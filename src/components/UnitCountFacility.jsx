import React from "react";
import { Icon } from "@iconify/react";
import downArrow from "../otherImages/ArrowDown.svg";
import riseArrow from "../otherImages/ArrowRise.svg";
import thirdcard from "../otherImages/vector.svg";
import reverseIcon from "../otherImages/reverseIcon.png";
const UnitCountFacility = () => {
  return (
    <>
      {/* <h2 className='fs-2 mb-20   '>Overview</h2> */}
      <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 gy-4 dashboardCol">
        <div className="col">
          <div className="card shadow-none ">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="contentBox">
                  <p className="fw-medium blackColor mb-1">Total Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">50</h3>
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
                  <p className="fw-medium blackColor mb-1">Completed Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">25</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="mdi:tick" className=" mb-0" />
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
                  <p className="fw-medium blackColor mb-1">Pending Forms</p>
                  <h3 className="mb-0 blackColor fw-bold">05</h3>
                </div>
                <div className="iconBox rounded-4 d-flex justify-content-center align-items-center">
                  <Icon icon="mdi:warning-circle" className=" mb-0" />
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
                  <h3 className="mb-0 blackColor fw-bold">04</h3>
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
      </div>
    </>
  );
};

export default UnitCountFacility;
