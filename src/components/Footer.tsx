import { Link } from 'react-router-dom'
import { Zap, Circle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Quantum Edge</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Advanced algorithmic trading solutions engineered for consistent performance in XAUUSD and EURUSD markets.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Circle className="w-2 h-2 fill-success text-success" />
              <span className="text-success">Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">PRODUCT</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
              <li><Link to="/activation" className="text-gray-400 hover:text-white transition">Setup Guide</Link></li>
              <li><Link to="/#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
              <li><Link to="/#reviews" className="text-gray-400 hover:text-white transition">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">SUPPORT</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@quantumedgetrader.com" className="text-gray-400 hover:text-white transition">Email Support</a></li>
              <li><Link to="/activation" className="text-gray-400 hover:text-white transition">Installation Guide</Link></li>
              <li><a href="https://www.metatrader5.com/en/download" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Download MT5</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">LEGAL</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/risk-disclaimer" className="text-gray-400 hover:text-white transition">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Quantum Edge Trader. All rights reserved.</p>
          <p className="text-sm text-gray-500">Founded by <span className="text-accent font-medium">Daniel Giza</span></p>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6 max-w-3xl mx-auto leading-relaxed">
          Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. The high degree of leverage can work against you as well as for you.
        </p>
      </div>
    </footer>
  )
}
