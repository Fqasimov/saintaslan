import '@fontsource-variable/montserrat'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CityProvider } from './lib/city'
import './styles.css'

document.documentElement.classList.add('js')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CityProvider>
      <App />
    </CityProvider>
  </StrictMode>,
)
