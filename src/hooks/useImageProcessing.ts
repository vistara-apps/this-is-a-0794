import { useState } from 'react'
import { removeBackground } from '../lib/openai'
import { assetsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface UseImageProcessingReturn {
  isProcessing: boolean
  error: string | null
  processImage: (file: File, projectId?: string) => Promise<string | null>
  removeImageBackground: (imageUrl: string) => Promise<string | null>
}

export function useImageProcessing(): UseImageProcessingReturn {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Uploads and processes an image
   */
  const processImage = async (file: File, projectId?: string): Promise<string | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Upload the image to Supabase Storage
      const { data, error } = await assetsApi.uploadImage(user.id, file, projectId)
      
      if (error) {
        throw error
      }
      
      return data?.url || null
    } catch (err: any) {
      setError(err.message || 'Failed to process image')
      console.error('Image processing failed:', err)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Removes the background from an image
   */
  const removeImageBackground = async (imageUrl: string): Promise<string | null> => {
    setIsProcessing(true)
    setError(null)

    try {
      const processedImageUrl = await removeBackground(imageUrl)
      return processedImageUrl
    } catch (err: any) {
      setError(err.message || 'Failed to remove background')
      console.error('Background removal failed:', err)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    error,
    processImage,
    removeImageBackground
  }
}

