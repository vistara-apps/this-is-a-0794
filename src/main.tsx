import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import { TemplateProvider } from './context/TemplateContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ProjectProvider>
        <TemplateProvider>
          <App />
        </TemplateProvider>
      </ProjectProvider>
    </AuthProvider>
  </React.StrictMode>,
)
