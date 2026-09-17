import React from 'react';

const Select = ({ children, className = '', value, onChange, style = {} }) => {
  return (
    <select
      className={`form-input ${className}`}
      value={value}
      onChange={onChange}
      style={style}
    >
      {children}
    </select>
  );
};

export default Select;
