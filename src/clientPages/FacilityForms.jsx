import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../otherImages/MasterLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FacilityDetailDashboardData from "../components/FacilityDetailDashboardData";
import UnitCountFacility from "../components/UnitCountFacility";
import FacilityDataTable from "../components/FacilityDataTable";

const FacilityForms = () => {
  const { state } = useLocation();
  const facilityData = state?.facility;
  const navigate = useNavigate();

  return (
    <MasterLayout>
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "30px",
        }}>
        <span
          onClick={() => navigate(-1)}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            color: "#8B2885",
          }}>
          <Icon
            icon="mdi:arrow-left-bold-circle"
            width="34"
            height="34"
            color="#8B2885"
          />
        </span>
        Forms
      </h2>
      <FacilityDetailDashboardData />
    </MasterLayout>
  );
};

export default FacilityForms;
