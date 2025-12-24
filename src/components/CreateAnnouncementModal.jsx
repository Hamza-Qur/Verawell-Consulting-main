import React, { useState } from 'react'

export default function CreateAnnouncementModal() {
  const [selectedTab, setSelectedTab] = useState("all");

  const handleTabSwitch = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <section className='announcementModal'>
      <div className="tabs">
        <button
          className={`tab ${selectedTab === "all" ? "active" : ""}`}
          onClick={() => handleTabSwitch("all")}
        >
          All
        </button>
        <button
          className={`tab ${selectedTab === "selected" ? "active" : ""}`}
          onClick={() => handleTabSwitch("selected")}
        >
          Selected Employees
        </button>
      </div>

      <div className="content">
        {selectedTab === "all" && (
          <div className="content-section">
            <div className="input-group">
              <label htmlFor="announcements">Announcements</label>
              <textarea id="announcements" placeholder="Write Here" />
            </div>
            <div className="input-group">
              <label htmlFor="purpose">Purpose</label>
              <select id="purpose">
                <option>Attendance</option>
                <option>Leave</option>
                <option>Meeting</option>
              </select>
            </div>
            <div className="actions">
              <button className="cancel">Cancel</button>
              <button className="send-alert">Send Alert</button>
            </div>
          </div>
        )}

        {selectedTab === "selected" && (
          <div className="content-section">
            <div className="selected-employees">
              <label>Selected Employees</label>
              <div className="selected-employees-list">
                <div className="employee">
                  <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Employee 1"
                    className="employee-img"
                  />
                  <button className="remove">✖</button>
                </div>
                <div className="employee">
                  <img
                    src="https://randomuser.me/api/portraits/men/2.jpg"
                    alt="Employee 2"
                    className="employee-img"
                  />
                  <button className="remove">✖</button>
                </div>
                <button className="add-employee">┿</button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="announcements">Announcements</label>
              <textarea id="announcements" placeholder="Write Here" />
            </div>
            <div className="input-group">
              <label htmlFor="purpose">Purpose</label>
              <select id="purpose">
                <option>Attendance</option>
                <option>Leave</option>
                <option>Meeting</option>
              </select>
            </div>
            <div className="actions">
              <button className="send-alert announceButton">Send Alert</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
