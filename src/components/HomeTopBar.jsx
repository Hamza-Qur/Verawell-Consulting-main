import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
const HomeTopBar = ({ title , desc,btnText, btnLink,btnText2, btnLink2, btnOnClick }) => {
  return (
    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24'>
      <div>
        <h2 className='fw-semibold mb-10 fs-1 primaryColor'>{title ? title : "Welcome Back, John Doe!"}</h2>
        <p>{desc ? desc : "Your recruitment metrics and activities at a glance"}</p>
      </div>    
      <div className="buttonDiv d-flex gap-10">
        {btnLink ? (
                  <Link to={btnLink} className="btn bg-primary text-white d-flex gap-10">
                    <Icon icon="akar-icons:plus" className="text-white fs-4 mb-0" />
                    {btnText}
                  </Link>
                ) : (
                  <button></button>
                )}
                {btnLink2 ? (
                  <Link to={btnLink2} className="btn bg-secondary d-flex gap-10">
                    <Icon icon="akar-icons:plus" className="fs-4 mb-0" />
                    {btnText2}
                  </Link>
                ) : (
                  <button ></button>
                )}
      </div>
    </div>
  );
};

export default HomeTopBar;
