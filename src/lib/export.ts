import html2canvas from 'html2canvas'

/**
 * Export options for the design
 */
export interface ExportOptions {
  format: 'png' | 'jpg'
  quality?: number
  fileName?: string
  width?: number
  height?: number
}

/**
 * Exports a DOM element as an image
 * @param element - The DOM element to export
 * @param options - Export options
 * @returns The data URL of the exported image
 */
export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportOptions
): Promise<string> {
  const { format, quality = 0.92, width, height } = options
  
  // Create canvas from the element
  const canvas = await html2canvas(element, {
    backgroundColor: format === 'jpg' ? '#FFFFFF' : null,
    scale: 2, // Higher resolution
    width,
    height,
    useCORS: true, // Allow cross-origin images
  })
  
  // Convert to data URL
  const dataUrl = format === 'jpg' 
    ? canvas.toDataURL('image/jpeg', quality) 
    : canvas.toDataURL('image/png')
  
  return dataUrl
}

/**
 * Downloads an image from a data URL
 * @param dataUrl - The data URL of the image
 * @param fileName - The file name for the download
 */
export function downloadImage(dataUrl: string, fileName: string): void {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generates a shareable link for a design
 * @param projectId - The ID of the project
 * @param projectName - The name of the project
 * @returns The shareable link
 */
export function generateShareableLink(projectId: string, projectName: string): string {
  // In a real app, this would generate a unique, possibly shortened URL
  // For now, we'll just use the project ID and name
  const baseUrl = window.location.origin
  const encodedName = encodeURIComponent(projectName)
  return `${baseUrl}/share/${projectId}/${encodedName}`
}

/**
 * Shares a design to social media
 * @param platform - The social media platform
 * @param url - The URL to share
 * @param title - The title of the share
 * @param description - The description of the share
 * @param imageUrl - The image URL to share
 */
export function shareToSocialMedia(
  platform: 'facebook' | 'twitter' | 'linkedin' | 'email',
  url: string,
  title: string,
  description?: string,
  imageUrl?: string
): void {
  let shareUrl = ''
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
      break
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`
      break
  }
  
  window.open(shareUrl, '_blank')
}

