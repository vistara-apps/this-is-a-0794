import React, { useState, useEffect } from 'react'
import { Search, Filter, Crown } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'

interface Template {
  id: string
  name: string
  category: string
  preview_url: string
  is_premium: boolean
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void
  userTier: 'free' | 'pro' | 'premium'
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Social Media Post',
    category: 'Social Media',
    preview_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop',
    is_premium: false
  },
  {
    id: '2', 
    name: 'Instagram Story',
    category: 'Social Media',
    preview_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&h=600&fit=crop',
    is_premium: true
  },
  {
    id: '3',
    name: 'Business Card',
    category: 'Business',
    preview_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop',
    is_premium: false
  },
  {
    id: '4',
    name: 'Presentation Slide',
    category: 'Presentation',
    preview_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    is_premium: true
  },
  {
    id: '5',
    name: 'YouTube Thumbnail',
    category: 'Social Media',
    preview_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
    is_premium: false
  },
  {
    id: '6',
    name: 'Logo Design',
    category: 'Branding',
    preview_url: 'https://images.unsplash.com/photo-1614851099175-e5b30eb5ce14?w=400&h=400&fit=crop',
    is_premium: true
  }
]

const categories = ['All', 'Social Media', 'Business', 'Presentation', 'Branding']

export function TemplateLibrary({ onSelectTemplate, userTier }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchTerm])

  const canAccessTemplate = (template: Template) => {
    return !template.is_premium || userTier !== 'free'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Template</h1>
        <p className="text-gray-600">Start with professionally designed templates</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg",
              !canAccessTemplate(template) && "opacity-75"
            )}
            onClick={() => {
              if (canAccessTemplate(template)) {
                onSelectTemplate(template)
              }
            }}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={template.preview_url}
                  alt={template.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {template.is_premium && (
                  <div className="absolute top-2 right-2 bg-gradient-purple text-white px-2 py-1 rounded-md flex items-center space-x-1 text-xs">
                    <Crown className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                )}
                {!canAccessTemplate(template) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Crown className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Premium Template</p>
                      <p className="text-xs opacity-90">Upgrade to access</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.category}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}