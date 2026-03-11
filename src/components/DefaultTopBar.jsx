// src/components/DefaultTopBar.jsx
import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const DefaultTopBar = ({
  title,
  desc,
  btnText,
  btnLink,
  // New props for first button API functionality
  isApiButton = false,
  onBtnClick,
  isBtnLoading = false,
  btnLoadingText = "Loading...",
  // Second button props (existing)
  btnText2,
  btnLink2,
  isApiButton2 = false,
  onBtn2Click,
  isBtn2Loading = false,
  btn2LoadingText = "Loading...",
}) => {
  // Handle first button click
  const handleBtnClick = (e) => {
    if (isApiButton && onBtnClick) {
      e.preventDefault();
      onBtnClick();
    }
    // If it's a regular link, let the Link component handle it normally
  };

  // Handle second button click
  const handleBtn2Click = (e) => {
    if (isApiButton2 && onBtn2Click) {
      e.preventDefault();
      onBtn2Click();
    }
  };

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
      <h2 className="fw-bold mb-0 fs-2">{title}</h2>
      {btnText || btnText2 ? (
        <div className="buttonDiv d-flex gap-20 align-items-center">
          {/* First Button - Now supports both Link and API */}
          {btnText ? (
            isApiButton ? (
              // API Button (button element)
              <button
                onClick={handleBtnClick}
                disabled={isBtnLoading}
                className="firstHeadBtn d-flex align-items-center gap-10">
                {isBtnLoading ? (
                  <>
                    <Icon
                      icon="mdi:loading"
                      className="mb-0"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    {btnLoadingText}
                  </>
                ) : (
                  <>
                    <Icon icon="akar-icons:plus" className="mb-0" />
                    {btnText}
                  </>
                )}
              </button>
            ) : (
              // Regular Link (for navigation)
              <Link to={btnLink} className="firstHeadBtn d-flex gap-10">
                <Icon icon="akar-icons:plus" className="mb-0" />
                {btnText}
              </Link>
            )
          ) : (
            ""
          )}

          {/* Second Button - Already supports both */}
          {btnText2 ? (
            isApiButton2 ? (
              // API Button (button element)
              <button
                onClick={handleBtn2Click}
                disabled={isBtn2Loading}
                className="secondHeadBtn d-flex gap-10">
                {isBtn2Loading ? (
                  <>
                    <Icon
                      icon="mdi:loading"
                      className="mb-0"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    {btn2LoadingText}
                  </>
                ) : (
                  <>
                    {btnText2}
                    <Icon
                      icon="material-symbols:arrow-downward-alt-rounded"
                      className="mb-0"
                    />
                  </>
                )}
              </button>
            ) : (
              // Regular Link (for navigation)
              <Link to={btnLink2} className="secondHeadBtn d-flex gap-10">
                {btnText2}
                <Icon
                  icon="material-symbols:arrow-downward-alt-rounded"
                  className="mb-0"
                />
              </Link>
            )
          ) : (
            ""
          )}
        </div>
      ) : (
        <div></div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DefaultTopBar;
