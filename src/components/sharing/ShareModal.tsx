import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Copy, Check, Facebook, Twitter, Linkedin, Mail, Download } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  projectName: string
}

export function ShareModal({ isOpen, onClose, imageUrl, projectName }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png')
  
  // Generate a share URL - in a real app, this would be a unique URL
  const shareUrl = `${window.location.origin}/share/${encodeURIComponent(projectName)}`
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `${projectName}.${downloadFormat}`
    link.href = imageUrl
    link.click()
  }
  
  const handleSocialShare = (platform: string) => {
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out my design created with PixelSpark: ${projectName}`)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out my design: ${projectName}`)}&body=${encodeURIComponent(`I created this design with PixelSpark. Check it out: ${window.location.href}`)}`
        break
    }
    
    window.open(shareUrl, '_blank')
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your design</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt={projectName}
              className="max-h-48 rounded-md shadow-md"
            />
          </div>
          
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Share Link</label>
            <div className="flex">
              <Input 
                value={shareUrl}
                readOnly
                className="rounded-r-none"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="rounded-l-none"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Social Sharing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Share on Social Media</label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSocialShare('facebook')}
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSocialShare('twitter')}
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSocialShare('email')}
                title="Share via Email"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Download Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Download</label>
            <div className="flex space-x-2">
              <Button 
                variant={downloadFormat === 'png' ? 'default' : 'outline'}
                onClick={() => setDownloadFormat('png')}
                className="flex-1"
              >
                PNG
              </Button>
              <Button 
                variant={downloadFormat === 'jpg' ? 'default' : 'outline'}
                onClick={() => setDownloadFormat('jpg')}
                className="flex-1"
              >
                JPG
              </Button>
              <Button 
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
