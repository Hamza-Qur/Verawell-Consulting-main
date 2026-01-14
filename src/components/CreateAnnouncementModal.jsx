import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendBroadcastNotification, clearNotificationState } from '../redux/slices/notificationSlice'
import { getDashboardUsers } from '../redux/slices/dashboardSlice'

export default function CreateAnnouncementModal({ onClose }) {
  const dispatch = useDispatch()
  const { isLoading, error, success } = useSelector((state) => state.notification)
  const { users, isLoading: isLoadingUsers } = useSelector((state) => state.dashboard)
  
  const [selectedTab, setSelectedTab] = useState("all")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState([])

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(getDashboardUsers())
  }, [dispatch])

  const handleTabSwitch = (tab) => {
    setSelectedTab(tab)
    setSelectedUserIds([])
    dispatch(clearNotificationState())
  }

  const handleSendNotification = () => {
    if (!body.trim()) {
      alert("Please enter announcement message")
      return
    }

    if (selectedTab === "selected" && selectedUserIds.length === 0) {
      alert("Please select at least one employee")
      return
    }

    const notificationData = {
      title: title.trim() || "Announcement",
      body: body.trim(),
      data_object: null,
      send_type: selectedTab,
      user_ids: selectedTab === "selected" ? selectedUserIds : []
    }

    dispatch(sendBroadcastNotification(notificationData))
      .then((action) => {
        if (action.payload?.success) {
          setTitle("")
          setBody("")
          setSelectedUserIds([])
          
          setTimeout(() => {
            if (onClose) onClose()
          }, 2000)
        }
      })
  }

  const handleSelectEmployee = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId))
    } else {
      setSelectedUserIds([...selectedUserIds, userId])
    }
  }

  const handleRemoveEmployee = (userId) => {
    setSelectedUserIds(selectedUserIds.filter(id => id !== userId))
  }

  const getProfileImage = (user) => {
    if (user.profile_picture) {
      return user.profile_picture.startsWith("http")
        ? user.profile_picture
        : `https://verawell.koderspedia.net${user.profile_picture}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random&color=fff&size=40`
  }

  return (
    <section className='announcementModal'>
      <div className="tabs">
        <button
          className={`tab ${selectedTab === "all" ? "active" : ""}`}
          onClick={() => handleTabSwitch("all")}
          disabled={isLoading}
        >
          All
        </button>
        <button
          className={`tab ${selectedTab === "selected" ? "active" : ""}`}
          onClick={() => handleTabSwitch("selected")}
          disabled={isLoading}
        >
          Selected Employees
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Notification sent successfully!
        </div>
      )}

      <div className="content">
        {/* Title Input - Always visible */}
        <div className="input-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="title">Title (Optional)</label>
          <input 
            type="text" 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title (optional)"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Announcement Textarea - Always visible */}
        <div className="input-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="announcements">Announcement *</label>
          <textarea 
            id="announcements" 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write announcement here..."
            disabled={isLoading}
            required
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Employee Selection - Only for "selected" tab */}
        {selectedTab === "selected" && (
          <div className="selected-employees" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select Employees *
            </label>
            
            {isLoadingUsers ? (
              <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                Loading users...
              </div>
            ) : users && users.length > 0 ? (
              <>
                {/* Compact user list */}
                <div style={{ 
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  {users.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => handleSelectEmployee(user.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        backgroundColor: selectedUserIds.includes(user.id) ? "#f0f5ff" : "white",
                        minHeight: '40px'
                      }}
                    >
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '3px',
                        border: '2px solid #ccc',
                        marginRight: '10px',
                        backgroundColor: selectedUserIds.includes(user.id) ? '#8B2885' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedUserIds.includes(user.id) && (
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        )}
                      </div>
                      <img
                        src={getProfileImage(user)}
                        alt={user.name}
                        style={{
                          width: "25px",
                          height: "25px",
                          borderRadius: "50%",
                          marginRight: "8px"
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: '500', 
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selected count indicator */}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginBottom: '5px'
                }}>
                  {selectedUserIds.length > 0 
                    ? `${selectedUserIds.length} employee${selectedUserIds.length !== 1 ? 's' : ''} selected`
                    : 'No employees selected'}
                </div>
              </>
            ) : (
              <div style={{ padding: '10px', textAlign: 'center', color: '#666', border: '1px dashed #ddd', borderRadius: '4px' }}>
                No users available
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="actions" style={{ 
          display: 'flex', 
          gap: '10px',
          paddingTop: '15px',
          borderTop: '1px solid #eee'
        }}>
          <button 
            className="cancel" 
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button 
            className="send-alert" 
            onClick={handleSendNotification}
            disabled={isLoading || (selectedTab === "selected" && selectedUserIds.length === 0)}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: selectedTab === "selected" && selectedUserIds.length === 0 ? '#ccc' : '#8B2885',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedTab === "selected" && selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isLoading ? (
              'Sending...'
            ) : selectedTab === "all" ? (
              'Send to All'
            ) : (
              `Send to ${selectedUserIds.length} Selected`
            )}
          </button>
        </div>
      </div>
    </section>
  )
}