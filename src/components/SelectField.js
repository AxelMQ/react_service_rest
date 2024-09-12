import React from 'react';
import './SelectField.css'

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} required={required}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
