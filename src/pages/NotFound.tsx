import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-8xl font-black text-primary/30 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary"><Home className="w-5 h-5" /> Back to Home</Link>
      </div>
    </section>
  )
}
