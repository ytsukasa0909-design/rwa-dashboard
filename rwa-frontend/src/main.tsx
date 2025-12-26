import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // .js や .tsx の拡張子は書かないのが一般的です

// root要素が存在することをTypeScriptに保証するために '!' を付けます
const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)