import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditPackageForm = () => {
  const { state } = useLocation();
  const packageData = state?.package;

  const [formData, setFormData] = useState({
    packageName: '',
    desc: '',
    price: '',
    additionalNotes: '',
    upload: '',
    // packageType: '',
  });

  useEffect(() => {
    if (packageData) {
      setFormData({
        packageName: packageData.packageName || '',
        desc: packageData.description || '',
        price: packageData.price || '',
        additionalNotes: '',
        upload: '',
        // packageType: packageData.packageType?.charAt(0).toUpperCase() + packageData.packageType?.slice(1).toLowerCase() || '',
      });
    }
  }, [packageData]);

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

  const handleQuillChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      desc: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    Swal.fire({
      icon: 'success',
      title: 'Package Updated Successfully!',
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
          placeholder='e.g., "Website Development - Basic"'
        />
      </div>

      <div className="mb-3">
        <label htmlFor="desc" className="form-label">
          Description <span>*</span>
        </label>
        <ReactQuill
          theme="snow"
          value={formData.desc}
          onChange={handleQuillChange}
          placeholder="Details about what the package includes"
        />
      </div>

      <div className="mb-3">
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
          placeholder="e.g., $500"
        />
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


        {/* <div className="mb-4 col-md-6">
          <label htmlFor="packageType" className="form-label">
            Package Type <span>*</span>
          </label>
          <select
            name="packageType"
            id="packageType"
            className="form-control"
            value={formData.packageType}
            required
            onChange={handleChange}
          >
            <option value="">Select a package type</option>
            <option value="Website">Website</option>
            <option value="App">App</option>
            <option value="Social media">Social Media</option>
            <option value="Seo">SEO</option>
          </select>
        </div>
      </div> */}

      <button type="submit" className="btn btn-primary">
        Save Changes
      </button>
    </form>
  );
};

export default EditPackageForm;
