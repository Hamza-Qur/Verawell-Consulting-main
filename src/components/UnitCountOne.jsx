// src/components/Dashboard/UnitCountOne.jsx
import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminStats } from "../redux/slices/dashboardSlice";
import DateFilter from "./DateFilter";
import useDateFilter from "./useDateFilter";

const UnitCountOne = () => {
  const dispatch = useDispatch();

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // Get admin stats from Redux store
  const { adminStats, isStatsLoading, statsError } = useSelector(
    (state) => state.dashboard,
  );

  // Fetch admin stats on component mount and when date filters change
  useEffect(() => {
    const dateRange = getDateRange();

    dispatch(
      getAdminStats({
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

  // Calculate total members (customers + team)
  const totalMembers =
    (adminStats.total_customer || 0) + (adminStats.total_team || 0);

  // Calculate active users (using total team as active users for now)
  const activeUsers = adminStats.total_team || 0;

  if (isStatsLoading) {
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
          {[1, 2, 3, 4].map((index) => (
            <div className="col" key={index}>
              <div className="card shadow-none">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="contentBox">
                      <p className="fw-medium blackColor mb-1">Loading...</p>
                      <div className="placeholder-glow">
                        <h3 className="mb-0 blackColor fw-bold placeholder col-6"></h3>
                      </div>
                    </div>
                    <div className="iconBox rounded-4 d-flex justify-content-center align-items-center placeholder-wave">
                      <div className="placeholder col-4"></div>
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

  if (statsError) {
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
            <div className="alert alert-danger" role="alert">
              Error loading dashboard stats: {statsError}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={() => {
                  const dateRange = getDateRange();
                  dispatch(
                    getAdminStats({
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
        {/* Total Members Card */}
        <div className="col">
          <div className="card shadow-none">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Members</p>
                  <h3 className="mb-0 blackColor fw-bold">{totalMembers}</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="mdi:user-group" className="mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Team Members Card */}
        <div className="col">
          <div className="card shadow-none">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Team</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {adminStats.total_team || 0}
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:user-rounded-bold" className="mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hours Logged Card */}
        <div className="col">
          <div className="card shadow-none">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Hours Logged</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {adminStats.total_hours_logged || 0} Hrs
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:clock-circle-bold" className="mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Card */}
        <div className="col">
          <div className="card shadow-none">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Facilities</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {adminStats.total_facilities || 0}
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="tabler:building-store" className="mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitCountOne;
