// src/components/InputField.js
import React from 'react';
import './InputField.css'

function InputField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default InputField;
