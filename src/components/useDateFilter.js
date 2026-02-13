// src/hooks/useDateFilter.js
import { useState, useCallback } from "react";

const useDateFilter = (initialFilter = {}) => {
  const [dateFilter, setDateFilter] = useState({
    viewType: "yearly",
    selectedYear: new Date().getFullYear(),
    selectedQuarter: 1,
    selectedMonth: new Date().getMonth() + 1,
    ...initialFilter,
  });

  // Helper function to get last day of month
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Get date range based on filter - NO PREDICTION LOGIC
  const getDateRange = useCallback(() => {
    const { viewType, selectedYear, selectedQuarter, selectedMonth } =
      dateFilter;

    switch (viewType) {
      case "yearly":
        return {
          from_date: `${selectedYear}-01-01`,
          to_date: `${selectedYear}-12-31`,
          label: `Year ${selectedYear}`,
        };

      case "quarterly":
        const quarterStartMonth = (selectedQuarter - 1) * 3 + 1;
        const quarterEndMonth = quarterStartMonth + 2;
        const lastDayOfQuarter = getLastDayOfMonth(
          selectedYear,
          quarterEndMonth,
        );
        return {
          from_date: `${selectedYear}-${String(quarterStartMonth).padStart(2, "0")}-01`,
          to_date: `${selectedYear}-${String(quarterEndMonth).padStart(2, "0")}-${lastDayOfQuarter}`,
          label: `Q${selectedQuarter} ${selectedYear}`,
        };

      case "monthly":
        const lastDayOfMonth = getLastDayOfMonth(selectedYear, selectedMonth);
        return {
          from_date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
          to_date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${lastDayOfMonth}`,
          label: `${new Date(2000, selectedMonth - 1, 1).toLocaleString("default", { month: "long" })} ${selectedYear}`,
        };

      default:
        return {
          from_date: `${selectedYear}-01-01`,
          to_date: `${selectedYear}-12-31`,
          label: `Year ${selectedYear}`,
        };
    }
  }, [dateFilter]);

  const updateFilter = useCallback((updates) => {
    setDateFilter((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFilter = useCallback(() => {
    setDateFilter({
      viewType: "yearly",
      selectedYear: new Date().getFullYear(),
      selectedQuarter: 1,
      selectedMonth: new Date().getMonth() + 1,
    });
  }, []);

  return {
    dateFilter,
    updateFilter,
    resetFilter,
    getDateRange,
  };
};

export default useDateFilter;
