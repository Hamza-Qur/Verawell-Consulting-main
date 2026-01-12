import React, { useEffect, useState } from "react";
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

const MEAL_DRAFT_KEY = "meal_form_draft"; // Different key for meal form

const MealFillForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [attachedFile, setAttachedFile] = useState(null);
  const navigate = useNavigate();

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(MEAL_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData(parsedData);
        setMessage({
          type: "info",
          text: "Draft loaded from previous session.",
        });

        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Check if at least one field is filled
  const hasAtLeastOneField = sections.some(
    (section) => formData[section.id]?.status || formData[section.id]?.comment
  );

  // Check if every section has been answered
  const isFormComplete = sections.every(
    (section) => formData[section.id]?.status
  );

  // Toggle section status
  const handleToggle = (sectionId, clickedStatus) => {
    const currentStatus = formData[sectionId]?.status;
    const newStatus = currentStatus === clickedStatus ? null : clickedStatus;

    const updatedFormData = {
      ...formData,
      [sectionId]: {
        ...formData[sectionId],
        status: newStatus,
      },
    };

    setFormData(updatedFormData);
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleComment = (sectionId, comment) => {
    const updatedFormData = {
      ...formData,
      [sectionId]: { ...formData[sectionId], comment },
    };

    setFormData(updatedFormData);
  };

  // Save draft to localStorage
  const saveToDraft = () => {
    try {
      localStorage.setItem(MEAL_DRAFT_KEY, JSON.stringify(formData));
      setMessage({
        type: "success",
        text: "Draft saved successfully! You can continue later.",
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save draft. Please try again.",
      });
    }
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the draft? This cannot be undone."
      )
    ) {
      localStorage.removeItem(MEAL_DRAFT_KEY);
      setFormData({});
      setAttachedFile(null);
      setMessage({
        type: "info",
        text: "Draft cleared successfully.",
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("Submitting Data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear draft after successful submission
      localStorage.removeItem(MEAL_DRAFT_KEY);

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

  // Handle file attachment
  const handleAttachFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setAttachedFile(file);
        console.log("File selected:", file.name);

        const updatedFormData = {
          ...formData,
          attachedFile: {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
          },
        };
        setFormData(updatedFormData);
      }
    };
    input.click();
  };

  // Calculate score dynamically
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
        {/* Show draft indicator */}
        {/* {Object.keys(formData).length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              background: "#E8F4FF",
              padding: "4px 10px",
              borderRadius: "20px",
              color: "#0066CC",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
            <Icon icon="mdi:content-save-outline" width="14" height="14" />
            Draft Available
          </span>
        )} */}
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

        {/* Attached file display */}
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
            }}>
            <Icon icon="mdi:paperclip" width="20" height="20" color="#8B2885" />
            <span>{attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ff4444",
                cursor: "pointer",
                padding: "4px 8px",
              }}>
              <Icon icon="mdi:close" width="16" height="16" />
            </button>
          </div>
        )}

        {/* Attach Button */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <button
            onClick={handleAttachFile}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              backgroundColor: "white",
              color: "#8B2885",
              border: "2px solid #8B2885",
              borderRadius: "30px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <Icon icon="mdi:paperclip" width="20" height="20" />
            {attachedFile ? "Change Document" : "Attach Document"}
          </button>
        </div>

        {/* Action Buttons */}
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

          {/* Draft Button Row */}
          {/* <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              marginBottom: "20px",
            }}>
            <button
              onClick={saveToDraft}
              disabled={!hasAtLeastOneField}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                backgroundColor: hasAtLeastOneField ? "#4CAF50" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "30px",
                cursor: hasAtLeastOneField ? "pointer" : "not-allowed",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}>
              <Icon icon="mdi:content-save-outline" width="20" height="20" />
              Save to Draft
            </button>

            {Object.keys(formData).length > 0 && (
              <button
                onClick={clearDraft}
                style={{
                  padding: "12px 20px",
                  fontSize: "16px",
                  backgroundColor: "transparent",
                  color: "#ff4444",
                  border: "1px solid #ff4444",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                <Icon icon="mdi:delete-outline" width="20" height="20" />
                Clear Draft
              </button>
            )}
          </div>

          {!hasAtLeastOneField && (
            <p
              style={{ color: "#888", fontSize: "14px", marginBottom: "15px" }}>
              Fill at least one field to save as draft
            </p>
          )} */}

          {/* Submit Button */}
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
