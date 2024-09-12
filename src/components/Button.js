import React from 'react';
import './Button.css';

function Button({ onClick, label, type = 'button', styleType = 'primary', disabled = false }) {
  return (
    <button 
      type={type} 
      className={`button ${styleType}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export default Button;
