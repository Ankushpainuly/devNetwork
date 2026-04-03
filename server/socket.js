import crypto from "crypto";
import { Server } from "socket.io"
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import Chat from "./models/chat.js";
import Connection from "./models/connection.js";

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split("=");
        return [key, decodeURIComponent(value.join("="))];
      })
  );

const getSecretRoomId = (userId, targetUserId) =>
  crypto
    .createHash("sha256")
    .update([userId.toString(), targetUserId.toString()].sort().join("_"))
    .digest("hex");

const ensureAcceptedConnection = async (userId, targetUserId) =>
  Connection.findOne({
    $or: [
      { sender: userId, receiver: targetUserId },
      { sender: targetUserId, receiver: userId },
    ],
    status: "accepted",
  });

const userPreviewFields = "name avatar headline subscription isOnline lastSeen";

const connectedUsers = new Map();

const emitPresenceUpdate = (io, userId, isOnline, lastSeen) => {
  io.emit("presence:update", {
    userId: userId.toString(),
    isOnline,
    lastSeen: lastSeen || null,
  });
};

const markUserOnline = async (io, userId) => {
  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    $unset: { lastSeen: 1 },
  });

  emitPresenceUpdate(io, userId, true, null);
};

const markUserOffline = async (io, userId) => {
  const lastSeen = new Date();

  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen,
  });

  emitPresenceUpdate(io, userId, false, lastSeen);
};

export const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -otp -otpExpiry -lastOtpSentAt"
      );

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const activeSockets = connectedUsers.get(userId) || new Set();
    const wasOffline = activeSockets.size === 0;

    activeSockets.add(socket.id);
    connectedUsers.set(userId, activeSockets);

    if (wasOffline) {
      markUserOnline(io, userId).catch((error) => {
        console.error("Failed to mark user online:", error);
      });
    }

    socket.on("joinChat", async ({ targetUserId }) => {
      if (!targetUserId) return;

      const isConnected = await ensureAcceptedConnection(
        socket.user._id,
        targetUserId
      );

      if (!isConnected) return;

      const roomId = getSecretRoomId(socket.user._id, targetUserId);
      socket.join(roomId);

      const chat = await Chat.findOne({
        participants: { $all: [socket.user._id, targetUserId] },
      });

      if (!chat) return;

      const seenMessageIds = [];
      chat.messages.forEach((message) => {
        if (
          message.senderId.toString() === targetUserId.toString() &&
          !message.seen
        ) {
          message.seen = true;
          message.seenAt = new Date();
          seenMessageIds.push(message._id.toString());
        }
      });

      if (seenMessageIds.length) {
        await chat.save();
        io.to(roomId).emit("messagesSeen", {
          messageIds: seenMessageIds,
          seenBy: socket.user._id.toString(),
        });
      }
    });

    socket.on("sendMessage", async ({ targetUserId, text }, callback) => {
      try {
        if (!targetUserId || !text?.trim()) {
          callback?.({ success: false, message: "Message is required" });
          return;
        }

        const isConnected = await ensureAcceptedConnection(
          socket.user._id,
          targetUserId
        );

        if (!isConnected) {
          callback?.({
            success: false,
            message: "You can chat only with accepted connections",
          });
          return;
        }

        let chat = await Chat.findOne({
          participants: { $all: [socket.user._id, targetUserId] },
        });

        if (!chat) {
          chat = await Chat.create({
            participants: [socket.user._id, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: socket.user._id,
          text: text.trim(),
          seen: false,
        });

        await chat.save();
        await chat.populate("messages.senderId", userPreviewFields);

        const newMessage = chat.messages[chat.messages.length - 1];
        const roomId = getSecretRoomId(socket.user._id, targetUserId);

        io.to(roomId).emit("messageReceived", {
          message: newMessage,
          targetUserId,
          chatId: chat._id,
        });

        callback?.({
          success: true,
          message: newMessage,
          chatId: chat._id,
        });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      const userSockets = connectedUsers.get(userId);

      if (!userSockets) return;

      userSockets.delete(socket.id);

      if (userSockets.size > 0) {
        return;
      }

      connectedUsers.delete(userId);
      markUserOffline(io, userId).catch((error) => {
        console.error("Failed to mark user offline:", error);
      });
    });
  });

  return io;
};
