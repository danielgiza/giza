import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, RefreshCw, Lock, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const STRIPE_API_URL = 'https://giza-stripe-backend-cjbnzsld.fly.dev'

const plans: Record<string, { name: string; price: number }> = {
  starter: { name: 'Starter', price: 299 },
  professional: { name: 'Professional', price: 599 },
  enterprise: { name: 'Enterprise', price: 999 },
}

export default function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') || ''
  const plan = plans[planId]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
    if (!plan) navigate('/pricing')
  }, [user, plan, navigate])

  const handleStripeCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          customer_email: user?.email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Payment failed')
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError('No checkout URL received. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!plan) return null

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pricing
        </button>

        <div className="card !p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Order Summary</h2>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
              <p className="text-white font-medium">Quantum Edge V2.0 — {plan.name}</p>
              <p className="text-sm text-gray-400">One-time payment · Lifetime access</p>
            </div>
            <span className="text-2xl font-black text-white">${plan.price}</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-gray-400 font-medium">Total</span>
            <span className="text-2xl font-black text-accent">${plan.price}</span>
          </div>
        </div>

        <div className="card !p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-primary-light" />
            <h2 className="text-lg font-bold text-white">Secure Payment</h2>
          </div>

          <p className="text-gray-400 text-sm mb-5">
            You will be redirected to Stripe's secure checkout page to complete your payment. Your card details are handled entirely by Stripe.
          </p>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            onClick={handleStripeCheckout}
            disabled={loading}
            className="btn-primary w-full justify-center !py-3.5 !text-base disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Redirecting to Stripe...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Pay ${plan.price} with Stripe</>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5" /> 256-bit SSL
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5" /> Powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
