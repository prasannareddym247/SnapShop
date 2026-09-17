import React from 'react';

const Button = ({ children, className = '', type = 'button', disabled = false, onClick, style = {} }) => {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
