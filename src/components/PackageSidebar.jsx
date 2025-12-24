// components/ClientPackageDrawer.jsx
import React from 'react';
import { Offcanvas, Form, Button, Image } from 'react-bootstrap';
import DefaultAvatar from '../otherImages/default.png';

const PackageSidebar = ({ show, onClose, data }) => {
  
  if (!data) return null;

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="drawerSidebar">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className='fw-bold'>Package Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="text-center mb-4">
          <Image
            src={data.packageImage || DefaultAvatar}
            roundedCircle
            height="120"
            width="120"
            alt="Package"
          />
        </div>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Package Name</Form.Label>
            <Form.Control type="text" value={data.packageName} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={data.description} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control type="text" value={data.price} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control type="text" value={data.date} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value={data.category} readOnly />
          </Form.Group>

          <div className="text-end  d-flex justify-content-end gap-10 absolute">
            <Button className="btn bg-secondary d-flex gap-10 drawerBtn" onClick={onClose} >
              Close
            </Button>
            <Button className='btn bg-primary text-white d-flex gap-10 drawerBtn'>Pay Now</Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default PackageSidebar;
