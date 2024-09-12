import React from 'react';
import './Modal.css';

const LoadingModal = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
