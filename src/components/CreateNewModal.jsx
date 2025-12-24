import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DynamicModal from './DynamicModal';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import CreateFaciltyModal from './CreateFaciltyModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import AssignFacilityModal from './AssignFacilityModal';

export default function CreateNewModal() {
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showFacilityModal, setShowFacilityModal] = useState(false);
    const [showaAssignFacilityModal, setShowAssignFacilityModal] = useState(false);
    
    const handleShowAnnouncementModal = () => setShowAnnouncementModal(true);       
    const handleCloseAnnouncementModal = () => setShowAnnouncementModal(false);

    const handleShowEmployeeModal = () => setShowEmployeeModal(true);       
    const handleCloseEmployeeModal = () => setShowEmployeeModal(false);

    const handleShowFacilityModal = () => setShowFacilityModal(true);   
    const handleCloseFacilityModal = () => setShowFacilityModal(false);

    const handleShowAssignFacilityModal = () => setShowAssignFacilityModal(true);       
    const handleCloseAssignFacilityModal = () => setShowAssignFacilityModal(false);



  return (
        <div>
          <p>What would you like to create?</p>
          <ul>
            <Link onClick={handleShowAnnouncementModal} className="btn modalButton w-100 ">Create Announcement</Link>
            <DynamicModal
                show={showAnnouncementModal}
                handleClose={handleCloseAnnouncementModal}
                title="Create Alert/Announcement"
                content={<CreateAnnouncementModal/>}
                modalWidth="40%"
            />
            
            <Link onClick={handleShowEmployeeModal} className="btn modalButton w-100">Add Employee</Link>
            <DynamicModal
                show={showEmployeeModal}
                handleClose={handleCloseEmployeeModal}
                title="Add Employee"
                content={<CreateEmployeeModal/>}
                modalWidth="40%"
            />

            <Link onClick={handleShowFacilityModal} className="btn modalButton w-100">Add Facility</Link>
            <DynamicModal
                show={showFacilityModal}
                handleClose={handleCloseFacilityModal}
                title="Add Facility"
                content={<CreateFaciltyModal/>}
                modalWidth="70%"
            />

            <Link onClick={handleShowAssignFacilityModal} className="btn modalButton w-100">Assign Facility</Link>
            <DynamicModal
                show={showaAssignFacilityModal}
                handleClose={handleCloseAssignFacilityModal}
                title="Assign Facility"
                content={<AssignFacilityModal/>}
                modalWidth="70%"
            />
          </ul>
        </div>
  )
}
