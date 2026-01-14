import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import webLogo from "../otherImages/logo-icon.svg";
import webSideLogo from "../otherImages/logo.svg";
import profilePic from "../otherImages/profilePic.png";
import DynamicModal from "../components/DynamicModal";
import CreateNewModal from "../components/CreateNewModal";
import NotificationTab from "../components/NotificationTab";
import NotificationDropdown from "../components/NotificatioDropdown";
import { getUserProfile } from "../redux/slices/userSlice";

const MasterLayout = ({ children, Chain }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { profile, isLoadingProfile } = useSelector((state) => state.user);
  const role = localStorage.getItem("role");
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  // useEffect(() => {
  //   const openActiveDropdown = () => {
  //     const allDropdowns = document.querySelectorAll(".navbar-header .dropdown");
  //     allDropdowns.forEach((dropdown) => {
  //       const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
  //       submenuLinks.forEach((link) => {
  //         if (
  //           link.getAttribute("href") === location.pathname ||
  //           link.getAttribute("to") === location.pathname
  //         ) {
  //           dropdown.classList.add("open");
  //           const submenu = dropdown.querySelector(".sidebar-submenu");
  //           if (submenu) {
  //             submenu.style.maxHeight = `${submenu.scrollHeight}px`;
  //           }
  //         }
  //       });
  //     });
  //   };

  //   openActiveDropdown();
  // }, [location.pathname]);

  // Handle dropdown toggle on button click

  const sidebarControl = () => setSidebarActive(!sidebarActive);
  const mobileMenuControl = () => setMobileMenu(!mobileMenu);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    // Only fetch if profile doesn't exist in state AND localStorage
    const cachedProfile = localStorage.getItem("userProfile");

    if (!profile && !cachedProfile && !isLoadingProfile) {
      dispatch(getUserProfile());
    }
  }, [dispatch, profile, isLoadingProfile]);

  useEffect(() => {
    // This will run whenever Redux user state changes
    const cachedProfile = localStorage.getItem("userProfile");
    if (cachedProfile) {
      const parsedProfile = JSON.parse(cachedProfile);
      // You can set a local state here if needed
      console.log("Profile updated:", parsedProfile);
    }
  }, [profile]);

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }>
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn">
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/" className="sidebar-logo">
            <img src={webLogo} alt="site logo" className="light-logo" />
            <img src={webLogo} alt="site logo" className="dark-logo" />
            <img
              src={webSideLogo}
              alt="site logo"
              className="logo-icon"
              style={{ width: "55px" }}
            />
          </Link>
        </div>
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">
            {role === "admin" && (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="svg-spinners:blocks-wave"
                      width="24"
                      height="24"
                    />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/employees"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="mdi:account-group"
                      className="menu-icon"
                      width="25"
                      height="25"
                    />
                    <span>Employees | Customers</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/documents"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="akar-icons:clipboard"
                      className="menu-icon"
                      width="28"
                      height="28"
                    />
                    <span>Documents</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink
                    to="/facilities"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="tabler:building-store"
                      className="menu-icon"
                      width="28"
                      height="28"
                    />
                    <span>Facilities</span>
                  </NavLink>
                </li> */}
                <li>
                  <NavLink
                    to="/facilities"
                    className={(navData) => {
                      // Match both exact /facilities AND /facilities/*
                      const isExactFacilities = navData.isActive;
                      const isFacilityDetail =
                        location.pathname.startsWith("/facilities/");
                      return isExactFacilities || isFacilityDetail
                        ? "active-page"
                        : "";
                    }}>
                    <Icon
                      icon="tabler:building-store"
                      className="menu-icon"
                      width="28"
                      height="28"
                    />
                    <span>Facilities</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/attendance"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="solar:calendar-bold"
                      className="menu-icon"
                      width="23"
                      height="23"
                      style={{ marginRight: "10px" }}
                    />
                    <span>Attendance</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/settings"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="material-symbols:settings-rounded"
                      className="menu-icon"
                      width="23"
                      height="23"
                      style={{ marginRight: "10px" }}
                    />
                    <span>Settings</span>
                  </NavLink>
                </li>
              </>
            )}

            {role === "team" && (
              <>
                <li>
                  <NavLink
                    to="/client-dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="svg-spinners:blocks-wave"
                      width="24"
                      height="24"
                    />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/timelogs"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon icon="svg-spinners:clock" width="23" height="24" />
                    <span>Timelogs</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/client-documents"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon icon="line-md:file-document" width="24" height="24" />
                    <span>Documents</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/facility-forms"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:text-box-multiple"
                      width="24"
                      height="24"
                    />
                    <span>Forms</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/chat"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:chat-round-dots"
                      width="24"
                      height="24"
                    />
                    <span>Messages</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink
                    to="/payment-history"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }>
                    <Icon
                      icon="fluent:payment-20-regular"
                      className="menu-icon"
                      width="24"
                      height="24"
                    />
                    <span>Payment History</span>
                  </NavLink>
                </li> */}
                <li>
                  <NavLink
                    to="/edit-profile"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:cog-filled-loop"
                      width="24"
                      height="24"
                    />
                    <span>Settings</span>
                  </NavLink>
                </li>
              </>
            )}
            {role === "customer" && (
              <>
                <li>
                  <NavLink
                    to="/customer-dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="svg-spinners:blocks-wave"
                      width="24"
                      height="24"
                    />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/customer-forms"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:text-box-multiple"
                      width="24"
                      height="24"
                    />
                    <span>Forms</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/customer-documents"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon icon="line-md:file-document" width="24" height="24" />
                    <span>Documents</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/chat"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:chat-round-dots"
                      width="24"
                      height="24"
                    />
                    <span>Messages</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile-settings"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Icon
                      icon="line-md:cog-filled-loop"
                      width="24"
                      height="24"
                    />
                    <span>Settings</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              {/* <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
              </div> */}
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {role === "admin" && (
                  <div className="announcementButton">
                    <Link
                      onClick={handleShowCreateModal}
                      className="firstHeadBtn d-flex gap-10">
                      <Icon icon="akar-icons:plus" className=" mb-0" />
                      Create New
                    </Link>
                  </div>
                )}
                <DynamicModal
                  show={showCreateModal}
                  handleClose={handleCloseCreateModal}
                  title="Create New"
                  content={<CreateNewModal />}
                  modalWidth="30%"
                />
                <div className="notifyButton p-10 rounded-10">
                  <Link to="/chat">
                    <Icon
                      icon="ion:chatbubbles-outline"
                      width="24"
                      height="24"
                    />
                  </Link>
                </div>
                {/* <div className='dropdown' ref={dropdownRef}>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    onClick={toggleDropdown}
                    data-bs-toggle='dropdown'
                    ref={buttonRef}
                  >
                    <div className="notifyButton p-10 rounded-10">
                      <Icon icon="material-symbols:notifications-outline" width="24" height="24" />
                    </div>
                  </button>
                  {isDropdownOpen && (
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                   <NotificationTab/>
                  </div>
                  )}
                </div> */}
                <NotificationDropdown />
                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown">
                    {isLoadingProfile ? (
                      <div className="w-40-px h-40-px rounded-circle bg-gray-200 d-flex align-items-center justify-content-center">
                        <Icon
                          icon="eos-icons:loading"
                          className="text-gray-500"
                        />
                      </div>
                    ) : profile?.data?.profile_picture ? (
                      <img
                        src={profile.data.profile_picture}
                        alt={profile?.data?.name || "User"}
                        className="w-40-px h-40-px object-fit-cover rounded-circle"
                      />
                    ) : (
                      <div className="w-40-px h-40-px rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-semibold">
                        {profile?.data?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">
                          {profile?.data?.name || "User Name"}{" "}
                          {/* Use profile from userSlice */}
                        </h6>
                        <span className="text-secondary-light fw-medium text-sm">
                          {profile?.data?.role || "Admin"}{" "}
                          {/* Use profile from userSlice */}
                        </span>
                      </div>
                      <button type="button" className="hover-text-danger">
                        <Icon
                          icon="radix-icons:cross-1"
                          className="icon text-xl"
                        />
                      </button>
                    </div>
                    <ul className="to-top-list">
                      <li>
                        <button
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 w-100 bg-transparent border-0"
                          onClick={handleLogout}
                          disabled={isLoading}>
                          <Icon icon="lucide:power" className="icon text-xl" />
                          {isLoading ? "Logging out..." : "Log Out"}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">{children}</div>
      </main>
    </section>
  );
};

export default MasterLayout;
