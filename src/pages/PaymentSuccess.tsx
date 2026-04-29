import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Download, Package, ArrowLeft } from 'lucide-react'
import { downloadRobot } from '../services/downloadService'

const plans: Record<string, { name: string; price: number }> = {
  starter: { name: 'Starter', price: 299 },
  professional: { name: 'Professional', price: 599 },
  enterprise: { name: 'Enterprise', price: 999 },
}

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const purchasedPlan = localStorage.getItem('qe_purchased_plan')
  const plan = purchasedPlan ? plans[purchasedPlan] : null

  useEffect(() => {
    if (!purchasedPlan || !plan) navigate('/pricing')
  }, [purchasedPlan, plan, navigate])

  if (!plan) return null

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        <div className="card !p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-1">
            Thank you for purchasing the <span className="text-white font-semibold">{plan.name}</span> plan.
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
                    {purchasedPlan?.toUpperCase()} PLAN
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
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    </section>
  )
}
