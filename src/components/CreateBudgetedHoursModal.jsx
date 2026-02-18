// CreateBudgetedHoursModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFacility } from "../redux/slices/facilitySlice";
import { getMyFacilities } from "../redux/slices/facilitySlice";

const CreateBudgetedHoursModal = ({ onClose, facilityData }) => {
  const dispatch = useDispatch();

  // Get the entire state first
  const fullState = useSelector((state) => state);
  const facilityState = fullState.facility || {};

  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
    isUpdating = false,
    updateError = null,
    successMessage = "",
  } = facilityState;

  const [facilityId, setFacilityId] = useState("");
  const [budgetedHours, setBudgetedHours] = useState("");
  const [budgetedHoursType, setBudgetedHoursType] = useState("Weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Predefined options for budgeted hours type
  const budgetedHoursOptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];

  // Fetch facilities on component mount
  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

  // If facilityData is provided, pre-fill the form
  useEffect(() => {
    if (facilityData) {
      setFacilityId(facilityData.id || facilityData.facility_id || "");
      setBudgetedHours(facilityData.budgeted_hours || "");
      setBudgetedHoursType(facilityData.budgeted_hours_type || "Weekly");
    }
  }, [facilityData]);

  // Handle success message from Redux
  useEffect(() => {
    if (successMessage) {
      setSuccess(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    }
  }, [successMessage, onClose]);

  // Handle error from Redux
  useEffect(() => {
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
    }
  }, [updateError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!facilityId) {
      setError("Please select a facility");
      return;
    }

    if (!budgetedHours) {
      setError("Budgeted hours are required");
      return;
    }

    if (isNaN(budgetedHours) || Number(budgetedHours) <= 0) {
      setError("Budgeted hours must be a positive number");
      return;
    }

    if (!budgetedHoursType.trim()) {
      setError("Budgeted hours type is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const updateData = {
        budgeted_hours: Number(budgetedHours),
        budgeted_hours_type: budgetedHoursType,
      };

      await dispatch(
        updateFacility({
          facilityId: facilityId,
          facilityData: updateData,
        }),
      ).unwrap();

      // Success will be handled by the useEffect watching successMessage
    } catch (err) {
      if (err.errors) {
        const errorMsg = Object.values(err.errors).flat().join(", ");
        setError(errorMsg);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
      console.error("Update budgeted hours error:", err);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBudgetedHours("");
    setBudgetedHoursType("Weekly");
    setError("");
  };

  // If facility slice is missing, show a warning
  if (!fullState.facility) {
    return (
      <div className="announcementModal">
        <div style={{ padding: "20px", textAlign: "center", color: "#D32F2F" }}>
          <h4>Missing Redux Slice</h4>
          <p>Please add facilityReducer to your store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcementModal">
      <div className="row">
        <div className="col-md-12 mt-10 position-relative">
          {error && !success && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit}>
              <div className="modal-scrollable-content">
                {/* Facility Selection */}
                <div className="form-group mb-20">
                  <label htmlFor="facilitySelect" className="fw-bold mb-2">
                    Facility *
                  </label>
                  <select
                    id="facilitySelect"
                    className="form-control"
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    disabled={
                      isLoading ||
                      isUpdating ||
                      isLoadingFacilities ||
                      facilityData
                    }
                    required>
                    <option value="">Select Facility</option>
                    {isLoadingFacilities ? (
                      <option disabled>Loading facilities...</option>
                    ) : myFacilities &&
                      myFacilities.data &&
                      myFacilities.data.length > 0 ? (
                      myFacilities.data.map((facility) => (
                        <option
                          key={facility.id || facility.facility_id}
                          value={facility.id || facility.facility_id}>
                          {facility.facility_name || facility.name}
                          {facility.facility_address
                            ? ` - ${facility.facility_address}`
                            : ""}
                        </option>
                      ))
                    ) : (
                      <option disabled>No facilities found</option>
                    )}
                  </select>
                  {facilityData && (
                    <small className="text-muted d-block mt-1">
                      Facility is pre-selected based on your selection
                    </small>
                  )}
                </div>

                {/* Budgeted Hours Input */}
                <div className="form-group mb-20">
                  <label htmlFor="budgetedHours" className="fw-bold mb-2">
                    Budgeted Hours *
                  </label>
                  <input
                    type="number"
                    id="budgetedHours"
                    className="form-control"
                    placeholder="Enter budgeted hours"
                    value={budgetedHours}
                    onChange={(e) => setBudgetedHours(e.target.value)}
                    disabled={isLoading || isUpdating}
                    min="0"
                    step="0.5"
                    required
                  />
                  <small className="text-muted d-block mt-1">
                    Enter the number of budgeted hours (e.g., 40, 37.5, 20)
                  </small>
                </div>

                {/* Budgeted Hours Type - Changed to Input with Datalist */}
                <div className="form-group mb-20">
                  <label htmlFor="budgetedHoursType" className="fw-bold mb-2">
                    Budgeted Hours Type *
                  </label>
                  <input
                    type="text"
                    id="budgetedHoursType"
                    className="form-control"
                    list="budgetedHoursOptions"
                    placeholder="Type or select an option"
                    value={budgetedHoursType}
                    onChange={(e) => setBudgetedHoursType(e.target.value)}
                    disabled={isLoading || isUpdating}
                    required
                  />
                  <datalist id="budgetedHoursOptions">
                    {budgetedHoursOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <small className="text-muted d-block mt-1">
                    Type a custom value or select from: Weekly, Monthly,
                    Quarterly, Yearly
                  </small>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-10 mt-20 sticky-actions">
                  <button
                    type="submit"
                    className="btn announceButton flex-grow-1"
                    disabled={isLoading || isUpdating || !facilityId}>
                    {isLoading || isUpdating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Budgeted Hours"
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary flex-grow-1"
                    onClick={handleReset}
                    disabled={isLoading || isUpdating}>
                    Clear
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mb-3">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                    fill="#28a745"
                  />
                </svg>
              </div>
              <h5 className="text-success">
                Budgeted Hours Updated Successfully!
              </h5>
              <p className="text-muted">
                The facility budgeted hours have been updated.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetedHoursModal;
