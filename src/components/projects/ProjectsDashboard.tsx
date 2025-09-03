import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, Calendar, FolderOpen, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProjects } from '../../context/ProjectContext'
import { Project } from '../../lib/api'

interface ProjectsDashboardProps {
  onOpenProject: (project: Project) => void
}

export function ProjectsDashboard({ onOpenProject }: ProjectsDashboardProps) {
  const { projects, isLoading, error, deleteProject, fetchProjects } = useProjects()
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  // Filter projects when search term changes
  useEffect(() => {
    if (searchTerm) {
      setFilteredProjects(
        projects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredProjects(projects)
    }
  }, [projects, searchTerm])

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(projectId)
      
      try {
        await deleteProject(projectId)
      } catch (error) {
        console.error('Failed to delete project:', error)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
        <p className="text-gray-600">Manage and access your saved designs</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg group",
                isDeleting === project.id && "opacity-50"
              )}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {project.preview_url ? (
                    <img
                      src={project.preview_url}
                      alt={project.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <FolderOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="h-8 w-8"
                      disabled={isDeleting === project.id}
                    >
                      {isDeleting === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div 
                  className="p-4"
                  onClick={() => onOpenProject(project)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Modified {formatDate(project.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FolderOpen className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Start by creating your first design from a template'}
          </p>
        </div>
      )}
    </div>
  )
}
