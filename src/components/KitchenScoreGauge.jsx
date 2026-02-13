import React from "react";

const KitchenScoreGauge = ({ score, title, subtitle, strokeGauge }) => {
  // SVG Path math:
  // We use a radius of 80. A full circle circumference is 2 * PI * R (~502).
  // A semi-circle is ~251.
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const containerStyle = {
    background:
      "linear-gradient( 90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100% )",
    padding: "30px",
    borderRadius: "20px",
    width: "100%",
    textAlign: "center",
    color: "white",
  };

  return (
    <div style={containerStyle}>
      <h6
        style={{
          margin: "0 0 20px 0",
          fontWeight: "500",
          fontSize: "20px",
          color: "white",
        }}>
        {title}
      </h6>

      <div style={{ position: "relative", height: "120px", width: "100%" }}>
        <svg
          height="100%"
          viewBox="0 0 200 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", margin: "0 auto" }}>
          {/* Background Gray Arch */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Yellow Progress Arch */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={strokeGauge} // The gold/yellow color from your image
            strokeWidth="6"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>

        {/* Score Text Center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -20%)",
          }}>
          <div style={{ fontSize: "48px", fontWeight: "500" }}>{score}%</div>
        </div>
      </div>

      <h6
        style={{
          marginTop: "20px",
          fontWeight: "500",
          fontSize: "18px",
          color: "white",
        }}>
        {subtitle}
      </h6>
    </div>
  );
};

export default KitchenScoreGauge;
