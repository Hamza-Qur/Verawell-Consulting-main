import React, { useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const sections = [
  { id: "menus", label: "Menus and Alternates prepared as posted" },
  { id: "menus_signed", label: "Menus Signed by RD" },
  { id: "substitutions", label: "Substitutions logged and signed by RD" },
  { id: "recipes", label: "Recipes out and in use" },
  { id: "trayline_temp", label: "Trayline temp log complete" },
  { id: "staff_danger", label: "Staff can verbalize temp danger zone" },
  {
    id: "thermometer_demo",
    label: "Staff can demonstrate proper thermometer calibration",
  },
  { id: "serving_utensils", label: "Proper Serving utensils used" },
  { id: "serving_sizes", label: "Proper serving sizes correct" },
  { id: "texture_flavor", label: "Texture/Flavor/Taste" },
  { id: "tray_presentation", label: "Tray Presentation/Garnish" },
  { id: "tray_accuracy", label: "Tray Accuracy of Items by Diet" },
  { id: "resident_preferences", label: "Resident Likes/Dislikes honored" },
  { id: "tray_delivery", label: "Tray Delivery Service on Schedule" },
  { id: "breakfast_gap", label: "14 Hours between Dinner and Breakfast" },
  { id: "food_safety", label: "Safe Food handling practices" },
  { id: "leftovers", label: "Leftovers Stored Properly" },
  { id: "uniforms", label: "All Staff in Clean Uniforms" },
  { id: "nametags", label: "All Staff with Proper Name Tags" },
  { id: "hair_restraints", label: "Hair restraints in use" },
  { id: "clean_schedules", label: "Clean Schedules complete" },
  { id: "supplements", label: "Supplement list available" },
  { id: "adaptive_equipment", label: "Adaptive Equipment available" },
  { id: "permit", label: "Health Inspection & Permit posted" },
  {
    id: "food_handlers",
    label: "All staff have proper food handlers certification",
  },
  { id: "menus_posted", label: "Menus Posted" },
  { id: "alternates_posted", label: "Alternates menu posted" },
  { id: "tables_chairs", label: "Tables & Chairs Clean" },
  { id: "silverware_glasses", label: "Silverware and Glasses Clean" },
  { id: "weight_report", label: "Weight Report available" },
  { id: "skin_report", label: "Skin Report available" },
  { id: "census_list", label: "Current Census list available" },
  { id: "don_admin_concerns", label: "Any concerns from DON or Admin" },
];

const MealFillForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Check if every section has been answered
  const isFormComplete = sections.every(
    (section) => formData[section.id]?.status
  );

  // Toggle section status
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
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleComment = (sectionId, comment) => {
    setFormData({
      ...formData,
      [sectionId]: { ...formData[sectionId], comment },
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("Submitting Data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({ type: "success", text: "Form submitted successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "There was a problem submitting the form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate score dynamically
  const calculateScore = () => {
    const totalMarks = sections.length * 3;
    let earnedMarks = 0;

    sections.forEach((section) => {
      const status = formData[section.id]?.status;
      if (status === "satisfactory") earnedMarks += 3;
      // "improvement" = 0 automatically
    });

    const percentage = totalMarks
      ? Math.round((earnedMarks / totalMarks) * 100)
      : 0;

    // Determine color
    let color = "#28a745"; // green
    if (percentage < 40) color = "#dc3545"; // red
    else if (percentage < 70) color = "#fd7e14"; // orange

    return { percentage, color };
  };

  const { percentage, color } = calculateScore();

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
                    checked={formData[section.id]?.status === "satisfactory"}
                    onChange={() => handleToggle(section.id, "satisfactory")}
                  />
                </div>
                <div className="toggle-row">
                  <span>Need Improvement</span>
                  <input
                    type="checkbox"
                    className="toggle grey"
                    checked={formData[section.id]?.status === "improvement"}
                    onChange={() => handleToggle(section.id, "improvement")}
                  />
                </div>
              </div>

              <textarea
                placeholder="Write comments"
                className="comment-box"
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
              />
            </div>
          </div>
        ))}

        {/* Total Score */}
        <div
          className="finalScore"
          style={{ textAlign: "center", margin: "20px 0" }}>
          <h3>Total Score</h3>
          <span style={{ fontSize: "35px", fontWeight: "bold", color }}>
            {percentage}%
          </span>
        </div>

        {/* Submit Section */}
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
                  message.type === "success" ? "#d4edda" : "#f8d7da",
                color: message.type === "success" ? "#155724" : "#721c24",
                border: `1px solid ${
                  message.type === "success" ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            style={{
              padding: "15px 50px",
              fontSize: "18px",
              backgroundColor: isFormComplete ? "#8B2885" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "30px",
              cursor: isFormComplete ? "pointer" : "not-allowed",
              transition: "0.3s",
              fontWeight: "bold",
            }}>
            {isSubmitting ? "Submitting..." : "Submit Complete"}
          </button>

          {!isFormComplete && (
            <p style={{ color: "#888", fontSize: "14px", marginTop: "10px" }}>
              Please complete all sections to enable submission.
            </p>
          )}
        </div>
      </div>
    </MasterLayout>
  );
};

export default MealFillForm;
