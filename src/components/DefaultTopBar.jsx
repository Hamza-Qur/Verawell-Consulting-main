import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const DefaultTopBar = ({ title, desc, btnText, btnLink,btnText2, btnLink2 }) => {
  return (
    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24'>
        <h2 className='fw-bold mb-0 fs-2'>{title}</h2>
      {btnLink || btnLink2?
      <div className="buttonDiv d-flex gap-20 align-items-center">
        {btnLink ? (
          <Link to={btnLink} className="firstHeadBtn d-flex gap-10">
            <Icon icon="akar-icons:plus" className=" mb-0" />
            {btnText}
          </Link>
        ) : (
          ""
        )}
        {btnLink2 ? (
          <Link to={btnLink2} className="secondHeadBtn d-flex gap-10">        
            {btnText2}
            <Icon icon="material-symbols:arrow-downward-alt-rounded" className=" mb-0" />
          </Link>
        ) : (
          ""
        )}
      </div>
      : <div></div>}
    </div>
  );
};

export default DefaultTopBar;