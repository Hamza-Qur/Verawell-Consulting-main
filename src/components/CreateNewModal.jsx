import React, { useState } from "react";
import { Link } from "react-router-dom";
import DynamicModal from "./DynamicModal";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import CreateFaciltyModal from "./CreateFaciltyModal";
import CreateEmployeeModal from "./CreateEmployeeModal";
import AssignFacilityModal from "./AssignFacilityModal";
import AddCustomerModal from "./AddCustomerModal";

export default function CreateNewModal() {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showaAssignFacilityModal, setShowAssignFacilityModal] =
    useState(false);
  const [showCustomerModal, setshowCustomerModal] = useState(false);

  const handleShowAnnouncementModal = () => setShowAnnouncementModal(true);
  const handleCloseAnnouncementModal = () => setShowAnnouncementModal(false);

  const handleShowEmployeeModal = () => setShowEmployeeModal(true);
  const handleCloseEmployeeModal = () => setShowEmployeeModal(false);

  const handleShowFacilityModal = () => setShowFacilityModal(true);
  const handleCloseFacilityModal = () => setShowFacilityModal(false);

  const handleShowAssignFacilityModal = () => setShowAssignFacilityModal(true);
  const handleCloseAssignFacilityModal = () =>
    setShowAssignFacilityModal(false);

  const handleShowCustomerModal = () => setshowCustomerModal(true);
  const handleCloseCustomerModal = () => setshowCustomerModal(false);

  return (
    <div>
      <p>What would you like to create?</p>
      <ul>
        <Link
          onClick={handleShowAnnouncementModal}
          className="btn modalButton w-100 ">
          Create Announcement
        </Link>
        <DynamicModal
          show={showAnnouncementModal}
          handleClose={handleCloseAnnouncementModal}
          title="Create Alert/Announcement"
          content={<CreateAnnouncementModal />}
          modalWidth="40%"
        />

        <Link
          onClick={handleShowEmployeeModal}
          className="btn modalButton w-100">
          Add Employee
        </Link>
        <DynamicModal
          show={showEmployeeModal}
          handleClose={handleCloseEmployeeModal}
          title="Add Employee"
          content={<CreateEmployeeModal />}
        />

        <Link
          onClick={handleShowFacilityModal}
          className="btn modalButton w-100">
          Add Facility
        </Link>
        <DynamicModal
          show={showFacilityModal}
          handleClose={handleCloseFacilityModal}
          title="Add Facility"
          content={<CreateFaciltyModal />}
        />

        <Link
          onClick={handleShowAssignFacilityModal}
          className="btn modalButton w-100">
          Assign Facility Form
        </Link>
        <DynamicModal
          show={showaAssignFacilityModal}
          handleClose={handleCloseAssignFacilityModal}
          title="Assign Facility"
          content={<AssignFacilityModal />}
        />
        <Link
          onClick={handleShowCustomerModal}
          className="btn modalButton w-100">
          Add Customer
        </Link>
        <DynamicModal
          show={showCustomerModal}
          handleClose={handleCloseCustomerModal}
          title="Add Customer"
          content={<AddCustomerModal />}
        />
      </ul>
    </div>
  );
}
