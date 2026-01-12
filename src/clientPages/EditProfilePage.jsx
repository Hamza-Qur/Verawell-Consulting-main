import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  clearUserErrors,
} from "../redux/slices/userSlice";
import MasterLayout from "../otherImages/MasterLayout";
import profilePic from "../otherImages/UserPic.png";
import { Icon } from "@iconify/react/dist/iconify.js";

const EditProfilePage = () => {
  const dispatch = useDispatch();
  const {
    profile,
    isLoading,
    isLoadingPassword,
    error,
    passwordError,
    successMessage,
  } = useSelector((state) => state.user);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(true);

  const currentPasswordRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Function to get appropriate icon based on toast type
  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage && successMessage.includes("updated")) {
      // Force refresh profile data
      dispatch(getUserProfile(true)); // Pass true to force refresh
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (profile) {
      const userData = profile.data || profile;
      const fullName = userData.name?.split(" ") || ["", ""];

      setProfileForm({
        firstName: fullName[0] || "",
        lastName: fullName.slice(1).join(" ") || "",
        email: userData.email || "",
        phone: userData.phone_number || "",
      });

      if (userData.profile_picture) {
        setSelectedImage(userData.profile_picture);
      }
      setImageLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      if (
        successMessage.includes("password") ||
        successMessage.includes("Password")
      ) {
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
      dispatch(clearUserErrors());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
    if (passwordError) {
      showToast(passwordError, "error");
    }
  }, [error, passwordError]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        showToast("Please select a valid image file (JPG, PNG, etc.)", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setImageFile(file);
        uploadProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = (file) => {
    showToast("Uploading profile picture...", "info");

    const profileData = {
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      email: profileForm.email,
      phone_number: profileForm.phone,
      profile_picture: file,
    };

    dispatch(updateUserProfile(profileData));
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!profileForm.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!profileForm.email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(profileForm.email))
      newErrors.email = "Email is invalid";
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.current_password)
      newErrors.current_password = "Current password is required";
    if (!passwordForm.new_password)
      newErrors.new_password = "New password is required";
    if (passwordForm.new_password.length < 8)
      newErrors.new_password = "Password must be at least 8 characters";
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSaveProfile = () => {
    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      showToast(firstError, "error");
      return;
    }

    setErrors({});

    const profileData = {
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      email: profileForm.email,
      phone_number: profileForm.phone,
    };

    if (imageFile) {
      profileData.profile_picture = imageFile;
    }

    dispatch(updateUserProfile(profileData));
  };

  const handleChangePassword = () => {
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      showToast(firstError, "error");
      return;
    }

    setErrors({});

    dispatch(
      changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
    );
  };

  return (
    <MasterLayout>
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {getToastIcon(toast.type)}{" "}
              {/* Fixed: Using getToastIcon function */}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="card p-5 editProfile">
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div className="d-flex align-items-center gap-3 position-relative">
            {imageLoading ? (
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <img
                src={selectedImage || profilePic}
                alt="Profile"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = profilePic;
                }}
              />
            )}
            <label htmlFor="profilePicInput" className="edit-icon">
              <Icon
                icon="akar-icons:edit"
                width="24"
                height="24"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  backgroundColor: "#8B2885",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "5px",
                  cursor: "pointer",
                  height: "30px",
                  width: "30px",
                }}
              />
            </label>
            <input
              id="profilePicInput"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>
        </div>

        <div className="row gy-3 mt-4 align-items-center">
          <div className="col-md-6">
            <h6 className="fw-bold mb-3 fs-3">Account Details</h6>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <button
              type="button"
              className="btn saveBtn"
              onClick={handleSaveProfile}
              disabled={isLoading}
              style={{
                background:
                  "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
                color: "#fff",
                padding: "12px 20px !important",
                borderRadius: "10px",
                fontWeight: "bold",
                width: "175px",
              }}>
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className={`form-control p-3 ${
                errors.firstName ? "is-invalid" : ""
              }`}
              placeholder="First Name"
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, firstName: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.firstName && (
              <div className="invalid-feedback d-block">{errors.firstName}</div>
            )}
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className="form-control p-3"
              placeholder="Last Name"
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, lastName: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="col-md-6">
            <input
              type="email"
              className={`form-control p-3 ${errors.email ? "is-invalid" : ""}`}
              placeholder="Email Address"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className="form-control p-3"
              placeholder="Phone"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phone: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="row gy-3">
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 fs-3">Change Password</h6>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <button
                type="button"
                className="btn saveBtn"
                onClick={handleChangePassword}
                disabled={isLoadingPassword}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(216, 81, 80, 1) 0%, rgba(87, 36, 103, 1) 100%)",
                  color: "#fff",
                  padding: "12px 20px !important",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  width: "175px",
                }}>
                {isLoadingPassword ? "Changing..." : "Save"}
              </button>
            </div>

            <div className="col-md-6">
              <input
                ref={currentPasswordRef}
                type="password"
                className={`form-control p-3 ${
                  errors.current_password ? "is-invalid" : ""
                }`}
                placeholder="Current Password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                disabled={isLoadingPassword}
                autoComplete="new-password"
                key="current-password-field"
              />
              {errors.current_password && (
                <div className="invalid-feedback d-block">
                  {errors.current_password}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <input
                type="password"
                className={`form-control p-3 ${
                  errors.new_password ? "is-invalid" : ""
                }`}
                placeholder="New Password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                disabled={isLoadingPassword}
                autoComplete="new-password"
              />
              {errors.new_password && (
                <div className="invalid-feedback d-block">
                  {errors.new_password}
                </div>
              )}
            </div>

            <div className="col-md-12">
              <input
                type="password"
                className={`form-control p-3 ${
                  errors.confirm_password ? "is-invalid" : ""
                }`}
                placeholder="Confirm New Password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                disabled={isLoadingPassword}
                autoComplete="new-password"
              />
              {errors.confirm_password && (
                <div className="invalid-feedback d-block">
                  {errors.confirm_password}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default EditProfilePage;
