import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MasterLayout from "../otherImages/MasterLayout";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  getCategoryById,
  storeAssessment,
  clearStoreAssessmentState,
} from "../redux/slices/formSlice";

const KitchenFillForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentCategory,
    isCategoryLoading,
    categoryError,
    isStoringAssessment,
    storeAssessmentError,
    storeAssessmentSuccess,
  } = useSelector((state) => state.form);

  const [formData, setFormData] = useState({});
  const [attachedFile, setAttachedFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFileError, setIsFileError] = useState(false);
  const [sections, setSections] = useState([]);

  // Get category_id from navigation state
  const category_id = location.state?.category_id;

  // Fetch category questions on component mount
  useEffect(() => {
    if (category_id) {
      dispatch(getCategoryById(category_id));
    } else {
      // Fallback to category_id 1 for Kitchen if not provided
      dispatch(getCategoryById(1));
    }
  }, [dispatch, category_id]);

  // Transform API questions into sections format
  useEffect(() => {
    if (currentCategory?.questions) {
      const transformedSections = currentCategory.questions.map(
        (question, index) => ({
          id: `question-${question.question_id}`,
          label: question.question,
          question_id: question.question_id,
          order: question.order || index + 1,
        })
      );
      setSections(transformedSections);
    }
  }, [currentCategory]);

  // Clear success message on component mount
  useEffect(() => {
    dispatch(clearStoreAssessmentState());
  }, [dispatch]);

  // Only show success message when API is successful
  useEffect(() => {
    if (storeAssessmentSuccess && !message.text) {
      setMessage({ type: "success", text: storeAssessmentSuccess });
    }
  }, [storeAssessmentSuccess, message.text]);

  // Show error message
  useEffect(() => {
    if (storeAssessmentError && !message.text) {
      setMessage({ type: "error", text: storeAssessmentError });
    }
    if (categoryError && !message.text) {
      setMessage({ type: "error", text: categoryError });
    }
  }, [storeAssessmentError, categoryError, message.text]);

  const isFormComplete =
    sections.length > 0 &&
    sections.every((section) => formData[section.id]?.status);

  const handleToggle = (sectionId, clickedStatus) => {
    const currentStatus = formData[sectionId]?.status;
    const newStatus = currentStatus === clickedStatus ? null : clickedStatus;

    setFormData({
      ...formData,
      [sectionId]: {
        ...formData[sectionId],
        status: newStatus,
      },
    });

    // Clear any existing messages when user interacts
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleComment = (sectionId, comment) => {
    setFormData({
      ...formData,
      [sectionId]: { ...formData[sectionId], comment },
    });
  };

  const handleSubmit = async () => {
    if (!id) {
      setMessage({
        type: "error",
        text: "No assessment ID found.",
      });
      return;
    }

    if (isFormSubmitted) {
      setMessage({
        type: "error",
        text: "Form already submitted.",
      });
      return;
    }

    const answers = sections.map((section) => {
      const sectionData = formData[section.id] || {};
      const status = sectionData.status;

      let satisfactory = 0;
      let need_improvement = 0;

      if (status === "satisfactory") {
        satisfactory = 1;
        need_improvement = 0;
      } else if (status === "improvement") {
        satisfactory = 0;
        need_improvement = 1;
      }

      return {
        question_id: section.question_id,
        satisfactory: satisfactory,
        need_improvement: need_improvement,
        comments: sectionData.comment || "",
      };
    });

    const assessmentData = {
      assigned_assessment_id: parseInt(id),
      answers: answers,
      documents: attachedFile ? [attachedFile] : [],
    };

    const result = await dispatch(storeAssessment(assessmentData));

    if (storeAssessment.fulfilled.match(result)) {
      setIsFormSubmitted(true);
      const newAssessmentId =
        result.payload.data?.assessment_id || result.payload.data?.id;

      // Don't set message here - it will be set by the useEffect when storeAssessmentSuccess changes

      setTimeout(() => {
        if (newAssessmentId) {
          // Navigate to view-form with the new assessment ID
          navigate(`/view-form/${newAssessmentId}`, {
            state: {
              assessmentId: newAssessmentId,
              category_id: category_id, // Pass the same category_id
              category_name: currentCategory?.name,
              isCompleted: true,
            },
          });
        } else {
          navigate("/facility-forms");
        }
      }, 2000);
    } else if (storeAssessment.rejected.match(result)) {
      const errorMessage = result.payload || "Unknown error";
      setMessage({
        type: "error",
        text: `Submission failed: ${errorMessage}`,
      });
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".xls",
      ".xlsx",
      ".csv",
      ".doc",
      ".docx",
    ];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension)
    );
  };

  const handleAttachFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.xls,.xlsx,.csv,.doc,.docx";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (validateFile(file)) {
          setAttachedFile(file);
          setIsFileError(false);
        } else {
          setMessage({
            type: "error",
            text: "Invalid file type. Please upload PDF, Excel, CSV, or Word documents only.",
          });
          setIsFileError(true);
        }
      }
    };
    input.click();
  };

  const calculateScore = () => {
    const totalMarks = sections.length * 3;
    let earnedMarks = 0;

    sections.forEach((section) => {
      const status = formData[section.id]?.status;
      if (status === "satisfactory") earnedMarks += 3;
      if (status === "improvement") earnedMarks -= 3;
    });

    const percentage = totalMarks
      ? Math.round((earnedMarks / totalMarks) * 100)
      : 0;

    let color = "#28a745";
    if (percentage < 0) color = "#dc3545";
    else if (percentage < 40) color = "#dc3545";
    else if (percentage < 70) color = "#fd7e14";

    return { percentage, color };
  };

  const { percentage, color } = calculateScore();

  // Loading state
  if (isCategoryLoading) {
    return (
      <MasterLayout>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "30px",
          }}>
          <span
            onClick={() => navigate("/facility-forms")}
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              color: "#8B2885",
            }}>
            <Icon
              icon="mdi:arrow-left-bold-circle"
              width="34"
              height="34"
              color="#8B2885"
            />
          </span>
          Loading Questions...
        </h2>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading questions...</span>
          </div>
        </div>
      </MasterLayout>
    );
  }

  // Error state
  if (categoryError) {
    return (
      <MasterLayout>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "30px",
          }}>
          <span
            onClick={() => navigate("/facility-forms")}
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              color: "#8B2885",
            }}>
            <Icon
              icon="mdi:arrow-left-bold-circle"
              width="34"
              height="34"
              color="#8B2885"
            />
          </span>
          {currentCategory?.name || "Assessment Form"}
        </h2>
        <div className="alert alert-danger" role="alert">
          Error loading questions: {categoryError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => dispatch(getCategoryById(category_id || 1))}>
            Retry
          </button>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "30px",
        }}>
        <span
          onClick={() => navigate("/facility-forms")}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            color: "#8B2885",
          }}>
          <Icon
            icon="mdi:arrow-left-bold-circle"
            width="34"
            height="34"
            color="#8B2885"
          />
        </span>
        {currentCategory?.name || "Assessment Form"}
      </h2>

      {sections.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No questions found for this category.
        </div>
      ) : (
        <>
          <div className="container pt-16 px-15 pb-10">
            {sections.map((section) => (
              <div key={section.id} className="card my-16 mx-0">
                <h3>{section.label}</h3>
                <div className="card-content">
                  <div className="status-controls">
                    <div className="toggle-row">
                      <span>Satisfactory</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={
                          formData[section.id]?.status === "satisfactory"
                        }
                        onChange={() =>
                          handleToggle(section.id, "satisfactory")
                        }
                        disabled={isFormSubmitted}
                      />
                    </div>
                    <div className="toggle-row">
                      <span>Need Improvement</span>
                      <input
                        type="checkbox"
                        className="toggle grey"
                        checked={formData[section.id]?.status === "improvement"}
                        onChange={() => handleToggle(section.id, "improvement")}
                        disabled={isFormSubmitted}
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Write comments"
                    className="comment-box"
                    value={formData[section.id]?.comment || ""}
                    style={{
                      resize: "none",
                      height: "90px",
                      flex: 3,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#f9f9f9",
                    }}
                    onChange={(e) => handleComment(section.id, e.target.value)}
                    disabled={isFormSubmitted}
                  />
                </div>
              </div>
            ))}

            <div
              className="finalScore"
              style={{ textAlign: "center", margin: "20px 0" }}>
              <h3>Total Score</h3>
              <span style={{ fontSize: "35px", fontWeight: "bold", color }}>
                {percentage}%
              </span>
            </div>

            {attachedFile && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  padding: "10px",
                  background: "#F0F8FF",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  position: "relative",
                }}>
                <Icon
                  icon="mdi:paperclip"
                  width="20"
                  height="20"
                  color="#8B2885"
                />
                <span>{attachedFile.name}</span>
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    setIsFileError(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ff4444",
                    cursor: "pointer",
                    padding: "4px",
                    position: "relative",
                    top: "-5px",
                  }}
                  disabled={isFormSubmitted}>
                  <Icon icon="mdi:close" width="16" height="16" />
                </button>
              </div>
            )}

            {isFileError && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  padding: "10px",
                  background: "#f8d7da",
                  borderRadius: "8px",
                  color: "#721c24",
                  fontSize: "14px",
                }}>
                <Icon
                  icon="mdi:alert-circle"
                  width="16"
                  height="16"
                  style={{ marginRight: "8px" }}
                />
                Invalid file type. Please upload PDF, Excel, CSV, or Word
                documents only.
              </div>
            )}

            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <button
                onClick={handleAttachFile}
                disabled={isFormSubmitted}
                style={{
                  padding: "12px 30px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "#8B2885",
                  border: "2px solid #8B2885",
                  borderRadius: "30px",
                  cursor: isFormSubmitted ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isFormSubmitted ? 0.5 : 1,
                }}>
                <Icon icon="mdi:paperclip" width="20" height="20" />
                {attachedFile ? "Change Document" : "Attach Document"}
              </button>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                Supported: PDF, Excel, CSV, Word documents
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                textAlign: "center",
                fontFamily: "Gilroy",
                fontWeight: "500",
              }}>
              {message.text && (
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    borderRadius: "5px",
                    backgroundColor:
                      message.type === "success"
                        ? "#d4edda"
                        : message.type === "error"
                        ? "#f8d7da"
                        : "#d1ecf1",
                    color:
                      message.type === "success"
                        ? "#155724"
                        : message.type === "error"
                        ? "#721c24"
                        : "#0c5460",
                    border: `1px solid ${
                      message.type === "success"
                        ? "#c3e6cb"
                        : message.type === "error"
                        ? "#f5c6cb"
                        : "#bee5eb"
                    }`,
                  }}>
                  {message.text}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={
                  !isFormComplete || isStoringAssessment || isFormSubmitted
                }
                style={{
                  padding: "15px 50px",
                  fontSize: "18px",
                  backgroundColor:
                    isFormComplete && !isFormSubmitted ? "#8B2885" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "30px",
                  cursor:
                    isFormComplete && !isFormSubmitted
                      ? "pointer"
                      : "not-allowed",
                  transition: "0.3s",
                  fontWeight: "bold",
                }}>
                {isStoringAssessment ? (
                  <>
                    <Icon
                      icon="mdi:loading"
                      width="20"
                      height="20"
                      style={{
                        animation: "spin 1s linear infinite",
                        marginRight: "8px",
                      }}
                    />
                    Submitting...
                  </>
                ) : isFormSubmitted ? (
                  "Submitted ✓"
                ) : (
                  "Submit Complete"
                )}
              </button>

              {!isFormComplete && !isFormSubmitted && (
                <p
                  style={{
                    color: "#888",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}>
                  Please complete all sections to enable submission.
                </p>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </>
      )}
    </MasterLayout>
  );
};

export default KitchenFillForm;
