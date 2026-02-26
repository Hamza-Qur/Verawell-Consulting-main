// src/pages/CustomerDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import KitchenScoreGauge from "../components/KitchenScoreGauge";
import UnitCountCustomer from "../components/UnitCountCustomer";
import CustomerStatistics from "../components/CustomerStatistics";
import CustomerDashboardData from "../components/CustomerDashboardData";
import { getFacilityScores } from "../redux/slices/dashboardSlice";
import DateFilter from "../components/DateFilter";
import useDateFilter from "../components/useDateFilter";

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { facilityScores, isFacilityScoresLoading, facilityScoresError } =
    useSelector((state) => state.dashboard);

  // Use date filter hook - ONLY for gauges
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [displayedFacilityId, setDisplayedFacilityId] = useState(null);
  const [displayedScores, setDisplayedScores] = useState({
    kitchen: 0,
    meal: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasData, setHasData] = useState(true);

  // Fetch facility scores with date filters - ONLY for gauges
  useEffect(() => {
    const dateRange = getDateRange();

    dispatch(
      getFacilityScores({
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
      }),
    );
  }, [
    dispatch,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  // Check if we have data and reset state when empty
  useEffect(() => {
    if (!isFacilityScoresLoading) {
      if (!facilityScores || facilityScores.length === 0) {
        setHasData(false);
        // Reset to default state when no data
        setSelectedFacilityId(null);
        setDisplayedFacilityId(null);
        setDisplayedScores({ kitchen: 0, meal: 0 });
      } else {
        setHasData(true);
      }
    }
  }, [facilityScores, isFacilityScoresLoading]);

  // Calculate aggregate scores for "All Facilities"
  const aggregateScores = useMemo(() => {
    if (!facilityScores || facilityScores.length === 0) {
      return { kitchen: 0, meal: 0, totalFacilities: 0 };
    }

    const facilitiesWithData = facilityScores.filter(
      (f) => parseInt(f.total_score_1) > 0 || parseInt(f.total_score_2) > 0,
    );

    const facilitiesToUse =
      facilitiesWithData.length > 0 ? facilitiesWithData : facilityScores;

    const totalKitchenScore = facilitiesToUse.reduce(
      (sum, facility) => sum + (parseInt(facility.total_score_1) || 0),
      0,
    );

    const totalMealScore = facilitiesToUse.reduce(
      (sum, facility) => sum + (parseInt(facility.total_score_2) || 0),
      0,
    );

    const kitchenAvg =
      facilitiesToUse.length > 0
        ? Math.round(totalKitchenScore / facilitiesToUse.length)
        : 0;

    const mealAvg =
      facilitiesToUse.length > 0
        ? Math.round(totalMealScore / facilitiesToUse.length)
        : 0;

    return {
      kitchen: kitchenAvg,
      meal: mealAvg,
      totalFacilities: facilitiesToUse.length,
      rawKitchenTotal: totalKitchenScore,
      rawMealTotal: totalMealScore,
    };
  }, [facilityScores]);

  // Also update the initial selection useEffect to use fresh aggregateScores
  useEffect(() => {
    if (facilityScores.length > 0 && !selectedFacilityId) {
      setSelectedFacilityId("all");
      setDisplayedFacilityId("all");
      setDisplayedScores({
        kitchen: aggregateScores.kitchen,
        meal: aggregateScores.meal,
      });
    }
  }, [facilityScores, selectedFacilityId, aggregateScores]);

  // Handle facility selection change
  useEffect(() => {
    if (selectedFacilityId && selectedFacilityId !== displayedFacilityId) {
      setIsTransitioning(true);

      if (selectedFacilityId === "all") {
        const timer = setTimeout(() => {
          setDisplayedFacilityId("all");
          // Always get fresh aggregate scores when switching to "All"
          setDisplayedScores({
            kitchen: aggregateScores.kitchen,
            meal: aggregateScores.meal,
          });
          setIsTransitioning(false);
        }, 300);

        return () => clearTimeout(timer);
      } else {
        const selectedFacility = facilityScores.find(
          (facility) => facility.facility_id === selectedFacilityId,
        );

        if (selectedFacility) {
          const timer = setTimeout(() => {
            setDisplayedFacilityId(selectedFacilityId);

            const kitchenScore = parseInt(selectedFacility.total_score_1) || 0;
            const mealScore = parseInt(selectedFacility.total_score_2) || 0;

            setDisplayedScores({
              kitchen: kitchenScore,
              meal: mealScore,
            });
            setIsTransitioning(false);
          }, 300);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [
    selectedFacilityId,
    displayedFacilityId,
    facilityScores,
    aggregateScores,
  ]);

  // useEffect to update displayedScores when aggregateScores changes AND we're on "All Facilities"
  useEffect(() => {
    if (displayedFacilityId === "all" && !isTransitioning) {
      setDisplayedScores({
        kitchen: aggregateScores.kitchen,
        meal: aggregateScores.meal,
      });
    }
  }, [aggregateScores, displayedFacilityId, isTransitioning]);

  // Get subtitle text based on selected facility
  const getGaugeSubtitle = useCallback(
    (gaugeType) => {
      if (!hasData) return "No Data Available";

      if (displayedFacilityId === "all") {
        const facilityCount = aggregateScores.totalFacilities;
        return `${gaugeType === "kitchen" ? "Kitchen Sanitation" : "Meal Observation"} Score`;
      } else {
        const facility = facilityScores.find(
          (f) => f.facility_id === displayedFacilityId,
        );
        const facilityName = facility?.facility_name || "Facility";
        return `${gaugeType === "kitchen" ? "Kitchen Sanitation Assessment" : "Meal Observation Assessments"}`;
      }
    },
    [displayedFacilityId, aggregateScores, facilityScores, hasData],
  );

  // NO NEED TO MEMOIZE - these components are independent and should render normally
  // They are NOT affected by the date filter

  if (isFacilityScoresLoading && facilityScores.length === 0) {
    return (
      <MasterLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </MasterLayout>
    );
  }

  if (facilityScoresError && facilityScores.length === 0) {
    return (
      <MasterLayout>
        <div className="alert alert-danger" role="alert">
          Error loading facility scores: {facilityScoresError}
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      {/* Custom CSS to make DateFilter match your existing facility dropdown */}
      <style>
        {`
          .dashboard-filter .form-select {
            padding: 12px 40px 12px 16px;
            border-radius: 8px;
            border: 1px solid rgb(204, 204, 204);
            font-size: 16px;
            background: linear-gradient(90deg, rgb(216, 81, 80) 0%, rgb(87, 36, 103) 100%);
            color: white !important;
            font-weight: 500;
            cursor: pointer;
            appearance: none;
            transition: 0.3s;
            outline: none;
            box-shadow: none;
          }
          
          .dashboard-filter .form-select:hover {
            box-shadow: 0 0 0 2px rgba(255,255,255,0.2) !important;
          }
          
          .dashboard-filter .form-select:focus {
            border-color: #fff !important;
          }
          
          .dashboard-filter .form-select option {
            background: #571a3e !important;
            color: white !important;
            padding: 10px !important;
          }
          
          .dashboard-filter .form-select-sm {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            font-size: 16px !important;
          }
          
          .dashboard-filter .d-flex {
            gap: 8px !important;
          }
        `}
      </style>

      {/* --- FILTER SECTION - ONLY FOR GAUGES --- */}
      <div className="mb-4 pb-3">
        {/* Filter Group - Date Filter + Facility Dropdown Side by Side */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Facility Dropdown - Only for gauges */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}>
            <select
              className="custom-select"
              value={selectedFacilityId || "all"}
              onChange={(e) =>
                setSelectedFacilityId(
                  e.target.value === "all" ? "all" : parseInt(e.target.value),
                )
              }
              disabled={!hasData || facilityScores.length === 0}
              style={{
                padding: "12px 40px 12px 16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                background:
                  !hasData || facilityScores.length === 0
                    ? "linear-gradient(90deg, rgba(216, 81, 80, 0.5) 0%, rgba(87, 36, 103, 0.5) 100%)"
                    : "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
                color:
                  !hasData || facilityScores.length === 0
                    ? "rgba(255,255,255,0.7)"
                    : "white",
                fontWeight: "500",
                cursor:
                  !hasData || facilityScores.length === 0
                    ? "not-allowed"
                    : "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                transition: "all 0.3s ease",
                outline: "none",
                opacity: !hasData || facilityScores.length === 0 ? 0.8 : 1,
              }}
              onFocus={(e) => {
                if (hasData && facilityScores.length > 0) {
                  e.target.style.borderColor = "#fff";
                }
              }}
              onBlur={(e) => {
                if (hasData && facilityScores.length > 0) {
                  e.target.style.borderColor = "#ccc";
                }
              }}
              onMouseOver={(e) => {
                if (hasData && facilityScores.length > 0) {
                  e.target.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.2)";
                }
              }}
              onMouseOut={(e) => {
                if (hasData && facilityScores.length > 0) {
                  e.target.style.boxShadow = "none";
                }
              }}>
              {hasData && facilityScores.length > 0 ? (
                <>
                  <option
                    value="all"
                    style={{
                      background: "#571a3e",
                      color: "white",
                      padding: "10px",
                      fontWeight: "600",
                    }}>
                    🏢 All Facilities ({facilityScores.length})
                  </option>
                  <option
                    disabled
                    style={{
                      background: "#571a3e",
                      color: "rgba(255,255,255,0.5)",
                      padding: "10px",
                      fontStyle: "italic",
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                    }}>
                    ──────────── Individual Facilities ────────────
                  </option>
                  {facilityScores.map((facility) => (
                    <option
                      key={facility.facility_id}
                      value={facility.facility_id}
                      style={{
                        background: "#571a3e",
                        color: "white",
                        padding: "10px",
                      }}>
                      🏭 {facility.facility_name}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option
                    value="all"
                    disabled
                    style={{
                      background: "#571a3e",
                      color: "rgba(255,255,255,0.7)",
                      padding: "10px",
                      fontWeight: "600",
                    }}>
                    🏢 No Facilities Available
                  </option>
                </>
              )}
            </select>

            {/* Custom Arrow */}
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "22px",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                transition: "transform 0.3s ease",
                opacity: !hasData || facilityScores.length === 0 ? 0.5 : 1,
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

          {/* Date Filter - ONLY FOR GAUGES */}
          <div className="d-flex align-items-center">
            <div className="position-relative">
              <DateFilter
                {...dateFilter}
                onFilterChange={updateFilter}
                size="sm"
                className="dashboard-filter"
              />
            </div>
          </div>

          {/* Active Filter Badge - Styled to match */}
          {dateFilter.viewType !== "yearly" && (
            <div className="ms-2">
              <span
                className="badge"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(216, 81, 80, 0.8) 0%, rgba(87, 36, 103, 0.8) 100%)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                <i className="fas fa-filter me-1"></i>
                {dateFilter.viewType === "quarterly"
                  ? `Q${dateFilter.selectedQuarter} ${dateFilter.selectedYear}`
                  : `${new Date(2000, dateFilter.selectedMonth - 1, 1).toLocaleString("default", { month: "short" })} ${dateFilter.selectedYear}`}
              </span>
            </div>
          )}
        </div>

        {/* Date Range Badge - Subtle hint for gauges */}
        <div className="mt-2 ms-1">
          <span
            style={{
              fontSize: "13px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
            <i className="fas fa-calendar-alt" style={{ color: "#8B2885" }}></i>
            Gauge Data: {getDateRange().label}
          </span>
        </div>
      </div>

      {/* --- GAUGES - affected by date filter --- */}
      <div className="row gauges g-4">
        <div className="col-12 col-md-6 mb-3">
          <div
            style={{
              opacity: isTransitioning ? 0.6 : 1,
              transition: "opacity 0.3s ease",
              height: "100%",
            }}>
            <KitchenScoreGauge
              score={displayedScores.kitchen}
              title="Total Average Score"
              subtitle={getGaugeSubtitle("kitchen")}
              strokeGauge="#ffe54fff"
            />
          </div>
        </div>

        <div className="col-12 col-md-6 mb-3">
          <div
            style={{
              opacity: isTransitioning ? 0.6 : 1,
              transition: "opacity 0.3s ease",
              height: "100%",
            }}>
            <KitchenScoreGauge
              score={displayedScores.meal}
              title="Total Average Score"
              subtitle={getGaugeSubtitle("meal")}
              strokeGauge="#50D4B5"
            />
          </div>
        </div>
      </div>

      {/* Empty State for No Data - ONLY for gauges */}
      {(!hasData || facilityScores.length === 0) &&
        !isFacilityScoresLoading && (
          <div className="text-center py-5 my-4">
            <div className="mb-3">
              <i
                className="fas fa-chart-line"
                style={{ fontSize: "48px", color: "#ccc" }}></i>
            </div>
            <h5 style={{ color: "#666", fontWeight: "500" }}>
              No gauge data available
            </h5>
            <p style={{ color: "#999", fontSize: "14px", marginTop: "8px" }}>
              No facility scores found for {getDateRange().label}
            </p>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Try selecting a different date range
            </p>
          </div>
        )}

      {/* --- OTHER DASHBOARD COMPONENTS - NOT affected by date filter --- */}
      {/* These will always show their own data (all-time or default ranges) */}
      <UnitCountCustomer />
      <CustomerStatistics />
      <CustomerDashboardData />
    </MasterLayout>
  );
};

export default CustomerDashboard;
