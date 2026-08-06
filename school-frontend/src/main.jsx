import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-fg)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: 'var(--surface)' } },
                error: { iconTheme: { primary: '#ef4444', secondary: 'var(--surface)' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
