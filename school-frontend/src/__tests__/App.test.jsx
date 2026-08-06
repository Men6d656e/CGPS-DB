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

// Mock the theme context (Login page renders a ThemeToggle)
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn(), isDark: true }),
}))

describe('App', () => {
  it('renders login page when not authenticated', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Login is lazy-loaded — wait for it
    expect(await screen.findByRole('heading', { name: /school management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders login form elements', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(await screen.findByPlaceholderText(/enter your username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })
})
