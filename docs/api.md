# PixelSpark API Documentation

This document provides comprehensive documentation for all API integrations used in the PixelSpark application.

## Table of Contents

1. [Supabase Integration](#supabase-integration)
2. [OpenAI Integration](#openai-integration)
3. [Stripe Integration](#stripe-integration)
4. [Internal API Services](#internal-api-services)

## Supabase Integration

PixelSpark uses Supabase for authentication, database, and storage services.

### Authentication

#### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'User Name'
    }
  }
})
```

#### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

#### Sign Out

```typescript
await supabase.auth.signOut()
```

### Database Operations

#### Users

```typescript
// Get user profile
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Update user profile
const { data, error } = await supabase
  .from('users')
  .update({ subscription_tier: 'pro' })
  .eq('id', userId)
```

#### Projects

```typescript
// Get all projects for a user
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false })

// Get a specific project
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single()

// Create a new project
const { data, error } = await supabase
  .from('projects')
  .insert([
    {
      user_id: userId,
      name: 'Project Name',
      template_id: templateId,
      design_data: designData,
      preview_url: previewUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])
  .select()
  .single()

// Update a project
const { data, error } = await supabase
  .from('projects')
  .update({
    name: 'New Project Name',
    design_data: newDesignData,
    updated_at: new Date().toISOString()
  })
  .eq('id', projectId)
  .select()
  .single()

// Delete a project
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
```

#### Templates

```typescript
// Get all templates
const { data, error } = await supabase
  .from('templates')
  .select('*')
  .order('name')

// Get templates by category
const { data, error } = await supabase
  .from('templates')
  .select('*')
  .eq('category', category)
  .order('name')

// Get a specific template
const { data, error } = await supabase
  .from('templates')
  .select('*')
  .eq('id', templateId)
  .single()
```

### Storage Operations

```typescript
// Upload an image
const { data, error } = await supabase
  .storage
  .from('assets')
  .upload(filePath, file)

// Get public URL for an image
const { data: { publicUrl } } = supabase
  .storage
  .from('assets')
  .getPublicUrl(filePath)

// Delete an image
const { error } = await supabase
  .storage
  .from('assets')
  .remove([filePath])
```

## OpenAI Integration

PixelSpark uses OpenAI for AI-powered features like background removal and design suggestions.

### Background Removal

```typescript
// Remove background from an image
const processedImageUrl = await removeBackground(imageUrl)

// Implementation
async function removeBackground(imageUrl: string): Promise<string> {
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
  
  const data = await response.json()
  const processedImageUrl = data.data[0].url
  
  return processedImageUrl
}
```

### Design Suggestions

```typescript
// Generate design suggestions
const suggestions = await generateDesignSuggestions(prompt)

// Implementation
async function generateDesignSuggestions(prompt: string): Promise<string[]> {
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

  return JSON.parse(content)
}
```

## Stripe Integration

PixelSpark uses Stripe for subscription management and payment processing.

### Create Checkout Session

```typescript
// Create a checkout session
const checkoutUrl = await createCheckoutSession(planId, userId)

// Implementation (server-side)
async function createCheckoutSession(planId: string, userId: string): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cancel`,
  })

  return session.url
}
```

### Customer Portal

```typescript
// Redirect to customer portal
await redirectToCustomerPortal(userId)

// Implementation (server-side)
async function redirectToCustomerPortal(userId: string): Promise<string> {
  const customer = await stripe.customers.retrieve(userId)
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${process.env.DOMAIN}/settings`,
  })

  return session.url
}
```

## Internal API Services

PixelSpark uses several internal API services to manage data and operations.

### Projects API

```typescript
// Get all projects for a user
const { data, error } = await projectsApi.getProjects(userId)

// Get a specific project
const { data, error } = await projectsApi.getProject(projectId)

// Create a new project
const { data, error } = await projectsApi.createProject(userId, {
  name: 'Project Name',
  template_id: templateId,
  design_data: designData,
  preview_url: previewUrl
})

// Update a project
const { data, error } = await projectsApi.updateProject(projectId, {
  name: 'New Project Name',
  design_data: newDesignData
})

// Delete a project
const { error } = await projectsApi.deleteProject(projectId)
```

### Templates API

```typescript
// Get all templates
const { data, error } = await templatesApi.getTemplates()

// Get templates by category
const { data, error } = await templatesApi.getTemplatesByCategory(category)

// Get a specific template
const { data, error } = await templatesApi.getTemplate(templateId)
```

### Assets API

```typescript
// Upload an image
const { data, error } = await assetsApi.uploadImage(userId, file, projectId)

// Get all assets for a user
const { data, error } = await assetsApi.getUserAssets(userId)

// Delete an asset
const { error } = await assetsApi.deleteAsset(assetId)
```

### Export API

```typescript
// Export an element as an image
const dataUrl = await exportElementAsImage(element, {
  format: 'png',
  quality: 0.92,
  fileName: 'export.png'
})

// Download an image
downloadImage(dataUrl, 'export.png')

// Generate a shareable link
const shareableLink = generateShareableLink(projectId, projectName)

// Share to social media
shareToSocialMedia('twitter', url, title, description, imageUrl)
```

