import { useState, useEffect } from 'react'
import { Search, Filter, Crown, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'
import { useTemplates } from '../../context/TemplateContext'
import { useSubscription } from '../../hooks/useSubscription'
import { Template } from '../../lib/api'

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void
  userTier: 'free' | 'pro' | 'premium'
}

export function TemplateLibrary({ onSelectTemplate, userTier }: TemplateLibraryProps) {
  const { templates, categories, isLoading, error, fetchTemplates } = useTemplates()
  const { } = useSubscription()
  
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Filter templates when templates, category, or search term changes
  useEffect(() => {
    if (!templates.length) return
    
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

  // Show loading state
  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  // Get all available categories
  const allCategories = ['All', ...categories]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Template</h1>
        <p className="text-gray-600">Start with professionally designed templates</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

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
          {allCategories.map((category) => (
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
      {filteredTemplates.length > 0 ? (
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
      ) : (
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
