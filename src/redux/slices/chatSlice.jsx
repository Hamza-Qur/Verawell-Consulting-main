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

      return data.data || [];
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

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messagesByConversation: {},
    activeConversationId: null,
    socketConnected: false,
    isLoading: false,
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
        msg => msg.id === message.id
      );

      if (!isDuplicate) {
        const transformedMessage = {
          ...message,
          file_content: message.file_contents || message.file_content || [],
        };

        state.messagesByConversation[conversationId].unshift(transformedMessage);
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
        state.messagesByConversation[action.payload.conversationId] =
          action.payload.messages;
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveConversation,
  addIncomingMessage,
  setSocketStatus,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;