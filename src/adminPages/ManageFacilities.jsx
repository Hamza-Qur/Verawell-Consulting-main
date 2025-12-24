import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import FacilityDataTable from "../components/FacilityDataTable";

const ManageFacilities = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Facility Management"
            // btnText="Add Facility"
            // btnLink="#" 
            btnText2="Download CSV"
            btnLink2="#" 
        />

        {/* TableDataLayer */}
        <FacilityDataTable />

      </MasterLayout>

    </>
  );
};

export default ManageFacilities; 
