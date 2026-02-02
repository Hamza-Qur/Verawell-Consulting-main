import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import MasterLayout from "../otherImages/MasterLayout";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  getAssessmentById,
  clearCurrentAssessment,
  updateAssessment,
} from "../redux/slices/formSlice";
import Toast from "../components/Toast";

const KitchenViewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentAssessment,
    isAssessmentLoading,
    assessmentError,
    isUpdatingAssessment,
    updateAssessmentError,
    updateAssessmentSuccess,
  } = useSelector((state) => state.form);

  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState([]);
  const [originalSections, setOriginalSections] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [score, setScore] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (id) {
      dispatch(getAssessmentById(id));
    }

    return () => {
      dispatch(clearCurrentAssessment());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAssessment) {
      const transformedSections =
        transformAssessmentToSections(currentAssessment);
      setSections(transformedSections);
      setOriginalSections(JSON.parse(JSON.stringify(transformedSections)));

      const submissionInfo = {
        submittedByName: currentAssessment.user?.name || "Unknown",
        submissionDate: currentAssessment.created_at || "N/A",
        facility: currentAssessment.facility?.name || "Unknown Facility",
        totalQuestions: currentAssessment.total_questions || 0,
        questionsAnswered: currentAssessment.total_questions_answered || 0,
      };
      setSubmissionData(submissionInfo);

      const calculatedScore = calculateScore(transformedSections);
      setScore(calculatedScore);
    }
  }, [currentAssessment]);

  useEffect(() => {
    const changed =
      JSON.stringify(sections) !== JSON.stringify(originalSections);
    setHasChanges(changed);
  }, [sections, originalSections]);

  const transformAssessmentToSections = (assessment) => {
    const questions = assessment?.category?.questions || [];

    return questions.map((q) => {
      const answer = q.answer;

      let status = "";
      if (answer?.satisfactory === 1) status = "satisfactory";
      if (answer?.need_improvement === 1) status = "improvement";

      return {
        id: q.question_id?.toString(),
        question_id: q.question_id,
        label: q.question,
        status,
        comment: answer?.comments || "",
      };
    });
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "guest");
  }, []);

  const canEdit = userRole === "admin" || userRole === "team";
  const isCustomer = userRole === "customer";

  const calculateScore = (sectionsArray) => {
    const pointsPerSection = 3;
    const totalSections = sectionsArray.length;

    if (totalSections === 0) return 0;

    const maxScore = totalSections * pointsPerSection;

    const rawScore = sectionsArray.reduce((acc, section) => {
      if (section.status === "satisfactory") return acc + pointsPerSection;
      if (section.status === "improvement") return acc - pointsPerSection;
      return acc;
    }, 0);

    return Math.round((rawScore / maxScore) * 100);
  };

  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleStatusChange = (id, newStatus) => {
    if (!canEdit) {
      showToast(
        "Customers cannot edit forms. Please contact your administrator.",
        "error",
      );
      return;
    }

    if (!isEditing) {
      showToast("Please click 'Edit Form' to make changes.", "warning");
      return;
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, status: newStatus } : section,
      ),
    );

    const updatedSections = sections.map((section) =>
      section.id === id ? { ...section, status: newStatus } : section,
    );
    const newScore = calculateScore(updatedSections);
    setScore(newScore);
  };

  const handleCommentChange = (id, newComment) => {
    if (!canEdit) {
      showToast(
        "Customers cannot edit forms. Please contact your administrator.",
        "error",
      );
      return;
    }

    if (!isEditing) {
      showToast("Please click 'Edit Form' to make changes.", "warning");
      return;
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, comment: newComment } : section,
      ),
    );
  };

  const handleEditClick = () => {
    if (!canEdit) {
      showToast("You do not have permission to edit this form.", "error");
      return;
    }
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      // Show custom confirm dialog instead of window.confirm
      const confirmDialog = document.createElement("div");
      confirmDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      const dialogContent = document.createElement("div");
      dialogContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
      `;

      dialogContent.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">Unsaved Changes</h3>
        <p style="margin-bottom: 20px; color: #666;">You have unsaved changes. Are you sure you want to cancel?</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="confirmCancelNo" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            No, Keep Editing
          </button>
          <button id="confirmCancelYes" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Yes, Discard Changes
          </button>
        </div>
      `;

      confirmDialog.appendChild(dialogContent);
      document.body.appendChild(confirmDialog);

      const handleNoClick = () => {
        document.body.removeChild(confirmDialog);
      };

      const handleYesClick = () => {
        document.body.removeChild(confirmDialog);
        setSections(JSON.parse(JSON.stringify(originalSections)));
        const originalScore = calculateScore(originalSections);
        setScore(originalScore);
        setIsEditing(false);
        setHasChanges(false);
      };

      dialogContent.querySelector("#confirmCancelNo").onclick = handleNoClick;
      dialogContent.querySelector("#confirmCancelYes").onclick = handleYesClick;

      // Close on click outside
      confirmDialog.onclick = (e) => {
        if (e.target === confirmDialog) {
          document.body.removeChild(confirmDialog);
        }
      };
    } else {
      setSections(JSON.parse(JSON.stringify(originalSections)));
      const originalScore = calculateScore(originalSections);
      setScore(originalScore);
      setIsEditing(false);
      setHasChanges(false);
    }
  };

  const handleSaveClick = async () => {
    if (!canEdit) {
      showToast("You do not have permission to save this form.", "error");
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      showToast("No changes to save.", "info");
      return;
    }

    // Prepare data for API
    const updateData = {
      id: parseInt(id),
      answers: sections.map((section) => ({
        question_id: parseInt(section.question_id),
        satisfactory: section.status === "satisfactory" ? 1 : 0,
        need_improvement: section.status === "improvement" ? 1 : 0,
        comments: section.comment || "",
      })),
    };

    try {
      const result = await dispatch(updateAssessment(updateData)).unwrap();

      if (result.success) {
        setOriginalSections(JSON.parse(JSON.stringify(sections)));
        setIsEditing(false);
        setHasChanges(false);

        // Refresh assessment data
        dispatch(getAssessmentById(id));

        // Show success toast
        showToast("Assessment updated successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to update assessment:", error);
      showToast(`Failed to update assessment: ${error}`, "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getScoreColor = (scoreValue) => {
    if (scoreValue < 0) return "#dc3545";
    if (scoreValue < 40) return "#dc3545";
    if (scoreValue < 70) return "#fd7e14";
    return "#28a745";
  };

  const scoreColor = getScoreColor(score);

  if (isAssessmentLoading) {
    return (
      <MasterLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            flexDirection: "column",
            gap: "20px",
          }}>
          <Icon
            icon="mdi:loading"
            width="50"
            height="50"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <h3>Loading assessment data...</h3>
        </div>
      </MasterLayout>
    );
  }

  if (assessmentError) {
    return (
      <MasterLayout>
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "8px",
            margin: "20px",
          }}>
          <Icon icon="mdi:alert-circle" width="50" height="50" />
          <h3>Error Loading Assessment</h3>
          <p>{assessmentError}</p>
          <button
            onClick={() => navigate("/facility-forms")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "20px",
            }}>
            Go Back
          </button>
        </div>
      </MasterLayout>
    );
  }

  if (!currentAssessment && !isAssessmentLoading) {
    return (
      <MasterLayout>
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Icon icon="mdi:file-document-outline" width="50" height="50" />
          <h3>No Assessment Found</h3>
          <p>The requested assessment could not be found.</p>
          <button
            onClick={() => navigate("/facility-forms")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "20px",
            }}>
            Go Back
          </button>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      {/* Main Toast Component */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {/* Update Status Notifications */}
      {isUpdatingAssessment && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#d1ecf1",
            border: "1px solid #bee5eb",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#0c5460",
          }}>
          <Icon
            icon="mdi:loading"
            width="20"
            height="20"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span>Saving changes...</span>
        </div>
      )}

      {updateAssessmentSuccess && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#155724",
          }}>
          <Icon
            icon="mdi:check-circle"
            width="20"
            height="20"
            color="#155724"
          />
          <span>{updateAssessmentSuccess}</span>
        </div>
      )}

      {updateAssessmentError && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#721c24",
          }}>
          <Icon
            icon="mdi:alert-circle"
            width="20"
            height="20"
            color="#721c24"
          />
          <span>{updateAssessmentError}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "30px",
          }}>
          <span
            onClick={() =>
              navigate(
                userRole === "customer" ? "/customer-forms" : "/facility-forms",
              )
            }
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
          {currentAssessment?.category?.name || "Kitchen Sanitation Assessment"}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isEditing && canEdit && (
            <button
              onClick={handleEditClick}
              style={{
                padding: "8px 16px",
                background:
                  "linear-gradient(90deg,rgba(216, 81, 80, 1) 0%,rgba(87, 36, 103, 1) 100% )",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
              <Icon icon="mdi:pencil" width="20" height="20" />
              Edit Form
            </button>
          )}

          {isEditing && canEdit && (
            <>
              <button
                onClick={handleCancelClick}
                disabled={isUpdatingAssessment}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isUpdatingAssessment ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isUpdatingAssessment ? 0.6 : 1,
                }}>
                <Icon icon="mdi:close" width="20" height="20" />
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                disabled={isUpdatingAssessment || !hasChanges}
                style={{
                  padding: "8px 16px",
                  backgroundColor: hasChanges ? "#2a7e00" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    hasChanges && !isUpdatingAssessment
                      ? "pointer"
                      : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isUpdatingAssessment ? 0.6 : 1,
                }}>
                <Icon
                  icon={
                    isUpdatingAssessment ? "mdi:loading" : "mdi:content-save"
                  }
                  width="20"
                  height="20"
                  style={
                    isUpdatingAssessment
                      ? { animation: "spin 1s linear infinite" }
                      : {}
                  }
                />
                {isUpdatingAssessment ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {submissionData && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  color: "#8B2885",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                <Icon icon="mdi:file-document-outline" width="24" height="24" />
                Submission Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                }}>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}>
                    Submitted By
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#333",
                    }}>
                    {submissionData.submittedByName}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}>
                    Facility
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#333",
                    }}>
                    {submissionData.facility}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}>
                    Submission Date
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#333",
                    }}>
                    {formatDateTime(submissionData.submissionDate)}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                border: `2px solid ${scoreColor}`,
                borderRadius: "8px",
                padding: "15px",
                width: "160px",
                textAlign: "center",
                alignSelf: "center",
              }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                }}>
                Overall Score
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: scoreColor,
                  marginBottom: "6px",
                }}>
                {score}%
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#666",
                  padding: "3px 10px",
                  backgroundColor:
                    score >= 70
                      ? "#d4edda"
                      : score >= 40
                        ? "#ffe5d0"
                        : "#f8d7da",
                  borderRadius: "10px",
                  display: "inline-block",
                }}>
                {score >= 70
                  ? "Satisfactory"
                  : score >= 40
                    ? "Needs Improvement"
                    : "Unsatisfactory"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: "1px solid #e9ecef",
              fontSize: "14px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
            <Icon icon="mdi:information-outline" width="18" height="18" />
            This inspection was completed on{" "}
            {formatDate(submissionData.submissionDate)} by{" "}
            {submissionData.submittedByName}.
          </div>

          {currentAssessment?.documents &&
            currentAssessment.documents.length > 0 && (
              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e9ecef",
                }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <Icon icon="mdi:paperclip" width="16" height="16" />
                  <span>Attached Documents:</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {currentAssessment.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#e9ecef",
                        borderRadius: "6px",
                        textDecoration: "none",
                        color: "#8B2885",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                      <Icon
                        icon="mdi:file-document-outline"
                        width="14"
                        height="14"
                      />
                      {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Editing Mode Indicator */}
      {isEditing && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "#cce5ff",
            border: "1px solid #b8daff",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#004085",
          }}>
          <Icon icon="mdi:pencil" width="20" height="20" />
          <strong>Editing Mode Active</strong>
          <span style={{ marginLeft: "auto", fontSize: "14px" }}>
            {hasChanges ? (
              <span style={{ color: "#856404" }}>
                <Icon
                  icon="mdi:alert-circle"
                  width="16"
                  height="16"
                  style={{ marginRight: "5px" }}
                />
                You have unsaved changes
              </span>
            ) : (
              "No changes made yet"
            )}
          </span>
        </div>
      )}

      {userRole && isCustomer && !isEditing && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#856404",
          }}>
          <Icon icon="mdi:eye-outline" width="20" height="20" />
          <span>
            View Only Mode - This form has been submitted and is now read-only
            for customer review.
          </span>
        </div>
      )}

      <div
        className="container py-16"
        style={{
          background:
            isEditing && canEdit
              ? "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)"
              : "transparent",
          transition: "background 0.3s ease",
          padding: "20px",
          borderRadius: "8px",
        }}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="card my-16">
              <h3>{section.label}</h3>

              <div className="card-content">
                <div className="status-controls">
                  <div className="toggle-row">
                    <span>Satisfactory</span>
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={section.status === "satisfactory"}
                      disabled={!isEditing || !canEdit}
                      onChange={(e) => {
                        e.preventDefault();
                        if (canEdit) {
                          if (!isEditing) {
                            showToast(
                              "Please click 'Edit Form' to make changes.",
                              "warning",
                            );
                            return;
                          }
                          handleStatusChange(section.id, "satisfactory");
                        } else {
                          showToast("Customers cannot edit forms.", "error");
                        }
                      }}
                    />
                  </div>

                  <div className="toggle-row">
                    <span>Need Improvement</span>
                    <input
                      type="checkbox"
                      className="toggle grey"
                      checked={section.status === "improvement"}
                      disabled={!isEditing || !canEdit}
                      onChange={(e) => {
                        e.preventDefault();
                        if (canEdit) {
                          if (!isEditing) {
                            showToast(
                              "Please click 'Edit Form' to make changes.",
                              "warning",
                            );
                            return;
                          }
                          handleStatusChange(section.id, "improvement");
                        } else {
                          showToast("Customers cannot edit forms.", "error");
                        }
                      }}
                    />
                  </div>
                </div>

                <textarea
                  className="comment-box"
                  value={section.comment}
                  disabled={!isEditing || !canEdit}
                  onChange={(e) => {
                    if (!canEdit) {
                      showToast("Customers cannot edit forms.", "error");
                      return;
                    }
                    if (!isEditing) {
                      showToast(
                        "Please click 'Edit Form' to make changes.",
                        "warning",
                      );
                      return;
                    }
                    handleCommentChange(section.id, e.target.value);
                  }}
                  onFocus={(e) => {
                    if (!canEdit) {
                      e.target.blur();
                      showToast("Customers cannot edit forms.", "error");
                    } else if (!isEditing) {
                      e.target.blur();
                      showToast(
                        "Please click 'Edit Form' to make changes.",
                        "warning",
                      );
                    }
                  }}
                  placeholder={
                    !isEditing ? "No comments..." : "Add your comments here..."
                  }
                  style={{
                    resize: "none",
                    height: "90px",
                    flex: 3,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isEditing && canEdit ? "#fff" : "#f1f1f1",
                    color: "#555",
                    cursor: isEditing && canEdit ? "text" : "not-allowed",
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <Icon icon="mdi:clipboard-text-outline" width="50" height="50" />
            <p>No assessment questions found in this assessment.</p>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default KitchenViewForm;
