import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { templatesApi, Template } from '../lib/api'

interface TemplateContextType {
  templates: Template[]
  categories: string[]
  isLoading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  getTemplatesByCategory: (category: string) => Promise<Template[]>
  getTemplate: (id: string) => Promise<Template | null>
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined)

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await templatesApi.getTemplates()
      
      if (error) {
        throw error
      }
      
      if (data) {
        setTemplates(data)
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(template => template.category))
        )
        setCategories(uniqueCategories)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates')
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getTemplatesByCategory = async (category: string): Promise<Template[]> => {
    try {
      const { data, error } = await templatesApi.getTemplatesByCategory(category)
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (err: any) {
      setError(err.message || `Failed to fetch templates for category ${category}`)
      console.error(`Error fetching templates for category ${category}:`, err)
      return []
    }
  }

  const getTemplate = async (id: string): Promise<Template | null> => {
    try {
      const { data, error } = await templatesApi.getTemplate(id)
      
      if (error) {
        throw error
      }
      
      return data
    } catch (err: any) {
      setError(err.message || `Failed to fetch template ${id}`)
      console.error(`Error fetching template ${id}:`, err)
      return null
    }
  }

  const value = {
    templates,
    categories,
    isLoading,
    error,
    fetchTemplates,
    getTemplatesByCategory,
    getTemplate
  }

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

export const useTemplates = () => {
  const context = useContext(TemplateContext)
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider')
  }
  return context
}
