import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { TemplateLibrary } from './components/templates/TemplateLibrary'
import { DesignEditor } from './components/editor/DesignEditor'
import { ProjectsDashboard } from './components/projects/ProjectsDashboard'
import { AuthModal } from './components/auth/AuthModal'
import { Button } from './components/ui/button'
import { LogOut } from 'lucide-react'
import './App.css'

interface User {
  id: string
  email: string
  name: string
  subscription_tier: 'free' | 'pro' | 'premium'
}

interface Template {
  id: string
  name: string
  category: string
  preview_url: string
  is_premium: boolean
}

interface Project {
  id: string
  name: string
  template_id: string
  preview?: string
  created_at: string
  updated_at: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('pixelspark-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      setShowAuthModal(true)
    }
  }, [])

  const handleAuth = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    localStorage.setItem('pixelspark-user', JSON.stringify(authenticatedUser))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('pixelspark-user')
    setActiveTab('templates')
    setSelectedTemplate(null)
    setEditingProject(null)
    setShowAuthModal(true)
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setEditingProject(null)
  }

  const handleOpenProject = (project: Project) => {
    setEditingProject(project)
    setSelectedTemplate(null)
  }

  const handleBackToLibrary = () => {
    setSelectedTemplate(null)
    setEditingProject(null)
    setActiveTab('templates')
  }

  const handleSaveProject = (projectData: any) => {
    console.log('Saving project:', projectData)
    // In production, save to Supabase
    setActiveTab('projects')
    setSelectedTemplate(null)
    setEditingProject(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">PixelSpark</h1>
          <p className="text-xl opacity-90">Effortless Graphics. Instantly Shareable.</p>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
      </div>
    )
  }

  if (selectedTemplate || editingProject) {
    return (
      <div className="h-screen">
        <DesignEditor
          template={selectedTemplate || {
            id: editingProject?.template_id || '1',
            name: editingProject?.name || 'Project',
            category: 'Custom',
            preview_url: editingProject?.preview || '',
            is_premium: false
          }}
          onBack={handleBackToLibrary}
          onSave={handleSaveProject}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userTier={user.subscription_tier}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user.name}
            </h2>
            <p className="text-sm text-gray-500">
              {user.subscription_tier} plan
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'templates' && (
            <TemplateLibrary 
              onSelectTemplate={handleSelectTemplate}
              userTier={user.subscription_tier}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsDashboard onOpenProject={handleOpenProject} />
          )}
          {activeTab === 'uploads' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Manager</h3>
              <p className="text-gray-500">Manage your uploaded images and assets</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
              <p className="text-gray-500">Manage your account preferences and subscription</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App