import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../otherImages/MasterLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CustomerDetailDashboardData from "./CustomerDetailDashboardData";

const CustomerForms = () => {
  const { state } = useLocation();
  const customerData = state?.facility;
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
      <CustomerDetailDashboardData rows={10} />
    </MasterLayout>
  );
};

export default CustomerForms;
