import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Check, Crown } from 'lucide-react'
import { subscriptionPlans, SubscriptionPlan, SubscriptionTier } from '../../lib/stripe'
import { cn } from '../../lib/utils'

interface PricingPlansProps {
  currentTier: SubscriptionTier
  onSelectPlan: (plan: SubscriptionPlan) => void
}

export function PricingPlans({ currentTier, onSelectPlan }: PricingPlansProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-2 text-gray-600">
          Select the plan that best fits your needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = plan.tier === currentTier
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "flex flex-col",
                plan.popular && "border-purple-400 shadow-lg",
                isCurrentPlan && "bg-purple-50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-gradient-purple text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.interval}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className={cn("w-full", 
                    plan.popular ? "bg-gradient-purple hover:bg-purple-700" : "",
                    isCurrentPlan ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                  onClick={() => onSelectPlan(plan)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          All plans include secure payment processing through Stripe.
          You can cancel or change your subscription at any time.
        </p>
      </div>
    </div>
  )
}

