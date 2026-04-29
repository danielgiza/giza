import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Lock, ShieldCheck, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'

const plans: Record<string, { name: string; price: number }> = {
  starter: { name: 'Starter', price: 299 },
  professional: { name: 'Professional', price: 599 },
  enterprise: { name: 'Enterprise', price: 999 },
}

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') || ''
  const plan = plans[planId]

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [email, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!plan) navigate('/pricing')
  }, [plan, navigate])

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    const digits = cardNumber.replace(/\s/g, '')
    if (digits.length < 16) {
      setError('Please enter a valid card number.')
      return
    }
    if (!cardName.trim()) {
      setError('Please enter the cardholder name.')
      return
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).')
      return
    }
    if (cvc.length < 3) {
      setError('Please enter a valid CVC code.')
      return
    }

    setProcessing(true)
    // Simulate payment processing (will be replaced with real Stripe integration)
    await new Promise(r => setTimeout(r, 3000))
    localStorage.setItem('qe_purchased_plan', planId)
    localStorage.setItem('qe_customer_email', email)
    setProcessing(false)
    navigate('/payment-success')
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
            <h2 className="text-lg font-bold text-white">Payment Details</h2>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="input-field"
                maxLength={19}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="input-field"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className="input-field"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-primary w-full justify-center !py-3.5 !text-base disabled:opacity-50"
            >
              {processing ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Processing Payment...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Pay ${plan.price}</>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5" /> SSL Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Payment
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle className="w-3.5 h-3.5" /> Money-Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
