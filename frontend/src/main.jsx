import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyDesignTokens } from './utils/designSystem'

const theme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
applyDesignTokens(theme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
