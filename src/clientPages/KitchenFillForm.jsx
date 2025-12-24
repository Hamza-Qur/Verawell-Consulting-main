import React, { useState } from "react";
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

const KitchenFillForm = () => {
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
        Kitchen Sanitation Assessment
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

export default KitchenFillForm;
