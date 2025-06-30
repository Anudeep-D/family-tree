import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./hooks/useAuth";

import "./index.css";
import "@styles/global.scss";
import "@xyflow/react/dist/style.css";
import { store } from "@/app/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@styles/theme";
import WebSocketManager from "./components/WebSocketManager/WebSocketManager";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Add CssBaseline here */}
        <AuthProvider>
          <WebSocketManager>
            <App />
          </WebSocketManager>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
