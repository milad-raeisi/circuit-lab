import './index.css'
import { AnimateUIProvider } from '@animate-ui/react/provider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimateUIProvider tempo={1} checkAnimation="draw">
      <App />
    </AnimateUIProvider>
  </StrictMode>,
)
