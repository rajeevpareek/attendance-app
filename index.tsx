
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ensureInitialized } from './server/db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// First, render a simple loading state. This gives immediate feedback.
root.render(
  <React.StrictMode>
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white font-sans">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Initializing Application...</p>
      </div>
    </div>
  </React.StrictMode>
);

// ensureInitialized returns a promise that resolves when the DB is ready.
ensureInitialized().then(() => {
  // Once the promise resolves, render the main application.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(err => {
    console.error("Failed to initialize application:", err);
    root.render(
        <div className="flex h-screen items-center justify-center bg-gray-900 text-red-400 font-sans">
            <p>Fatal Error: Could not initialize application.</p>
        </div>
    );
});
