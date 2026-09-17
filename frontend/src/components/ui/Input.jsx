import React from 'react';

const Input = ({ className = '', type = 'text', required = false, placeholder = '', value, onChange, min, max, style = {} }) => {
  return (
    <input
      type={type}
      className={`form-input ${className}`}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      style={style}
    />
  );
};

export default Input;
