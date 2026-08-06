import { describe, it, expect, vi } from 'vitest'
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

    // Should show login form (heading + submit button)
    expect(screen.getByRole('heading', { name: /school management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Should have username and password inputs
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })
})
