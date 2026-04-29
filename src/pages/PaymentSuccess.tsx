import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Download, Package, ArrowRight, RefreshCw, XCircle } from 'lucide-react'
import { downloadRobot } from '../services/downloadService'

const STRIPE_API_URL = 'https://giza-stripe-backend-cjbnzsld.fly.dev'

const planNames: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const planFromUrl = searchParams.get('plan') || ''

  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [planId, setPlanId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      const existing = localStorage.getItem('qe_purchased_plan')
      if (existing) {
        setPlanId(existing)
        setVerified(true)
        setVerifying(false)
      } else {
        navigate('/pricing')
      }
      return
    }

    async function verify() {
      try {
        const res = await fetch(`${STRIPE_API_URL}/verify-session/${sessionId}`)
        const data = await res.json()
        if (data.paid) {
          const plan = data.plan_id || planFromUrl
          if (!plan) {
            setError('Payment confirmed but plan info is missing. Please contact support.')
            return
          }
          localStorage.setItem('qe_purchased_plan', plan)
          setPlanId(plan)
          setVerified(true)
        } else {
          setError('Payment has not been confirmed yet. Please wait a moment and refresh.')
        }
      } catch {
        setError('Could not verify payment. Please try refreshing the page.')
      } finally {
        setVerifying(false)
      }
    }
    verify()
  }, [sessionId, planFromUrl, navigate])

  if (verifying) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <RefreshCw className="w-12 h-12 text-primary-light animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
          <p className="text-gray-400">Please wait while we confirm your payment with Stripe.</p>
        </div>
      </section>
    )
  }

  if (error || !verified) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <XCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h1>
          <p className="text-gray-400 mb-6">{error || 'Something went wrong.'}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </section>
    )
  }

  const planName = planNames[planId] || 'Plan'

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        <div className="card !p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-1">
            Thank you for purchasing the <span className="text-white font-semibold">{planName}</span> plan.
          </p>
          <p className="text-gray-400">
            Your Quantum Edge V2.0 robot is ready to download.
          </p>
        </div>

        <div className="card !p-6 border-success/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">Quantum Edge V2.0</h3>
                  <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold">
                    {planId.toUpperCase()} PLAN
                  </span>
                </div>
                <p className="text-sm text-gray-400">Extract the ZIP and follow the README instructions.</p>
              </div>
            </div>
            <button onClick={() => downloadRobot()} className="btn-primary shrink-0">
              <Download className="w-5 h-5" /> Download ZIP
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">Version:</span> <span className="text-white font-medium">2.0.0</span></div>
            <div><span className="text-gray-500">Pairs:</span> <span className="text-white font-medium">XAUUSD</span></div>
            <div><span className="text-gray-500">Platform:</span> <span className="text-white font-medium">MT5</span></div>
            <div><span className="text-gray-500">License:</span> <span className="text-success font-medium">Active</span></div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-primary-light hover:text-white transition"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
