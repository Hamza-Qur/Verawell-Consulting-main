import React, { useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import profilePic from "../otherImages/UserPic.png";
import EmailAvatar from "../otherImages/EmailAvator.png";
import { Icon } from "@iconify/react/dist/iconify.js";


const EditProfilePage = () => {

   const [selectedImage, setSelectedImage] = useState(null);

    const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Set the selected image as the new profile picture
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <MasterLayout>
      <div className="card p-5 editProfile">
        {/* Top User Profile Info */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div className="d-flex align-items-center gap-3 position-relative">
            <img
              src={selectedImage || profilePic}
              alt="Profile"
              style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit:"cover", }}
            />
            <label htmlFor="profilePicInput" className="edit-icon">
              <Icon
                icon="akar-icons:edit"
                width="24"
                height="24"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  backgroundColor: "#8B2885", // Purple background
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "5px",
                  cursor: "pointer",
                  height:"30px",
                  width:"30px",
                }}
              />
            </label>
            <input
              id="profilePicInput"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageUpload} // Handle image change
              accept="image/*"
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="row gy-3 mt-4 align-items-center">
           <div className="col-md-6">
          <h6 className="fw-bold mb-3 fs-3">Account Details</h6>
          </div>
           <div className="col-md-6 d-flex justify-content-end">
          <button
            type="button"
            className="btn saveBtn"
            style={{
              background: "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
              color: "#fff",
              padding: "12px 20px !important",
              borderRadius: "10px",
              fontWeight: "bold",
              width:"175px",
            }}
          >
            Save
          </button>
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control p-3"
              placeholder="First Name"
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control p-3"
              placeholder="Last Name"
            />
          </div>
          <div className="col-md-6">
            <input
              type="email"
              className="form-control p-3"
              placeholder="Email Address"
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control p-3"
              placeholder="Phone"
            />
          </div>
        </div>

        {/* Change Password */}
        <div className="mt-5">
          <div className="row gy-3">
            <div className="col-md-6">
            <h6 className="fw-bold mb-3 fs-3">Change Password</h6>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
            <button
              type="button"
              className="btn saveBtn"
              style={{
                background: "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
                color: "#fff",
                padding: "12px 20px !important",
                borderRadius: "10px",
                fontWeight: "bold",
                width:"175px",
              }}
            >
              Save
            </button>
            </div>
            <div className="col-md-6">
              <input
                type="password"
                className="form-control p-3"
                placeholder="Current Password"
              />
            </div>
            <div className="col-md-6">
              <input
                type="password"
                className="form-control p-3"
                placeholder="New Password"
              />
            </div>
            <div className="col-md-12">
              <input
                type="password"
                className="form-control p-3"
                placeholder="Confirm New Password"
              />
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default EditProfilePage;
