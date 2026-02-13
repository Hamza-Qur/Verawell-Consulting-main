import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import banner from "../otherImages/sigupbanner.png";
import Logo from "../otherImages/logo-icon.svg";
import { Formik, Form, Field } from "formik";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  requestPasswordReset,
  validateResetCode,
  resetPassword,
} from "../redux/slices/authSlice";
import { getUserProfile } from "../redux/slices/userSlice"; // ADD THIS IMPORT

const SignInLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const timerRef = useRef(null);

  // Toast function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Timer countdown
  useEffect(() => {
    if (resetStep === 2 && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setResetError("Code has expired. Please request a new one.");
    }

    return () => clearInterval(timerRef.current);
  }, [resetStep, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Format validation errors
  const formatValidationErrors = (errorData) => {
    if (!errorData) return "";

    if (typeof errorData === "string") return errorData;

    if (errorData.error && typeof errorData.error === "object") {
      return Object.entries(errorData.error)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(", ")}`;
          }
          return `${field}: ${messages}`;
        })
        .join("; ");
    }

    return JSON.stringify(errorData);
  };

  const handleLogin = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result.success) {
        const userRole = result.data.user.role;

        // FORCE REFRESH user profile to update persisted store
        await dispatch(getUserProfile(true)).unwrap();

        if (userRole === "admin") {
          navigate("/dashboard");
        } else if (userRole === "team") {
          navigate("/client-dashboard");
        } else if (userRole === "customer") {
          navigate("/customer-dashboard");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // Step 1: Request reset code
  const handleRequestReset = async (values) => {
    setResetLoading(true);
    setResetError("");
    try {
      const result = await dispatch(
        requestPasswordReset({ email: values.email }),
      ).unwrap();
      if (result.success) {
        setResetEmail(values.email);
        setResetStep(2);
        setTimeLeft(120);
      } else {
        if (result.data?.error) {
          setResetError(
            `Validation failed: ${formatValidationErrors(result.data)}`,
          );
        } else {
          setResetError(result.message || "Failed to send reset code");
        }
      }
    } catch (err) {
      if (err.data?.error) {
        setResetError(`Validation failed: ${formatValidationErrors(err.data)}`);
      } else {
        setResetError(err.message || "Something went wrong");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Validate code
  const handleValidateCode = async (values) => {
    setResetLoading(true);
    setResetError("");
    try {
      const result = await dispatch(
        validateResetCode({
          email: resetEmail,
          code: values.code,
        }),
      ).unwrap();
      if (result.success) {
        setResetCode(values.code);
        setResetStep(3);
        clearInterval(timerRef.current);
      } else {
        if (result.data?.error) {
          setResetError(
            `Validation failed: ${formatValidationErrors(result.data)}`,
          );
        } else {
          setResetError(result.message || "Invalid code");
        }
      }
    } catch (err) {
      if (err.data?.error) {
        setResetError(`Validation failed: ${formatValidationErrors(err.data)}`);
      } else {
        setResetError(err.message || "Code validation failed");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Reset password (with all 4 fields)
  const handleResetPassword = async (values) => {
    setResetLoading(true);
    setResetError("");
    try {
      const result = await dispatch(
        resetPassword({
          email: values.email,
          code: values.code,
          password: values.password,
          password_confirmation: values.password_confirmation,
        }),
      ).unwrap();

      if (result.success) {
        showToast(
          "Password reset successful! You can now login with your new password.",
          "success",
        );
        closeResetModal();
      } else {
        if (result.data?.error) {
          setResetError(
            `Validation failed: ${formatValidationErrors(result.data)}`,
          );
        } else {
          setResetError(result.message || "Failed to reset password");
        }
      }
    } catch (err) {
      if (err.data?.error) {
        setResetError(`Validation failed: ${formatValidationErrors(err.data)}`);
      } else {
        setResetError(err.message || "Password reset failed");
      }
      console.error("Password reset failed:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail("");
    setResetCode("");
    setResetError("");
    setTimeLeft(120);
    clearInterval(timerRef.current);
  };

  const resendCode = () => {
    if (resetEmail) {
      handleRequestReset({ email: resetEmail });
      setTimeLeft(120); // Reset timer
      showToast("New code sent to your email!", "success");
    }
  };

  return (
    <section className="auth bg-base d-flex authSection">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img
            className="h-100vh w-100"
            src={banner}
            alt=""
            style={{ objectFit: "cover", objectPosition: "bottom" }}
          />
        </div>
      </div>
      <div className="auth-right py-22 px-24 d-flex flex-column justify-content-center">
        <div className="text-center authImage">
          <Link to="/" className="mb-40 max-w-290-px">
            <img src={Logo} alt="" />
          </Link>
        </div>
        <div className="w-100 rightCol">
          <div className="text-center">
            <h4 className="mb-5 fw-bold fs-1 text-center">
              Login to Your Account
            </h4>
          </div>

          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={handleLogin}>
            <Form>
              <label className="authLabel fw-bold mb-10">Email Address</label>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <Field
                  type="email"
                  name="email"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>

              <div className="position-relative mb-20">
                <label className="authLabel fw-bold mb-10">Password</label>
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <span
                    className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ri-${
                      showPassword ? "eye-off-line" : "eye-line"
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between gap-2">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300"
                    type="checkbox"
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <Link
                  to="#"
                  className="primaryColor fw-medium"
                  onClick={() => setShowForgotPassword(true)}>
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn bg-primary py-16 w-100 radius-12 mt-32"
                disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </Form>
          </Formik>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✅" : "❌"}
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5>
                {resetStep === 1 && "Reset Password"}
                {resetStep === 2 && "Enter Reset Code"}
                {resetStep === 3 && "New Password"}
              </h5>
              <button onClick={closeResetModal}>×</button>
            </div>

            <div className="modal-body">
              {resetError && (
                <div className="alert alert-danger mb-3" role="alert">
                  {resetError}
                </div>
              )}

              {resetStep === 1 && (
                <>
                  <p>Enter your email to receive a reset code</p>
                  <Formik
                    initialValues={{ email: "" }}
                    onSubmit={handleRequestReset}>
                    <Form>
                      <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="form-control mb-3"
                        required
                      />
                      <button
                        type="submit"
                        className="btn bg-primary btn-primary w-100"
                        disabled={resetLoading}>
                        {resetLoading ? "Sending..." : "Send Reset Code"}
                      </button>
                    </Form>
                  </Formik>
                </>
              )}

              {resetStep === 2 && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="mb-0">
                      Enter the 6-digit code sent to{" "}
                      <strong>{resetEmail}</strong>
                    </p>
                    <div
                      className={`badge ${
                        timeLeft > 30
                          ? "bg-success"
                          : timeLeft > 10
                            ? "bg-warning"
                            : "bg-danger"
                      }`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <Formik
                    initialValues={{ code: "" }}
                    onSubmit={handleValidateCode}>
                    <Form>
                      <Field
                        type="text"
                        name="code"
                        placeholder="Enter 6-digit code"
                        className="form-control mb-3"
                        maxLength="6"
                        required
                      />
                      <button
                        type="submit"
                        className="btn bg-primary btn-primary w-100 mb-2"
                        disabled={resetLoading || timeLeft === 0}>
                        {resetLoading ? "Verifying..." : "Verify Code"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={resendCode}
                        disabled={resetLoading}>
                        Resend Code
                      </button>
                    </Form>
                  </Formik>
                </>
              )}

              {resetStep === 3 && (
                <>
                  <p>Create a new password</p>
                  <Formik
                    initialValues={{
                      email: resetEmail,
                      code: resetCode,
                      password: "",
                      password_confirmation: "",
                    }}
                    onSubmit={handleResetPassword}>
                    {({ values }) => (
                      <Form>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <Field
                            type="email"
                            name="email"
                            className="form-control"
                            required
                            readOnly
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Reset Code</label>
                          <Field
                            type="text"
                            name="code"
                            className="form-control"
                            maxLength="6"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">New Password *</label>
                          <Field
                            type="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            className="form-control"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Confirm New Password *
                          </label>
                          <Field
                            type="password"
                            name="password_confirmation"
                            placeholder="Confirm new password"
                            className="form-control"
                            required
                          />
                        </div>

                        {values.password &&
                          values.password_confirmation &&
                          values.password !== values.password_confirmation && (
                            <div className="alert alert-warning mb-3">
                              Passwords don't match
                            </div>
                          )}

                        {values.password && values.password.length < 8 && (
                          <div className="alert alert-danger mb-3">
                            Password must be at least 8 characters long
                          </div>
                        )}

                        <button
                          type="submit"
                          className="btn bg-primary btn-primary w-100"
                          disabled={resetLoading || values.password.length < 8}>
                          {resetLoading ? "Resetting..." : "Reset Password"}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignInLayer;
