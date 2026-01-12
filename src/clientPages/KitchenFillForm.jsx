import React, { useEffect, useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const sections = [
  { id: "floors", label: "Floors Clean and free of build up" },
  { id: "walkins", label: "Walk-ins Clean" },
  { id: "logs", label: "Refrigerator Logs complete" },
  { id: "thermometers", label: "Thermometers inside refrigerator units" },
  {
    id: "refrigerator",
    label:
      "Refrigerator/Freezer units at appropriate temps Walk-in/Fridge (35-40 degrees) Freezer (0 -10 degrees) No signs of thaw/freezer burn",
  },
  {
    id: "thawing",
    label: "Proper Thawing methods used with thaw dates labeled",
  },
  { id: "food", label: "Food off Floor" },
  { id: "walls", label: "Walls Clean" },
  { id: "surfaces", label: "Work Surfaces Clean" },
  {
    id: "sanitizer",
    label: "Sanitizer Buckets out and in use with clean towels",
  },
  {
    id: "equipment",
    label: "Major Equipment clean: Oven, Stovetop, Grill top, Steamer",
  },
  {
    id: "minor",
    label:
      "Minor Equipment Clean: Toaster, Blender, Food Processor, Mixer, Plate warmer",
  },
  { id: "area", label: "Dishwashing area clean. Machine free of build-up" },
  { id: "dishes", label: "Dishes clean and dry, no wet nesting" },
  { id: "utensils", label: "Pots, Pans, and Utensils clean & Dry" },
  { id: "tested", label: "Dish Machine tested and Log filled" },
  {
    id: "verbalize",
    label: "Staff can verbalize Dish machine use and testing",
  },
  { id: "log", label: "Pot Sink Tested and log complete. PPM" },
  { id: "testing", label: "Staff can Verbalize Pot/pan sink testing" },
  { id: "clean", label: "Coffee Urns Clean" },
  { id: "sticker", label: "Hoots/Vents clean- sticker up to date" },
  { id: "knives", label: "Knives stored Properly" },
  { id: "opener", label: "Can opener Clean" },
  { id: "slicer", label: "Slicer Clean" },
  { id: "storage", label: "Storage room clean and organized" },
  { id: "stock", label: "Stock < 18” from ceiling" },
  { id: "scoops", label: "No scoops in ingredient bins" },
  { id: "chemicals", label: "Chemicals stored and labeled" },
  { id: "sds", label: "SDS Posted and Complete" },
  { id: "labeled", label: "All food labeled and dated" },
  { id: "washing", label: "Hand washing sink stocked" },
  { id: "posted", label: "Hand washing procedures posted" },
  { id: "hands", label: "Staff observed washing hands between tasks" },
  {
    id: "available",
    label: "One motion Eyewash Station available and labeled",
  },
  { id: "cans", label: "Garbage cans clean and covered" },
  { id: "staff", label: "PPE available and staff can verbalize when to use" },
  { id: "all", label: "All equipment working" },
];
const DRAFT_KEY = "kitchen_form_draft"; // Key for localStorage

const KitchenFillForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [attachedFile, setAttachedFile] = useState(null); // For file attachment
  const navigate = useNavigate();

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData(parsedData);
        setMessage({
          type: "info",
          text: "Draft loaded from previous session.",
        });

        // Auto-clear the message after 3 seconds
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setMessage({
        type: "success",
        text: "Draft saved successfully! You can continue later.",
      });

      // Auto-clear the message after 3 seconds
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
      localStorage.removeItem(DRAFT_KEY);
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
      localStorage.removeItem(DRAFT_KEY);

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

        // You can also save file info to formData if needed
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
      if (status === "improvement") earnedMarks -= 3; // Negative marking for improvement
    });

    // Allow negative percentages
    const percentage = totalMarks
      ? Math.round((earnedMarks / totalMarks) * 100)
      : 0;

    // Determine color - negative scores will be red
    let color = "#28a745"; // green
    if (percentage < 0) color = "#dc3545"; // red for negative
    else if (percentage < 40) color = "#dc3545"; // red for low positive
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
        Kitchen Sanitation Assessment
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
          </div> */}

          {/* {!hasAtLeastOneField && (
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

export default KitchenFillForm;
