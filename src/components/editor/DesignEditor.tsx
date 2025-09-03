import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { 
  Download, 
  Share2, 
  Upload, 
  Wand2, 
  Type, 
  Square, 
  Circle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { removeBackground } from '../../lib/openai'
import html2canvas from 'html2canvas'

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
  const [elements, setElements] = useState<any[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [projectName, setProjectName] = useState(`${template.name} Project`)

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
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBackground = async () => {
    if (!selectedElement) return

    const element = elements.find(el => el.id === selectedElement)
    if (!element || element.type !== 'image') return

    setIsProcessing(true)
    try {
      const processedImageUrl = await removeBackground(element.content)
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, content: processedImageUrl }
          : el
      ))
    } catch (error) {
      console.error('Failed to remove background:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `${projectName}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleSave = () => {
    const projectData = {
      name: projectName,
      template_id: template.id,
      elements,
      created_at: new Date().toISOString()
    }
    onSave(projectData)
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

          {selectedElement && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Remove Background
                </Button>
              </CardContent>
            </Card>
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
    </div>
  )
}