import React, { useState, useEffect } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import KitchenScoreGauge from "../components/KitchenScoreGauge";
import UnitCountCustomer from "../components/UnitCountCustomer";
import CustomerStatistics from "../components/CustomerStatistics";
import CustomerDashboardData from "../components/CustomerDashboardData";

const foodChainScores = {
  KFC: {
    kitchen: 86,
    meal: 74,
  },
  Nobu: {
    kitchen: 95,
    meal: 92,
  },
  "Burger King": {
    kitchen: 72,
    meal: 61,
  },
  "White Castle": {
    kitchen: 65,
    meal: 58,
  },
  "Cluckin' Bell": {
    kitchen: 42,
    meal: 37,
  },
};

const CustomerDashboard = () => {
  const [selectedChain, setSelectedChain] = useState("KFC");
  const [displayedChain, setDisplayedChain] = useState("KFC");
  const [displayedScores, setDisplayedScores] = useState({
    kitchen: 86,
    meal: 74,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scores = foodChainScores[selectedChain];

  useEffect(() => {
    if (selectedChain !== displayedChain) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setDisplayedChain(selectedChain);
        setDisplayedScores(scores);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [selectedChain, displayedChain, scores]);

  return (
    <MasterLayout>
      {/* --- FOOD CHAIN DROPDOWN --- */}
      <div
        style={{
          marginBottom: "20px",
          position: "relative",
          display: "inline-block",
        }}>
        <select
          className="custom-select"
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
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
          {Object.keys(foodChainScores).map((chain) => (
            <option
              key={chain}
              value={chain}
              style={{
                background: "#571a3e",
                color: "white",
                padding: "10px",
              }}>
              {chain}
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
              title="Kitchen Score"
              subtitle={`${displayedChain} – Kitchen Sanitization`}
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
              title="Meal Score"
              subtitle={`${displayedChain} – Meal Observation`}
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
