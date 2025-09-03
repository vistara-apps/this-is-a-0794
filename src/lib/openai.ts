import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

/**
 * Converts a data URL to a Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

/**
 * Converts a Blob to a data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Removes the background from an image using OpenAI's API
 * @param imageUrl - URL or data URL of the image
 * @returns A data URL of the image with background removed
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // For demo/development without API key
    if (import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
      console.log('Using mock background removal for:', imageUrl)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return imageUrl
    }
    
    console.log('Processing background removal for:', imageUrl)
    
    // Convert to blob if it's a data URL
    let imageBlob: Blob
    if (imageUrl.startsWith('data:')) {
      imageBlob = dataURLtoBlob(imageUrl)
    } else {
      // Fetch the image if it's a URL
      const response = await fetch(imageUrl)
      imageBlob = await response.blob()
    }
    
    // Create a FormData object to send the image
    const formData = new FormData()
    formData.append('image', imageBlob)
    formData.append('model', 'background-removal')
    
    // Call the background removal API
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Background removal API error')
    }
    
    const data = await response.json()
    const processedImageUrl = data.data[0].url
    
    // Fetch the processed image and convert to data URL
    const processedImageResponse = await fetch(processedImageUrl)
    const processedImageBlob = await processedImageResponse.blob()
    const processedImageDataUrl = await blobToDataURL(processedImageBlob)
    
    return processedImageDataUrl
  } catch (error) {
    console.error('Background removal failed:', error)
    throw new Error('Failed to remove background')
  }
}

/**
 * Generates design suggestions based on a prompt
 * @param prompt - The design prompt
 * @returns An array of design suggestions
 */
export async function generateDesignSuggestions(prompt: string): Promise<string[]> {
  try {
    // For demo/development without API key
    if (import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
      console.log('Using mock design suggestions for:', prompt)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return [
        'Try a bold gradient background',
        'Add some geometric shapes',
        'Use contrasting text colors'
      ]
    }
    
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful design assistant. Generate 3 creative design suggestions based on the user prompt. Return only the suggestions as a JSON array of strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    try {
      return JSON.parse(content)
    } catch {
      // Fallback if JSON parsing fails
      return [
        'Try a bold gradient background',
        'Add some geometric shapes',
        'Use contrasting text colors'
      ]
    }
  } catch (error) {
    console.error('AI suggestions failed:', error)
    return [
      'Try a bold gradient background',
      'Add some geometric shapes', 
      'Use contrasting text colors'
    ]
  }
}
