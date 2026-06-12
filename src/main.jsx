import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UIProvider } from './components/UIProvider.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>,
)
