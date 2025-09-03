import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { PricingPlans } from './PricingPlans'
import { SubscriptionPlan, SubscriptionTier, createCheckoutSession, redirectToCustomerPortal } from '../../lib/stripe'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user, profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const currentTier = profile?.subscription_tier || 'free'
  
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real implementation, this would redirect to Stripe Checkout
      const checkoutUrl = await createCheckoutSession(plan.id, user.id)
      
      // For demo purposes, we'll just update the user's subscription tier
      // In a real app, this would happen after a successful Stripe webhook event
      await updateProfile({ subscription_tier: plan.tier })
      
      // Close the modal
      onClose()
      
      // In a real app, this would redirect to Stripe Checkout
      // window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err.message || 'Failed to process subscription')
      console.error('Subscription error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleManageSubscription = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      await redirectToCustomerPortal(user.id)
    } catch (err: any) {
      console.error('Failed to redirect to customer portal:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Subscription Plans</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            <p className="mt-4 text-gray-600">Processing your request...</p>
          </div>
        ) : (
          <>
            <PricingPlans 
              currentTier={currentTier} 
              onSelectPlan={handleSelectPlan} 
            />
            
            {currentTier !== 'free' && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                >
                  Manage Current Subscription
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

