import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePageOne from "./adminPages/HomePageOne";
import ErrorPage from "./adminPages/ErrorPage";
import SignInPage from "./adminPages/SignInPage";
import SignUpPage from "./adminPages/SignUpPage";
import AccessDeniedPage from "./adminPages/AccessDeniedPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import ManageDocuments from "./adminPages/ManageDocuments";
import ManageEmployees from "./adminPages/ManageEmployees";
import AddClientPage from "./adminPages/AddClientPage";
import AddPackagePage from "./adminPages/AddPackagePage";
import EditPackagePage from "./adminPages/EditPackagePage";
import EditClientPage from "./adminPages/EditClientPage";
import ManageFacilities from "./adminPages/ManageFacilities";
import CreateInvoicePage from "./adminPages/CreateInvoicePage";
import ManageAttendance from "./adminPages/ManageAttendance";
import ChatPage from "./adminPages/ChatPage";
import ClientPackagesPage from "./clientPages/ClientPackagesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPackagesPage from "./clientPages/MyPackagesPage";
import PaymentHistoryPage from "./clientPages/PaymentHistoryPage";
import EditProfilePage from "./clientPages/EditProfilePage";
import ClientDashboard from "./clientPages/ClientDashboard";
import FacilityDetailpage from "./clientPages/FacilityDetailpage";
import ClientDocuments from "./clientPages/ClientDocuments";
import FacilityForms from "./clientPages/FacilityForms";
import Timelogs from "./clientPages/Timelogs";
import CustomerDashboard from "./customerPages/CustomerDashboard";
import KitchenViewForm from "./clientPages/KitchenViewForm";
import KitchenFillForm from "./clientPages/KitchenFillForm";
import CustomerDocuments from "./customerPages/CustomerDocuments";
import CustomerDetailpage from "./customerPages/CustomerDetailpage";
import CustomerForms from "./customerPages/CustomerForms";
import AdminFacilityDetailPage from "./components/AdminFacilityDetailPage";
import TeamFacilityDetailPage from "./components/TeamFacilityDetailPage";
import SocketProvider from "./components/SocketProvider";

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <RouteScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Admin Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute element={HomePageOne} allowedRole="admin" />
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute element={ManageEmployees} allowedRole="admin" />
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute element={ManageDocuments} allowedRole="admin" />
              }
            />
            <Route
              path="/add-client"
              element={
                <ProtectedRoute element={AddClientPage} allowedRole="admin" />
              }
            />
            <Route
              path="/add-package"
              element={
                <ProtectedRoute element={AddPackagePage} allowedRole="admin" />
              }
            />
            <Route
              path="/edit-package"
              element={
                <ProtectedRoute element={EditPackagePage} allowedRole="admin" />
              }
            />
            <Route
              path="/edit-client"
              element={
                <ProtectedRoute element={EditClientPage} allowedRole="admin" />
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute
                  element={ManageFacilities}
                  allowedRole="admin"
                />
              }
            />
            <Route
              path="/create-invoice"
              element={
                <ProtectedRoute
                  element={CreateInvoicePage}
                  allowedRole="admin"
                />
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute
                  element={ManageAttendance}
                  allowedRole="admin"
                />
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute element={EditProfilePage} allowedRole="admin" />
              }
            />
            <Route
              path="/facilities/:facilityId"
              element={
                <ProtectedRoute
                  element={AdminFacilityDetailPage}
                  allowedRole="admin"
                />
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute
                  element={ChatPage}
                  allowedRole={["admin", "team", "customer"]}
                />
              }
            />

            {/* Client Protected Routes */}
            <Route
              path="/facility/:facilityId"
              element={
                <ProtectedRoute
                  element={TeamFacilityDetailPage}
                  allowedRole="team"
                />
              }
            />
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute element={ClientDashboard} allowedRole="team" />
              }
            />
            <Route
              path="/all-packages"
              element={
                <ProtectedRoute
                  element={ClientPackagesPage}
                  allowedRole="team"
                />
              }
            />
            <Route
              path="/my-packages"
              element={
                <ProtectedRoute element={MyPackagesPage} allowedRole="team" />
              }
            />
            <Route
              path="/payment-history"
              element={
                <ProtectedRoute
                  element={PaymentHistoryPage}
                  allowedRole="team"
                />
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute element={EditProfilePage} allowedRole="team" />
              }
            />
            <Route
              path="/facility-detail-page"
              element={
                <ProtectedRoute
                  element={FacilityDetailpage}
                  allowedRole="team"
                />
              }
            />
            <Route
              path="/view-form/:id"
              element={
                <ProtectedRoute
                  element={KitchenViewForm}
                  allowedRole={["team", "customer"]}
                />
              }
            />
            <Route
              path="/fill-form/:id"
              element={
                <ProtectedRoute
                  element={KitchenFillForm}
                  allowedRole={["team", "customer"]}
                />
              }
            />
            <Route
              path="/timelogs"
              element={<ProtectedRoute element={Timelogs} allowedRole="team" />}
            />
            <Route
              path="/client-documents"
              element={
                <ProtectedRoute element={ClientDocuments} allowedRole="team" />
              }
            />
            <Route
              path="/facility-forms"
              element={
                <ProtectedRoute element={FacilityForms} allowedRole="team" />
              }
            />

            {/* Customer Protected Routes */}
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute
                  element={CustomerDashboard}
                  allowedRole="customer"
                />
              }
            />
            <Route
              path="/customer-documents"
              element={
                <ProtectedRoute
                  element={CustomerDocuments}
                  allowedRole="customer"
                />
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute
                  element={EditProfilePage}
                  allowedRole="customer"
                />
              }
            />
            <Route
              path="/customer-detail-page"
              element={
                <ProtectedRoute
                  element={CustomerDetailpage}
                  allowedRole="customer"
                />
              }
            />
            <Route
              path="/customer-forms"
              element={
                <ProtectedRoute
                  element={CustomerForms}
                  allowedRole="customer"
                />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  );
}

export default App;
