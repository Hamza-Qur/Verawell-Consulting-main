// src/components/ChatPage.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import UserPic from "../otherImages/UserPic.png";
import DynamicModal from "../components/DynamicModal";

import {
  getMyConversations,
  getConversationMessages,
  setActiveConversation,
} from "../redux/slices/chatSlice";
import {
  sendChatMessage,
  joinConversation,
  getSocketStatus,
} from "../redux/services/chatSocket";
import { getAllUsers } from "../redux/slices/userSlice";
import { Icon } from "@iconify/react";

const ChatPage = () => {
  const dispatch = useDispatch();

  const {
    conversations,
    messagesByConversation,
    activeConversationId,
    isLoading,
  } = useSelector((state) => state.chat);

  const {
    usersList: { data: users = [], pagination = {} },
    isLoadingUsers,
  } = useSelector((state) => state.user);

  const { user: currentUser } = useSelector((state) => state.auth);

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [allLoadedUsers, setAllLoadedUsers] = useState([]);

  const messagesEndRef = useRef(null);

  const currentUserId =
    currentUser?.id || parseInt(localStorage.getItem("userId") || "0");

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  const currentMessages = activeConversationId
    ? [...(messagesByConversation[activeConversationId] || [])].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      )
    : [];

  // Check WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = getSocketStatus();
      setWsStatus(connected ? "CONNECTED" : "DISCONNECTED");
    };
    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load conversations
  useEffect(() => {
    dispatch(getMyConversations());
  }, [dispatch]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
      dispatch(getConversationMessages(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [currentMessages, activeConversationId]);

  // Load users when modal opens
  useEffect(() => {
    if (showNewChat) {
      setSelectedUserForChat(null);
      setUserSearchQuery("");
      setCurrentPage(1);

      // Load page 1
      dispatch(getAllUsers({ page: 1, perPage: 100, search: "", role: "" }));
    }
  }, [showNewChat, dispatch]);

  // Accumulate users as they load
  useEffect(() => {
    if (showNewChat && users.length > 0) {
      setAllLoadedUsers(users);
    }
  }, [showNewChat, users]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      // When no search, show all loaded users with pagination
      return allLoadedUsers;
    }

    // When searching, filter all loaded users
    return allLoadedUsers.filter((user) =>
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()),
    );
  }, [allLoadedUsers, userSearchQuery]);

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  const handleSend = () => {
    if (newMessage.trim() === "" || !activeConversation) return;
    const otherParticipants = activeConversation.conversation_users?.filter(
      (cu) => cu.user_id !== currentUserId,
    );
    if (!otherParticipants || otherParticipants.length === 0) return;

    const success = sendChatMessage({
      conversationId: activeConversationId,
      receiverId: otherParticipants[0].user_id,
      text: newMessage,
      files: [],
    });
    if (success) setNewMessage("");
  };

  const handleStartNewChat = () => {
    if (!selectedUserForChat) return;
    const existingConversation = conversations.find((conversation) => {
      return conversation.conversation_users.some(
        (cu) => cu.user_id === selectedUserForChat.id,
      );
    });

    if (existingConversation) {
      dispatch(setActiveConversation(existingConversation.id));
      setShowNewChat(false);
      return;
    }

    const success = sendChatMessage({
      receiverId: selectedUserForChat.id,
      text: initialMessage.trim() || `Hi ${selectedUserForChat.name}!`,
      files: [],
    });

    if (success) {
      setSelectedUserForChat(null);
      setInitialMessage("");
      setUserSearchQuery("");
      setCurrentPage(1);
      setShowNewChat(false);
      setTimeout(() => {
        dispatch(getMyConversations());
      }, 500);
    }
  };

  const handleLoadPage = (page) => {
    setCurrentPage(page);
    dispatch(getAllUsers({ page, perPage: 100, search: "", role: "" }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = pagination.last_page || 1;
    const current = currentPage;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (current <= 3) pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      else if (current >= totalPages - 2)
        pageNumbers.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      else
        pageNumbers.push(
          1,
          "...",
          current - 1,
          current,
          current + 1,
          "...",
          totalPages,
        );
    }
    return pageNumbers;
  };

  const getConversationName = (conversation) => {
    if (conversation.group?.name) return conversation.group.name;
    const others =
      conversation.conversation_users?.filter(
        (cu) => cu.user_id !== currentUserId,
      ) || [];
    if (others.length === 1) return others[0]?.user?.name || "Unknown User";
    return others.map((p) => p.user?.name || "User").join(", ");
  };

  const getConversationAvatar = (conversation) => {
    const others =
      conversation.conversation_users?.filter(
        (cu) => cu.user_id !== currentUserId,
      ) || [];
    if (others.length === 1) return others[0]?.user?.profile_picture || UserPic;
    return conversation.group?.avatar || UserPic;
  };

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

  const filteredConversations = conversations.filter((conversation) => {
    return getConversationName(conversation)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

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
        <div className="flex chat-row row">
          {/* Left Sidebar */}
          <div className="chat-left col-md-4">
            <div className="chat-header">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Chat</h1>
                <button
                  className="btn dsgnbtn btn-sm"
                  onClick={() => setShowNewChat(true)}>
                  <i className="fa-solid fa-plus me-1"></i> New Chat
                </button>
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
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`chat-item ${activeConversationId === conversation.id ? "active" : ""}`}
                    onClick={() => handleSelectConversation(conversation.id)}>
                    <img
                      src={getConversationAvatar(conversation)}
                      alt="avatar"
                      className="chat-avatar"
                      onError={(e) => {
                        e.target.src = UserPic;
                      }}
                    />
                    <div className="chat-info d-flex align-items-center justify-content-between w-100">
                      <div className="clientInfo">
                        <h4>{getConversationName(conversation)}</h4>
                        <p className="preview-text">
                          {conversation.last_message?.text || "No messages yet"}
                        </p>
                      </div>
                      <div className="clientInfoTime">
                        {conversation.last_message?.created_at && (
                          <span className="chat-time">
                            {formatTime(conversation.last_message.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
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
                    alt="avatar"
                    className="chat-avatar-lg"
                    onError={(e) => {
                      e.target.src = UserPic;
                    }}
                  />
                  <h3>{getConversationName(activeConversation)}</h3>
                </div>

                <div className="chat-window">
                  {currentMessages.length > 0 ? (
                    <div className="chat-messages">
                      {currentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`chat-bubble ${msg.sender_id === currentUserId ? "sent" : "received"}`}>
                          <div className="recieved-name">
                            {msg.sender_id !== currentUserId && (
                              <span className="chat-sender">
                                {activeConversation.conversation_users?.find(
                                  (cu) => cu.user_id === msg.sender_id,
                                )?.user?.name || "Unknown"}
                              </span>
                            )}
                            <span className="chat-time">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>
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
                    disabled={wsStatus !== "CONNECTED"}
                  />
                  <button
                    onClick={handleSend}
                    disabled={wsStatus !== "CONNECTED" || !newMessage.trim()}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected text-center py-5">
                <i className="fa-regular fa-comments fa-3x text-muted mb-3"></i>
                <h3>Welcome to Chat</h3>
                <button
                  className="btn dsgnbtn btn-lg"
                  onClick={() => setShowNewChat(true)}>
                  <i className="fa-solid fa-plus me-2"></i> Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        <DynamicModal
          show={showNewChat}
          handleClose={() => {
            setShowNewChat(false);
            setUserSearchQuery("");
            setCurrentPage(1);
            setAllLoadedUsers([]); // Clear loaded users when modal closes
          }}
          title="Start New Chat"
          modalWidth="500px"
          content={
            <div className="new-chat-content">
              {/* Search Bar for Users */}
              <div className="user-search-bar mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <Icon icon="mdi:magnify" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by name..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setSelectedUserForChat(null);
                    }}
                    autoFocus
                  />
                  {userSearchQuery && (
                    <button
                      className="btn btnbtn"
                      type="button"
                      onClick={() => setUserSearchQuery("")}>
                      <Icon icon="mdi:close" />
                    </button>
                  )}
                </div>
                {userSearchQuery && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Searching: "{userSearchQuery}"
                    </small>
                  </div>
                )}
              </div>

              <div className="user-list-section">
                {isLoadingUsers && allLoadedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <p className="mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <Icon
                      icon="mdi:account"
                      className="text-muted"
                      width="48"
                      height="48"
                    />
                    <p className="mt-2">
                      {userSearchQuery
                        ? `No users found for "${userSearchQuery}"`
                        : "No users available"}
                    </p>
                    {userSearchQuery && (
                      <button
                        className="btn btn-sm btn-link"
                        onClick={() => setUserSearchQuery("")}>
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="user-list">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`user-item ${selectedUserForChat?.id === user.id ? "selected" : ""}`}
                          onClick={() => setSelectedUserForChat(user)}>
                          <div className="user-avatar">
                            <img
                              src={user.profile_picture || UserPic}
                              alt={user.name}
                              onError={(e) => {
                                e.target.src = UserPic;
                              }}
                            />
                          </div>
                          <div className="user-details">
                            <h6 className="mb-0">{user.name}</h6>
                            <small className="user-role">
                              {user.role === "team"
                                ? "Team Member"
                                : "Customer"}
                            </small>
                          </div>
                          {selectedUserForChat?.id === user.id && (
                            <div className="selected-check">
                              <Icon
                                icon="mdi:check-circle"
                                className="text-primary"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Show pagination when NOT searching and there are multiple pages */}
                    {!userSearchQuery && pagination.last_page > 1 && (
                      <div className="pagination-wrapper mt-3">
                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btnbtn"
                            disabled={currentPage === 1}
                            onClick={() => handleLoadPage(currentPage - 1)}>
                            <Icon icon="mdi:chevron-left" /> Prev
                          </button>
                          <div className="d-flex gap-1 flex-wrap">
                            {getPageNumbers().map((pageNum, idx) => (
                              <button
                                key={idx}
                                className={`btn btn-sm ${currentPage === pageNum ? "dsgnbtn" : "btnbtn"}`}
                                onClick={() =>
                                  typeof pageNum === "number" &&
                                  handleLoadPage(pageNum)
                                }>
                                {pageNum}
                              </button>
                            ))}
                          </div>
                          <button
                            className="btn btn-sm btnbtn"
                            disabled={currentPage === pagination.last_page}
                            onClick={() => handleLoadPage(currentPage + 1)}>
                            Next <Icon icon="mdi:chevron-right" />
                          </button>
                        </div>
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            {userSearchQuery ? (
                              `Found ${filteredUsers.length} users`
                            ) : (
                              <>
                                Page {currentPage} of {pagination.last_page} •{" "}
                                {pagination.total} users total
                              </>
                            )}
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Show search results count when searching */}
                    {userSearchQuery && (
                      <div className="text-center mt-2">
                        <small className="text-muted">
                          Found {filteredUsers.length} users matching "
                          {userSearchQuery}"
                        </small>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-actions d-flex gap-2 mt-4 pt-3 border-top">
                <button
                  className="btn btnbtn flex-fill"
                  onClick={() => {
                    setShowNewChat(false);
                    setUserSearchQuery("");
                    setCurrentPage(1);
                    setAllLoadedUsers([]);
                  }}>
                  Cancel
                </button>
                <button
                  className="btn dsgnbtn flex-fill"
                  onClick={handleStartNewChat}
                  disabled={!selectedUserForChat || wsStatus !== "CONNECTED"}>
                  {wsStatus !== "CONNECTED" ? (
                    "Waiting for connection..."
                  ) : (
                    <>
                      <Icon icon="mdi:message" className="me-2" /> Start Chat
                    </>
                  )}
                </button>
              </div>
            </div>
          }
        />
      </section>
    </MasterLayout>
  );
};

export default ChatPage;
