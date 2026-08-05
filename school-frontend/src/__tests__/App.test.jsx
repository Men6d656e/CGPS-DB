import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
  }),
}))

describe('App', () => {
  it('renders login page when not authenticated', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should show login form
    expect(screen.getByText(/School Management/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument()
  })

  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should have username and password inputs
    expect(screen.getByPlaceholder(/Enter your username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholder(/Enter your password/i)).toBeInTheDocument()
  })
})
