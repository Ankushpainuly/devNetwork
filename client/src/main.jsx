// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Store } from "./app/store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={Store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#14141f",
              color:      "#f1f5f9",
              border:     "1px solid #1e1e35",
              fontSize:   "13px",
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);