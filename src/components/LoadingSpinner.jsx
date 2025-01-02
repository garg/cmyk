import React from 'react';

const LoadingSpinner = ({ size = 40, color = '#4CAF50' }) => {
  return (
    <div 
      className="loading-spinner-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div
        className="loading-spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `4px solid ${color}20`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
