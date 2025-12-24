import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../otherImages/MasterLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FacilityDetailDashboardData from "../components/FacilityDetailDashboardData";
import UnitCountFacility from "../components/UnitCountFacility";

const FacilityDetailpage = () => {
  const { state } = useLocation();
  const facilityData = state?.facility;
  const navigate = useNavigate();

  return (
    <MasterLayout>
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          onClick={() => navigate(-1)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#8B2885",
          }}>
          <Icon
            icon="mdi:arrow-left-bold-circle"
            width="38"
            height="38"
            color="#8B2885"
          />
        </span>

        {facilityData?.facility}
      </h2>

      <UnitCountFacility />
      <h2>Recent Forms</h2>
      <FacilityDetailDashboardData />
    </MasterLayout>
  );
};

export default FacilityDetailpage;
