import React, { useState } from "react";
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

const KitchenViewForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState(sectionsData); // <-- local editable copy

  const handleStatusChange = (id, newStatus) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, status: newStatus } : section
      )
    );
  };

  const handleCommentChange = (id, newComment) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, comment: newComment } : section
      )
    );
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

  const percentageScore = Math.max(Math.round((rawScore / maxScore) * 100), 0);

  let scoreColor = "#28a745"; // green
  if (percentageScore < 40) scoreColor = "#dc3545"; // red
  else if (percentageScore < 70) scoreColor = "#fd7e14"; // orange

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

      {/* --- Display Total Score --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "20px 0",
        }}>
        <h3>Total Score:</h3>
        <span
          style={{ fontSize: "35px", fontWeight: "bold", color: scoreColor }}>
          {percentageScore}%
        </span>
      </div>

      <div
        className="container py-16"
        style={{
          background: isEditing
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
                    disabled={!isEditing}
                    onChange={() =>
                      handleStatusChange(section.id, "satisfactory")
                    }
                  />
                </div>

                <div className="toggle-row">
                  <span>Need Improvement</span>
                  <input
                    type="checkbox"
                    className="toggle grey"
                    checked={section.status === "improvement"}
                    disabled={!isEditing}
                    onChange={() =>
                      handleStatusChange(section.id, "improvement")
                    }
                  />
                </div>
              </div>

              <textarea
                className="comment-box"
                value={section.comment}
                disabled={!isEditing}
                onChange={(e) =>
                  handleCommentChange(section.id, e.target.value)
                }
                style={{
                  resize: "none",
                  height: "90px",
                  flex: 3,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: isEditing ? "#fff" : "#f1f1f1",
                  color: "#555",
                }}
              />
            </div>
          </div>
        ))}

        {/* --- EDIT BUTTON --- */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
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
      </div>
    </MasterLayout>
  );
};

export default KitchenViewForm;
