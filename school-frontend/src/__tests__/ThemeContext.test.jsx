import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'

function ToggleProbe() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button data-testid="toggle" onClick={toggleTheme}>
      {theme}
    </button>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('toggles the dark class on <html> and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ToggleProbe />
      </ThemeProvider>
    )

    const btn = screen.getByTestId('toggle')
    const initial = btn.textContent

    // Default (no saved preference, jsdom matchMedia returns light)
    expect(initial).toBe('light')

    fireEvent.click(btn)
    expect(btn.textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    fireEvent.click(btn)
    expect(btn.textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('restores the saved preference on mount', () => {
    localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <ToggleProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId('toggle').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
