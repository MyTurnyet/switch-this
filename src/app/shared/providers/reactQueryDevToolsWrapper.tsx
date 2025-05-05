'use client';

import { useState, useEffect } from 'react';

export const ReactQueryDevToolsWrapper = () => {
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    // Only load DevTools in development and on the client side
    if (process.env.NODE_ENV === 'development') {
      setShowDevTools(true);
    }
  }, []);

  return (
    <>
      {showDevTools && (
        <div className="z-50">
          {/* Dynamic import to avoid loading DevTools in production builds */}
          {(() => {
            // Using an IIFE to make it cleaner with JSX
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore - DevTools are only available in development
              const ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
              return <ReactQueryDevtools initialIsOpen={false} />;
            } catch (error) {
              // If it fails to load, don't break the app
              console.warn('Could not load React Query DevTools:', error);
              return null;
            }
          })()}
        </div>
      )}
    </>
  );
}; 