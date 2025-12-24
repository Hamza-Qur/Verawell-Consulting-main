import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import Select from 'react-select';
import Swal from 'sweetalert2';
// import axios from 'axios';

const AddPackageForm = () => {
  const [formData, setFormData] = useState({
    packageName: '',
    desc: '',
    category: '',
    price: '',
    packageDeliverables: '',
    additionalNotes: '',
    upload: '',
    // packageType: '',
  });

  const categoryOptions = [
    { value: 'Koderspedia', label: 'Koderspedia' },
    { value: 'Webflow Creators', label: 'Webflow Creators' },
    { value: 'Shopify Web Creators', label: 'Shopify Web Creators' },
  ];

  const deliverableOptions = [
    { value: 'Logo', label: 'Logo' },
    { value: 'Home page', label: 'Home Page' },
    { value: 'Inner pages', label: 'Inner Pages' },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleQuillChange = (value) => {
    setFormData((formData) => ({
      ...formData,
      desc: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      // Adjust the API URL to your Laravel endpoint
    //   await axios.post('http://localhost:8000/api/clients', data, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });

    await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Package Created Successfully!',
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form
      setFormData({
        packageName: '',
        desc: '',
        category: '',
        price: '',
        packageDeliverables: '',
        additionalNotes: '',
        upload: '',
      });

      console.log(formData, ">> Formdata")

    } catch (error) {
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while adding the package!',
      });

      console.error('Submit error:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mt-4 mainForm"
      encType="multipart/form-data"
    >
      <div className="mb-3">
        <label htmlFor="packageName" className="form-label">
          Package Name <span>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="packageName"
          name="packageName"
          value={formData.packageName}
          required
          onChange={handleChange}
          placeholder='e.g., "Website Development - Basic'
        />
      </div>

        <div className=" mb-3">
          <label htmlFor="desc" className="form-label">
            Description <span>*</span>
          </label>
          <ReactQuill
            theme="snow"
            value={formData.desc}
            onChange={handleQuillChange}
            placeholder="Details about what the package includes"
            id="desc"
            name="desc"
          />
        </div>

        <div className="mb-20">
          <label htmlFor="category" className="form-label">
            Category <span>*</span>
          </label>
          <Select
            name="category"
            id="category"
            required
            options={categoryOptions}
            value={categoryOptions.find(opt => opt.value === formData.category)}
            onChange={(selectedOption) =>
              setFormData(prev => ({ ...prev, category: selectedOption.value }))
            }
            placeholder="Select a category"
            isSearchable
          />
        </div>

      <div className="row">
          <div className="mb-3 col-md-6">
            <label htmlFor="price" className="form-label">
              Price ($USD) <span>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              required
              onChange={handleChange}
              placeholder='e.g., $500'
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

      <div class="row">
        <div class="col-md-6 mb-3">
          <label htmlFor="notes" className="form-label">
          Additional Notes
          </label>
          <input
            type="text"
            className="form-control"
            id="notes"
            name="notes"
            onChange={handleChange}
            placeholder="Lorem ispum"
          />
        </div>

        <div class="col-md-6 mb-3">
          <label htmlFor="upload" className="form-label">
          Upload Scope of Work / Document <span>*</span>
          </label>
          <input
            type="file"
            className="form-control"
            id="upload"
            name="document"
            accept=".pdf,.doc,.docx,.jpg,.png"  // Optional: file type restrictions
            required
            onChange={handleChange}
          />
        </div>
      </div>  

      <button type="submit" className="btn btn-primary">
      Create Package
      </button>
    </form>
  );
};

export default AddPackageForm;
