import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const APP_VERSION = "restored-delco-blue-philly-2026-05-05";
window.DELCOHELP_VERSION = APP_VERSION;
console.log("DelcoHelp version:", APP_VERSION);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .then(() => {
      if ("caches" in window) {
        return caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }
      return undefined;
    })
    .then(() => console.log("[DelcoHelp] Service workers unregistered on app load"))
    .catch((err) => console.log("[DelcoHelp] Service worker cleanup failed on app load", err));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
