import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { TemplateLibrary } from './components/templates/TemplateLibrary'
import { DesignEditor } from './components/editor/DesignEditor'
import { ProjectsDashboard } from './components/projects/ProjectsDashboard'
import { AuthModal } from './components/auth/AuthModal'
import { SubscriptionModal } from './components/subscription/SubscriptionModal'
import { Button } from './components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useProjects } from './context/ProjectContext'
import { useTemplates } from './context/TemplateContext'
import { useSubscription } from './hooks/useSubscription'
import { Template } from './lib/api'
import './App.css'

function App() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth()
  const { projects, createProject, isLoading: projectsLoading } = useProjects()
  const { templates, isLoading: templatesLoading } = useTemplates()
  const { currentTier } = useSubscription()
  
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [user, authLoading])

  const handleLogout = async () => {
    await signOut()
    setActiveTab('templates')
    setSelectedTemplate(null)
    setEditingProject(null)
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setEditingProject(null)
  }

  const handleOpenProject = (project: any) => {
    setEditingProject(project)
    setSelectedTemplate(null)
  }

  const handleBackToLibrary = () => {
    setSelectedTemplate(null)
    setEditingProject(null)
    setActiveTab('templates')
  }

  const handleSaveProject = async (projectData: any) => {
    if (!user) return
    
    try {
      await createProject({
        name: projectData.name,
        template_id: projectData.template_id,
        design_data: projectData.elements,
        preview_url: projectData.preview
      })
      
      setActiveTab('projects')
      setSelectedTemplate(null)
      setEditingProject(null)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true)
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading PixelSpark...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!user || !profile) {
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
          onAuth={() => {}} // Auth is now handled by AuthContext
        />
      </div>
    )
  }

  // Show editor when editing a template or project
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

  // Main application layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userTier={currentTier}
        onUpgradeClick={handleUpgradeClick}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {profile.name}
            </h2>
            <p className="text-sm text-gray-500">
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {currentTier === 'free' && (
              <Button 
                variant="default" 
                className="bg-gradient-purple hover:bg-purple-700"
                onClick={handleUpgradeClick}
              >
                Upgrade
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'templates' && (
            <TemplateLibrary 
              onSelectTemplate={handleSelectTemplate}
              userTier={currentTier}
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
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">Current Plan: <span className="font-medium capitalize">{currentTier}</span></p>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentTier === 'free' 
                        ? 'Upgrade to access premium features' 
                        : 'You have access to premium features'}
                    </p>
                  </div>
                  <Button onClick={handleUpgradeClick}>
                    {currentTier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  )
}

export default App
