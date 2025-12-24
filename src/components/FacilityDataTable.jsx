import React, { useState, useEffect, useRef } from 'react';
import MUIDataTable from 'mui-datatables';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DefaultAvatar from '../otherImages/default.png';
import DP1 from '../otherImages/dp-1.png';
import DP2 from '../otherImages/dp-2.png';
import DP3 from '../otherImages/dp-3.png';
import DP4 from '../otherImages/dp-4.png';
import DP5 from '../otherImages/dp-5.png';
import DP6 from '../otherImages/dp-6.png';

const FacilityDataTable = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef([]);

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();
    
    // Get button position
    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120 
      });
    }
    
    setDropdownOpen(dropdownOpen === index ? null : index);
  };


  const handleEdit = (rowData) => {
    alert(`Edit Facility: ${rowData.facilityName} for ${rowData.assignedEmployee}`);
    setDropdownOpen(null);
  };


  const handleDelete = (rowData) => {
    if (window.confirm(`Are you sure you want to delete ${rowData.facilityName} - ${rowData.assignedEmployee}?`)) {
      alert(`Deleted Facility Assignment: ${rowData.facilityName} successfully`);
    }
    setDropdownOpen(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Facility data matching your image exactly
  const facilityData = [
    { 
      facilityName: 'KFC Facility', 
      assignedEmployee: 'Savannah Nguyen', 
      id: '70668', 
      formsSubmitted: '05',
      date: '25 October, 2025'
    },
    { 
      facilityName: 'Starbucks Facility', 
      assignedEmployee: 'Darlene Robertson', 
      id: '97174', 
      formsSubmitted: '07',
      date: '05 October, 2025'
    },
    { 
      facilityName: 'Burger King Facility', 
      assignedEmployee: 'Marvin McKinney', 
      id: '97174', 
      formsSubmitted: '10',
      date: '02 October, 2025'
    },
    { 
      facilityName: 'McDonald Facility', 
      assignedEmployee: 'Jerome Bell', 
      id: '22739', 
      formsSubmitted: '15',
      date: '30 September, 2025'
    },
    { 
      facilityName: 'KFC Facility', 
      assignedEmployee: 'Jacob Jones', 
      id: '22739', 
      formsSubmitted: '12',
      date: '27 September, 2025'
    },
    { 
      facilityName: 'Starbucks Facility', 
      assignedEmployee: 'Esther Howard', 
      id: '43178', 
      formsSubmitted: '04',
      date: '22 September, 2025'
    },
    { 
      facilityName: 'Burger King Facility', 
      assignedEmployee: 'Annette Black', 
      id: '70668', 
      formsSubmitted: '12',
      date: '15 September, 2025'
    },
    { 
      facilityName: 'McDonald Facility', 
      assignedEmployee: 'Guy Hawkins', 
      id: '39635', 
      formsSubmitted: '02',
      date: '09 September, 2025'
    },
    { 
      facilityName: 'KFC Facility', 
      assignedEmployee: 'Kristin Watson', 
      id: '43756', 
      formsSubmitted: '12',
      date: '01 September, 2025'
    },
    { 
      facilityName: 'Starbucks Facility', 
      assignedEmployee: 'Floyd Miles', 
      id: '22739', 
      formsSubmitted: '08',
      date: '31 August, 2025'
    },
    { 
      facilityName: 'Burger King Facility', 
      assignedEmployee: 'Esther Howard', 
      id: '70668', 
      formsSubmitted: '05',
      date: '29 August, 2025'
    },
    { 
      facilityName: 'McDonald Facility', 
      assignedEmployee: 'Jerome Bell', 
      id: '70668', 
      formsSubmitted: '15',
      date: '16 August, 2025'
    },
    { 
      facilityName: 'KFC Facility', 
      assignedEmployee: 'Marvin McKinney', 
      id: '70668', 
      formsSubmitted: '20',
      date: '14 August, 2025'
    }
  ];

  const columns = [
    {
      name: 'facilityName',
      label: 'Facility Name',
    },
    {
      name: 'assignedEmployee',
      label: 'Assigned Employee',
    },
    {
      name: 'id',
      label: 'Employee ID',
    },
    {
      name: 'formsSubmitted',
      label: 'Forms Submitted',
    },
    {
      name: 'date',
      label: 'Date',
    },
    {
      name: 'action',
      label: 'Action',
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = facilityData[dataIndex];
          return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                  ref={el => buttonRefs.current[dataIndex] = el}
                  onClick={(e) => handleDropdownToggle(dataIndex, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Icon icon="mdi:dots-horizontal" width="25" height="25" />
              </button>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: 'none',
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 15, 20],
    responsive: 'standard',
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: 'Search facilities...',
    pagination: true,
    tableBodyHeight: 'auto',
  };

  return (
    <>
      <div className="basic-data-table">
        <MUIDataTable
          title=""
          data={facilityData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

      {/* Portal dropdown to body */}
      {dropdownOpen !== null && createPortal(
        <div
            style={{
              position: 'absolute',
              top: buttonPosition.top,
              left: buttonPosition.left,
              backgroundColor: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              minWidth: '140px',
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#333',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => handleEdit(facilityData[dropdownOpen])}
            >
              <Icon icon="line-md:edit" width="18" height="18" color="#666" /> 
              <span>Edit</span>
            </div>
            <div
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#D32F2F',
                borderTop: '1px solid #F0F0F0',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => handleDelete(facilityData[dropdownOpen])}
            >
              <Icon icon="material-symbols:delete-outline" width="18" height="18" color="#D32F2F" /> 
              <span>Delete</span>
            </div>
          </div>,
        document.body
      )}
    </>
  );
};

export default FacilityDataTable;