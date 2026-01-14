import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminStats } from "../redux/slices/dashboardSlice";

const UnitCountOne = () => {
  const dispatch = useDispatch();

  // Get admin stats from Redux store
  const { adminStats, isStatsLoading, statsError } = useSelector(
    (state) => state.dashboard
  );

  // Fetch admin stats on component mount
  useEffect(() => {
    dispatch(getAdminStats());
  }, [dispatch]);

  // Calculate total members (customers + team)
  const totalMembers =
    (adminStats.total_customer || 0) + (adminStats.total_team || 0);

  // Calculate active users (using total team as active users for now)
  // You might want to adjust this based on your actual active user logic
  const activeUsers = adminStats.total_team || 0;

  if (isStatsLoading) {
    return (
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
    );
  }

  if (statsError) {
    return (
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            Error loading dashboard stats: {statsError}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => dispatch(getAdminStats())}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <div
                  className="iconBox rounded-4 d-flex justify-content-center align-items-center"
            >
                  <Icon
                    icon="tabler:building-store"
                    className="mb-0"
                  />
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
