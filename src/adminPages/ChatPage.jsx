import React, { useState, useRef, useEffect } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import profile1 from "../otherImages/profileImage1.png";
import profile2 from "../otherImages/profileImage2.png";
import profile3 from "../otherImages/profileImage3.png";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState("Sara Doe");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Chat");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const [allChats, setAllChats] = useState({
    "Sara Doe": [
      {
        id: 1,
        sender: "Sara Doe",
        time: "4:56PM",
        text: "Hey Buddy! How’s your day going?",
        type: "received",
      },
      {
        id: 2,
        sender: "You",
        time: "4:58PM",
        text: "Hello Sara! I’m doing great!",
        type: "sent",
      },
    ],
    "Susan Doe": [
      {
        id: 1,
        sender: "Susan Doe",
        time: "4:10PM",
        text: "Hi, I want to visit soon.",
        type: "received",
      },
    ],
    "Thomas Doe": [
      {
        id: 1,
        sender: "Thomas Doe",
        time: "3:00PM",
        text: "Want to visit on 9:00PM...",
        type: "received",
      },
    ],
    "Daniel Doe": [
      {
        id: 1,
        sender: "Daniel Doe",
        time: "5:20PM",
        text: "Do you have ADHD treatment?",
        type: "received",
      },
    ],
    "Sara Doe": [
      {
        id: 1,
        sender: "Sara Doe",
        time: "4:56PM",
        text: "Hey Buddy! How’s your day going?",
        type: "received",
      },
      {
        id: 2,
        sender: "You",
        time: "4:58PM",
        text: "Hello Sara! I’m doing great!",
        type: "sent",
      },
    ],
    "Susan Doe": [
      {
        id: 1,
        sender: "Susan Doe",
        time: "4:10PM",
        text: "Hi, I want to visit soon.",
        type: "received",
      },
    ],
    "Thomas Doe": [
      {
        id: 1,
        sender: "Thomas Doe",
        time: "3:00PM",
        text: "Want to visit on 9:00PM...",
        type: "received",
      },
    ],
    "Daniel Doe": [
      {
        id: 1,
        sender: "Daniel Doe",
        time: "5:20PM",
        text: "Do you have ADHD treatment?",
        type: "received",
      },
    ],
    "Tech Team": [
      {
        id: 1,
        sender: "SEO Team",
        time: "5:20PM",
        text: "What about the ranking?",
        type: "received",
      },
      {
        id: 2,
        sender: "Tech Team",
        time: "5:20PM",
        text: "Have you completed the document?",
        type: "received",
      },
      {
        id: 2,
        sender: "You",
        time: "4:58PM",
        text: "Hello Team! I’m doing great!",
        type: "sent",
      },
    ],
    "Project Group": [
      {
        id: 1,
        sender: "Team Lead",
        time: "5:20PM",
        text: "Have you completed the document?",
        type: "received",
      },
      {
        id: 2,
        sender: "Project Group",
        time: "5:20PM",
        text: "What's happening",
        type: "received",
      },
      {
        id: 3,
        sender: "You",
        time: "4:58PM",
        text: "Hello Team! I’m doing great!",
        type: "sent",
      },
    ],
  });

  const chats = [
    { id: 1, name: "Sara Doe", avatar: profile1, messageRecieved: 2 },
    { id: 2, name: "Susan Doe", avatar: profile2, messageRecieved: 3 },
    { id: 3, name: "Thomas Doe", avatar: profile3, messageRecieved: 1 },
    { id: 4, name: "Daniel Doe", avatar: profile2, messageRecieved: 0 },
    { id: 5, name: "Sara Doe", avatar: profile1, messageRecieved: 2 },
    { id: 6, name: "Susan Doe", avatar: profile2, messageRecieved: 3 },
    { id: 7, name: "Thomas Doe", avatar: profile3, messageRecieved: 1 },
    { id: 8, name: "Daniel Doe", avatar: profile2, messageRecieved: 0 },
  ];

  const groupChats = [
    { id: 1, name: "Tech Team", avatar: profile1, messageRecieved: 5 },
    { id: 2, name: "Project Group", avatar: profile2, messageRecieved: 7 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, allChats]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const msg = {
      id: Date.now(),
      sender: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: newMessage,
      type: "sent",
    };

    setAllChats((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), msg],
    }));

    setNewMessage("");
  };

  const currentMessages = allChats[selectedChat] || [];

  const getChatPreview = (chatName) => {
    const messages = allChats[chatName];
    if (!messages || messages.length === 0)
      return { label: "", message: "No messages yet" };

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.type === "received") {
      return { label: "Send a message", message: lastMsg.text };
    } else {
      return { label: "", message: lastMsg.text };
    }
  };

  // Get avatar of selected chat dynamically
  const selectedChatAvatar = chats.find(
    (chat) => chat.name === selectedChat
  )?.avatar;

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter group chats similarly (if needed)
  const filteredGroupChats = groupChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MasterLayout>
      <section className="chat-section">
        <div className="flex chat-row row">
          {/* Left Sidebar */}
          <div className="chat-left col-md-4">
            <div className="chat-header">
              <h1>Chat</h1>
              <button
                className={`tab-btn ${activeTab === "Chat" ? "active" : ""}`}
                onClick={() => setActiveTab("Chat")}>
                Chat
              </button>
              <button
                className={`tab-btn ${
                  activeTab === "Group Chat" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Group Chat")}>
                Group Chat
              </button>
              <div className="search-chat">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list">
              {/* Display either chats or group chats based on selected tab */}
              {(activeTab === "Chat" ? filteredChats : filteredGroupChats).map(
                (chat) => {
                  const preview = getChatPreview(chat.name);
                  return (
                    <div
                      key={chat.id}
                      className={`chat-item ${
                        selectedChat === chat.name ? "active" : ""
                      }`}
                      onClick={() => setSelectedChat(chat.name)}>
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="chat-avatar"
                      />
                      <div className="chat-info d-flex align-items-center justify-content-between w-100">
                        <div className="clientInfo">
                          <h4>{chat.name}</h4>
                          <p>{preview.message}</p>
                        </div>
                        <div className="clientInfoTime">
                          <span className="chat-time">
                            {allChats[chat.name]?.[
                              allChats[chat.name].length - 1
                            ]?.time || ""}
                          </span>
                          {chat.messageRecieved !== 0 && (
                            <span className="chat-number">
                              {chat.messageRecieved}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Right Chat Window */}
          <div className="chat-right col-md-8">
            <div className="chat-topbar">
              <img
                src={selectedChatAvatar || profile1}
                alt={selectedChat}
                className="chat-avatar-lg"
              />
              <h3>{selectedChat}</h3>
            </div>

            <div className="chat-window">
              <div className="chat-date">Today</div>

              <div className="chat-messages">
                {allChats[selectedChat]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${
                      msg.type === "sent" ? "sent" : "received"
                    }`}>
                    <div className="recieved-name">
                      {msg.type === "received" && (
                        <span className="chat-sender">{msg.sender}</span>
                      )}
                      <span className="chat-time">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Type a message ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </MasterLayout>
  );
};

export default ChatPage;
