# Lumira — Setup Guide

## 1. Supabase Setup

### Database Schema
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor** → **New query**
3. Paste the contents of `schema.sql` and click **Run**
4. This creates: `profiles` table, `subscriptions` table, RLS policies, and auto-triggers

### API Keys
1. Go to **Settings → API**
2. Copy the **anon/public** key (starts with `eyJ...`)
3. Open `supabase.js` and replace `YOUR_SUPABASE_ANON_KEY_HERE` with your key

### Google OAuth (Optional)
1. Go to **Authentication → Providers → Google**
2. Enable Google provider
3. Add your Google OAuth Client ID and Secret
4. Set the redirect URL to your site domain

---

## 2. Stripe Setup

### Create Product
1. Sign up at [stripe.com](https://stripe.com)
2. Go to **Products → Add product**
3. Name: "Lumira Pro", Price: $12/month (recurring)
4. Copy the **Price ID** (starts with `price_...`)

### Add Keys
1. Go to **Developers → API Keys**
2. Copy the **Publishable key** (starts with `pk_test_...`)
3. Open `stripe.js` and replace:
   - `pk_test_YOUR_STRIPE_KEY_HERE` with your publishable key
   - `price_YOUR_PRICE_ID_HERE` with your price ID

### Stripe Webhook (For auto-upgrading users)

Create a Supabase Edge Function to handle Stripe webhooks:

```bash
# Install Supabase CLI
npm install -g supabase

# Create edge function
supabase functions new create-checkout
```

Paste this into `supabase/functions/create-checkout/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

serve(async (req) => {
  const { priceId, email, userId, successUrl, cancelUrl } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId }
  })

  return new Response(JSON.stringify({ sessionUrl: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Deploy and set the Stripe secret key:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
supabase functions deploy create-checkout
```

### Alternative: No-Code Payment Links
If you don't want Edge Functions, use Stripe Payment Links:
1. Go to **Stripe → Payment Links → New**
2. Select your "Lumira Pro" product
3. Copy the link and paste it into `stripe.js` where it says `PAYMENT_LINK`
