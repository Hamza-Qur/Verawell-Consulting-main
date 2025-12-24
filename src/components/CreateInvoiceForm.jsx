import { useState } from "react";
import ReactQuill from "react-quill-new";
import Select from 'react-select';
import Swal from "sweetalert2";

const CreateInvoiceForm = () => {
  const [formData, setFormData] = useState({
    invoiceTitle: "",
    orderAmount: "",
    remainingAmount: "",
    customer: "",
    description: "",
    category: "",
    paymentType: "",
    saleType: "",
  });

  const customerOptions = [
    { value: 'Tim Bertin', label: 'Tim Bertin' },
    { value: 'Zale Crave', label: 'Zale Crave' },
    { value: 'Martin Grape', label: 'Martin Grape' },
    { value: 'Callison', label: 'Callison' },
  ];

  const categoryOptions = [
    { value: 'Koderspedia', label: 'Koderspedia' },
    { value: 'Webflow Creators', label: 'Webflow Creators' },
    { value: 'Shopify Web Creators', label: 'Shopify Web Creators' },
  ];

  const paymentTypeOptions = [
    { value: 'Stripe', label: 'Stripe' },
    { value: 'Paypal', label: 'Paypal' },
    { value: 'Zelle', label: 'Zelle' },
    { value: 'Sqaure', label: 'Sqaure' },
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
      description: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Invoice Created Successfully!",
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form
      setFormData({
        invoiceTitle: "",
        orderAmount: "",
        remainingAmount: "",
        customer: "",
        description: "",
        category: "",
        paymentType: "",
        saleType: "",
      });

      console.log(formData, ">> Formdata");
    } catch (error) {
      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while creating the invoice!",
      });

      console.error("Submit error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mt-4 mainForm"
      encType="multipart/form-data"
    >
      <div className="mb-3">
        <label htmlFor="invoiceTitle" className="form-label">
          Invoice Title <span>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="invoiceTitle"
          name="invoiceTitle"
          value={formData.invoiceTitle}
          required
          onChange={handleChange}
        />
      </div>
      <div className="row">
        <div className="mb-3 col-md-6">
          <label htmlFor="orderAmount" className="form-label">
            Order Amount ($) <span>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="orderAmount"
            name="orderAmount"
            value={formData.orderAmount}
            required
            onChange={handleChange}
          />
        </div>
        <div className="mb-3 col-md-6">
          <label htmlFor="remainingAmount" className="form-label">
            Remaining Amount ($) <span>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="remainingAmount"
            name="remainingAmount"
            value={formData.remainingAmount}
            required
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="mb-20">
        <label htmlFor="customer" className="form-label">
          Customer <span>*</span>
        </label>
        <Select
          name="customer"
          id="customer"
          required
          options={customerOptions}
          value={customerOptions.find(opt => opt.value === formData.customer)}
          onChange={(selectedOption) =>
            setFormData(prev => ({ ...prev, customer: selectedOption.value }))
          }
          placeholder="Select a customer"
          isSearchable
        />
      </div>

      <div className=" mb-3">
        <label htmlFor="description" className="form-label">
          Description <span>*</span>
        </label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={handleQuillChange}
          placeholder="Details about what the package includes"
          id="description"
          name="description"
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
      <div className="mb-3">
        <label htmlFor="paymentType" className="form-label">
          Payment Type <span>*</span>
        </label>
        <Select
          name="paymentType"
          id="paymentType"
          required
          options={paymentTypeOptions}
          value={paymentTypeOptions.find(opt => opt.value === formData.paymentType)}
          onChange={(selectedOption) =>
            setFormData(prev => ({ ...prev, paymentType: selectedOption.value }))
          }
          placeholder="Select a payment type"
          isSearchable
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Sale Type <span>*</span>
        </label>
        <div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="saleType"
              id="freshSale"
              value="Fresh Sale"
              checked={formData.saleType === "Fresh Sale"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="freshSale">
              Fresh Sale
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="saleType"
              id="upsell"
              value="Upsell"
              checked={formData.saleType === "Upsell"}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="upsell">
              Upsell
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="saleType"
              id="followUp"
              value="Follow Up"
              checked={formData.saleType === "Follow Up"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="followUp">
              Follow Up
            </label>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Add
      </button>
    </form>
  );
};

export default CreateInvoiceForm;
