import React from 'react';

export const Card = ({ className, children }) => {
  return <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>;
};
