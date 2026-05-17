import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181c27',
            color: '#f3f4f6',
            border: '1px solid #252a3a',
            fontFamily: '"IBM Plex Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#181c27' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#181c27' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
