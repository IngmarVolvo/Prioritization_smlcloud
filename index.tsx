
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Ensure the DOM is ready before attempting to mount
const init = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("Critical Error: Failed to find the root element.");
  }
};

// Start the application
init();
