import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/providers'

createRoot(document.getElementById('root')!).render(
  <AppProviders />
)
