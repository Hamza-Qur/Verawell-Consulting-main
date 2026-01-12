import React, { useEffect, useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const sectionsData = [
  {
    id: "menus",
    label: "Menus and Alternates prepared as posted",
    status: "satisfactory",
    comment: "Menus matched the posted schedule.",
  },
  {
    id: "menus_signed",
    label: "Menus Signed by RD",
    status: "improvement",
    comment: "Some menus missing signature.",
  },
  {
    id: "substitutions",
    label: "Substitutions logged and signed by RD",
    status: "satisfactory",
    comment: "All substitutions properly logged.",
  },
  {
    id: "recipes",
    label: "Recipes out and in use",
    status: "satisfactory",
    comment: "Recipes followed correctly.",
  },
  {
    id: "trayline_temp",
    label: "Trayline temp log complete",
    status: "satisfactory",
    comment: "All trayline temps logged.",
  },
  {
    id: "staff_danger",
    label: "Staff can verbalize temp danger zone",
    status: "improvement",
    comment: "One staff member unsure about lower limit.",
  },
  {
    id: "thermometer_demo",
    label: "Staff can demonstrate proper thermometer calibration",
    status: "satisfactory",
    comment: "Thermometers calibrated correctly.",
  },
  {
    id: "serving_utensils",
    label: "Proper Serving utensils used",
    status: "satisfactory",
    comment: "Correct utensils in use.",
  },
  {
    id: "serving_sizes",
    label: "Proper serving sizes correct",
    status: "satisfactory",
    comment: "Portion sizes verified.",
  },
  {
    id: "texture_flavor",
    label: "Texture/Flavor/Taste",
    status: "satisfactory",
    comment: "All items tasted and correct.",
  },
  {
    id: "tray_presentation",
    label: "Tray Presentation/Garnish",
    status: "satisfactory",
    comment: "Trays presented properly.",
  },
  {
    id: "tray_accuracy",
    label: "Tray Accuracy of Items by Diet",
    status: "improvement",
    comment: "One tray had a diet mismatch.",
  },
  {
    id: "resident_preferences",
    label: "Resident Likes/Dislikes honored",
    status: "satisfactory",
    comment: "Preferences followed.",
  },
  {
    id: "tray_delivery",
    label: "Tray Delivery Service on Schedule",
    status: "satisfactory",
    comment: "Meals delivered on time.",
  },
  {
    id: "breakfast_gap",
    label: "14 Hours between Dinner and Breakfast",
    status: "satisfactory",
    comment: "Meal timing within regulation.",
  },
  {
    id: "food_safety",
    label: "Safe Food handling practices",
    status: "improvement",
    comment: "Observed minor cross-contamination risk.",
  },
  {
    id: "leftovers",
    label: "Leftovers Stored Properly",
    status: "satisfactory",
    comment: "Leftovers stored in correct containers.",
  },
  {
    id: "uniforms",
    label: "All Staff in Clean Uniforms",
    status: "satisfactory",
    comment: "Uniforms clean and presentable.",
  },
  {
    id: "nametags",
    label: "All Staff with Proper Name Tags",
    status: "satisfactory",
    comment: "All staff had visible name tags.",
  },
  {
    id: "hair_restraints",
    label: "Hair restraints in use",
    status: "satisfactory",
    comment: "Hairnets and beard covers used correctly.",
  },
  {
    id: "clean_schedules",
    label: "Clean Schedules complete",
    status: "improvement",
    comment: "Some weekly tasks were behind schedule.",
  },
  {
    id: "supplements",
    label: "Supplement list available",
    status: "satisfactory",
    comment: "Supplements available and organized.",
  },
  {
    id: "adaptive_equipment",
    label: "Adaptive Equipment available",
    status: "satisfactory",
    comment: "All adaptive equipment ready.",
  },
  {
    id: "permit",
    label: "Health Inspection & Permit posted",
    status: "satisfactory",
    comment: "Permit posted and valid.",
  },
  {
    id: "food_handlers",
    label: "All staff have proper food handlers certification",
    status: "satisfactory",
    comment: "Certifications verified.",
  },
  {
    id: "menus_posted",
    label: "Menus Posted",
    status: "satisfactory",
    comment: "Menus visible in the dining area.",
  },
  {
    id: "alternates_posted",
    label: "Alternates menu posted",
    status: "satisfactory",
    comment: "Alternate menus displayed correctly.",
  },
  {
    id: "tables_chairs",
    label: "Tables & Chairs Clean",
    status: "improvement",
    comment: "Some tables needed wiping.",
  },
  {
    id: "silverware_glasses",
    label: "Silverware and Glasses Clean",
    status: "satisfactory",
    comment: "All silverware clean.",
  },
  {
    id: "weight_report",
    label: "Weight Report available",
    status: "satisfactory",
    comment: "Weight report on file.",
  },
  {
    id: "skin_report",
    label: "Skin Report available",
    status: "satisfactory",
    comment: "Skin reports updated.",
  },
  {
    id: "census_list",
    label: "Current Census list available",
    status: "satisfactory",
    comment: "Census list checked.",
  },
  {
    id: "don_admin_concerns",
    label: "Any concerns from DON or Admin",
    status: "improvement",
    comment: "Minor concern reported by DON.",
  },
];

const mockSubmissionData = {
  submittedBy: "EMP-1002", // Different employee ID for meal form
  submittedByName: "Jane Doe", // Different employee name
  submissionDate: "2024-01-16", // Different date
  submissionTime: "11:45:22", // Different time
  facility: "Starbucks Facility", // Different facility
  score: 75, // Different score
};

const MealViewForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState(sectionsData);
  const [userRole, setUserRole] = useState(null);

  // Use useEffect to read localStorage after component mounts
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "guest");
  }, []);

  // Determine if user can edit based on role
  const canEdit = userRole === "admin" || userRole === "team";
  const isCustomer = userRole === "customer";

  const toggleStatus = (id, statusType) => {
    if (!canEdit) {
      alert("Customers cannot edit forms. Please contact your administrator.");
      return;
    }

    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, status: statusType } : sec))
    );
  };

  const updateComment = (id, value) => {
    if (!canEdit) {
      alert("Customers cannot edit forms. Please contact your administrator.");
      return;
    }

    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, comment: value } : sec))
    );
  };

  // Handle edit button click with protection
  const handleEditClick = () => {
    if (!canEdit) {
      alert("Customers cannot edit forms. Please contact your administrator.");
      return;
    }
    setIsEditing(!isEditing);
  };

  // --- Total Score Calculation ---
  const pointsPerSection = 3;
  const totalSections = sections.length;
  const maxScore = totalSections * pointsPerSection;

  const rawScore = sections.reduce((acc, section) => {
    if (section.status === "satisfactory") return acc + pointsPerSection;
    if (section.status === "improvement") return acc - pointsPerSection;
    return acc;
  }, 0);

  // Allow negative percentages
  const percentageScore = Math.round((rawScore / maxScore) * 100);

  // Format submission date
  const formattedDate = new Date(
    mockSubmissionData.submissionDate
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine score label
  const getScoreLabel = () => {
    if (percentageScore >= 70) return "Satisfactory";
    if (percentageScore >= 40) return "Needs Improvement";
    return "Unsatisfactory";
  };

  // Determine color including negative scores
  let scoreColor = "#28a745"; // green
  if (percentageScore < 0) scoreColor = "#dc3545"; // red for negative
  else if (percentageScore < 40) scoreColor = "#dc3545"; // red for low positive
  else if (percentageScore < 70) scoreColor = "#fd7e14"; // orange

  return (
    <MasterLayout>
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
            onClick={() => navigate(-1)}
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
          Meal Observation Assessment
        </h2>

        {/* Add print button */}
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#8B2885",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <Icon icon="mdi:printer" width="20" height="20" />
          Print Report
        </button>
      </div>

      {/* ADD SUBMISSION INFO SECTION */}
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
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
          }}>
          {/* Left side - Submission details */}
          <div>
            <h3
              style={{
                color: "#8B2885",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
              <Icon icon="mdi:food" width="24" height="24" />
              Meal Observation Submission Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
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
                  {mockSubmissionData.submittedByName}
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      color: "#666",
                      marginLeft: "8px",
                    }}>
                    ({mockSubmissionData.submittedBy})
                  </span>
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
                  {mockSubmissionData.facility}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}>
                  Observation Date
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                  }}>
                  {formattedDate} at {mockSubmissionData.submissionTime}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Score card */}
          <div
            style={{
              backgroundColor: "white",
              border: `2px solid ${scoreColor}`,
              borderRadius: "8px",
              padding: "20px",
              minWidth: "200px",
              textAlign: "center",
            }}>
            <div
              style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Meal Observation Score
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: scoreColor,
                marginBottom: "8px",
              }}>
              {percentageScore}%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                padding: "4px 12px",
                backgroundColor:
                  scoreColor === "#28a745"
                    ? "#d4edda"
                    : scoreColor === "#fd7e14"
                    ? "#ffe5d0"
                    : "#f8d7da",
                borderRadius: "12px",
                display: "inline-block",
              }}>
              {getScoreLabel()}
            </div>
          </div>
        </div>

        {/* Add a summary line */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid #e9ecef",
            fontSize: "14px",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
          <Icon icon="mdi:information-outline" width="18" height="18" />
          This meal service observation was completed on {formattedDate} by{" "}
          {mockSubmissionData.inspector}.
        </div>
      </div>

      {/* Show role indicator */}
      {userRole && isCustomer && (
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
            View Only Mode - This meal observation form has been submitted and
            is now read-only for customer review.
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
        {sections.map((section) => (
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
                      toggleStatus(section.id, "satisfactory");
                    }}
                    onClick={(e) => {
                      if (!canEdit) {
                        e.preventDefault();
                        alert("Customers cannot edit forms.");
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
                      toggleStatus(section.id, "improvement");
                    }}
                    onClick={(e) => {
                      if (!canEdit) {
                        e.preventDefault();
                        alert("Customers cannot edit forms.");
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
                    e.preventDefault();
                    alert("Customers cannot edit forms.");
                    return;
                  }
                  updateComment(section.id, e.target.value);
                }}
                onFocus={(e) => {
                  if (!canEdit) {
                    e.target.blur();
                    alert("Customers cannot edit forms.");
                  }
                }}
                style={{
                  resize: "none",
                  height: "90px",
                  flex: 3,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: isEditing && canEdit ? "#fff" : "#f1f1f1",
                  color: "#555",
                }}
              />
            </div>
          </div>
        ))}

        {/* --- EDIT BUTTON --- */}
        {/* {canEdit ? (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={handleEditClick}
              style={{
                padding: "12px 30px",
                backgroundColor: "#8B2885",
                color: "#fff",
                fontSize: "16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}>
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "8px",
              color: "#666",
            }}>
            <Icon
              icon="mdi:lock-outline"
              width="24"
              height="24"
              style={{ marginBottom: "10px" }}
            />
            <p style={{ margin: 0 }}>
              {userRole === "customer"
                ? "This form is view-only for customers. Contact your admin for edits."
                : "Please log in to edit this form."}
            </p>
          </div>
        )} */}
      </div>
    </MasterLayout>
  );
};

export default MealViewForm;
