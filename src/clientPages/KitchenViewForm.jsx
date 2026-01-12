import React, { useEffect, useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const sectionsData = [
  {
    id: "floors",
    label: "Floors Clean and free of build up",
    status: "satisfactory",
    comment: "Floors were clean during inspection.",
  },
  {
    id: "walkins",
    label: "Walk-ins Clean",
    status: "improvement",
    comment: "Minor spills noticed near the back wall.",
  },
  {
    id: "logs",
    label: "Refrigerator Logs complete",
    status: "satisfactory",
    comment: "Logs properly filled and up to date.",
  },
  {
    id: "thermometers",
    label: "Thermometers inside refrigerator units",
    status: "satisfactory",
    comment: "Thermometers present and functional.",
  },
  {
    id: "refrigerator",
    label:
      "Refrigerator/Freezer units at appropriate temps Walk-in/Fridge (35-40 degrees) Freezer (0 -10 degrees) No signs of thaw/freezer burn",
    status: "improvement",
    comment: "One freezer was slightly above recommended temperature.",
  },
  {
    id: "thawing",
    label: "Proper Thawing methods used with thaw dates labeled",
    status: "satisfactory",
    comment: "All thaw dates labeled correctly.",
  },
  {
    id: "food",
    label: "Food off Floor",
    status: "satisfactory",
    comment: "All food items stored properly above the floor.",
  },
  {
    id: "walls",
    label: "Walls Clean",
    status: "improvement",
    comment: "Some marks noticed near prep area.",
  },
  {
    id: "surfaces",
    label: "Work Surfaces Clean",
    status: "satisfactory",
    comment: "Surfaces wiped down and sanitized.",
  },
  {
    id: "sanitizer",
    label: "Sanitizer Buckets out and in use with clean towels",
    status: "satisfactory",
    comment: "Sanitizer buckets present and clean.",
  },
  {
    id: "equipment",
    label: "Major Equipment clean: Oven, Stovetop, Grill top, Steamer",
    status: "improvement",
    comment: "Oven needs deep cleaning.",
  },
  {
    id: "minor",
    label:
      "Minor Equipment Clean: Toaster, Blender, Food Processor, Mixer, Plate warmer",
    status: "satisfactory",
    comment: "All minor equipment clean and ready to use.",
  },
  {
    id: "area",
    label: "Dishwashing area clean. Machine free of build-up",
    status: "satisfactory",
    comment: "Dishwashing area clear and machine clean.",
  },
  {
    id: "dishes",
    label: "Dishes clean and dry, no wet nesting",
    status: "improvement",
    comment: "Some dishes still wet, needs attention.",
  },
  {
    id: "utensils",
    label: "Pots, Pans, and Utensils clean & Dry",
    status: "satisfactory",
    comment: "All utensils properly cleaned.",
  },
  {
    id: "tested",
    label: "Dish Machine tested and Log filled",
    status: "satisfactory",
    comment: "Dish machine log up to date.",
  },
  {
    id: "verbalize",
    label: "Staff can verbalize Dish machine use and testing",
    status: "satisfactory",
    comment: "Staff demonstrated knowledge of machine use.",
  },
  {
    id: "log",
    label: "Pot Sink Tested and log complete. PPM",
    status: "improvement",
    comment: "Pot sink test missing one entry.",
  },
  {
    id: "testing",
    label: "Staff can Verbalize Pot/pan sink testing",
    status: "satisfactory",
    comment: "Staff knowledgeable about pot sink testing.",
  },
  {
    id: "clean",
    label: "Coffee Urns Clean",
    status: "satisfactory",
    comment: "Coffee urns wiped and sanitized.",
  },
  {
    id: "sticker",
    label: "Hoots/Vents clean- sticker up to date",
    status: "improvement",
    comment: "One vent sticker missing date.",
  },
  {
    id: "knives",
    label: "Knives stored Properly",
    status: "satisfactory",
    comment: "Knives properly stored in holder.",
  },
  {
    id: "opener",
    label: "Can opener Clean",
    status: "satisfactory",
    comment: "Can opener cleaned and functional.",
  },
  {
    id: "slicer",
    label: "Slicer Clean",
    status: "improvement",
    comment: "Slicer needs deep cleaning.",
  },
  {
    id: "storage",
    label: "Storage room clean and organized",
    status: "satisfactory",
    comment: "Storage room organized and clear of clutter.",
  },
  {
    id: "stock",
    label: "Stock < 18” from ceiling",
    status: "satisfactory",
    comment: "Stock properly stored below ceiling limit.",
  },
  {
    id: "scoops",
    label: "No scoops in ingredient bins",
    status: "satisfactory",
    comment: "All scoops properly stored.",
  },
  {
    id: "chemicals",
    label: "Chemicals stored and labeled",
    status: "improvement",
    comment: "Some chemicals missing labels.",
  },
  {
    id: "sds",
    label: "SDS Posted and Complete",
    status: "satisfactory",
    comment: "SDS sheets posted and current.",
  },
  {
    id: "labeled",
    label: "All food labeled and dated",
    status: "satisfactory",
    comment: "All food items properly labeled.",
  },
  {
    id: "washing",
    label: "Hand washing sink stocked",
    status: "satisfactory",
    comment: "Hand washing sink fully stocked.",
  },
  {
    id: "posted",
    label: "Hand washing procedures posted",
    status: "satisfactory",
    comment: "Procedure posters displayed correctly.",
  },
  {
    id: "hands",
    label: "Staff observed washing hands between tasks",
    status: "improvement",
    comment: "Observed one staff skipping hand wash.",
  },
  {
    id: "available",
    label: "One motion Eyewash Station available and labeled",
    status: "satisfactory",
    comment: "Eyewash station functional and labeled.",
  },
  {
    id: "cans",
    label: "Garbage cans clean and covered",
    status: "satisfactory",
    comment: "All garbage cans clean and covered.",
  },
  {
    id: "staff",
    label: "PPE available and staff can verbalize when to use",
    status: "satisfactory",
    comment: "Staff demonstrated PPE knowledge.",
  },
  {
    id: "all",
    label: "All equipment working",
    status: "satisfactory",
    comment: "All equipment operational.",
  },
];

const mockSubmissionData = {
  submittedBy: "EMP-1001", // Mock employee ID
  submittedByName: "John Smith", // Mock employee name
  submissionDate: "2024-01-15", // Mock submission date
  submissionTime: "14:30:45", // Mock submission time
  facility: "KFC Facility", // Mock facility name
  score: 68, // This will be calculated from sectionsData
};

const KitchenViewForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState(sectionsData);
  const [userRole, setUserRole] = useState(null);

  // Use useEffect to read localStorage after component mounts
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "guest"); // default to guest if no role
    console.log("User role:", role); // Debug log
  }, []);

  // Determine if user can edit based on role
  const canEdit = userRole === "admin" || userRole === "team"; // Only admin and team can edit
  const isCustomer = userRole === "customer"; // Customer can only view

  const handleStatusChange = (id, newStatus) => {
    console.log("Can edit?", canEdit, "Role:", userRole); // Debug log
    if (!canEdit) {
      alert("Customers cannot edit forms. Please contact your administrator.");
      return;
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, status: newStatus } : section
      )
    );
  };

  const handleCommentChange = (id, newComment) => {
    console.log("Can edit?", canEdit, "Role:", userRole); // Debug log
    if (!canEdit) {
      alert("Customers cannot edit forms. Please contact your administrator.");
      return;
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, comment: newComment } : section
      )
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
  const calculateScore = () => {
    const pointsPerSection = 3;
    const totalSections = sections.length;
    const maxScore = totalSections * pointsPerSection;

    const rawScore = sections.reduce((acc, section) => {
      if (section.status === "satisfactory") return acc + pointsPerSection;
      if (section.status === "improvement") return acc - pointsPerSection;
      return acc;
    }, 0);

    return Math.round((rawScore / maxScore) * 100);
  };

  const percentageScore = calculateScore();

  // Format submission date
  const formattedDate = new Date(
    mockSubmissionData.submissionDate
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine color including negative scores
  let scoreColor = "#28a745";
  if (percentageScore < 0) scoreColor = "#dc3545";
  else if (percentageScore < 40) scoreColor = "#dc3545";
  else if (percentageScore < 70) scoreColor = "#fd7e14";

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
          Kitchen Sanitation Assessment
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
              <Icon icon="mdi:file-document-outline" width="24" height="24" />
              Submission Details
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
                  Submission Date
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
              Overall Score
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
              {percentageScore >= 70
                ? "Satisfactory"
                : percentageScore >= 40
                ? "Needs Improvement"
                : "Unsatisfactory"}
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
          This inspection was completed on {formattedDate} and submitted to the
          system by {mockSubmissionData.submittedByName}.
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
                    disabled={!isEditing || !canEdit} // Disable if not allowed to edit
                    onChange={(e) => {
                      e.preventDefault(); // Prevent default behavior
                      handleStatusChange(section.id, "satisfactory");
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
                    disabled={!isEditing || !canEdit} // Disable if not allowed to edit
                    onChange={(e) => {
                      e.preventDefault(); // Prevent default behavior
                      handleStatusChange(section.id, "improvement");
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
                disabled={!isEditing || !canEdit} // Disable if not allowed to edit
                onChange={(e) => {
                  if (!canEdit) {
                    e.preventDefault();
                    alert("Customers cannot edit forms.");
                    return;
                  }
                  handleCommentChange(section.id, e.target.value);
                }}
                onFocus={(e) => {
                  if (!canEdit) {
                    e.target.blur(); // Remove focus if not allowed
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

        {/* --- EDIT BUTTON ---
        {canEdit ? (
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

export default KitchenViewForm;
