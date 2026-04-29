import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const { verifyEmail } = useAuth()

  useEffect(() => {
    if (!token) {
      setResult({ success: false, message: 'Invalid verification link.' })
      setLoading(false)
      return
    }
    verifyEmail(token).then(res => {
      setResult(res)
      setLoading(false)
    })
  }, [token, verifyEmail])

  if (loading) {
    return (
      <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying your email...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card !p-8 text-center">
          {result?.success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Email Verified!</h2>
              <p className="text-gray-400 mb-6">{result.message}</p>
              <Link to="/login" className="btn-primary inline-flex">Sign In Now</Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{result?.message}</p>
              <Link to="/register" className="text-primary-light hover:text-primary transition">Create a new account</Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
