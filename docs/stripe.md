# Stripe Integration Guide

This document provides detailed information about the Stripe integration in PixelSpark for subscription management and payment processing.

## Table of Contents

1. [Setup](#setup)
2. [Subscription Plans](#subscription-plans)
3. [Checkout Flow](#checkout-flow)
4. [Customer Portal](#customer-portal)
5. [Webhooks](#webhooks)
6. [Feature Access Control](#feature-access-control)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

## Setup

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Stripe Client

Initialize the Stripe client in your server-side code:

```javascript
// server.js
const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);
```

For client-side initialization:

```typescript
// src/lib/stripe.ts
export function initStripe(): void {
  // Load Stripe.js script
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/';
  script.async = true;
  document.body.appendChild(script);
}
```

## Subscription Plans

Define your subscription plans in Stripe and reference them in your application:

```typescript
// src/lib/stripe.ts
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    interval: 'month',
    features: [
      'Access to basic templates',
      'Limited exports (5/month)',
      'Standard quality exports',
      'Community support'
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    tier: 'pro',
    price: 5,
    interval: 'month',
    features: [
      'Access to all templates',
      'Unlimited exports',
      'High quality exports',
      'AI background removal',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    tier: 'premium',
    price: 15,
    interval: 'month',
    features: [
      'Access to all templates',
      'Unlimited exports',
      'Maximum quality exports',
      'Advanced AI tools',
      'Custom branding',
      'Team collaboration',
      'Priority support'
    ]
  }
];
```

### Creating Products and Prices in Stripe

Create your products and prices in the Stripe dashboard or using the Stripe API:

```javascript
// Create a product
const product = await stripe.products.create({
  name: 'Pro Plan',
  description: 'Professional plan with premium features',
});

// Create a price for the product
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 500, // $5.00
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});
```

## Checkout Flow

### Creating a Checkout Session

```typescript
// Client-side
export async function createCheckoutSession(
  planId: string,
  userId: string
): Promise<string> {
  // Call your server endpoint to create a checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planId,
      userId,
    }),
  });

  const data = await response.json();
  return data.url;
}

// Server-side
app.post('/api/create-checkout-session', async (req, res) => {
  const { planId, userId } = req.body;

  // Get user from database
  const user = await getUserById(userId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cancel`,
  });

  res.json({ url: session.url });
});
```

### Handling Checkout Success

```typescript
// Client-side
const handleCheckoutSuccess = async (sessionId: string) => {
  // Call your server endpoint to verify the session
  const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
  const data = await response.json();

  if (data.success) {
    // Update user subscription tier in your database
    await updateUserSubscription(data.userId, data.tier);
    
    // Show success message
    showSuccessMessage('Subscription activated successfully!');
    
    // Redirect to dashboard
    navigate('/dashboard');
  } else {
    // Show error message
    showErrorMessage('Failed to verify subscription. Please contact support.');
  }
};

// Server-side
app.get('/api/verify-checkout-session', async (req, res) => {
  const { session_id } = req.query;

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Get the price
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    
    // Get the product
    const product = await stripe.products.retrieve(price.product);
    
    // Determine the subscription tier from the product metadata
    const tier = product.metadata.tier || 'pro';
    
    // Update user subscription in your database
    await updateUserSubscriptionInDatabase(session.client_reference_id, tier);
    
    res.json({
      success: true,
      userId: session.client_reference_id,
      tier,
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});
```

## Customer Portal

### Redirecting to Customer Portal

```typescript
// Client-side
export async function redirectToCustomerPortal(userId: string): Promise<void> {
  // Call your server endpoint to create a customer portal session
  const response = await fetch('/api/create-customer-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
    }),
  });

  const data = await response.json();
  
  // Redirect to the customer portal
  window.location.href = data.url;
}

// Server-side
app.post('/api/create-customer-portal-session', async (req, res) => {
  const { userId } = req.body;

  // Get user from database
  const user = await getUserById(userId);

  // Get Stripe customer ID
  let customerId = user.stripeCustomerId;

  // If user doesn't have a Stripe customer ID, create one
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId,
      },
    });
    
    customerId = customer.id;
    
    // Update user with Stripe customer ID
    await updateUserStripeCustomerId(userId, customerId);
  }

  // Create customer portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.DOMAIN}/settings`,
  });

  res.json({ url: session.url });
});
```

## Webhooks

Stripe webhooks are essential for handling subscription lifecycle events.

### Setting Up Webhooks

1. Create a webhook endpoint in your server:

```javascript
// server.js
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.VITE_STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionChange(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionCancelled(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

2. Register your webhook endpoint in the Stripe dashboard:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe-webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### Handling Webhook Events

```javascript
// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  // Get the user ID from the client reference ID
  const userId = session.client_reference_id;
  
  // Get the subscription
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Get the price
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  
  // Get the product
  const product = await stripe.products.retrieve(price.product);
  
  // Determine the subscription tier from the product metadata
  const tier = product.metadata.tier || 'pro';
  
  // Update user subscription in your database
  await updateUserSubscriptionInDatabase(userId, tier);
}

// Handle subscription change
async function handleSubscriptionChange(subscription) {
  // Get the customer
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Get the user ID from the customer metadata
  const userId = customer.metadata.userId;
  
  // Get the price
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  
  // Get the product
  const product = await stripe.products.retrieve(price.product);
  
  // Determine the subscription tier from the product metadata
  const tier = product.metadata.tier || 'pro';
  
  // Update user subscription in your database
  await updateUserSubscriptionInDatabase(userId, tier);
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(subscription) {
  // Get the customer
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Get the user ID from the customer metadata
  const userId = customer.metadata.userId;
  
  // Downgrade user to free tier
  await updateUserSubscriptionInDatabase(userId, 'free');
}
```

## Feature Access Control

Implement feature access control based on the user's subscription tier:

```typescript
// src/lib/stripe.ts
export function isFeatureAvailable(
  feature: string,
  tier: SubscriptionTier
): boolean {
  // Get the plan for the tier
  const plan = subscriptionPlans.find(p => p.tier === tier && p.interval === 'month');
  
  if (!plan) return false;
  
  return plan.features.includes(feature);
}

// Usage in components
const { currentTier, canUseFeature } = useSubscription();

const handleRemoveBackground = async () => {
  // Check if user can use this feature
  if (!canUseFeature('AI background removal')) {
    alert('Background removal is a premium feature. Please upgrade your plan to use it.');
    return;
  }
  
  // Proceed with background removal
  // ...
};
```

## Testing

### Test Cards

Use these test card numbers for testing Stripe payments:

- Successful payment: `4242 4242 4242 4242`
- Payment requires authentication: `4000 0025 0000 3155`
- Payment declined: `4000 0000 0000 9995`

### Test Webhooks

Use the Stripe CLI to test webhooks locally:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to your Stripe account: `stripe login`
3. Forward webhooks to your local server: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
4. Trigger test webhook events: `stripe trigger checkout.session.completed`

## Best Practices

1. **Security**: Never expose your Stripe secret key in client-side code. Use environment variables and server-side endpoints.

2. **Error Handling**: Implement proper error handling for all Stripe API calls.

```typescript
try {
  const checkoutUrl = await createCheckoutSession(planId, userId);
  window.location.href = checkoutUrl;
} catch (error) {
  console.error('Failed to create checkout session:', error);
  showErrorMessage('Payment processing failed. Please try again later.');
}
```

3. **Idempotency**: Use idempotency keys for critical operations to prevent duplicate charges.

```javascript
const session = await stripe.checkout.sessions.create(
  {
    // Checkout session parameters
  },
  {
    idempotencyKey: `checkout_${userId}_${planId}_${Date.now()}`,
  }
);
```

4. **Metadata**: Use metadata to store additional information about customers and subscriptions.

```javascript
const customer = await stripe.customers.create({
  email: user.email,
  metadata: {
    userId: user.id,
    referralSource: user.referralSource,
  },
});
```

5. **Subscription Management**: Provide clear UI for users to manage their subscriptions.

```typescript
// In settings component
const { currentTier, manageSubscription } = useSubscription();

return (
  <div>
    <h2>Subscription</h2>
    <p>Current Plan: {currentTier}</p>
    <Button onClick={manageSubscription}>
      {currentTier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
    </Button>
  </div>
);
```

6. **Graceful Degradation**: Handle cases where Stripe is unavailable or the user's subscription status is unknown.

```typescript
// Default to free tier if subscription status is unknown
const tier = user.subscription_tier || 'free';

// Disable premium features if subscription status is unknown
const isPremiumFeatureAvailable = user.subscription_tier === 'premium';
```

7. **Testing**: Thoroughly test the subscription flow, including edge cases like subscription cancellation and upgrades/downgrades.

```typescript
// Test subscription upgrade
test('User can upgrade from free to pro', async () => {
  // Mock Stripe API responses
  // ...
  
  // Simulate upgrade flow
  await upgradeSubscription(userId, 'pro-monthly');
  
  // Verify user subscription was updated
  const updatedUser = await getUserById(userId);
  expect(updatedUser.subscription_tier).toBe('pro');
});
```

