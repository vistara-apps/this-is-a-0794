import { supabase } from './supabase'
import { Database } from './supabase'

// Project Types
export interface Project {
  id: string
  user_id: string
  name: string
  template_id: string
  design_data: any
  preview_url?: string
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  template_id: string
  design_data: any
  preview_url?: string
}

export interface UpdateProjectData {
  name?: string
  design_data?: any
  preview_url?: string
}

// Template Types
export interface Template {
  id: string
  name: string
  category: string
  preview_url: string
  elements: any
  is_premium: boolean
}

// Asset Types
export interface Asset {
  id: string
  user_id: string
  project_id?: string
  url: string
  type: 'image' | 'background' | 'shape'
  created_at: string
}

// Projects API
export const projectsApi = {
  async getProjects(userId: string): Promise<{ data: Project[] | null, error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    return { data, error }
  },

  async getProject(projectId: string): Promise<{ data: Project | null, error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    return { data, error }
  },

  async createProject(userId: string, projectData: CreateProjectData): Promise<{ data: Project | null, error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: projectData.name,
          template_id: projectData.template_id,
          design_data: projectData.design_data,
          preview_url: projectData.preview_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    return { data, error }
  },

  async updateProject(projectId: string, updates: UpdateProjectData): Promise<{ data: Project | null, error: any }> {
    // Add updated_at timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updatedData)
      .eq('id', projectId)
      .select()
      .single()

    return { data, error }
  },

  async deleteProject(projectId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    return { error }
  }
}

// Templates API
export const templatesApi = {
  async getTemplates(): Promise<{ data: Template[] | null, error: any }> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name')

    return { data, error }
  },

  async getTemplatesByCategory(category: string): Promise<{ data: Template[] | null, error: any }> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('category', category)
      .order('name')

    return { data, error }
  },

  async getTemplate(templateId: string): Promise<{ data: Template | null, error: any }> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    return { data, error }
  }
}

// Assets API
export const assetsApi = {
  async uploadImage(userId: string, file: File, projectId?: string): Promise<{ data: Asset | null, error: any }> {
    // Generate a unique file path
    const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('assets')
      .upload(filePath, file)
    
    if (uploadError) {
      return { data: null, error: uploadError }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('assets')
      .getPublicUrl(filePath)
    
    // Create asset record
    const { data, error } = await supabase
      .from('assets')
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          url: publicUrl,
          type: 'image',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    return { data, error }
  },

  async getUserAssets(userId: string): Promise<{ data: Asset[] | null, error: any }> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async deleteAsset(assetId: string): Promise<{ error: any }> {
    // First get the asset to get the file path
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()
    
    if (fetchError || !asset) {
      return { error: fetchError || new Error('Asset not found') }
    }
    
    // Extract file path from URL
    const url = new URL(asset.url)
    const filePath = url.pathname.split('/').slice(-2).join('/')
    
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('assets')
      .remove([filePath])
    
    if (storageError) {
      return { error: storageError }
    }
    
    // Delete record
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
    
    return { error }
  }
}

