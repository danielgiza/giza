import { Link, useNavigate } from 'react-router-dom'
import { Check, Crown, Lock, ShieldCheck } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { useAuth } from '../context/AuthContext'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    popular: false,
    features: ['Quantum Edge V2.0 Robot', '1 Trading Account License', 'Email Support', 'Basic Setup Guide', '30 Days Updates'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 599,
    popular: true,
    features: ['Quantum Edge V2.0 Robot', '3 Trading Account Licenses', 'Priority Email & Chat Support', 'Advanced Setup Guide + Video', '90 Days Updates', 'Custom Configuration Assist'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    popular: false,
    features: ['Quantum Edge V2.0 Robot', 'Unlimited Account Licenses', '24/7 Priority Support', 'Full Setup + Optimization Guide', 'Lifetime Updates', '1-on-1 Configuration Session', 'Private Telegram Group'],
  },
]

function AnimatedSection({ children, className = '', delay = '' }: { children: React.ReactNode; className?: string; delay?: string }) {
  const { ref, inView } = useInView(0.1)
  return <div ref={ref} className={`${inView ? `animate-fade-in-up ${delay}` : 'opacity-0'} ${className}`}>{children}</div>
}

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const handlePurchase = (planId: string) => {
    if (!user) {
      navigate('/register')
      return
    }
    navigate(`/checkout?plan=${planId}`)
  }

  const alreadyPurchased = !!localStorage.getItem('qe_purchased_plan')

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <h1 className="text-5xl font-black text-center text-white mb-3">Choose Your Plan</h1>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Select the package that fits your trading needs. All packages include the Quantum Edge V2.0 robot.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <AnimatedSection key={i} delay={`delay-${(i + 1) * 100}`}>
              <div className={`card relative h-full flex flex-col ${plan.popular ? 'border-primary !border-2 shadow-lg shadow-primary/10' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <Crown className="w-3 h-3" /> MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-white">${plan.price}</span>
                    <span className="text-sm text-gray-500">/one-time</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-success' : 'text-primary-light'}`} />
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                {alreadyPurchased ? (
                  <Link
                    to="/dashboard"
                    className="block text-center py-3 rounded-xl font-bold bg-success/20 text-success"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${plan.popular ? 'btn-primary justify-center' : 'bg-surface-lighter text-white hover:bg-primary/20'}`}
                  >
                    <ShieldCheck className="w-5 h-5" /> Buy {plan.name}
                  </button>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Secured by Stripe. 256-bit SSL encryption.
        </p>
      </div>
    </section>
  )
}
