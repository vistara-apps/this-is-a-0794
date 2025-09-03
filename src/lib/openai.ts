import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // Mock implementation for demo - in production, use actual background removal API
    console.log('Processing background removal for:', imageUrl)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return the same image for demo purposes
    // In production, this would return the processed image
    return imageUrl
  } catch (error) {
    console.error('Background removal failed:', error)
    throw new Error('Failed to remove background')
  }
}

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