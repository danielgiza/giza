import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Setup Guide', to: '/activation' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Quantum Edge</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === l.to ? 'text-accent bg-accent/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">Dashboard</Link>
                <button onClick={logout} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-300 hover:text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-primary/20 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${pathname === l.to ? 'text-accent bg-accent/10' : 'text-gray-300 hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-lg">Dashboard</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-lg">Login</Link>
                  <Link to="/register" className="block px-4 py-3 text-sm font-bold text-center btn-primary">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
