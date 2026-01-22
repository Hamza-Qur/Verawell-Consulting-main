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
      console.log("Conversations API response:", data); // Add this for debugging

      if (!res.ok) {
        console.error("Conversations API error:", data);
        return rejectWithValue(data.message || "Failed to fetch conversations");
      }

      return data.data || [];
    } catch (error) {
      console.error("Conversations network error:", error);
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
      console.log(
        `Messages API response for conversation ${conversationId}:`,
        data,
      );

      if (!res.ok) {
        console.error("Messages API error:", data);
        return rejectWithValue(data.message || "Failed to fetch messages");
      }

      // Transform the data to match your expected structure
      const transformedMessages = (data.data || []).map((msg) => ({
        ...msg,
        // Add any missing fields or rename fields if needed
        file_content: msg.file_contents || [], // Rename file_contents to file_content
        created_at: msg.created_at,
        updated_at: msg.updated_at,
      }));

      return {
        conversationId,
        messages: transformedMessages,
      };
    } catch (error) {
      console.error("Messages network error:", error);
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

      // Transform incoming message if needed
      const transformedMessage = {
        ...message,
        file_content: message.file_contents || message.file_content || [],
      };

      state.messagesByConversation[conversationId].unshift(transformedMessage); // Add to beginning
    },
    setSocketStatus(state, action) {
      state.socketConnected = action.payload;
    },
    clearChat(state) {
      state.conversations = [];
      state.messagesByConversation = {};
      state.activeConversationId = null;
    },
    // Add a reducer to update conversation's last message
    updateConversationLastMessage(state, action) {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(
        (c) => c.id === conversationId,
      );
      if (conversation) {
        conversation.last_message = message;
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
        console.error("getMyConversations rejected:", action.payload);
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
        console.error("getConversationMessages rejected:", action.payload);
      });
  },
});

export const {
  setActiveConversation,
  addIncomingMessage,
  setSocketStatus,
  clearChat,
  updateConversationLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
