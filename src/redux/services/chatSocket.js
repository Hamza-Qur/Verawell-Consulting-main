// src/redux/services/chatSocket.js
import { store } from "../store";
import { addIncomingMessage, setSocketStatus } from "../slices/chatSlice";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer = null;
let pingInterval = null;
let lastPongTime = null;
const PING_INTERVAL = 30000;
const PONG_TIMEOUT = 10000;

export const initChatSocket = ({ socketBaseUrl, userId }) => {
  if (socket) {
    cleanUpSocket();
  }

  const token = localStorage.getItem("token");

  if (!token || !userId) {
    return null;
  }

  const url = `${socketBaseUrl}/connection?authorization=Bearer ${encodeURIComponent(token)}&user_id=${userId}`;

  try {
    socket = new WebSocket(url);

    socket.onopen = () => {
      store.dispatch(setSocketStatus(true));
      reconnectAttempts = 0;
      clearTimeout(reconnectTimer);
      startPingPong();
    };

    socket.onclose = (event) => {
      store.dispatch(setSocketStatus(false));
      stopPingPong();

      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        reconnectTimer = setTimeout(() => {
          initChatSocket({ socketBaseUrl, userId });
        }, delay);
      }
    };

    socket.onerror = (error) => {
      stopPingPong();
    };

    socket.onmessage = (event) => {
      try {
        const data = event.data;

        if (data === "pong" || data === '"pong"') {
          lastPongTime = Date.now();
          return;
        }

        const payload = JSON.parse(data);

        if (
          payload.type === "receive_message" &&
          payload.success &&
          payload.data
        ) {
          const conversation_id = payload.data.conversation_id;
          const messageText = payload.data.text;

          if (conversation_id && messageText) {
            store.dispatch(
              addIncomingMessage({
                conversationId: conversation_id,
                message: {
                  id: payload.data.id,
                  conversation_id: conversation_id,
                  conversation_user_id: payload.data.conversation_user_id,
                  sender_id: payload.data.sender_id,
                  text: messageText,
                  created_at:
                    payload.data.created_at || new Date().toISOString(),
                  updated_at:
                    payload.data.updated_at || new Date().toISOString(),
                  file_contents: payload.data.messages || [],
                  file_content: payload.data.messages || [],
                },
              }),
            );
          }
        } else if (payload.type === "ping") {
          sendPong();
        }
      } catch (error) {
        if (event.data === "pong" || event.data === '"pong"') {
          lastPongTime = Date.now();
          return;
        }
      }
    };

    return socket;
  } catch (error) {
    return null;
  }
};

const startPingPong = () => {
  stopPingPong();
  pingInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      sendPing();
    }
  }, PING_INTERVAL);
};

const stopPingPong = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

const sendPing = () => {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type: "ping" }));
    } catch (error) {}
  }
};

const sendPong = () => {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type: "pong" }));
    } catch (error) {}
  }
};

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

export const sendChatMessage = ({
  conversationId = null,
  receiverId,
  text,
  files = [],
}) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  const messageData = {
    type: "send_message",
    text: text,
    data: files,
  };

  // Include conversation_id if we have one (existing conversation)
  if (conversationId) {
    messageData.conversation_id = conversationId;
  }

  // Always include receiver_id (required for new conversations)
  messageData.receiver_id = receiverId;

  console.log("Sending chat message:", messageData);

  try {
    socket.send(JSON.stringify(messageData));
    return true;
  } catch (error) {
    console.error("Failed to send message:", error);
    return false;
  }
};

export const joinConversation = (conversationId) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const joinMessage = {
    type: "join_conversation",
    conversation_id: conversationId,
  };

  try {
    socket.send(JSON.stringify(joinMessage));
  } catch (error) {}
};

export const getSocketStatus = () => {
  return socket?.readyState === WebSocket.OPEN;
};

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
  };
};

export const getSocketInstance = () => {
  return socket;
};

export const disconnectChatSocket = () => {
  cleanUpSocket();
  reconnectAttempts = 0;
};

export const reconnectWebSocket = ({ socketBaseUrl, userId }) => {
  disconnectChatSocket();
  return initChatSocket({ socketBaseUrl, userId });
};
