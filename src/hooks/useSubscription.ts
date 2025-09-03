import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { SubscriptionTier, SubscriptionPlan, createCheckoutSession, redirectToCustomerPortal, isFeatureAvailable } from '../lib/stripe'

interface UseSubscriptionReturn {
  currentTier: SubscriptionTier
  isLoading: boolean
  error: string | null
  upgradeToPlan: (plan: SubscriptionPlan) => Promise<void>
  manageSubscription: () => Promise<void>
  canUseFeature: (feature: string) => boolean
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const currentTier = profile?.subscription_tier || 'free'
  
  /**
   * Upgrades the user to a new subscription plan
   */
  const upgradeToPlan = async (plan: SubscriptionPlan): Promise<void> => {
    if (!user) {
      setError('User not authenticated')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real implementation, this would redirect to Stripe Checkout
      await createCheckoutSession(plan.id, user.id)
      
      // For demo purposes, we'll just update the user's subscription tier
      // In a real app, this would happen after a successful Stripe webhook event
      await updateProfile({ subscription_tier: plan.tier })
      
      // In a real app, this would redirect to Stripe Checkout
      // window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err.message || 'Failed to process subscription')
      console.error('Subscription error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Redirects the user to the Stripe customer portal
   */
  const manageSubscription = async (): Promise<void> => {
    if (!user) {
      setError('User not authenticated')
      return
    }
    
    setIsLoading(true)
    
    try {
      await redirectToCustomerPortal(user.id)
    } catch (err: any) {
      setError(err.message || 'Failed to redirect to customer portal')
      console.error('Failed to redirect to customer portal:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Checks if the user can use a specific feature
   */
  const canUseFeature = (feature: string): boolean => {
    return isFeatureAvailable(feature, currentTier)
  }
  
  return {
    currentTier,
    isLoading,
    error,
    upgradeToPlan,
    manageSubscription,
    canUseFeature
  }
}
