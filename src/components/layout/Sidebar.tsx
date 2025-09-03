import React from 'react'
import { Home, Image, FolderOpen, Settings, Crown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userTier: 'free' | 'pro' | 'premium'
}

const navigationItems = [
  { id: 'templates', label: 'Templates', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'uploads', label: 'Uploads', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, userTier }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900">PixelSpark</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeTab === item.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Subscription Status */}
      <div className="p-4 border-t">
        <div className="bg-gradient-purple rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-5 h-5" />
            <span className="font-semibold capitalize">{userTier} Plan</span>
          </div>
          <p className="text-sm opacity-90 mb-3">
            {userTier === 'free' 
              ? 'Unlock premium templates and AI features' 
              : 'Enjoying premium features'}
          </p>
          {userTier === 'free' && (
            <button className="w-full bg-white text-purple-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}