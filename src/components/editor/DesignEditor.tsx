import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { 
  Download, 
  Share2, 
  Upload, 
  Wand2, 
  Type, 
  Square, 
  Circle,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { generateDesignSuggestions } from '../../lib/openai'
import { ShareModal } from '../sharing/ShareModal'
import { useImageProcessing } from '../../hooks/useImageProcessing'
import { useSubscription } from '../../hooks/useSubscription'
import { exportElementAsImage, downloadImage } from '../../lib/export'
// html2canvas is used indirectly via exportElementAsImage

interface Template {
  id: string
  name: string
  category: string
  preview_url: string
  is_premium: boolean
}

interface DesignEditorProps {
  template: Template
  onBack: () => void
  onSave: (projectData: any) => void
}

export function DesignEditor({ template, onBack, onSave }: DesignEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isProcessing, error, removeImageBackground } = useImageProcessing()
  const { currentTier, canUseFeature } = useSubscription()
  
  const [elements, setElements] = useState<any[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [projectName, setProjectName] = useState(`${template.name} Project`)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [designSuggestions, setDesignSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    // Initialize with template elements
    setElements([
      {
        id: '1',
        type: 'background',
        content: template.preview_url,
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        style: {}
      },
      {
        id: '2',
        type: 'text',
        content: 'Your Text Here',
        x: 50,
        y: 50,
        width: 300,
        height: 50,
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center'
        }
      }
    ])
  }, [template])

  const handleAddText = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      style: {
        fontSize: '18px',
        color: '#000000'
      }
    }
    setElements([...elements, newElement])
  }

  const handleAddShape = (shape: 'rectangle' | 'circle') => {
    const newElement = {
      id: Date.now().toString(),
      type: 'shape',
      content: shape,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      style: {
        backgroundColor: '#3B82F6',
        borderRadius: shape === 'circle' ? '50%' : '8px'
      }
    }
    setElements([...elements, newElement])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      
      // Add original image
      const newElement = {
        id: Date.now().toString(),
        type: 'image',
        content: imageUrl,
        x: 50,
        y: 100,
        width: 200,
        height: 150,
        style: {}
      }
      setElements([...elements, newElement])
      setSelectedElement(newElement.id)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBackground = async () => {
    if (!selectedElement) return

    const element = elements.find(el => el.id === selectedElement)
    if (!element || element.type !== 'image') return
    
    // Check if user can use this feature
    if (!canUseFeature('AI background removal')) {
      alert('Background removal is a premium feature. Please upgrade your plan to use it.')
      return
    }

    try {
      const processedImageUrl = await removeImageBackground(element.content)
      
      if (processedImageUrl) {
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, content: processedImageUrl }
            : el
        ))
      }
    } catch (error) {
      console.error('Failed to remove background:', error)
    }
  }

  const handleGetDesignSuggestions = async () => {
    // Check if user can use this feature
    if (!canUseFeature('Advanced AI tools')) {
      alert('AI design suggestions are a premium feature. Please upgrade your plan to use it.')
      return
    }
    
    setIsLoadingSuggestions(true)
    
    try {
      const prompt = `Design suggestions for a ${template.category} graphic with the title "${projectName}"`
      const suggestions = await generateDesignSuggestions(prompt)
      setDesignSuggestions(suggestions)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Failed to get design suggestions:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleExport = async () => {
    if (!canvasRef.current) return

    try {
      // Generate preview image
      const dataUrl = await exportElementAsImage(canvasRef.current, {
        format: 'png',
        fileName: projectName,
      })
      
      // Save preview URL for sharing
      setPreviewUrl(dataUrl)
      
      // Download the image
      downloadImage(dataUrl, `${projectName}.png`)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleShare = async () => {
    if (!canvasRef.current) return
    
    try {
      // Generate preview image if not already generated
      if (!previewUrl) {
        const dataUrl = await exportElementAsImage(canvasRef.current, {
          format: 'png',
          fileName: projectName,
        })
        setPreviewUrl(dataUrl)
      }
      
      // Open share modal
      setShowShareModal(true)
    } catch (error) {
      console.error('Share preparation failed:', error)
    }
  }

  const handleSave = async () => {
    if (!canvasRef.current) return
    
    try {
      // Generate preview image if not already generated
      if (!previewUrl) {
        const dataUrl = await exportElementAsImage(canvasRef.current, {
          format: 'png',
          fileName: projectName,
        })
        setPreviewUrl(dataUrl)
      }
      
      // Save project data
      const projectData = {
        name: projectName,
        template_id: template.id,
        elements,
        preview: previewUrl,
        created_at: new Date().toISOString()
      }
      
      onSave(projectData)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const updateElement = (id: string, updates: any) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Input 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSave}>
              Save Project
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Toolbar */}
        <div className="w-64 bg-white border-r p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleAddText}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Text
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleAddShape('rectangle')}
              >
                <Square className="w-4 h-4 mr-2" />
                Rectangle
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleAddShape('circle')}
              >
                <Circle className="w-4 h-4 mr-2" />
                Circle
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleRemoveBackground}
                disabled={isProcessing || !selectedElement}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Remove Background
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleGetDesignSuggestions}
                disabled={isLoadingSuggestions}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Design Suggestions
              </Button>
              
              {showSuggestions && designSuggestions.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Suggestions:</p>
                  <ul className="text-xs space-y-1">
                    {designSuggestions.map((suggestion, index) => (
                      <li key={index} className="p-2 bg-gray-50 rounded-md">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}
          
          {currentTier === 'free' && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-md text-xs">
              <p className="font-medium mb-1">Premium Features Available</p>
              <p>Upgrade your plan to access AI background removal, advanced design tools, and more.</p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg"
              style={{ width: '400px', height: '300px' }}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer ${
                    selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    ...element.style
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === 'background' && (
                    <img 
                      src={element.content} 
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {element.type === 'text' && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      style={element.style}
                      onBlur={(e) => {
                        updateElement(element.id, { 
                          content: e.target.textContent 
                        })
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === 'image' && (
                    <img 
                      src={element.content} 
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {element.type === 'shape' && (
                    <div 
                      className="w-full h-full"
                      style={element.style}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        imageUrl={previewUrl}
        projectName={projectName}
      />
    </div>
  )
}
