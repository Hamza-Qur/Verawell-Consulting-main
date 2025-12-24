// ClientForm.jsx
import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
// import axios from 'axios';

const AddClientForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    picture: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
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
        title: 'Client Added Successfully!',
        showConfirmButton: false,
        timer: 500000,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        picture: null,
      });

      document.getElementById('picture').value = '';
    } catch (error) {
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while adding the client!',
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
        <label htmlFor="name" className="form-label">
          Client Name <span>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
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
        <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
                Create Password <span>*</span>
            </label>
            <div className="input-group">
                <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                required
                onChange={handleChange}
                placeholder='e.g., ******'
                />
                <button
                type="button"
                className="btn btn-outline-secondary eyeBtn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                >
                {showPassword ? <Icon icon="bi:eye-slash-fill"  width="22" height="22" /> : <Icon icon="bi:eye-fill" width="22" height="22" />}
                </button>
            </div>
        </div>
      <div className="mb-4">
        <label htmlFor="picture" className="form-label">
          Upload Picture <span>*</span>
        </label>
        <input
          type="file"
          className="form-control"
          id="picture"
          name="picture"
          accept="image/*"
          required
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Add Client
      </button>
    </form>
  );
};

export default AddClientForm;
