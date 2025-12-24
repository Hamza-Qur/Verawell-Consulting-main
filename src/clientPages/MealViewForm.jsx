import React, { useState } from "react";
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

const MealViewForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState(sectionsData);

  const toggleStatus = (id, statusType) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, status: statusType } : sec))
    );
  };

  const updateComment = (id, value) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, comment: value } : sec))
    );
  };

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
                    onChange={() => toggleStatus(section.id, "satisfactory")}
                  />
                </div>

                <div className="toggle-row">
                  <span>Need Improvement</span>
                  <input
                    type="checkbox"
                    className="toggle grey"
                    checked={section.status === "improvement"}
                    disabled={!isEditing}
                    onChange={() => toggleStatus(section.id, "improvement")}
                  />
                </div>
              </div>

              <textarea
                className="comment-box"
                value={section.comment}
                disabled={!isEditing}
                onChange={(e) => updateComment(section.id, e.target.value)}
                style={{
                  resize: "none",
                  height: "90px",
                  flex: 3,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f1f1f1",
                  color: "#555",
                }}
              />
            </div>
          </div>
        ))}

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

export default MealViewForm;
