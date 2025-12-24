import React, { useState } from "react";

const CreateEmployeeModal = () => {
  const [fullName, setfullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loginID, setLoginID] = useState("");

  const handleSubmit = () => {
    alert("employee added!");
  };

  return (
    <div className="announcementModal">
      <div className="row">
        <div className="addPhotoBox mt-20">
            <button className="add-employee">┿</button>
            <h6>Add Photo</h6>
        </div>
        <div className="col-md-12 mt-10 position-relative">
          <div className="form-group">
            <label htmlFor="employeeName">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-control mb-10"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setfullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Email Address">Email Address</label>
            <input
              type="email"
              id="emailAddress"
              className="form-control mb-10"
              placeholder="Enter email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="Phone">Phone Number</label>
            <input
              type="number"
              id="phone"
              className="form-control mb-10"
              placeholder="000-000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="LoginID">Login ID </label>
            <input
              type="text"
              id="loginID"
              className="form-control mb-10"
              placeholder="Create Login ID"
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
            />
          </div>


          <button className="btn announceButton w-100 mt-20" onClick={handleSubmit}>
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
