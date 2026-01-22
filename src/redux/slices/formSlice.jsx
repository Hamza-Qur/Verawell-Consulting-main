// src/redux/slices/formSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get categories list only
export const getCategories = createAsyncThunk(
  "form/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/category/get-list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch categories");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Get specific category by ID (1 = Kitchen Sanitation, 2 = Meel Observation)
export const getCategoryById = createAsyncThunk(
  "form/getCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/category/get/${categoryId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch category");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Get assigned assessments
export const getAssignedAssessments = createAsyncThunk(
  "form/getAssignedAssessments",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assign-assessment/get?page=${page}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch assigned assessments"
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Get assessment by ID
export const getAssessmentById = createAsyncThunk(
  "form/getAssessmentById",
  async (assessment_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get/${assessment_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch assessment");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Store/submit assessment
export const storeAssessment = createAsyncThunk(
  "form/storeAssessment",
  async (assessmentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Format form data for multipart/form-data
      const formData = new FormData();

      // Add assigned_assessment_id
      formData.append(
        "assigned_assessment_id",
        assessmentData.assigned_assessment_id
      );

      // Add answers array - ALL 37 questions
      if (assessmentData.answers && Array.isArray(assessmentData.answers)) {
        assessmentData.answers.forEach((answer, index) => {
          formData.append(`answers[${index}][question_id]`, answer.question_id);
          formData.append(
            `answers[${index}][satisfactory]`,
            answer.satisfactory || 0
          );
          formData.append(
            `answers[${index}][need_improvement]`,
            answer.need_improvement || 0
          );
          formData.append(`answers[${index}][comments]`, answer.comments || "");
        });
      }

      // Add documents if any
      if (assessmentData.documents && Array.isArray(assessmentData.documents)) {
        assessmentData.documents.forEach((document, index) => {
          formData.append(`documents[${index}]`, document);
        });
      }

      const response = await fetch(`${BASE_URL}/api/assessment/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to store assessment");
      }

      return data;
    } catch (err) {
      console.error("Store assessment error:", err);
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Update assessment
export const updateAssessment = createAsyncThunk(
  "form/updateAssessment",
  async (updateData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/assessment/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update assessment");
      }

      return data;
    } catch (err) {
      console.error("Update assessment error:", err);
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const formSlice = createSlice({
  name: "form",
  initialState: {
    categories: [],
    currentCategory: null,
    assignedAssessments: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 100,
      total: 0,
      first_page_url: "",
      from: null,
      last_page_url: "",
      links: [],
      next_page_url: null,
      path: "",
      prev_page_url: null,
      to: null,
    },
    currentAssessment: null,
    isUpdatingAssessment: false,
    updateAssessmentError: null,
    updateAssessmentSuccess: null,
    isLoading: false,
    isCategoryLoading: false,
    isAssignedAssessmentsLoading: false,
    isAssessmentLoading: false,
    isStoringAssessment: false,
    error: null,
    categoryError: null,
    assignedAssessmentsError: null,
    assessmentError: null,
    storeAssessmentError: null,
    storeAssessmentSuccess: null,
  },
  reducers: {
    clearFormState: (state) => {
      state.error = null;
      state.categoryError = null;
      state.assignedAssessmentsError = null;
      state.assessmentError = null;
      state.storeAssessmentError = null;
      state.storeAssessmentSuccess = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.categoryError = null;
    },
    clearAssignedAssessments: (state) => {
      state.assignedAssessments = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 100,
        total: 0,
        first_page_url: "",
        from: null,
        last_page_url: "",
        links: [],
        next_page_url: null,
        path: "",
        prev_page_url: null,
        to: null,
      };
      state.assignedAssessmentsError = null;
    },
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
      state.assessmentError = null;
    },
    clearStoreAssessmentState: (state) => {
      state.storeAssessmentError = null;
      state.storeAssessmentSuccess = null;
    },
    setAssignedAssessmentsPage: (state, action) => {
      state.assignedAssessments.current_page = action.payload;
    },
    clearUpdateAssessmentState: (state) => {
      state.updateAssessmentError = null;
      state.updateAssessmentSuccess = null;
    },
    setEditingMode: (state, action) => {
      // Optional: You can add a reducer to set editing mode
      state.isEditing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Categories
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.categories = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to fetch categories";
        }
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      });

    // Get Category by ID
    builder
      .addCase(getCategoryById.pending, (state) => {
        state.isCategoryLoading = true;
        state.categoryError = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isCategoryLoading = false;
        if (action.payload.success) {
          state.currentCategory = action.payload.data || null;
        } else {
          state.categoryError =
            action.payload.message || "Failed to fetch category";
        }
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isCategoryLoading = false;
        state.categoryError = action.payload || "Failed to fetch category";
      });

    // Get Assigned Assessments
    builder
      .addCase(getAssignedAssessments.pending, (state) => {
        state.isAssignedAssessmentsLoading = true;
        state.assignedAssessmentsError = null;
      })
      .addCase(getAssignedAssessments.fulfilled, (state, action) => {
        state.isAssignedAssessmentsLoading = false;
        if (action.payload.success) {
          state.assignedAssessments = {
            ...action.payload.data,
            // Ensure all properties exist
            data: action.payload.data.data || [],
            current_page: action.payload.data.current_page || 1,
            last_page: action.payload.data.last_page || 1,
            per_page: action.payload.data.per_page || 100,
            total: action.payload.data.total || 0,
            first_page_url: action.payload.data.first_page_url || "",
            from: action.payload.data.from || null,
            last_page_url: action.payload.data.last_page_url || "",
            links: action.payload.data.links || [],
            next_page_url: action.payload.data.next_page_url || null,
            path: action.payload.data.path || "",
            prev_page_url: action.payload.data.prev_page_url || null,
            to: action.payload.data.to || null,
          };
        } else {
          state.assignedAssessmentsError =
            action.payload.message || "Failed to fetch assigned assessments";
        }
      })
      .addCase(getAssignedAssessments.rejected, (state, action) => {
        state.isAssignedAssessmentsLoading = false;
        state.assignedAssessmentsError =
          action.payload || "Failed to fetch assigned assessments";
      });

    // Get Assessment by ID
    builder
      .addCase(getAssessmentById.pending, (state) => {
        state.isAssessmentLoading = true;
        state.assessmentError = null;
      })
      .addCase(getAssessmentById.fulfilled, (state, action) => {
        state.isAssessmentLoading = false;
        if (action.payload.success) {
          state.currentAssessment = action.payload.data || null;
        } else {
          state.assessmentError =
            action.payload.message || "Failed to fetch assessment";
        }
      })
      .addCase(getAssessmentById.rejected, (state, action) => {
        state.isAssessmentLoading = false;
        state.assessmentError = action.payload || "Failed to fetch assessment";
      });

    // Store/Submit Assessment
    builder
      .addCase(storeAssessment.pending, (state) => {
        state.isStoringAssessment = true;
        state.storeAssessmentError = null;
        state.storeAssessmentSuccess = null;
      })
      .addCase(storeAssessment.fulfilled, (state, action) => {
        state.isStoringAssessment = false;
        if (action.payload.success) {
          state.storeAssessmentSuccess =
            action.payload.message || "Assessment submitted successfully";
          // Update current assessment with new data if needed
          if (action.payload.data) {
            state.currentAssessment = action.payload.data;
          }
        } else {
          state.storeAssessmentError =
            action.payload.message || "Failed to submit assessment";
        }
      })
      .addCase(storeAssessment.rejected, (state, action) => {
        state.isStoringAssessment = false;
        state.storeAssessmentError = action.payload;
      });

    // Update Assessment
    builder
      .addCase(updateAssessment.pending, (state) => {
        state.isUpdatingAssessment = true;
        state.updateAssessmentError = null;
        state.updateAssessmentSuccess = null;
      })
      .addCase(updateAssessment.fulfilled, (state, action) => {
        state.isUpdatingAssessment = false;
        if (action.payload.success) {
          state.updateAssessmentSuccess =
            action.payload.message || "Assessment updated successfully";
          // Update the current assessment with the new data
          if (action.payload.data) {
            state.currentAssessment = {
              ...state.currentAssessment,
              ...action.payload.data,
              // Update answers if returned in response
              category: {
                ...state.currentAssessment?.category,
                questions:
                  state.currentAssessment?.category?.questions?.map((q) => {
                    const updatedAnswer = action.payload.data.answers?.find(
                      (a) => a.question_id === q.question_id
                    );
                    if (updatedAnswer) {
                      return {
                        ...q,
                        answer: {
                          ...q.answer,
                          ...updatedAnswer,
                        },
                      };
                    }
                    return q;
                  }) || [],
              },
            };
          }
        } else {
          state.updateAssessmentError =
            action.payload.message || "Failed to update assessment";
        }
      })
      .addCase(updateAssessment.rejected, (state, action) => {
        state.isUpdatingAssessment = false;
        state.updateAssessmentError = action.payload;
      });
  },
});

export const {
  clearFormState,
  clearCategories,
  clearCurrentCategory,
  clearAssignedAssessments,
  clearCurrentAssessment,
  clearUpdateAssessmentState,
  clearStoreAssessmentState,
  setAssignedAssessmentsPage,
} = formSlice.actions;
export default formSlice.reducer;
