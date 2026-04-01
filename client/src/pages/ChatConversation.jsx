import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../api/axios";
import UserAvatar from "../components/UserAvatar";
import PremiumBadge from "../components/PremiumBadge";

const socketUrl = api.defaults.baseURL.replace(/\/api$/, "");

const formatMessageTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

function MessageTicks({ seen }) {
  return (
    <span
      className={`inline-flex items-center ${seen ? "text-sky-300" : "text-white/70"}`}
      title={seen ? "Seen" : "Sent"}
    >
      <span>✔︎</span>
      {seen && (
        <span>✔︎</span>
      )}
    </span>
  );
}

export default function ChatConversation() {
  const { userId: targetUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.user);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);

  const activeUser = activeChat?.targetUser || null;

  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current.on("messageReceived", ({ message, targetUserId: roomUserId }) => {
      if (roomUserId !== targetUserId) return;

      setMessages((current) => {
        const alreadyExists = current.some((item) => item._id === message._id);
        if (alreadyExists) return current;
        return [...current, message];
      });
    });

    socketRef.current.on("messagesSeen", ({ messageIds }) => {
      setMessages((current) =>
        current.map((message) =>
          messageIds.includes(message._id)
            ? { ...message, seen: true, seenAt: new Date().toISOString() }
            : message
        )
      );
    });

    socketRef.current.on("connect_error", () => {
      toast.error("Chat connection failed");
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, targetUserId]);
  

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoadingChat(true);
        const res = await api.get(`/chat/${targetUserId}`);
        setActiveChat(res.data.chat);
        setMessages(res.data.chat?.messages || []);
        socketRef.current?.emit("joinChat", { targetUserId });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to open chat");
        navigate("/chat", { replace: true });
      } finally {
        setLoadingChat(false);
      }
    };

    loadChat();
  }, [targetUserId, navigate]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      220
    )}px`;
  }, [draft]);


  const handleSendMessage = (event) => {
    event.preventDefault();

    if (!draft.trim() || !targetUserId || !socketRef.current) return;

    setSending(true);

    socketRef.current.emit(
      "sendMessage",
      {
        targetUserId,
        text: draft,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          toast.error(response?.message || "Message send failed");
          return;
        }

        setMessages((current) => {
          const alreadyExists = current.some(
            (item) => item._id === response.message._id
          );

          if (alreadyExists) return current;

          return [...current, response.message];
        });

        setDraft("");
      }
    );
  };

  return (
    <section className="flex h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)] min-h-[60vh] flex-col overflow-hidden rounded-3xl border border-dark-500 bg-dark-700 lg:h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-3rem)]">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-500 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="rounded-2xl border border-dark-400 px-3 py-2 text-sm text-slate-200"
          >
            Back
          </button>

          {activeUser ? (
            <>
              <UserAvatar user={activeUser} size="md" />
              <div className="min-w-0">
                <Link
                  to={`/profile/${activeUser._id}`}
                  className="inline-flex items-center gap-1 truncate font-semibold text-white hover:text-brand-300"
                >
                  {activeUser.name}
                  <PremiumBadge user={activeUser} size="sm" />
                </Link>
                <div className="flex items-center gap-2">
                  {activeUser.isOnline ? (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  ) : null}
                  <p className="truncate text-sm text-slate-400">
                    {activeUser.isOnline
                      ? "Active now"
                      : activeUser.headline || "Developer on DevNetwork"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="font-semibold text-white">Chat</p>
              <p className="text-sm text-slate-400">Loading chat...</p>
            </div>
          )}
        </div>

        {activeUser && (
          <Link
            to={`/profile/${activeUser._id}`}
            className="rounded-2xl border border-dark-400 px-4 py-2 text-sm text-slate-200"
          >
            View profile
          </Link>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          {loadingChat ? (
            <div className="text-sm text-slate-400">Loading messages...</div>
          ) : messages.length ? (
            messages.map((message) => {
              const isOwnMessage =
                message.senderId?._id?.toString() === user?._id?.toString();

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                      isOwnMessage
                        ? "bg-brand-500 text-white"
                        : "bg-dark-800 text-slate-100"
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="mb-1 text-xs font-medium text-brand-300">
                        <span className="inline-flex items-center gap-1">
                          {message.senderId?.name}
                          <PremiumBadge user={message.senderId} size="sm" />
                        </span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.text}
                    </p>
                    <p
                      className={`mt-2 flex items-center justify-end gap-1 text-right text-[11px] ${
                        isOwnMessage ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {isOwnMessage ? <MessageTicks seen={message.seen} /> : null}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dark-500 bg-dark-800 p-4 text-sm text-slate-400">
              No messages yet. Send the first message.
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t border-dark-500 px-5 py-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message..."
            rows={1}
            className="max-h-[220px] min-h-12 flex-1 resize-none overflow-y-auto rounded-2xl border border-dark-400 bg-dark-800 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
