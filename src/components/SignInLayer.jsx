import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import banner from "../otherImages/sigupbanner.png";
import Logo from "../otherImages/logo-icon.svg";
import { Formik, Form, Field } from "formik";

const SignInLayer = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const btnOnClick = () => {
    navigate("/dashboard");
  };

  const handleLogin = (values) => {
    const { email, password } = values;

    // Dummy logic: check role based on email (replace with real API in future)
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("role", "admin");
      navigate("/dashboard");
    } else if (email === "team@gmail.com" && password === "team123") {
      localStorage.setItem("role", "team");
      navigate("/client-dashboard");
    } else if (email === "cus@gmail.com" && password === "cus123") {
      localStorage.setItem("role", "customer");
      navigate("/customer-dashboard");
    } else {
      alert("Invalid email or password");
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
        <div className="w-100 rightCol  ">
          <div className="text-center">
            <h4 className="mb-5 fw-bold fs-1 text-center">
              Login to Your Account
            </h4>
          </div>

          {/* Formik Form Starts */}
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
                  // required
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
                    // required
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
                <Link to="#" className="primaryColor fw-medium">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn bg-primary py-16 w-100 radius-12 mt-32">
                Log In
              </button>

              {/* <div className='mt-32 center-border-horizontal text-center'>
                <span className='bg-base z-1 px-4 fw-bold'>Or Continue With</span>
              </div>

              <div className='mt-32 d-flex align-items-center gap-3 justify-content-center'>
                <button
                  type='button'
                  className='fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50'
                >
                  <Icon icon='logos:google-icon' className='text-primary-600 text-xl line-height-1' />
                  Google
                </button>
              </div> */}

              <div className="mt-32 text-center text-sm">
                <p className="mb-0">
                  Don’t have an account?{" "}
                  <Link to="/signup" className="primaryColor fw-semibold">
                    Register Now
                  </Link>
                </p>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
