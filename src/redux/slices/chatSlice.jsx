// src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

export const getMyConversations = createAsyncThunk(
  "chat/getMyConversations",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/chat/my-conversations`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch conversations");
      }

      // Fix URL escaping if needed
      const transformedConversations = (data.data || []).map((conversation) => {
        const transformedConv = JSON.parse(JSON.stringify(conversation));

        // Fix escaped URLs in conversation users
        if (transformedConv.conversation_users) {
          transformedConv.conversation_users =
            transformedConv.conversation_users.map((cu) => {
              if (cu.user && cu.user.profile_picture) {
                cu.user.profile_picture = cu.user.profile_picture.replace(
                  /\\\//g,
                  "/",
                );
              }
              return cu;
            });
        }

        // Fix escaped URLs in group photos
        if (transformedConv.group && transformedConv.group.photo) {
          transformedConv.group.photo = transformedConv.group.photo.replace(
            /\\\//g,
            "/",
          );
        }

        return transformedConv;
      });

      return transformedConversations;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

export const getConversationMessages = createAsyncThunk(
  "chat/getConversationMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/api/chat/conversation/${conversationId}/messages`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch messages");
      }

      const transformedMessages = (data.data || []).map((msg) => ({
        ...msg,
        file_content: msg.file_contents || [],
        created_at: msg.created_at,
        updated_at: msg.updated_at,
      }));

      return {
        conversationId,
        messages: transformedMessages,
      };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

// Group Chat APIs (keep as is)
export const createGroupChat = createAsyncThunk(
  "chat/createGroupChat",
  async (groupData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", groupData.name);
      formData.append("description", groupData.description || "");

      if (groupData.photo) {
        formData.append("photo", groupData.photo);
      }

      groupData.user_ids.forEach((userId, index) => {
        formData.append(`user_ids[${index}]`, userId);
      });

      const res = await fetch(`${BASE_URL}/api/chat/group/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to create group");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

export const updateGroupChat = createAsyncThunk(
  "chat/updateGroupChat",
  async (updateData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/chat/group/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: updateData.conversation_id,
          name: updateData.name,
          description: updateData.description || "",
          user_ids: updateData.user_ids || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to update group");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

export const removeGroupMember = createAsyncThunk(
  "chat/removeGroupMember",
  async ({ conversation_id, user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/api/chat/group/delete-member?conversation_id=${conversation_id}&user_id=${user_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id,
            name: "",
            description: "",
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to remove member");
      }

      return { conversation_id, user_id, data: data.data };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

export const deleteGroupChat = createAsyncThunk(
  "chat/deleteGroupChat",
  async (conversation_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/api/chat/group/delete/${conversation_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id,
            name: "",
            description: "",
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to delete group");
      }

      return conversation_id;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messagesByConversation: {},
    activeConversationId: null,
    socketConnected: false,
    isLoading: false,
    isCreatingGroup: false,
    isUpdatingGroup: false,
    error: null,
  },
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    addIncomingMessage(state, action) {
      const { conversationId, message } = action.payload;

      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }

      // Check for duplicates
      const isDuplicate = state.messagesByConversation[conversationId].some(
        (msg) => msg.id === message.id,
      );

      if (!isDuplicate) {
        // FIXED: Properly handle the incoming message structure
        const transformedMessage = {
          id: message.id,
          sender_id: message.sender_id,
          text: message.text,
          created_at: message.created_at || new Date().toISOString(),
          updated_at: message.updated_at || new Date().toISOString(),
          file_content: message.file_contents || message.file_content || [],
          // Add other fields if needed
        };

        // FIXED: Use push instead of unshift to maintain chronological order
        state.messagesByConversation[conversationId].push(transformedMessage);
      }
    },
    setSocketStatus(state, action) {
      state.socketConnected = action.payload;
    },
    clearChat(state) {
      state.conversations = [];
      state.messagesByConversation = {};
      state.activeConversationId = null;
    },
    updateConversationInList(state, action) {
      const updatedConversation = action.payload;
      const index = state.conversations.findIndex(
        (conv) => conv.id === updatedConversation.id,
      );

      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...updatedConversation,
        };
      }
    },
    removeConversationFromList(state, action) {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter(
        (conv) => conv.id !== conversationId,
      );

      delete state.messagesByConversation[conversationId];

      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
    },
    updateGroupMembers(state, action) {
      const { conversationId, members } = action.payload;
      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId,
      );

      if (conversation) {
        conversation.members = members;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(getMyConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getConversationMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        // FIXED: Replace messages instead of appending
        state.messagesByConversation[action.payload.conversationId] =
          action.payload.messages;
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Group Chat
    builder
      .addCase(createGroupChat.pending, (state) => {
        state.isCreatingGroup = true;
        state.error = null;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.isCreatingGroup = false;
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.isCreatingGroup = false;
        state.error = action.payload;
      });

    // Update Group Chat
    builder
      .addCase(updateGroupChat.pending, (state) => {
        state.isUpdatingGroup = true;
        state.error = null;
      })
      .addCase(updateGroupChat.fulfilled, (state, action) => {
        state.isUpdatingGroup = false;
        const index = state.conversations.findIndex(
          (conv) => conv.id === action.payload.id,
        );
        if (index !== -1) {
          state.conversations[index] = {
            ...state.conversations[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateGroupChat.rejected, (state, action) => {
        state.isUpdatingGroup = false;
        state.error = action.payload;
      });

    // Remove Group Member
    builder.addCase(removeGroupMember.fulfilled, (state, action) => {
      const { conversation_id, user_id } = action.payload;
      const conversation = state.conversations.find(
        (conv) => conv.id === conversation_id,
      );

      if (conversation && conversation.members) {
        conversation.members = conversation.members.filter(
          (member) => member.id !== user_id,
        );
      }
    });

    // Delete Group Chat
    builder.addCase(deleteGroupChat.fulfilled, (state, action) => {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter(
        (conv) => conv.id !== conversationId,
      );
      delete state.messagesByConversation[conversationId];
      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
    });
  },
});

export const {
  setActiveConversation,
  addIncomingMessage,
  setSocketStatus,
  clearChat,
  updateConversationInList,
  removeConversationFromList,
  updateGroupMembers,
} = chatSlice.actions;

export default chatSlice.reducer;
