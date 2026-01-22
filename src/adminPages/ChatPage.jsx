import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import UserPic from "../otherImages/UserPic.png";

// Import Redux actions and WebSocket functions
import {
  getMyConversations,
  getConversationMessages,
  setActiveConversation,
  addIncomingMessage,
} from "../redux/slices/chatSlice";
import {
  sendChatMessage,
  joinConversation,
  getSocketStatus,
  getSocketReadyState,
  getSocketInstance,
  reconnectWebSocket,
} from "../redux/services/chatSocket";

const ChatPage = () => {
  const dispatch = useDispatch();

  // Get state from Redux store
  const {
    conversations,
    messagesByConversation,
    activeConversationId,
    socketConnected,
    isLoading,
    error,
  } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Get current user ID from auth state or localStorage
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?.id || parseInt(localStorage.getItem("userId") || "0");

  // Get current active conversation
  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  // Get messages for active conversation and sort by date (newest first)
  const currentMessages = activeConversationId
    ? [...(messagesByConversation[activeConversationId] || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];

  // WebSocket connection monitoring
  useEffect(() => {
    const checkConnection = () => {
      const connected = getSocketStatus();
      const state = getSocketReadyState();
      const status = connected ? "CONNECTED" : state?.stateName || "DISCONNECTED";
      setWsStatus(status);
    };

    // Check immediately
    checkConnection();
    
    // Check every 3 seconds
    const interval = setInterval(checkConnection, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(getMyConversations());
  }, [dispatch]);

  // Handle conversation selection
  useEffect(() => {
    if (activeConversationId) {
      // Join WebSocket room
      joinConversation(activeConversationId);

      // Fetch messages
      dispatch(getConversationMessages(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, activeConversationId]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  // Handle sending a message
  const handleSend = () => {
    if (newMessage.trim() === "" || !activeConversation) return;

    // Get other participants (excluding current user)
    const otherParticipants = activeConversation.conversation_users?.filter(
      (cu) => cu.user_id !== currentUserId,
    );

    if (!otherParticipants || otherParticipants.length === 0) {
      console.error("No other participants found");
      return;
    }

    // Create optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId,
      conversation_user_id: activeConversation.conversation_users?.find(
        (cu) => cu.user_id === currentUserId,
      )?.id,
      sender_id: currentUserId,
      text: newMessage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_contents: [],
      isTemporary: true,
    };

    // Optimistic update (add to beginning for newest messages)
    dispatch(
      addIncomingMessage({
        conversationId: activeConversationId,
        message: tempMessage,
      }),
    );

    // Send via WebSocket (send to first other participant)
    if (otherParticipants.length > 0) {
      sendChatMessage({
        conversationId: activeConversationId,
        receiverId: otherParticipants[0].user_id,
        text: newMessage,
        files: [],
      });
    }

    setNewMessage("");
    scrollToBottom();
  };

  // Get other participants (for conversation name and avatar)
  const getOtherParticipants = (conversation) => {
    if (!conversation?.conversation_users) return [];
    return conversation.conversation_users.filter(
      (cu) => cu.user_id !== currentUserId,
    );
  };

  // Get conversation display name
  const getConversationName = (conversation) => {
    const otherParticipants = getOtherParticipants(conversation);

    if (conversation.group?.name) {
      return conversation.group.name;
    }

    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.name || "Unknown User";
    }

    // Multiple participants
    return otherParticipants.map((p) => p.user?.name || "User").join(", ");
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation) => {
    const otherParticipants = getOtherParticipants(conversation);

    // For 1-on-1 chat, use other person's profile picture
    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.profile_picture || UserPic;
    }

    // For group chat, use default or group avatar
    return conversation.group?.avatar || UserPic;
  };

  // Get last message preview
  const getLastMessagePreview = (conversation) => {
    if (conversation.last_message) {
      const isFromMe = conversation.last_message.sender_id === currentUserId;
      const prefix = isFromMe ? "You: " : "";
      return prefix + (conversation.last_message.text || "Sent a file");
    }
    return "No messages yet";
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Format date for grouping
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      const today = new Date();

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // Group messages by date (oldest to newest within each group)
  const groupMessagesByDate = (messages) => {
    const groups = {};

    // Sort messages oldest to newest for proper display
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    sortedMessages.forEach((msg) => {
      try {
        const date = new Date(msg.created_at).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(msg);
      } catch {
        // Skip invalid dates
      }
    });

    return Object.entries(groups);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation) => {
    const conversationName = getConversationName(conversation).toLowerCase();
    return conversationName.includes(searchQuery.toLowerCase());
  });

  // Get sender name for message
  const getSenderName = (message) => {
    if (message.sender_id === currentUserId) return "You";

    if (activeConversation) {
      const sender = activeConversation.conversation_users?.find(
        (cu) => cu.user_id === message.sender_id,
      );
      return sender?.user?.name || "Unknown";
    }

    return "Unknown";
  };

  // WebSocket Debug Panel
  const renderDebugPanel = () => (
    <div style={{ padding: '10px', background: '#f5f5f5', marginBottom: '20px', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>WebSocket Status:</strong> 
          <span style={{ 
            marginLeft: '10px', 
            padding: '2px 8px', 
            borderRadius: '3px',
            backgroundColor: wsStatus === 'CONNECTED' ? '#4CAF50' : wsStatus === 'CONNECTING' ? '#FFC107' : '#F44336',
            color: 'white'
          }}>
            {wsStatus}
            {wsStatus === 'CONNECTED' && ' ✅'}
            {wsStatus === 'CONNECTING' && ' 🔄'}
            {wsStatus === 'DISCONNECTED' && ' ❌'}
          </span>
        </div>
        <div>
          <button 
            onClick={() => {
              reconnectWebSocket({
                socketBaseUrl: "ws://verawell.koderspedia.online",
                userId: currentUserId,
              });
            }}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px', 
              fontSize: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Reconnect
          </button>
          <button 
            onClick={() => {
              console.log("=== WEBSOCKET DEBUG ===");
              const socket = getSocketInstance();
              const state = getSocketReadyState();
              console.log("WebSocket:", socket);
              console.log("State:", state?.stateName, `(${state?.state})`);
              console.log("URL:", socket?.url);
              console.log("Connected:", getSocketStatus());
              console.log("Current Messages:", currentMessages.length);
              console.log("Active Conversation:", activeConversationId);
            }}
            style={{ 
              marginLeft: '5px', 
              padding: '5px 10px', 
              fontSize: '12px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Debug
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <MasterLayout>
        <div className="loading-state">Loading conversations...</div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <section className="chat-section">
        {/* WebSocket Status Panel */}
        {renderDebugPanel()}
        
        <div className="flex chat-row row">
          {/* Left Sidebar */}
          <div className="chat-left col-md-4">
            <div className="chat-header">
              <h1>Chat</h1>
              <div className="socket-status">
                <span
                  className={`status-dot ${wsStatus === 'CONNECTED' ? "connected" : wsStatus === 'CONNECTING' ? "connecting" : "disconnected"}`}>
                </span>
                {wsStatus === 'CONNECTED' && 'Connected'}
                {wsStatus === 'CONNECTING' && 'Connecting...'}
                {wsStatus === 'DISCONNECTED' && 'Disconnected'}
              </div>
              <div className="search-chat">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list">
              {filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const lastMessageTime = conversation.last_message?.created_at;

                  return (
                    <div
                      key={conversation.id}
                      className={`chat-item ${
                        activeConversationId === conversation.id ? "active" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}>
                      <img
                        src={getConversationAvatar(conversation)}
                        alt={getConversationName(conversation)}
                        className="chat-avatar"
                        onError={(e) => {
                          e.target.src = UserPic;
                        }}
                      />
                      <div className="chat-info d-flex align-items-center justify-content-between w-100">
                        <div className="clientInfo">
                          <h4>{getConversationName(conversation)}</h4>
                          <p className="preview-text">
                            {getLastMessagePreview(conversation)}
                          </p>
                        </div>
                        <div className="clientInfoTime">
                          {lastMessageTime && (
                            <span className="chat-time">
                              {formatTime(lastMessageTime)}
                            </span>
                          )}
                          {/* Show unread count */}
                          {conversation.unread_count > 0 && (
                            <span className="chat-number">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Chat Window */}
          <div className="chat-right col-md-8">
            {activeConversation ? (
              <>
                <div className="chat-topbar">
                  <img
                    src={getConversationAvatar(activeConversation)}
                    alt={getConversationName(activeConversation)}
                    className="chat-avatar-lg"
                    onError={(e) => {
                      e.target.src = UserPic;
                    }}
                  />
                  <h3>{getConversationName(activeConversation)}</h3>
                </div>

                <div className="chat-window" ref={chatWindowRef}>
                  {currentMessages.length > 0 ? (
                    groupMessagesByDate(currentMessages).map(
                      ([date, messages]) => (
                        <div key={date}>
                          <div className="chat-date">{formatDate(date)}</div>
                          <div className="chat-messages">
                            {messages.map((msg) => {
                              const isSentByMe =
                                msg.sender_id === currentUserId;

                              return (
                                <div
                                  key={msg.id}
                                  className={`chat-bubble ${isSentByMe ? "sent" : "received"} ${
                                    msg.isTemporary ? "temporary" : ""
                                  }`}>
                                  <div className="recieved-name">
                                    {!isSentByMe && (
                                      <span className="chat-sender">
                                        {getSenderName(msg)}
                                      </span>
                                    )}
                                    <span className="chat-time">
                                      {formatTime(msg.created_at)}
                                    </span>
                                    {msg.isTemporary && (
                                      <span className="sending-indicator">
                                        Sending...
                                      </span>
                                    )}
                                  </div>
                                  <p>{msg.text}</p>

                                  {/* Show files if any */}
                                  {msg.file_contents && msg.file_contents.length > 0 && (
                                    <div className="message-files">
                                      {msg.file_contents.map((file) => (
                                        <div
                                          key={file.id}
                                          className="message-file">
                                          <a
                                            href={file.path}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            📎{" "}
                                            {file.type === "file"
                                              ? "File"
                                              : "Image"}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type a message ..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={wsStatus !== 'CONNECTED'}
                  />
                  <button
                    onClick={handleSend}
                    disabled={wsStatus !== 'CONNECTED' || !newMessage.trim()}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <h3>Select a conversation to start chatting</h3>
                <p>Your messages will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </MasterLayout>
  );
};

export default ChatPage;