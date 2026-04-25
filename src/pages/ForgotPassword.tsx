import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (result.success) {
      setSent(true)
      const linkMatch = result.message.match(/(\/reset-password\?token=[^\s]+)/)
      if (linkMatch) setResetLink(linkMatch[1])
    }
  }

  if (sent) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card !p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              If an account exists with <span className="text-white font-medium">{email}</span>, we've sent a password reset link.
            </p>
            {resetLink && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Demo: In production, this link would be sent via email:</p>
                <Link to={resetLink} className="text-primary-light text-sm underline break-all hover:text-primary">
                  {window.location.origin}{resetLink}
                </Link>
              </div>
            )}
            <Link to="/login" className="text-primary-light text-sm hover:text-primary transition flex items-center gap-1 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card !p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-primary-light" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Forgot Password?</h1>
            <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field pl-10" required />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/login" className="text-primary-light hover:text-primary transition flex items-center gap-1 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
