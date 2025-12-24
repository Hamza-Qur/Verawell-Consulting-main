import React, { useState } from "react";
import mapImage from "../otherImages/mapImage.png"

const CreateFaciltyModal = () => {
  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleSubmit = () => {
    // Handle form submission logic here
    alert("Facility added!");
  };

  return (
    <div className="announcementModal">
      <div className="row">
        <div className="col-md-6 mt-20 position-relative">
          <div className="form-group">
            <label htmlFor="facilityName">Facility Name</label>
            <input
              type="text"
              id="facilityName"
              className="form-control mb-20"
              placeholder="Enter facility name"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              className="form-control mb-20"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee">Assign Employee</label>
            <select
              id="employee"
              className="form-control mb-20 "
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              <option value="employee1">John Doe</option>
              <option value="employee2">Jane Smith</option>
              <option value="employee3">Michael Johnson</option>
            </select>
          </div>

          <button className="btn announceButton facilityButton" onClick={handleSubmit}>
            Add Facility
          </button>
        </div>
        <div className="col-md-6">
            <img src={mapImage} className="w-100"/>
        </div>
      </div>
    </div>
  );
};

export default CreateFaciltyModal;
