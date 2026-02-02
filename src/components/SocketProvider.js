// src/components/SocketProvider.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  initChatSocket,
  disconnectChatSocket,
  getSocketStatus,
  getSocketReadyState,
} from "../redux/services/chatSocket";

const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("🔧 Initializing WebSocket for user:", user.id);

      const socketBaseUrl = process.env.REACT_APP_SOCKET_BASE_URL;

      // Initialize WebSocket
      const socket = initChatSocket({
        socketBaseUrl,
        userId: user.id,
      });

      // Log connection status
      const checkConnection = () => {
        const connected = getSocketStatus();
        const state = getSocketReadyState();
        console.log(
          connected
            ? "✅ WebSocket is connected"
            : `❌ WebSocket is ${state?.stateName || "disconnected"}`,
        );
      };

      // Check after 2 seconds
      setTimeout(checkConnection, 2000);

      // Cleanup on unmount or auth change
      return () => {
        console.log("🧼 Cleaning up WebSocket connection");
        disconnectChatSocket();
      };
    }
  }, [isAuthenticated, user?.id]);

  return children;
};

export default SocketProvider;
