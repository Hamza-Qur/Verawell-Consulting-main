// src/redux/services/chatSocket.js
import { store } from "../store";
import { addIncomingMessage, setSocketStatus } from "../slices/chatSlice";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer = null;
let pingInterval = null;
let lastPongTime = null;
const PING_INTERVAL = 30000; // 30 seconds
const PONG_TIMEOUT = 10000; // 10 seconds

/**
 * Initialize pure WebSocket connection
 */
export const initChatSocket = ({ socketBaseUrl, userId }) => {
  // Close existing connection if any
  if (socket) {
    cleanUpSocket();
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ No token found for WebSocket connection");
    return null;
  }

  if (!userId) {
    console.error("❌ No user ID provided for WebSocket connection");
    return null;
  }

  console.log("🔌 Initializing WebSocket...");
  console.log("URL:", socketBaseUrl);
  console.log("User ID:", userId);

  // Build URL with query parameters
  const url = `${socketBaseUrl}/connection?authorization=Bearer ${encodeURIComponent(token)}&user_id=${userId}`;

  console.log("🔗 Connecting to:", url);

  try {
    socket = new WebSocket(url);

    // WebSocket event listeners
    socket.onopen = () => {
      console.log("✅ WebSocket connected successfully!");
      store.dispatch(setSocketStatus(true));
      reconnectAttempts = 0;
      clearTimeout(reconnectTimer);

      // Start ping-pong to keep connection alive
      startPingPong();

      // Send initial ping to test connection
      sendPing();
    };

    socket.onclose = (event) => {
      console.log(
        `❌ WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || "No reason"}`,
      );
      store.dispatch(setSocketStatus(false));
      stopPingPong();

      // Auto-reconnect (except for normal closure)
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        console.log(
          `🔄 Reconnecting in ${delay / 1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
        );

        reconnectTimer = setTimeout(() => {
          initChatSocket({ socketBaseUrl, userId });
        }, delay);
      }
    };

    socket.onerror = (error) => {
      console.error("🔥 WebSocket error event:", error);
      stopPingPong();
    };

    socket.onmessage = (event) => {
      try {
        const data = event.data;

        // Handle pong messages (keep-alive)
        if (data === "pong" || data === '"pong"') {
          lastPongTime = Date.now();
          console.log("🏓 Received pong - connection alive");
          return;
        }

        const payload = JSON.parse(data);
        console.log("📩 Received WebSocket message:", payload);

        // Handle "receive_message" events
        if (
          payload.type === "receive_message" &&
          payload.success &&
          payload.data
        ) {
          const { conversation_id, messages } = payload.data;

          if (conversation_id && messages && Array.isArray(messages)) {
            messages.forEach((message) => {
              store.dispatch(
                addIncomingMessage({
                  conversationId: conversation_id,
                  message: {
                    ...message,
                    conversation_id: conversation_id,
                  },
                }),
              );
            });
          } else if (conversation_id) {
            store.dispatch(
              addIncomingMessage({
                conversationId: conversation_id,
                message: {
                  ...payload.data,
                  conversation_id: conversation_id,
                },
              }),
            );
          }
        }

        // Handle other message types
        else if (payload.type === "join_conversation_success") {
          console.log(
            "✅ Successfully joined conversation:",
            payload.conversation_id,
          );
        } else if (payload.type === "error") {
          console.error("❌ Server error:", payload.message);
        }

        // Server ping - respond with pong
        else if (payload.type === "ping") {
          console.log("🏓 Server ping received, sending pong");
          sendPong();
        } else {
          console.log("📨 Other message type:", payload.type, payload);
        }
      } catch (error) {
        // Check if it's a simple pong message
        if (event.data === "pong" || event.data === '"pong"') {
          lastPongTime = Date.now();
          console.log("🏓 Received pong - connection alive");
          return;
        }

        console.error("❌ Failed to parse WebSocket message:", error);
        console.log("Raw message data:", event.data);
      }
    };

    return socket;
  } catch (error) {
    console.error("❌ Failed to create WebSocket:", error);
    return null;
  }
};

/**
 * Start ping-pong to keep connection alive
 */
const startPingPong = () => {
  stopPingPong(); // Clear any existing interval

  // Send ping every PING_INTERVAL seconds
  pingInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      sendPing();

      // Check if we received pong recently
      if (lastPongTime && Date.now() - lastPongTime > PONG_TIMEOUT) {
        console.warn("⚠️ No pong received, connection might be dead");
        // You could trigger a reconnect here
      }
    }
  }, PING_INTERVAL);
};

/**
 * Stop ping-pong
 */
const stopPingPong = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

/**
 * Send ping message
 */
const sendPing = () => {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type: "ping" }));
      console.log("🏓 Sent ping");
    } catch (error) {
      console.error("Failed to send ping:", error);
    }
  }
};

/**
 * Send pong response
 */
const sendPong = () => {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type: "pong" }));
    } catch (error) {
      console.error("Failed to send pong:", error);
    }
  }
};

/**
 * Clean up socket resources
 */
const cleanUpSocket = () => {
  stopPingPong();

  if (socket) {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close(1000, "Client reconnecting");
    }
    socket = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

/**
 * Send a chat message via WebSocket
 */
export const sendChatMessage = ({
  conversationId,
  receiverId,
  text,
  files = [],
}) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error(
      "❌ WebSocket not connected. State:",
      getSocketReadyState()?.stateName,
    );
    return false;
  }

  console.log("📤 Sending message via WebSocket...");

  const messageData = {
    type: "send_message",
    conversation_id: conversationId,
    receiver_id: receiverId,
    text: text,
    data: files,
  };

  try {
    socket.send(JSON.stringify(messageData));
    console.log("✅ Message sent:", messageData);
    return true;
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    return false;
  }
};

/**
 * Join a conversation via WebSocket
 */
export const joinConversation = (conversationId) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error(
      "❌ WebSocket not connected. State:",
      getSocketReadyState()?.stateName,
    );
    return;
  }

  console.log("🔗 Joining conversation:", conversationId);

  const joinMessage = {
    type: "join_conversation",
    conversation_id: conversationId,
  };

  try {
    socket.send(JSON.stringify(joinMessage));
    console.log("📤 Sent join message:", joinMessage);
  } catch (error) {
    console.error("❌ Failed to send join message:", error);
  }
};

/**
 * Check if WebSocket is connected
 */
export const getSocketStatus = () => {
  return socket?.readyState === WebSocket.OPEN;
};

/**
 * Get WebSocket ready state details
 */
export const getSocketReadyState = () => {
  if (!socket) return null;

  const states = {
    0: "CONNECTING",
    1: "OPEN",
    2: "CLOSING",
    3: "CLOSED",
  };

  return {
    state: socket.readyState,
    stateName: states[socket.readyState] || "UNKNOWN",
    socket: socket,
  };
};

/**
 * Get WebSocket instance (for debugging)
 */
export const getSocketInstance = () => {
  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectChatSocket = () => {
  cleanUpSocket();
  reconnectAttempts = 0;
};

/**
 * Manual reconnect
 */
export const reconnectWebSocket = ({ socketBaseUrl, userId }) => {
  disconnectChatSocket();
  return initChatSocket({ socketBaseUrl, userId });
};
