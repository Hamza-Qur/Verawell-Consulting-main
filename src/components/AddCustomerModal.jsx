import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../redux/slices/authSlice";

const AddCustomerModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Add success state

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const customerData = {
        name: fullName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        phone_number: phone || "1234567890",
        role: "customer",
      };

      const result = await dispatch(register(customerData)).unwrap();

      if (result.success) {
        setSuccess(true);
        // Clear form after successful submission
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");

        // Auto-close after 2 seconds
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.message || "Failed to add customer");
      }
    } catch (err) {
      if (err.errors) {
        const errorMsg = Object.values(err.errors).flat().join(", ");
        setError(errorMsg);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
      console.error("Add customer error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  return (
    <div className="announcementModal">
      <div className="row">
        <div className="col-md-12 mt-10 position-relative">
          {error && !success && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          {!success ? (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control mb-10"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  className="form-control mb-10"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-control mb-10"
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => {
                    const numbersOnly = e.target.value.replace(/\D/g, "");
                    setPhone(numbersOnly);
                  }}
                  disabled={isLoading}
                />
                <small className="text-muted">Enter numbers only</small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  className="form-control mb-10"
                  placeholder="Set password for customer"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control mb-10"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="d-flex gap-10 mt-20">
                <button
                  className="btn announceButton flex-grow-1"
                  onClick={handleSubmit}
                  disabled={isLoading}>
                  {isLoading ? "Adding Customer..." : "Add Customer"}
                </button>

                <button
                  className="btn btn-secondary flex-grow-1"
                  onClick={handleReset}
                  disabled={isLoading}>
                  Clear
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-3">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                    fill="#28a745"
                  />
                </svg>
              </div>
              <h5 className="text-success">Customer Added Successfully!</h5>
              <p className="text-muted">
                The customer can now log in with their credentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;