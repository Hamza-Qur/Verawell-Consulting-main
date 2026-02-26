// src/components/Dashboard/DateFilter.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

const DateFilter = ({
  viewType = "yearly",
  selectedYear = new Date().getFullYear(),
  selectedQuarter = 1,
  selectedMonth = new Date().getMonth() + 1,
  onFilterChange,
  showViewType = true,
  showYearSelector = true,
  showQuarterSelector = true,
  showMonthSelector = true,
  className = "",
  size = "md",
}) => {
  const [localFilter, setLocalFilter] = useState({
    viewType,
    selectedYear,
    selectedQuarter,
    selectedMonth,
  });

  // Generate year options - ONLY PAST AND CURRENT YEAR
  const yearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 3; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const handleChange = (updates) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const handleViewTypeChange = (e) => {
    handleChange({ viewType: e.target.value });
  };

  const handleYearChange = (e) => {
    handleChange({ selectedYear: parseInt(e.target.value) });
  };

  const handleQuarterChange = (e) => {
    handleChange({ selectedQuarter: parseInt(e.target.value) });
  };

  const handleMonthChange = (e) => {
    handleChange({ selectedMonth: parseInt(e.target.value) });
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "form-select-sm";
      case "lg":
        return "form-select-lg";
      default:
        return "";
    }
  };

  // Updated DateFilter.jsx - Modern Minimalist
  return (
    <div className={`d-flex flex-wrap gap-2 align-items-center ${className}`}>
      {showViewType && (
        <div className="position-relative">
          <select
            className="form-select border-0 bg-light bg-opacity-75 rounded-3 py-2 px-3 fw-semibold"
            value={localFilter.viewType}
            onChange={handleViewTypeChange}
            style={{
              minWidth: "110px",
              fontSize: size === "sm" ? "0.875rem" : "0.95rem",
              color: "#2D3748",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}>
            <option value="yearly">📅 Yearly</option>
            <option value="quarterly">📊 Quarterly</option>
            <option value="monthly">📆 Monthly</option>
          </select>
        </div>
      )}

      {showYearSelector && (
        <div className="position-relative">
          <select
            className="form-select text-light border-0 bg-light bg-opacity-75 rounded-3 py-2 px-3 fw-semibold"
            value={localFilter.selectedYear}
            onChange={handleYearChange}
            style={{
              minWidth: "90px",
              fontSize: size === "sm" ? "0.875rem" : "0.95rem",
              color: "#2D3748",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}>
            {yearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {showQuarterSelector && localFilter.viewType === "quarterly" && (
        <div className="position-relative">
          <select
            className="form-select text-light border-0 bg-light bg-opacity-75 rounded-3 py-2 px-3 fw-semibold"
            value={localFilter.selectedQuarter}
            onChange={handleQuarterChange}
            style={{
              minWidth: "130px",
              fontSize: size === "sm" ? "0.875rem" : "0.95rem",
              color: "#2D3748",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}>
            <option value="1">Q1 · Jan-Mar</option>
            <option value="2">Q2 · Apr-Jun</option>
            <option value="3">Q3 · Jul-Sep</option>
            <option value="4">Q4 · Oct-Dec</option>
          </select>
        </div>
      )}

      {showMonthSelector && localFilter.viewType === "monthly" && (
        <div className="position-relative">
          <select
            className="form-select text-light border-0 bg-light bg-opacity-75 rounded-3 py-2 px-3 fw-semibold"
            value={localFilter.selectedMonth}
            onChange={handleMonthChange}
            style={{
              minWidth: "150px",
              fontSize: size === "sm" ? "0.875rem" : "0.95rem",
              color: "#2D3748",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1, 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

DateFilter.propTypes = {
  viewType: PropTypes.oneOf(["yearly", "quarterly", "monthly"]),
  selectedYear: PropTypes.number,
  selectedQuarter: PropTypes.oneOf([1, 2, 3, 4]),
  selectedMonth: PropTypes.number,
  onFilterChange: PropTypes.func,
  showViewType: PropTypes.bool,
  showYearSelector: PropTypes.bool,
  showQuarterSelector: PropTypes.bool,
  showMonthSelector: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default DateFilter;
