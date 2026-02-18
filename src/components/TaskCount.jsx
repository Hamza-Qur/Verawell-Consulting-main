import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getTeamStats } from "../redux/slices/dashboardSlice";

const TaskCount = () => {
  const dispatch = useDispatch();

  // Get team stats from Redux store
  const { teamStats, isTeamStatsLoading, teamStatsError } = useSelector(
    (state) => state.dashboard,
  );

  // Fetch team stats on component mount
  useEffect(() => {
    dispatch(getTeamStats());
  }, [dispatch]);

  // Show loading state
  if (isTeamStatsLoading) {
    return (
      <>
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
                        icon="material-symbols:library-books"
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
        <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
          <div className="col-12">
            <div className="alert alert-danger mb-0" role="alert">
              Error loading stats: {teamStatsError}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={() => dispatch(getTeamStats())}>
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
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        {/* Total Forms - maps to total_assigned_assessments */}
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {teamStats.total_assigned_assessments || 0}
                  </h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon
                    icon="material-symbols:library-books"
                    className=" mb-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </>
  );
};

export default TaskCount;
