import React, { useState } from "react";

const AssignFacilityModal = () => {
 const [employeeName, setEmployeeName] = useState('');
  const [formType, setFormType] = useState('');
  const [facility, setFacility] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskDescription, setTaskDescription] = useState('');


  const handleSubmit = () => {
    alert("Facility Assigned!");
  };

  return (
    <div className="announcementModal assignedFacilityModal">
      <div className="row mt-10 position-relative">
        <div className="col-md-6 ">
            <div className="form-group">
                <label htmlFor="employeeName">Employee Name / ID</label>
                <input
                type="text"
                id="employeeName"
                placeholder="Enter Name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                />
            </div>

            <div className="form-group">
            <label htmlFor="formType">Form</label>
            <select
                id="formType"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                >
                <option value="">Select Form</option>
                <option value="form1">Form 1</option>
                <option value="form2">Form 2</option>
            </select>
            </div>
        </div>
        <div className="col-md-6 ">
      <div className="form-group">
        <label htmlFor="facility">Facility</label>
        <select
          id="facility"
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
        >
          <option value="">Select Facility</option>
          <option value="facility1">Facility 1</option>
          <option value="facility2">Facility 2</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="shiftType">Shift Type</label>
        <select
          id="shiftType"
          value={shiftType}
          onChange={(e) => setShiftType(e.target.value)}
        >
          <option value="">Select</option>
          <option value="day">Day</option>
          <option value="night">Night</option>
        </select>
      </div>
      </div>
        <div className="col-md-12">
      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          type="text"
          id="phone"
          placeholder="000-000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      </div>
        <div className="col-md-6">
      <div className="form-group date-group">
        <label htmlFor="startDate">Start Date & Time</label>
        <div className="date-time d-flex gap-10 ">
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="time"
            id="startTime"
            value={startTime}   
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>
      </div>
     
<div className="col-md-6">
      <div className="form-group date-group">
        <label htmlFor="endDate">End Date & Time</label>
        <div className="date-time d-flex gap-10 ">
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
       </div>
       
        <div className="col-md-12">

      <div className="form-group">
        <label htmlFor="taskDescription">Task Description</label>
        <textarea
          id="taskDescription"
          placeholder="Write Here"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        ></textarea>
      </div>
      </div>

        <div className="col-md-12 d-flex justify-content-end">
          <button className="btn announceButton mt-20 w-100" onClick={handleSubmit}>
            Assign Facility
          </button>
          </div>
        </div>
        </div>
  );
};

export default AssignFacilityModal;
