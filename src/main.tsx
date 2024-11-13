import { StrictMode } from 'react'
import {CocheeProvider} from './store/cocheeProvider'
import { AxiosProvider } from './store/axiosProvider.tsx'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  //使用StricMode會有跑兩次的情況
  // <StrictMode>
  <AxiosProvider>
    <CocheeProvider>
      <App />
    </CocheeProvider>  
  </AxiosProvider>
      
  // </StrictMode>,
)
