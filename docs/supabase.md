# Supabase Integration Guide

This document provides detailed information about the Supabase integration in PixelSpark.

## Table of Contents

1. [Setup](#setup)
2. [Database Schema](#database-schema)
3. [Authentication](#authentication)
4. [Storage](#storage)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Best Practices](#best-practices)

## Setup

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Client

Initialize the Supabase client in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Projects Table

```sql
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates NOT NULL,
  design_data JSONB,
  preview_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

### Templates Table

```sql
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  elements JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Templates are viewable by all users" ON templates
  FOR SELECT USING (true);
```

### Assets Table

```sql
CREATE TABLE assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  project_id UUID REFERENCES projects,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'background', 'shape')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);
```

## Authentication

### User Registration

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name
    }
  }
})

// Create user profile
if (!error && data.user) {
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      { 
        id: data.user.id,
        email,
        name,
        subscription_tier: 'free'
      }
    ])
}
```

### User Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### User Logout

```typescript
await supabase.auth.signOut()
```

### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    // Handle auth state change
  }
)

// Unsubscribe
subscription.unsubscribe()
```

## Storage

### Storage Buckets

Create the following storage buckets in your Supabase project:

1. `assets` - For user-uploaded images and assets
2. `templates` - For template preview images
3. `exports` - For exported designs

### Storage Policies

```sql
-- Assets bucket policies
CREATE POLICY "Users can view their own assets" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own assets" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own assets" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own assets" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Templates bucket policies (read-only for all users)
CREATE POLICY "Templates are viewable by all users" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates');

-- Exports bucket policies
CREATE POLICY "Users can view their own exports" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own exports" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### File Upload

```typescript
// Upload an image
const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
const { data, error } = await supabase
  .storage
  .from('assets')
  .upload(filePath, file)

// Get public URL
const { data: { publicUrl } } = supabase
  .storage
  .from('assets')
  .getPublicUrl(filePath)
```

### File Deletion

```typescript
// Delete an image
const { error } = await supabase
  .storage
  .from('assets')
  .remove([filePath])
```

## Row Level Security (RLS)

Row Level Security (RLS) is a critical feature in Supabase that ensures users can only access their own data. Here's how it's implemented in PixelSpark:

### Users Table

- Users can only view and update their own data
- Users cannot delete their own user record (handled by auth.users)

### Projects Table

- Users can only view, insert, update, and delete their own projects
- Projects are linked to users via the `user_id` field

### Templates Table

- Templates are viewable by all users (read-only)
- Only admins can insert, update, or delete templates (handled outside the app)

### Assets Table

- Users can only view, insert, update, and delete their own assets
- Assets are linked to users via the `user_id` field

## Best Practices

1. **Error Handling**: Always check for errors in Supabase responses and handle them appropriately.

```typescript
const { data, error } = await supabase.from('projects').select('*')
if (error) {
  console.error('Error fetching projects:', error)
  // Handle error (e.g., show error message to user)
} else {
  // Process data
}
```

2. **Optimistic Updates**: For better UX, update the UI optimistically before waiting for the Supabase response.

```typescript
// Add new project to local state immediately
setProjects(prev => [newProject, ...prev])

// Then update in database
const { error } = await supabase.from('projects').insert([newProject])

// If error, revert local state
if (error) {
  setProjects(prev => prev.filter(p => p.id !== newProject.id))
  console.error('Error creating project:', error)
}
```

3. **Batch Operations**: Use batch operations when possible to reduce the number of API calls.

```typescript
// Instead of multiple insert calls
const { error } = await supabase.from('projects').insert([project1, project2, project3])
```

4. **Subscriptions**: Use Supabase's real-time subscriptions for collaborative features.

```typescript
const subscription = supabase
  .from('projects')
  .on('*', payload => {
    // Handle real-time updates
  })
  .subscribe()

// Unsubscribe when done
subscription.unsubscribe()
```

5. **Pagination**: Implement pagination for large datasets.

```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .range(0, 9) // First 10 items
  .order('created_at', { ascending: false })
```

