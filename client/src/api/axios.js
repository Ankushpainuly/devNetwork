import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

api.interceptors.response.use(
    (res) => res,  // ← success → just return response normally
  
    (err) => {     // ← error → runs on EVERY failed request
      if (err.response?.status === 401) {
        window.location.href = "/login"; // auto redirect if not logged in
      }
      return Promise.reject(err); // still throw error so catch() works
    }
  );

export default api;
