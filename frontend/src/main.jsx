import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "flowbite";
import "flowbite-react";
import "flowbite/dist/flowbite.min.css";
import { WatchListProvider } from './context/WatchListContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WatchListProvider>
        <App />
      </WatchListProvider>
    </AuthProvider>
  </StrictMode>,
)
