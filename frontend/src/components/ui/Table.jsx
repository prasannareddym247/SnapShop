import React from 'react';

const Table = ({ children, className = '', style = {} }) => {
  return (
    <table className={`data-table ${className}`} style={style}>
      {children}
    </table>
  );
};

export default Table;
