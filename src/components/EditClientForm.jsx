import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dp1 from "../otherImages/dp-1.png";

const EditClientForm = () => {
  const { state } = useLocation();
  const clientData = state?.client;

  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    assignedPackages: '',
    paymentStatus: '',
    packageDeliverables: '',
    clientImage: null, 
  });

  const packageOptions = [
    { value: 'Website development - basic', label: 'Website Development - Basic' },
    { value: 'Mobile application', label: 'Mobile Application' },
    { value: 'Social media management', label: 'Social Media Management' },
    { value: 'Website development', label: 'Website Development' },
  ];

  const paymentOptions = [
    { value: 'Recieved', label: 'Recieved' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const deliverableOptions = [
    { value: 'Logo', label: 'Logo' },
    { value: 'Home page', label: 'Home Page' },
    { value: 'Inner pages', label: 'Inner Pages' },
  ];

  useEffect(() => {
    if (clientData) {
      setFormData({
        clientName: clientData.clientName || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        assignedPackages: clientData.assignedPackages?.charAt(0).toUpperCase() + clientData.assignedPackages?.slice(1).toLowerCase() || '',
        paymentStatus: clientData.paymentStatus || '',
        packageDeliverables: clientData.packageDeliverables || '',
        clientImage: clientData.clientImage,
      });
    }
  }, [clientData]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: files ? files[0] : value,
    }));
  };

//   const handleQuillChange = (value) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       desc: value,
//     }));
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    Swal.fire({
      icon: 'success',
      title: 'Client Updated Successfully!',
      showConfirmButton: false,
      timer: 2000,
    });

    // Reset form
    // setFormData({
    //   packageName: '',
    //   desc: '',
    //   price: '',
    //   packageType: '',
    // });
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4 mainForm">
        <div className="imageEdit text-center mb-4">
    <img
        src={
            formData.clientImage instanceof File
      ? URL.createObjectURL(formData.clientImage)
      : formData.clientImage || dp1
        }
        alt="clientImage"
        className="rounded-circle"
        style={{ width: '100px', height: '100px', objectFit: 'cover',boxShadow: '1px 1px 10px #00000036', }}
    />
    <input
        type="file"
        id="clientImageInput"
        name="clientImage"
        accept="image/*"
        onChange={handleChange}
        hidden
    />
    <label
        htmlFor="clientImageInput"
        className="position-absolute"
        style={{
            bottom: "0px",
            right: 'calc(0% - 0px)', 
            background: '#1d1d4e',
            borderRadius: '50%',
            padding: '10px',
            cursor: 'pointer',
            boxShadow: '0 0 0 4px white',
            fontSize: '0px',
        }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-pencil" viewBox="0 0 16 16">
        <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2L3 10.207V11h.793L13 2.793 11.207 2zM14 3.5 12.5 2 13 1.5 14.5 3 14 3.5z"/>
        </svg>
    </label>
    </div>

         <div className="mb-3">
        <label htmlFor="clientName" className="form-label">
          Client Name <span>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          required
          onChange={handleChange}
          placeholder='e.g., "John Doe'
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">
            Email Address <span>*</span>
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            required
            onChange={handleChange}
            placeholder='e.g., "johndoe@gmail.com'
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="phone" className="form-label">
            Phone Number <span>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone}
            required
            onChange={handleChange}
            placeholder='e.g., "33304442'
          />
        </div>
      </div>
      <div className="mb-4">
          <label htmlFor="assignedPackages" className="form-label">
            Assigned Package <span>*</span>
          </label>
          <Select
            id="assignedPackages"
            name="assignedPackages"
            required
            options={packageOptions}
            value={packageOptions.find(opt => opt.value === formData.assignedPackages)}
            onChange={(selectedOption) =>
              setFormData(prev => ({ ...prev, assignedPackages: selectedOption.value }))
            }
            isSearchable
            isMulti
            placeholder="Select a package"
          />
        </div>
        <div className="row mt-20">
        <div className="mb-4 col-md-6">
          <label htmlFor="paymentStatus" className="form-label">
            Payment Status <span>*</span>
          </label>
          <Select
           id="paymentStatus"
            name="paymentStatus"
            required
            options={paymentOptions}
            value={paymentOptions.find(opt => opt.value === formData.paymentStatus)}
            onChange={(selectedOption) =>
              setFormData(prev => ({ ...prev, paymentStatus: selectedOption.value }))
            }
            isSearchable
            placeholder="Select payment status"
          />
        </div>
        <div className="mb-4 col-md-6">
          <label htmlFor="packageDeliverables" className="form-label">
            Package Deliverables <span>*</span>
          </label>
          <Select
            id="packageDeliverables"
            name="packageDeliverables"
            required
            options={deliverableOptions}
            value={deliverableOptions.find(opt => opt.value === formData.packageDeliverables)}
            onChange={(selectedOption) =>
              setFormData(prev => ({ ...prev, packageDeliverables: selectedOption.value }))
            }
            isSearchable
            isMulti
            placeholder="Select deliverables"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Save Changes
      </button>
    </form>
  );
};

export default EditClientForm;
