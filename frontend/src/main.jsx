import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "flowbite";
import "flowbite-react";
import "flowbite/dist/flowbite.min.css";
import { WatchListProvider } from './context/WatchListContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WatchListProvider>
      <App />
    </WatchListProvider>
  </StrictMode>,
)
