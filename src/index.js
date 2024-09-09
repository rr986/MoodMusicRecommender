import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convexUrl = process.env.REACT_APP_CONVEX_URL;

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using Convex URL:', convexUrl);

const convex = new ConvexReactClient(convexUrl);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </React.StrictMode>
  );
} else {
  console.error("Could not find the 'root' element to mount the React app.");
}
