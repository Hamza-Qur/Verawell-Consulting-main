import React from "react";
import { Icon } from "@iconify/react";
import downArrow from "../otherImages/ArrowDown.svg";
import riseArrow from "../otherImages/ArrowRise.svg";
import thirdcard from "../otherImages/vector.svg";
import reverseIcon from "../otherImages/reverseIcon.png";
const UnitCountOne = () => {
  return (
    <>
      {/* <h2 className='fs-2 mb-20   '>Overview</h2> */}
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Members</p>
                  <h3 className="mb-0 blackColor fw-bold">50</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="mdi:user-group" className=" mb-0" />
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
                  <p className="fw-medium blackColor mb-1">Active User</p>
                  <h3 className="mb-0 blackColor fw-bold">25</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="solar:user-rounded-bold" className=" mb-0" />
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
                  <h3 className="mb-0 blackColor fw-bold">162 Hrs</h3>
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
                  <p className="fw-medium blackColor mb-1">Facilities</p>
                  <h3 className="mb-0 blackColor fw-bold">04</h3>
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

export default UnitCountOne;
