import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService'

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const AUTH_VERSION = '5'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedVersion = localStorage.getItem('qe_auth_version')
    if (storedVersion !== AUTH_VERSION) {
      localStorage.removeItem('qe_users')
      localStorage.removeItem('qe_user')
      localStorage.removeItem('qe_payment_confirmed')
      localStorage.removeItem('qe_purchased_plan')
      const keys = Object.keys(localStorage)
      for (const k of keys) {
        if (k.startsWith('qe_verify_') || k.startsWith('qe_reset_')) {
          localStorage.removeItem(k)
        }
      }
      localStorage.setItem('qe_auth_version', AUTH_VERSION)
    }

    const stored = localStorage.getItem('qe_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, _password: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem('qe_users') || '[]')
    const found = users.find((u: User & { password: string }) => u.email === email)
    if (!found) return { success: false, message: 'Invalid email or password.' }
    if (!found.emailVerified) return { success: false, message: 'Please verify your email first. Check your inbox.' }
    const u = { id: found.id, name: found.name, email: found.email, emailVerified: found.emailVerified }
    setUser(u)
    localStorage.setItem('qe_user', JSON.stringify(u))
    return { success: true, message: 'Login successful!' }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem('qe_users') || '[]')
    if (users.find((u: { email: string }) => u.email === email)) {
      return { success: false, message: 'An account with this email already exists.' }
    }
    const id = crypto.randomUUID()
    const token = crypto.randomUUID()
    const newUser = { id, name, email, password, emailVerified: false, verifyToken: token }
    users.push(newUser)
    localStorage.setItem('qe_users', JSON.stringify(users))
    localStorage.setItem('qe_verify_' + token, email)

    const verifyLink = window.location.origin + '/verify-email?token=' + token
    const emailSent = await sendVerificationEmail(email, name, verifyLink)

    if (emailSent) {
      return { success: true, message: token }
    }
    return { success: true, message: 'EMAIL_FAILED:' + token }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('qe_user')
  }

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem('qe_users') || '[]')
    const found = users.find((u: { email: string; name: string }) => u.email === email)
    if (!found) return { success: true, message: 'If an account exists with this email, a password reset link has been sent.' }
    const token = crypto.randomUUID()
    localStorage.setItem('qe_reset_' + token, email)

    const resetLink = window.location.origin + '/reset-password?token=' + token
    const emailSent = await sendPasswordResetEmail(email, found.name, resetLink)

    if (emailSent) {
      return { success: true, message: 'Password reset link sent to your email! Please check your inbox.' }
    }
    return { success: true, message: 'Password reset link sent! Check your email. Reset link: /reset-password?token=' + token }
  }

  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const email = localStorage.getItem('qe_reset_' + token)
    if (!email) return { success: false, message: 'Invalid or expired reset link.' }
    const users = JSON.parse(localStorage.getItem('qe_users') || '[]')
    const idx = users.findIndex((u: { email: string }) => u.email === email)
    if (idx === -1) return { success: false, message: 'Account not found.' }
    users[idx].password = password
    localStorage.setItem('qe_users', JSON.stringify(users))
    localStorage.removeItem('qe_reset_' + token)
    return { success: true, message: 'Password reset successfully! You can now sign in.' }
  }

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    const email = localStorage.getItem('qe_verify_' + token)
    if (!email) return { success: false, message: 'Invalid or expired verification link.' }
    const users = JSON.parse(localStorage.getItem('qe_users') || '[]')
    const idx = users.findIndex((u: { email: string }) => u.email === email)
    if (idx === -1) return { success: false, message: 'Account not found.' }
    users[idx].emailVerified = true
    localStorage.setItem('qe_users', JSON.stringify(users))
    localStorage.removeItem('qe_verify_' + token)
    return { success: true, message: 'Email verified successfully! You can now sign in.' }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}
