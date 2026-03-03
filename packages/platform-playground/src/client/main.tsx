import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TrpcProviderComponent } from './providers/trpc'
import { AuthProvider } from './contexts/AuthContext.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrpcProviderComponent>
      <AuthProvider>
        <App />
      </AuthProvider>
    </TrpcProviderComponent>
  </StrictMode>,
)
