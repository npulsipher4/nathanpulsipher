import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import NavBar from './components/NavBar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<NavBar />*/}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
