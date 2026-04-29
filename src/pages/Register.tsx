import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Eye, EyeOff, Mail, User, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifyToken, setVerifyToken] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)
    if (result.success) {
      if (result.message.startsWith('EMAIL_FAILED:')) {
        setVerifyToken(result.message.replace('EMAIL_FAILED:', ''))
      } else {
        setVerifyToken(result.message)
      }
      setSuccess(true)
    } else {
      setError(result.message)
    }
  }

  if (success) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card !p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to verify your account.
            </p>

            <div className="flex flex-col gap-3">
              {verifyToken && (
                <Link
                  to={`/verify-email?token=${verifyToken}`}
                  className="btn-primary w-full justify-center !py-3"
                >
                  <CheckCircle className="w-5 h-5" /> Verify Account Now
                </Link>
              )}
              <Link to="/login" className="text-primary-light text-sm hover:text-primary transition">
                Go to Login
              </Link>
            </div>
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
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">Start your trading journey today</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="input-field" style={{ paddingLeft: '2.75rem' }} required />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field" style={{ paddingLeft: '2.75rem' }} required />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="input-field pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-primary-light hover:text-primary font-medium transition">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
