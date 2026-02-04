// src/components/ChatPage.js
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import UserPic from "../otherImages/UserPic.png";
import DynamicModal from "../components/DynamicModal";
import Toast from "../components/Toast";

import {
  getMyConversations,
  getConversationMessages,
  setActiveConversation,
  createGroupChat,
  updateGroupChat,
  removeGroupMember,
  deleteGroupChat,
  updateGroupMembers,
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
    isCreatingGroup,
    isUpdatingGroup,
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
  const [activeTab, setActiveTab] = useState("chats");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    photo: null,
    selectedUsers: [],
  });
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [shouldRefreshConversations, setShouldRefreshConversations] =
    useState(false);

  // Toast states
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId =
    currentUser?.id || parseInt(localStorage.getItem("userId") || "0");

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  const currentMessages = activeConversationId
    ? messagesByConversation[activeConversationId] || []
    : [];

  // Toast helper function
  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  // Define helper functions
  const getConversationName = useCallback(
    (conversation) => {
      if (conversation?.group) return conversation.group.name;
      const others =
        conversation?.conversation_users?.filter(
          (cu) => cu.user_id !== currentUserId,
        ) || [];
      if (others.length === 1) return others[0]?.user?.name || "Unknown User";
      return others.map((p) => p.user?.name || "User").join(", ");
    },
    [currentUserId],
  );

  const getConversationAvatar = useCallback(
    (conversation) => {
      if (conversation?.group?.photo) return conversation.group.photo;
      const others =
        conversation?.conversation_users?.filter(
          (cu) => cu.user_id !== currentUserId,
        ) || [];
      if (others.length === 1)
        return others[0]?.user?.profile_picture || UserPic;
      return UserPic;
    },
    [currentUserId],
  );

  const formatTime = useCallback((timestamp) => {
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
  }, []);

  // Memoized values
  const chats = useMemo(
    () => conversations.filter((conv) => !conv.group),
    [conversations],
  );

  const groups = useMemo(
    () => conversations.filter((conv) => conv.group),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const list = activeTab === "chats" ? chats : groups;
    return list.filter((conversation) => {
      return getConversationName(conversation)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [activeTab, chats, groups, searchQuery, getConversationName]);

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

  // Refresh conversations when needed
  useEffect(() => {
    if (shouldRefreshConversations) {
      dispatch(getMyConversations());
      setShouldRefreshConversations(false);
    }
  }, [shouldRefreshConversations, dispatch]);

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
    if (showNewChat || showGroupModal || showManageMembers) {
      setSelectedUserForChat(null);
      setUserSearchQuery("");
      setCurrentPage(1);
      dispatch(getAllUsers({ page: 1, perPage: 100, search: "", role: "" }));
    }
  }, [showNewChat, showGroupModal, showManageMembers, dispatch]);

  // Accumulate users as they load
  useEffect(() => {
    if (
      (showNewChat || showGroupModal || showManageMembers) &&
      users.length > 0
    ) {
      setAllLoadedUsers(users);
    }
  }, [showNewChat, showGroupModal, showManageMembers, users]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const validUsers = allLoadedUsers.filter((user) => user && user.id);
    if (!userSearchQuery.trim()) {
      return validUsers.filter((user) => user.id !== currentUserId);
    }
    return validUsers.filter(
      (user) =>
        user.id !== currentUserId &&
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()),
    );
  }, [allLoadedUsers, userSearchQuery, currentUserId]);

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  // FIXED: Removed toast from handleSend to prevent spam
  const handleSend = () => {
    if (newMessage.trim() === "" || !activeConversation) return;

    if (activeConversation.group) {
      // For group chat - only send conversation_id
      const success = sendChatMessage({
        conversationId: activeConversationId,
        text: newMessage,
        files: [],
        // Don't pass receiverId at all for groups
      });
      if (success) {
        setNewMessage("");
      }
    } else {
      // For one-on-one chat
      const otherParticipants = activeConversation.conversation_users?.filter(
        (cu) => cu.user_id !== currentUserId,
      );
      if (!otherParticipants || otherParticipants.length === 0) return;

      const success = sendChatMessage({
        conversationId: activeConversationId,
        receiverId: otherParticipants[0].user_id, // Pass receiverId for individual chats
        text: newMessage,
        files: [],
      });
      if (success) {
        setNewMessage("");
      }
    }
  };

  const handleStartNewChat = () => {
    if (!selectedUserForChat) {
      showToast("Please select a user to chat with", "warning");
      return;
    }

    const existingConversation = conversations.find((conversation) => {
      return conversation.conversation_users?.some(
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
    } else {
      showToast("Failed to start new chat", "error");
    }
  };

  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) {
      showToast("Please provide a group name", "warning");
      return;
    }

    if (groupForm.selectedUsers.length === 0) {
      showToast("Please select at least one member", "warning");
      return;
    }

    const groupData = {
      name: groupForm.name,
      description: groupForm.description || "",
      photo: groupForm.photo,
      user_ids: groupForm.selectedUsers.map((user) => user.id),
    };

    dispatch(createGroupChat(groupData))
      .unwrap()
      .then(() => {
        setGroupForm({
          name: "",
          description: "",
          photo: null,
          selectedUsers: [],
        });
        setShowGroupModal(false);
        setActiveTab("groups");
        showToast("Group created successfully", "success");
        setShouldRefreshConversations(true);
      })
      .catch((error) => {
        showToast(error.message || "Failed to create group", "error");
      });
  };

  const handleGroupModalClose = () => {
    setShowGroupModal(false);
    setGroupForm({
      name: "",
      description: "",
      photo: null,
      selectedUsers: [],
    });
    setUserSearchQuery("");
    setCurrentPage(1);
    setAllLoadedUsers([]);
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !groupForm.name.trim()) {
      showToast("Please provide a group name", "warning");
      return;
    }

    const updateData = {
      conversation_id: editingGroup.id,
      name: groupForm.name,
      description: groupForm.description || null,
      user_ids: groupForm.selectedUsers.map((user) => user.id),
    };

    dispatch(updateGroupChat(updateData))
      .unwrap()
      .then(() => {
        setGroupForm({
          name: "",
          description: "",
          photo: null,
          selectedUsers: [],
        });
        setEditingGroup(null);
        setShowGroupSettings(false);
        showToast("Group updated successfully", "success");
        setShouldRefreshConversations(true);
      })
      .catch((error) => {
        showToast(error.message || "Failed to update group", "error");
      });
  };

  const handleRemoveMember = (userId) => {
    if (!activeConversation || !activeConversation.group) return;

    const memberName =
      activeConversation.conversation_users?.find((cu) => cu.user_id === userId)
        ?.user?.name || "this member";

    if (
      window.confirm(
        `Are you sure you want to remove ${memberName} from the group?`,
      )
    ) {
      dispatch(
        removeGroupMember({
          conversation_id: activeConversation.id,
          user_id: userId,
        }),
      )
        .unwrap()
        .then(() => {
          const updatedMembers =
            activeConversation.conversation_users?.filter(
              (cu) => cu.user_id !== userId,
            ) || [];

          dispatch(
            updateGroupMembers({
              conversationId: activeConversation.id,
              members: updatedMembers,
            }),
          );

          showToast("Member removed successfully", "success");
          setShouldRefreshConversations(true);
        })
        .catch((error) => {
          showToast(error.message || "Failed to remove member", "error");
        });
    }
  };

  const handleDeleteGroup = () => {
    if (!activeConversation || !activeConversation.group) return;

    const groupName = activeConversation.group.name || "this group";
    setGroupToDelete({
      id: activeConversation.id,
      name: groupName,
    });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;

    dispatch(deleteGroupChat(groupToDelete.id))
      .unwrap()
      .then(() => {
        setShowGroupSettings(false);
        setShowDeleteConfirm(false);
        setGroupToDelete(null);
        showToast("Group deleted successfully", "success");
        setGroupForm({
          name: "",
          description: "",
          photo: null,
          selectedUsers: [],
        });
        setShouldRefreshConversations(true);
      })
      .catch((error) => {
        showToast(error.message || "Failed to delete group", "error");
        setShowDeleteConfirm(false);
        setGroupToDelete(null);
      });
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

  const handleGroupPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupForm((prev) => ({ ...prev, photo: file }));
    }
  };

  const openGroupSettings = () => {
    if (!activeConversation || !activeConversation.group) {
      showToast("No group selected", "warning");
      return;
    }

    setEditingGroup(activeConversation);
    setGroupForm({
      name: activeConversation.group.name || "",
      description: activeConversation.group.description || "",
      photo: null,
      selectedUsers:
        activeConversation.conversation_users
          ?.map((cu) => cu.user)
          .filter(Boolean) || [],
    });
    setShowGroupSettings(true);
  };

  if (isLoading && conversations.length === 0) {
    return (
      <MasterLayout>
        <div className="loading-state">Loading conversations...</div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <section className="chat-section">
        <div className="flex chat-row row">
          {/* Left Sidebar */}
          <div className="chat-left col-md-4">
            <div className="chat-header">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Chat</h1>
                <div className="d-flex gap-2">
                  <button
                    className="btn dsgnbtn btn-sm"
                    onClick={() => setShowGroupModal(true)}>
                    <i className="fa-solid fa-users me-1"></i> New Group
                  </button>
                  <button
                    className="btn dsgnbtn btn-sm"
                    onClick={() => setShowNewChat(true)}>
                    <i className="fa-solid fa-plus me-1"></i> New Chat
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="chat-tabs mb-3">
                <div className="nav nav-tabs">
                  <button
                    className={`nav-link ${activeTab === "chats" ? "active" : ""}`}
                    onClick={() => setActiveTab("chats")}>
                    <i className="fa-solid fa-user me-1"></i> Chats
                    <span className="badge bg-secondary ms-2">
                      {chats.length}
                    </span>
                  </button>
                  <button
                    className={`nav-link ${activeTab === "groups" ? "active" : ""}`}
                    onClick={() => setActiveTab("groups")}>
                    <i className="fa-solid fa-users me-1"></i> Groups
                    <span className="badge bg-secondary ms-2">
                      {groups.length}
                    </span>
                  </button>
                </div>
              </div>

              <div className="search-chat">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list">
              {filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  {searchQuery
                    ? `No ${activeTab} found`
                    : `No ${activeTab} yet`}
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
                        <div className="d-flex align-items-center">
                          <h4 className="mb-0 me-2">
                            {getConversationName(conversation)}
                          </h4>
                          {conversation.group && (
                            <span className="badge bg-light text-dark">
                              <i className="fa-solid fa-users me-1"></i> Group
                            </span>
                          )}
                        </div>
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

          {/* Right Chat Window - FIXED: Group messages will now show properly */}
          <div className="chat-right col-md-8">
            {activeConversation ? (
              <>
                <div className="chat-topbar d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={getConversationAvatar(activeConversation)}
                      alt="avatar"
                      className="chat-avatar-lg"
                      onError={(e) => {
                        e.target.src = UserPic;
                      }}
                    />
                    <div className="ms-3">
                      <h3 className="mb-0">
                        {getConversationName(activeConversation)}
                      </h3>
                      {activeConversation.group && (
                        <small className="text-muted">
                          <i className="fa-solid fa-users me-1"></i>{" "}
                          {activeConversation.conversation_users?.length || 0}{" "}
                          members
                        </small>
                      )}
                    </div>
                  </div>

                  {activeConversation.group && (
                    <button className="btn dsgnbtn" onClick={openGroupSettings}>
                      <i className="fa-solid fa-gear me-1"></i> Group Settings
                    </button>
                  )}
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
                <p className="text-muted mb-4">
                  {activeTab === "chats"
                    ? "Start a conversation with a team member or customer"
                    : "Create or join a group chat"}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn dsgnbtn btn-lg"
                    onClick={() => setShowNewChat(true)}>
                    <i className="fa-solid fa-plus me-2"></i> Start New Chat
                  </button>
                  <button
                    className="btn border !border-black text-black"
                    onClick={() => setShowGroupModal(true)}>
                    <i className="fa-solid fa-users me-2"></i> Create Group
                  </button>
                </div>
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
            setAllLoadedUsers([]);
            setSelectedUserForChat(null);
            setInitialMessage("");
          }}
          title="Start New Chat"
          modalWidth="500px"
          content={
            <div className="new-chat-content">
              <div className="mb-3">
                <label className="form-label">Search Users</label>
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
                      className="btn border border-black text-black"
                      type="button"
                      onClick={() => setUserSearchQuery("")}>
                      <Icon icon="mdi:close" />
                    </button>
                  )}
                </div>
              </div>

              <div className="user-list-section mb-3">
                <label className="form-label">Select User</label>
                {isLoadingUsers && allLoadedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <p className="mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 border rounded">
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
                  </div>
                ) : (
                  <div
                    className="user-list"
                    style={{ maxHeight: "250px", overflowY: "auto" }}>
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
                          <small className="user-role text-muted">
                            {user.role === "team" ? "Team Member" : "Customer"}
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
                )}

                {!userSearchQuery && pagination.last_page > 1 && (
                  <div className="pagination-wrapper mt-3">
                    <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={currentPage === 1}
                        onClick={() => handleLoadPage(currentPage - 1)}>
                        <Icon icon="mdi:chevron-left" /> Prev
                      </button>
                      <div className="d-flex gap-1 flex-wrap">
                        {getPageNumbers().map((pageNum, idx) => (
                          <button
                            key={idx}
                            className={`btn btn-sm ${currentPage === pageNum ? "dsgnbtn" : "btn-outline-secondary"}`}
                            onClick={() =>
                              typeof pageNum === "number" &&
                              handleLoadPage(pageNum)
                            }>
                            {pageNum}
                          </button>
                        ))}
                      </div>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={currentPage === pagination.last_page}
                        onClick={() => handleLoadPage(currentPage + 1)}>
                        Next <Icon icon="mdi:chevron-right" />
                      </button>
                    </div>
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Page {currentPage} of {pagination.last_page} •{" "}
                        {pagination.total} users total
                      </small>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions d-flex gap-2 mt-4 pt-3 border-top">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => setShowNewChat(false)}>
                  Cancel
                </button>
                <button
                  className="btn dsgnbtn flex-fill"
                  onClick={handleStartNewChat}
                  disabled={!selectedUserForChat || wsStatus !== "CONNECTED"}>
                  {wsStatus !== "CONNECTED" ? (
                    <>
                      <Icon icon="mdi:wifi-off" className="me-2" />
                      Waiting for connection...
                    </>
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

        {/* Create Group Modal */}
        <DynamicModal
          show={showGroupModal}
          handleClose={handleGroupModalClose}
          title="Create New Group"
          modalWidth="600px"
          content={
            <div
              className="new-group-content"
              style={{
                maxHeight: "70vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
              <div className="flex-shrink-0">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="group-photo-upload">
                      <label className="form-label small mb-2">
                        Group Photo
                      </label>
                      <div
                        className="photo-preview border rounded p-2 text-center d-flex flex-column align-items-center justify-content-center"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: "pointer", height: "100px" }}>
                        {groupForm.photo ? (
                          <img
                            src={URL.createObjectURL(groupForm.photo)}
                            alt="Group preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "80px" }}
                          />
                        ) : (
                          <div className="photo-placeholder d-flex flex-column align-items-center justify-content-center h-100">
                            <Icon
                              icon="mdi:camera"
                              width="32"
                              height="32"
                              className="text-muted mb-1"
                            />
                            <small
                              className="text-muted"
                              style={{ fontSize: "11px" }}>
                              Add photo
                            </small>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleGroupPhotoChange}
                        accept="image/*"
                        hidden
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="mb-2">
                      <label className="form-label small mb-2">
                        Group Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter group name"
                        value={groupForm.name}
                        onChange={(e) =>
                          setGroupForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        placeholder="Enter group description (optional)"
                        value={groupForm.description}
                        onChange={(e) =>
                          setGroupForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows="2"
                        style={{ resize: "none" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="flex-grow-1"
                style={{ overflowY: "auto", minHeight: "0" }}>
                <div className="mb-3">
                  <label className="form-label small mb-2">
                    Add Members <span className="text-danger">*</span>
                  </label>
                  <div className="mb-2">
                    <div className="input-group input-group-sm">
                      <span
                        className="input-group-text"
                        style={{ padding: "0.25rem 0.5rem" }}>
                        <Icon icon="mdi:magnify" width="16" height="16" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search users to add..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        style={{ padding: "0.25rem 0.5rem" }}
                      />
                    </div>
                  </div>

                  <div
                    className="selected-users-container mb-2 p-2"
                    style={{
                      minHeight: "40px",
                      maxHeight: "80px",
                      overflowY: "auto",
                    }}>
                    {groupForm.selectedUsers.length === 0 ? (
                      <div className="text-muted text-center py-1">
                        <small>No members selected yet</small>
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        {groupForm.selectedUsers.filter(Boolean).map((user) => (
                          <div key={user.id} className="selected-user-badge-sm">
                            <div className="d-flex align-items-center gap-1">
                              <div className="selected-user-avatar-sm">
                                <img
                                  src={user.profile_picture || UserPic}
                                  alt={user.name}
                                  className="img-fluid rounded-circle"
                                  onError={(e) => {
                                    e.target.src = UserPic;
                                  }}
                                />
                              </div>
                              <span className="selected-user-name-sm">
                                {user.name.split(" ")[0]}
                              </span>
                              <button
                                type="button"
                                className="btn-remove-user-sm"
                                onClick={() =>
                                  setGroupForm((prev) => ({
                                    ...prev,
                                    selectedUsers: prev.selectedUsers.filter(
                                      (u) => u && u.id !== user.id,
                                    ),
                                  }))
                                }>
                                <Icon icon="mdi:close" width="10" height="10" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="user-list-section"
                    style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <label className="form-label small mb-2">
                      Available Users
                    </label>
                    {isLoadingUsers ? (
                      <div className="text-center py-2">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                        <p className="mt-1 small">Loading users...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-2 border rounded">
                        <small className="text-muted">
                          {userSearchQuery
                            ? "No users found"
                            : "No users available"}
                        </small>
                      </div>
                    ) : (
                      <div className="user-list-sm">
                        {filteredUsers
                          .filter(
                            (user) =>
                              !groupForm.selectedUsers.some(
                                (selected) =>
                                  selected && selected.id === user.id,
                              ),
                          )
                          .map((user) => (
                            <div
                              key={user.id}
                              className="user-item-sm"
                              onClick={() =>
                                setGroupForm((prev) => ({
                                  ...prev,
                                  selectedUsers: [...prev.selectedUsers, user],
                                }))
                              }>
                              <div className="user-avatar-sm">
                                <img
                                  src={user.profile_picture || UserPic}
                                  alt={user.name}
                                  onError={(e) => {
                                    e.target.src = UserPic;
                                  }}
                                />
                              </div>
                              <div className="user-details-sm flex-grow-1">
                                <h6 className="mb-0 small fw-semibold">
                                  {user.name}
                                </h6>
                                <small className="user-role-sm text-muted">
                                  {user.role === "team" ? "Team" : "Customer"}
                                </small>
                              </div>
                              <div className="add-icon-sm">
                                <Icon
                                  icon="mdi:plus-circle"
                                  className="text-success"
                                  width="18"
                                  height="18"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions d-flex gap-2 pt-3 border-top flex-shrink-0">
                <button
                  className="btn btn-outline-secondary btn-sm flex-fill"
                  onClick={handleGroupModalClose}
                  disabled={isCreatingGroup}>
                  Cancel
                </button>
                <button
                  className="btn dsgnbtn btn-sm flex-fill"
                  onClick={handleCreateGroup}
                  disabled={
                    isCreatingGroup ||
                    !groupForm.name.trim() ||
                    groupForm.selectedUsers.length === 0
                  }>
                  {isCreatingGroup ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    <>Create Group</>
                  )}
                </button>
              </div>
            </div>
          }
        />

        {/* Group Settings Modal */}
        <DynamicModal
          show={showGroupSettings}
          handleClose={() => {
            setShowGroupSettings(false);
            setEditingGroup(null);
            setGroupForm({
              name: "",
              description: "",
              photo: null,
              selectedUsers: [],
            });
            setShowManageMembers(false);
            setUserSearchQuery("");
          }}
          title="Group Settings"
          modalWidth="700px"
          content={
            <div className="group-settings-content">
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${!showManageMembers ? "active" : ""}`}
                    onClick={() => setShowManageMembers(false)}>
                    <i className="fa-solid fa-gear me-1"></i> Group Info
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${showManageMembers ? "active" : ""}`}
                    onClick={() => setShowManageMembers(true)}>
                    <i className="fa-solid fa-users me-1"></i> Manage Members
                  </button>
                </li>
              </ul>

              {!showManageMembers ? (
                <div className="group-info-tab">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="group-photo-upload">
                        <label className="form-label">Group Photo</label>
                        <div
                          className="photo-preview border rounded p-3 text-center d-flex flex-column align-items-center justify-content-center"
                          style={{ minHeight: "150px" }}>
                          {activeConversation?.group?.photo ? (
                            <img
                              src={activeConversation.group.photo}
                              alt="Group"
                              className="img-fluid rounded"
                              style={{ maxHeight: "120px" }}
                            />
                          ) : (
                            <div className="photo-placeholder h-100 d-flex flex-column align-items-center justify-content-center">
                              <Icon
                                icon="mdi:account-group"
                                width="48"
                                height="48"
                                className="text-muted"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Group Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={groupForm.name}
                          onChange={(e) =>
                            setGroupForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Description (Optional)
                        </label>
                        <textarea
                          className="form-control"
                          placeholder="Group description (optional)"
                          value={groupForm.description}
                          onChange={(e) =>
                            setGroupForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleDeleteGroup}>
                      <i className="fa-solid fa-trash me-1"></i> Delete Group
                    </button>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowGroupSettings(false)}>
                        Cancel
                      </button>
                      <button
                        className="btn dsgnbtn"
                        onClick={handleUpdateGroup}
                        disabled={isUpdatingGroup}>
                        {isUpdatingGroup ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="manage-members-tab">
                  <div className="mb-3">
                    <label className="form-label">Search Members</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Icon icon="mdi:magnify" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search members..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div
                    className="members-list"
                    style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {activeConversation?.conversation_users
                      ?.filter((cu) => cu && cu.user)
                      ?.filter(
                        (cu) =>
                          cu.user?.name
                            ?.toLowerCase()
                            .includes(userSearchQuery.toLowerCase()) ||
                          !userSearchQuery,
                      )
                      .map((conversationUser) => (
                        <div
                          key={conversationUser.user_id}
                          className="member-item d-flex align-items-center justify-content-between p-3 border rounded mb-2">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                conversationUser.user?.profile_picture ||
                                UserPic
                              }
                              alt={conversationUser.user?.name}
                              className="member-avatar rounded-circle me-3"
                              width="40"
                              height="40"
                              onError={(e) => {
                                e.target.src = UserPic;
                              }}
                            />
                            <div>
                              <h6 className="mb-0">
                                {conversationUser.user?.name}
                              </h6>
                              <small className="text-muted">
                                {conversationUser.user?.role === "team"
                                  ? "Team Member"
                                  : "Customer"}
                                {conversationUser.user_id === currentUserId &&
                                  " • (You)"}
                              </small>
                            </div>
                          </div>

                          {conversationUser.user_id !== currentUserId && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleRemoveMember(conversationUser.user_id)
                              }>
                              <i className="fa-solid fa-user-minus me-1"></i>{" "}
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowGroupSettings(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </section>

      {/* Delete Confirm Modal */}
      <DynamicModal
        show={showDeleteConfirm}
        handleClose={() => {
          setShowDeleteConfirm(false);
          setGroupToDelete(null);
        }}
        title="Delete Group"
        modalWidth="400px"
        content={
          <div className="delete-confirm-content">
            <div className="text-center mb-4">
              <Icon
                icon="mdi:alert-circle"
                className="text-warning mb-3"
                width="64"
                height="64"
              />
              <h5 className="mb-3">Are you sure?</h5>
              <p className="text-muted">
                You are about to delete the group "{groupToDelete?.name}". This
                action cannot be undone and all messages will be permanently
                lost.
              </p>
            </div>

            <div className="modal-actions d-flex gap-2 mt-4">
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setGroupToDelete(null);
                }}>
                Cancel
              </button>
              <button
                className="btn dsgnbtn flex-fill"
                onClick={confirmDeleteGroup}>
                Delete Group
              </button>
            </div>
          </div>
        }
      />
    </MasterLayout>
  );
};

export default ChatPage;
