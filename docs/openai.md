# OpenAI Integration Guide

This document provides detailed information about the OpenAI integration in PixelSpark.

## Table of Contents

1. [Setup](#setup)
2. [Background Removal](#background-removal)
3. [Design Suggestions](#design-suggestions)
4. [Error Handling](#error-handling)
5. [Best Practices](#best-practices)
6. [Fallback Mechanisms](#fallback-mechanisms)

## Setup

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_OPENAI_API_KEY=your_openai_api_key
```

### OpenAI Client

Initialize the OpenAI client in `src/lib/openai.ts`:

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})
```

## Background Removal

The background removal feature uses OpenAI's image editing capabilities to remove backgrounds from user-uploaded images.

### Implementation

```typescript
/**
 * Removes the background from an image using OpenAI's API
 * @param imageUrl - URL or data URL of the image
 * @returns A data URL of the image with background removed
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
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
```

### Usage

```typescript
// In a component
const { isProcessing, error, removeImageBackground } = useImageProcessing()

const handleRemoveBackground = async () => {
  try {
    const processedImageUrl = await removeImageBackground(imageUrl)
    // Update UI with processed image
  } catch (error) {
    console.error('Failed to remove background:', error)
  }
}
```

## Design Suggestions

The design suggestions feature uses OpenAI's language models to generate creative design ideas based on the user's project.

### Implementation

```typescript
/**
 * Generates design suggestions based on a prompt
 * @param prompt - The design prompt
 * @returns An array of design suggestions
 */
export async function generateDesignSuggestions(prompt: string): Promise<string[]> {
  try {
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
```

### Usage

```typescript
// In a component
const [designSuggestions, setDesignSuggestions] = useState<string[]>([])
const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

const handleGetDesignSuggestions = async () => {
  setIsLoadingSuggestions(true)
  
  try {
    const prompt = `Design suggestions for a ${category} graphic with the title "${projectName}"`
    const suggestions = await generateDesignSuggestions(prompt)
    setDesignSuggestions(suggestions)
  } catch (error) {
    console.error('Failed to get design suggestions:', error)
  } finally {
    setIsLoadingSuggestions(false)
  }
}
```

## Error Handling

Proper error handling is crucial when working with AI APIs, as they can sometimes be unpredictable or have rate limits.

### Background Removal Errors

```typescript
try {
  const processedImageUrl = await removeBackground(imageUrl)
  // Success
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limit error
    showErrorMessage('You have reached the API rate limit. Please try again later.')
  } else if (error.message.includes('invalid image')) {
    // Handle invalid image error
    showErrorMessage('The image format is not supported. Please try a different image.')
  } else {
    // Handle general error
    showErrorMessage('Failed to remove background. Please try again.')
  }
}
```

### Design Suggestions Errors

```typescript
try {
  const suggestions = await generateDesignSuggestions(prompt)
  // Success
} catch (error) {
  // Fallback to default suggestions
  const defaultSuggestions = [
    'Try a bold gradient background',
    'Add some geometric shapes',
    'Use contrasting text colors'
  ]
  setDesignSuggestions(defaultSuggestions)
  
  // Show error message
  showErrorMessage('Failed to generate design suggestions. Using default suggestions instead.')
}
```

## Best Practices

1. **API Key Security**: Never expose your OpenAI API key in client-side code. Use environment variables and server-side proxies when possible.

2. **Rate Limiting**: Implement rate limiting to prevent excessive API calls and control costs.

```typescript
// Simple rate limiting
const lastCallTime = localStorage.getItem('lastAICallTime')
const now = Date.now()

if (lastCallTime && now - parseInt(lastCallTime) < 5000) {
  // Less than 5 seconds since last call
  showErrorMessage('Please wait a moment before making another request.')
  return
}

// Make API call
localStorage.setItem('lastAICallTime', now.toString())
```

3. **Caching**: Cache API responses when possible to reduce API calls and improve performance.

```typescript
// Check cache first
const cacheKey = `background-removal-${imageHash}`
const cachedResult = localStorage.getItem(cacheKey)

if (cachedResult) {
  return JSON.parse(cachedResult)
}

// Make API call
const result = await removeBackground(imageUrl)

// Cache result
localStorage.setItem(cacheKey, JSON.stringify(result))
```

4. **Progressive Enhancement**: Design your app to work without AI features, then enhance with AI when available.

```typescript
// Check if API key is available
const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

// Enable or disable AI features
setAIFeaturesEnabled(hasApiKey)
```

5. **User Feedback**: Provide clear feedback to users about AI processing status.

```typescript
// Show loading state
setIsProcessing(true)

try {
  // Make API call
} catch (error) {
  // Handle error
} finally {
  // Hide loading state
  setIsProcessing(false)
}
```

## Fallback Mechanisms

Implement fallback mechanisms for when the OpenAI API is unavailable or returns errors.

### Background Removal Fallback

```typescript
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // Try OpenAI API
    return await removeBackgroundWithOpenAI(imageUrl)
  } catch (error) {
    console.error('OpenAI background removal failed:', error)
    
    try {
      // Fallback to alternative API
      return await removeBackgroundWithAlternativeAPI(imageUrl)
    } catch (fallbackError) {
      console.error('Alternative background removal failed:', fallbackError)
      
      // Return original image as last resort
      return imageUrl
    }
  }
}
```

### Design Suggestions Fallback

```typescript
export async function generateDesignSuggestions(prompt: string): Promise<string[]> {
  try {
    // Try OpenAI API
    return await generateSuggestionsWithOpenAI(prompt)
  } catch (error) {
    console.error('OpenAI suggestions failed:', error)
    
    // Fallback to predefined suggestions based on prompt keywords
    if (prompt.includes('social media')) {
      return [
        'Use bright, attention-grabbing colors',
        'Keep text concise and readable',
        'Include a clear call-to-action'
      ]
    } else if (prompt.includes('business')) {
      return [
        'Maintain a professional color scheme',
        'Use clean, minimal layouts',
        'Ensure typography is consistent'
      ]
    } else {
      return [
        'Try a bold gradient background',
        'Add some geometric shapes',
        'Use contrasting text colors'
      ]
    }
  }
}
```

