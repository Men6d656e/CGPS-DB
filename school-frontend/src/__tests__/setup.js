// Vitest setup — registers @testing-library/jest-dom matchers
import '@testing-library/jest-dom'

// jsdom doesn't implement matchMedia — stub it (ThemeContext depends on it)
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
