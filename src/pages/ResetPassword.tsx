import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setResult({ success: false, message: 'Passwords do not match.' })
      return
    }
    if (password.length < 6) {
      setResult({ success: false, message: 'Password must be at least 6 characters.' })
      return
    }
    setLoading(true)
    const res = await resetPassword(token, password)
    setLoading(false)
    setResult(res)
  }

  if (result?.success) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card !p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Password Reset!</h2>
            <p className="text-gray-400 mb-6">{result.message}</p>
            <Link to="/login" className="btn-primary inline-flex">Sign In Now</Link>
          </div>
        </div>
      </section>
    )
  }

  if (!token) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card !p-8 text-center">
            <XCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Invalid Link</h2>
            <p className="text-gray-400 mb-6">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="text-primary-light hover:text-primary transition">Request a new reset link</Link>
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
              <Lock className="w-7 h-7 text-primary-light" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Reset Password</h1>
            <p className="text-gray-400 text-sm">Enter your new password below</p>
          </div>

          {result && !result.success && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4 text-sm text-danger">{result.message}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="input-field pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
