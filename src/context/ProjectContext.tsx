import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { projectsApi, Project, CreateProjectData, UpdateProjectData } from '../lib/api'
import { useAuth } from './AuthContext'

interface ProjectContextType {
  projects: Project[]
  isLoading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  getProject: (id: string) => Promise<Project | null>
  createProject: (data: CreateProjectData) => Promise<Project | null>
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>
  deleteProject: (id: string) => Promise<boolean>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects when user changes
  useEffect(() => {
    if (user) {
      fetchProjects()
    } else {
      setProjects([])
    }
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await projectsApi.getProjects(user.id)
      
      if (error) {
        throw error
      }
      
      setProjects(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getProject = async (id: string): Promise<Project | null> => {
    try {
      const { data, error } = await projectsApi.getProject(id)
      
      if (error) {
        throw error
      }
      
      return data
    } catch (err: any) {
      setError(err.message || `Failed to fetch project ${id}`)
      console.error(`Error fetching project ${id}:`, err)
      return null
    }
  }

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    try {
      const { data: newProject, error } = await projectsApi.createProject(user.id, data)
      
      if (error) {
        throw error
      }
      
      if (newProject) {
        setProjects(prev => [newProject, ...prev])
        return newProject
      }
      
      return null
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
      console.error('Error creating project:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateProject = async (id: string, data: UpdateProjectData): Promise<Project | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: updatedProject, error } = await projectsApi.updateProject(id, data)
      
      if (error) {
        throw error
      }
      
      if (updatedProject) {
        setProjects(prev => 
          prev.map(project => project.id === id ? updatedProject : project)
        )
        return updatedProject
      }
      
      return null
    } catch (err: any) {
      setError(err.message || `Failed to update project ${id}`)
      console.error(`Error updating project ${id}:`, err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await projectsApi.deleteProject(id)
      
      if (error) {
        throw error
      }
      
      setProjects(prev => prev.filter(project => project.id !== id))
      return true
    } catch (err: any) {
      setError(err.message || `Failed to delete project ${id}`)
      console.error(`Error deleting project ${id}:`, err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    projects,
    isLoading,
    error,
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

