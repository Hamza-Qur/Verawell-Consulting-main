import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import KitchenScoreGauge from "../components/KitchenScoreGauge";
import UnitCountCustomer from "../components/UnitCountCustomer";
import CustomerStatistics from "../components/CustomerStatistics";
import CustomerDashboardData from "../components/CustomerDashboardData";
import { getFacilityScores } from "../redux/slices/dashboardSlice"; // Import the action

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { facilityScores, isFacilityScoresLoading, facilityScoresError } =
    useSelector((state) => state.dashboard);

  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [displayedFacilityId, setDisplayedFacilityId] = useState(null);
  const [displayedScores, setDisplayedScores] = useState({
    kitchen: 0,
    meal: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch facility scores on component mount
  useEffect(() => {
    dispatch(getFacilityScores());
  }, [dispatch]);

  // Set initial selected facility when data loads
  useEffect(() => {
    if (facilityScores.length > 0 && !selectedFacilityId) {
      const firstFacility = facilityScores[0];
      setSelectedFacilityId(firstFacility.facility_id);
      setDisplayedFacilityId(firstFacility.facility_id);

      // Convert total_score from string to number for the gauge
      const kitchenScore = parseInt(firstFacility.total_score) || 0;
      const mealScore = firstFacility.total || 0; // Using 'total' as meal score

      setDisplayedScores({
        kitchen: kitchenScore,
        meal: mealScore,
      });
    }
  }, [facilityScores, selectedFacilityId]);

  // Handle facility selection change
  useEffect(() => {
    if (selectedFacilityId && selectedFacilityId !== displayedFacilityId) {
      setIsTransitioning(true);

      const selectedFacility = facilityScores.find(
        (facility) => facility.facility_id === selectedFacilityId,
      );

      if (selectedFacility) {
        const timer = setTimeout(() => {
          setDisplayedFacilityId(selectedFacilityId);

          // Convert total_score from string to number for the gauge
          const kitchenScore = parseInt(selectedFacility.total_score) || 0;
          const mealScore = selectedFacility.total || 0; // Using 'total' as meal score

          setDisplayedScores({
            kitchen: kitchenScore,
            meal: mealScore,
          });
          setIsTransitioning(false);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedFacilityId, displayedFacilityId, facilityScores]);

  // Find the currently displayed facility for the subtitle
  const displayedFacility = facilityScores.find(
    (facility) => facility.facility_id === displayedFacilityId,
  );

  if (isFacilityScoresLoading) {
    return (
      <MasterLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </MasterLayout>
    );
  }

  if (facilityScoresError) {
    return (
      <MasterLayout>
        <div className="alert alert-danger" role="alert">
          Error loading facility scores: {facilityScoresError}
        </div>
      </MasterLayout>
    );
  }

  if (facilityScores.length === 0) {
    return (
      <MasterLayout>
        <div className="alert alert-info" role="alert">
          No facility scores available.
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      {/* --- FACILITY DROPDOWN --- */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}>
        <select
          className="custom-select"
          value={selectedFacilityId || ""}
          onChange={(e) => setSelectedFacilityId(parseInt(e.target.value))}
          style={{
            padding: "12px 40px 12px 16px" /* Extra right padding for arrow */,
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            background:
              "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
            color: "white",
            fontWeight: "500",
            cursor: "pointer",
            appearance: "none" /* Remove default arrow */,
            WebkitAppearance: "none" /* Safari/Chrome */,
            MozAppearance: "none" /* Firefox */,
            transition: "all 0.3s ease",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#fff")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          onMouseOver={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.2)")
          }
          onMouseOut={(e) => (e.target.style.boxShadow = "none")}>
          {facilityScores.map((facility) => (
            <option
              key={facility.facility_id}
              value={facility.facility_id}
              style={{
                background: "#571a3e",
                color: "white",
                padding: "10px",
              }}>
              {facility.facility_name}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "40%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            transition: "transform 0.3s ease",
          }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6L8 10L12 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* --- GAUGES --- */}
      <div className="row gauges">
        <div className="col-12 col-md-6 mb-3">
          <div
            style={{
              opacity: isTransitioning ? 0.6 : 1,
              transition: "opacity 0.3s ease",
            }}>
            <KitchenScoreGauge
              score={displayedScores.kitchen}
              title="Total Score"
              subtitle={`${displayedFacility?.facility_name || "Facility"} – Overall Assessment`}
              strokeGauge="#ffe54fff"
            />
          </div>
        </div>

        <div className="col-12 col-md-6 mb-3">
          <div
            style={{
              opacity: isTransitioning ? 0.6 : 1,
              transition: "opacity 0.3s ease",
            }}>
            <KitchenScoreGauge
              score={displayedScores.meal}
              title="Total Assessments"
              subtitle={`${displayedFacility?.facility_name || "Facility"} – Completed Assessments`}
              strokeGauge="#50D4B5"
            />
          </div>
        </div>
      </div>

      <UnitCountCustomer />
      <CustomerStatistics />
      <CustomerDashboardData />
    </MasterLayout>
  );
};

export default CustomerDashboard;
