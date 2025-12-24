import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import banner from "../otherImages/sigupbanner.png"
import Logo from "../otherImages/logo-icon.svg"


const SignUpLayer = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const btnOnClick = () => {
     navigate("/dashboard");
  };

  return (
    <section className="auth bg-base d-flex authSection">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img
            className="w-100"
            src={banner}
            alt=""
            style={{
              objectFit: "cover",
              objectPosition: "bottom",
              height: "950px",
            }}
          />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="text-center authImage">
          <Link to="/" className="mb-40 max-w-290-px">
            <img src={Logo} alt="" />
          </Link>
        </div>
        <div className="rightCol w-100">
          <div className="text-center">       
            <h4 className="mb-20 fw-bold fs-1 text-center">Register Now</h4>
          </div>
          <form action="#">
            <div className="nameBlock d-flex gap-20 w-100">
              <div className="firstName">
                <label className="authLabel fw-bold mb-10">First Name</label>
                <div className="icon-field mb-16">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="f7:person" />
                  </span>
                  <input
                    type="text"
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    placeholder="First Name"
                  />
                </div>
              </div>
              <div className="lastname">
                <label className="authLabel fw-bold mb-10">Last Name</label>
                <div className="icon-field mb-16">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="f7:person" />
                  </span>
                  <input
                    type="text"
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>
            <label className="authLabel fw-bold mb-10">Email Address</label>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
              />
            </div>
            <label className="authLabel fw-bold mb-10">Password</label>
            <div className="mb-20">
              <div className="position-relative ">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    id="your-password"
                    placeholder="Password"
                  />
                </div>
                <span
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ri-${
                  showPassword ? "eye-off-line" : "eye-line"
                }`}
                onClick={() => setShowPassword(!showPassword)}
              />
              </div>
            </div>
            <label className="authLabel fw-bold mb-10">Confirm Password</label>
            <div className="mb-20">
              <div className="position-relative ">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    id="confirm-password"
                    placeholder="Confirm Password"
                  />
                </div>
                <span
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ri-${
                  showConfirmPassword ? "eye-off-line" : "eye-line"
                }`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
              </div>
            </div>
            <div className="">
              <div className="d-flex justify-content-between gap-2">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300 mt-4"
                    type="checkbox"
                    defaultValue=""
                    id="condition"
                  />
                  <label
                    className="form-check-label text-md"
                    htmlFor="condition"
                  >
                    By creating an account on Suit Sync, you agree to the Terms
                    & Condition and Privacy Policy
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={btnOnClick}
              type="submit"
              className="btn bg-primary py-16 w-100 radius-12 mt-32"
            >
              {" "}
              Register
            </button>
            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Already have an account?{" "}
                <Link to="/" className="primaryColor fw-semibold">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpLayer;
