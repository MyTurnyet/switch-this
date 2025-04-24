import React from 'react';

interface ErrorViewProps {
  message: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message }) => {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p className="font-medium">{message}</p>
    </div>
  );
}; 