import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerStats } from "../redux/slices/dashboardSlice";

const UnitCountCustomer = () => {
  const dispatch = useDispatch();

  // Get customer stats from Redux store
  const { customerStats, isCustomerStatsLoading, customerStatsError } =
    useSelector((state) => state.dashboard);

  // Fetch customer stats on component mount
  useEffect(() => {
    dispatch(getCustomerStats());
  }, [dispatch]);

  // Extract data from customerStats with defaults
  const {
    total_assigned_assessments = 0, // Total Forms
    total_assessments = 0, // Total Documents
    total_hours = 0, // Hours Logged
    total_facilities = 0, // Total Facilities
  } = customerStats;

  // Show loading state
  if (isCustomerStatsLoading) {
    return (
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">...</h3>
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Documents</p>
                  <h3 className="mb-0 blackColor fw-bold">...</h3>
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Hours Logged</p>
                  <h3 className="mb-0 blackColor fw-bold">... Hrs</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:clock-circle-bold" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Facilities</p>
                  <h3 className="mb-0 blackColor fw-bold">...</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="tabler:building-store" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (customerStatsError) {
    return (
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">0</h3>
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Documents</p>
                  <h3 className="mb-0 blackColor fw-bold">0</h3>
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Hours Logged</p>
                  <h3 className="mb-0 blackColor fw-bold">0 Hrs</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:clock-circle-bold" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Facilities</p>
                  <h3 className="mb-0 blackColor fw-bold">0</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="tabler:building-store" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {total_assigned_assessments}
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Documents</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {total_assessments}
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
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Hours Logged</p>
                  <h3 className="mb-0 blackColor fw-bold">{total_hours} Hrs</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:clock-circle-bold" className=" mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Facilities</p>
                  <h3 className="mb-0 blackColor fw-bold">
                    {total_facilities}
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

export default UnitCountCustomer;
