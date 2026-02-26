// src/components/Dashboard/UnitCountTwo.jsx
import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getTeamStats } from "../redux/slices/dashboardSlice";
import DateFilter from "./DateFilter";
import useDateFilter from "./useDateFilter";

const UnitCountTwo = () => {
  const dispatch = useDispatch();

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // Get team stats from Redux store
  const { teamStats, isTeamStatsLoading, teamStatsError } = useSelector(
    (state) => state.dashboard,
  );

  // Fetch team stats on component mount and when date filters change
  useEffect(() => {
    const dateRange = getDateRange();

    dispatch(
      getTeamStats({
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

  // Show loading state
  if (isTeamStatsLoading) {
    return (
      <>
        {/* Date Filter Skeleton */}
        <div className="mb-4 pb-2 border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <div style={{ minWidth: "300px" }}>
              <div className="placeholder-glow">
                <span
                  className="placeholder col-6"
                  style={{ height: "38px" }}></span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <span className="badge bg-light text-dark p-2 placeholder-glow">
              <span className="placeholder col-4"></span>
            </span>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
          {[1, 2, 3, 4].map((item) => (
            <div className="col" key={item}>
              <div className="card shadow-none ">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="contentBox">
                      <div className="placeholder-glow">
                        <p
                          className="fw-medium blackColor mb-1 placeholder"
                          style={{ width: "100px" }}></p>
                        <h3
                          className="mb-0 blackColor fw-bold placeholder"
                          style={{ width: "60px" }}></h3>
                      </div>
                    </div>
                    <div className="iconBox rounded-4 d-flex justify-content-center align-items-center placeholder">
                      <Icon
                        icon="material-symbols:docs-rounded"
                        className=" mb-0"
                        style={{ opacity: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Show error state
  if (teamStatsError) {
    return (
      <>
        {/* Date Filter (still show even in error state) */}
        <div className="mb-4 pb-2 border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <div style={{ minWidth: "300px" }}>
              <DateFilter
                {...dateFilter}
                onFilterChange={updateFilter}
                size="sm"
              />
            </div>
          </div>
          <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-light text-dark p-2">
              <i className="fas fa-calendar-alt me-1"></i>
              {getDateRange().label}
            </span>
          </div>
        </div>

        <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
          <div className="col-12">
            <div className="alert alert-danger mb-0" role="alert">
              Error loading stats: {teamStatsError}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={() => {
                  const dateRange = getDateRange();
                  dispatch(
                    getTeamStats({
                      from_date: dateRange.from_date,
                      to_date: dateRange.to_date,
                    }),
                  );
                }}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Date Filter */}
      <div className="mb-4 pb-2 border-bottom">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div style={{ minWidth: "300px" }}>
            <DateFilter
              {...dateFilter}
              onFilterChange={updateFilter}
              size="sm"
            />
          </div>
        </div>

        {/* Active filter badges */}
        <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-light text-dark p-2">
            <i className="fas fa-calendar-alt me-1"></i>
            {getDateRange().label}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        {/* Total Documents - maps to total_assessments */}
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Documents</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {teamStats.total_assessments || 0}
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon
                    icon="material-symbols:docs-rounded"
                    className=" mb-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hours Logged - maps to total_hours */}
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">
                    Total Hours Logged
                  </p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {teamStats.total_hours || 0} Hrs
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:clock-circle-bold" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Assigned - maps to total_facilities */}
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">
                    Facilities Assigned
                  </p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {teamStats.total_facilities || 0}
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="tabler:building-store" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty card to maintain grid layout (since we have 3 cards instead of 4) */}
        <div className="col d-none d-lg-block">
          {/* This empty div maintains the grid layout */}
        </div>
      </div>
    </>
  );
};

export default UnitCountTwo;
