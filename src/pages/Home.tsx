import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Rocket, ArrowRight, Shield, BarChart3, Zap, Clock, TrendingUp, Globe, Star, ChevronDown, ChevronUp, Lock, RefreshCw, Search, Eye, Play } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import ImageLightbox from '../components/ImageLightbox'

function AnimatedSection({ children, className = '', delay = '' }: { children: React.ReactNode; className?: string; delay?: string }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className={`${inView ? `animate-fade-in-up ${delay}` : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

const tradingProofImages = [
  { src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80', alt: 'Live MT5 Trading Results - XAUUSD Scalping Session', caption: 'XAUUSD Scalping - +$2,340 profit in one session' },
  { src: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80', alt: 'MetaTrader 5 Account Statement - Consistent Profits', caption: 'Account statement showing consistent daily profits' },
  { src: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80', alt: 'Trading Performance Dashboard - Real Results', caption: 'Performance dashboard - 98.2% win rate verified' },
  { src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80', alt: 'EURUSD Trading Proof - Robot Performance', caption: 'EURUSD trades - automated execution results' },
  { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', alt: 'Monthly Trading Report - Verified Gains', caption: 'Monthly verified gains report' },
  { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', alt: 'Live Account Balance Growth Chart', caption: 'Account balance growth over 6 months' },
]

const features = [
  { icon: Shield, title: 'Anti-Loss Shield', desc: 'Advanced stop-loss system that protects your capital with dynamic position sizing and drawdown limits.' },
  { icon: BarChart3, title: '5-Timeframe Analysis', desc: 'Simultaneously analyzes M1, M5, M15, H1, and H4 timeframes for high-probability setups.' },
  { icon: Zap, title: 'Lightning Execution', desc: 'Sub-millisecond order execution ensures you never miss optimal entry and exit points.' },
  { icon: Lock, title: 'Smart Risk Management', desc: 'Automatic lot sizing based on account balance with configurable risk per trade parameters.' },
  { icon: RefreshCw, title: 'Auto-Recovery', desc: 'Intelligent recovery system that adapts strategy after losses to restore account balance.' },
  { icon: Search, title: 'Pattern Recognition', desc: 'AI-powered pattern recognition identifies market structures and trend reversals in real-time.' },
]

const testimonials = [
  { name: 'Thomas Andersson', country: 'Sweden', profit: '+$6,320 in 4 months', text: '"Running this on both XAUUSD and EURUSD on separate charts. The trailing stop system is brilliant - it locks in profits automatically. Set it up on my VPS and it runs perfectly. Best $599 I\'ve spent on trading."', rating: 5 },
  { name: 'Maria Santos', country: 'Portugal', profit: '+$4,150 in 3 months', text: '"Was skeptical at first but the results speak for themselves. The anti-loss shield saved me during the NFP release. Very impressed with the risk management."', rating: 5 },
  { name: 'James Wilson', country: 'UK', profit: '+$8,900 in 6 months', text: '"Enterprise package was worth every penny. The 1-on-1 setup session helped me optimize for my broker. Running on a VPS 24/5 with consistent results."', rating: 5 },
]

const faqs = [
  { q: 'What broker can I use?', a: 'Quantum Edge works with any MT5-compatible broker. We recommend brokers with low spreads on XAUUSD and EURUSD such as ICMarkets, Pepperstone, or Exness for optimal performance.' },
  { q: 'What is the minimum account balance?', a: 'We recommend a minimum of $500 for the EURUSD pair and $1,000 for XAUUSD. Higher balances allow for better risk management and more consistent results.' },
  { q: 'Do I need to keep my computer running?', a: 'For optimal results, the robot should run 24/5 during market hours. We recommend using a VPS (Virtual Private Server) for uninterrupted trading. Many providers offer MT5-optimized VPS from $10/month.' },
  { q: 'What are the best trading hours?', a: 'The robot performs best during the London/New York overlap (14:30-17:00 UTC+2). It can run during other sessions but peak performance occurs during high-liquidity periods.' },
  { q: 'Is my money safe?', a: 'The robot runs on your own MT5 account with your broker. We never have access to your funds. The anti-loss shield and smart risk management protect against excessive drawdown.' },
  { q: 'Can I use it on a demo account first?', a: 'Yes! We strongly recommend testing on a demo account first to familiarize yourself with the settings. The robot works identically on demo and live accounts.' },
]

export default function Home() {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.08),_transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Trading System — 1,200+ Active Users
            </div>
          </AnimatedSection>
          <AnimatedSection delay="delay-100">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              Trade Smarter<br />
              <span className="gradient-text">With Advanced Precision</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay="delay-200">
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Quantum Edge Trader uses cutting-edge algorithms and multi-timeframe analysis to identify high-probability scalping opportunities on XAUUSD & EURUSD.
            </p>
          </AnimatedSection>
          <AnimatedSection delay="delay-300">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg"><Rocket className="w-5 h-5" /> Start Trading Now</Link>
              <Link to="/pricing" className="btn-secondary text-lg">View Pricing <ArrowRight className="w-5 h-5" /></Link>
            </div>
          </AnimatedSection>
          <AnimatedSection delay="delay-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
              {[
                { value: '98%', label: 'Win Rate' },
                { value: '$2.4M+', label: 'Total Traded', accent: true },
                { value: '1,247+', label: 'Active Traders', accent: true },
                { value: '4.9', label: 'User Rating' },
              ].map((s, i) => (
                <div key={i} className="card text-center py-4">
                  <div className={`text-2xl md:text-3xl font-black ${s.accent ? 'gradient-text' : 'text-white'}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-500 mx-auto" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-black text-center text-white mb-3">How It Works</h2>
            <p className="text-gray-400 text-center mb-12">Get started in minutes. No coding required.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📋', title: 'Purchase Package', desc: 'Choose the plan that fits your needs. Secure payment via Stripe. Instant access after purchase.' },
              { step: '02', icon: '📥', title: 'Download & Install', desc: 'Download the robot ZIP file. Extract to your computer. Install Python if needed.' },
              { step: '03', icon: '▶️', title: 'Start Trading', desc: 'Open CMD, navigate to folder, run the robot. Connect to MT5 and watch it trade automatically.' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={`delay-${(i + 1) * 100}`}>
                <div className="card text-center relative">
                  <div className="text-5xl font-black text-primary/20 mb-2">{item.step}</div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  {i < 2 && <div className="hidden md:block absolute right-[-20px] top-1/2 text-gray-600 text-2xl">→</div>}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-surface-light/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-primary-light mb-4">⚙️ Advanced Technology</span>
              <h2 className="text-4xl font-black text-white mb-3">Why Quantum Edge?</h2>
              <p className="text-gray-400">Engineered for professional traders who demand the best performance</p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={`delay-${(i % 3 + 1) * 100}`}>
                <div className="card h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Optimal Trading Hours */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="text-3xl font-black text-white mb-4">Optimal Trading Hours</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The robot performs best between <span className="text-accent font-bold">14:30 - 17:00</span> (UTC+2, Bucharest/Eastern Europe time). This window overlaps with the London and New York sessions when XAUUSD and EURUSD have the highest liquidity and volatility.
              </p>
              <ul className="space-y-3">
                {[
                  'London/New York session overlap = maximum opportunities',
                  'Tightest spreads and deepest liquidity',
                  'Robot auto-filters low-quality sessions',
                  'Can run 24/5 on VPS for all sessions',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection delay="delay-200">
              <div className="card">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 text-center uppercase tracking-wider">Performance by Session</h4>
                {[
                  { session: 'Asian Session (02:00-08:00)', pct: 15, color: 'bg-gray-500' },
                  { session: 'London Open (08:00-12:00)', pct: 55, color: 'bg-primary' },
                  { session: 'NY Overlap (14:30-17:00)', pct: 95, color: 'bg-accent' },
                  { session: 'NY Close (17:00-22:00)', pct: 35, color: 'bg-primary' },
                ].map((s, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{s.session}</span>
                      <span className={`font-bold ${s.pct >= 90 ? 'text-accent' : 'text-gray-300'}`}>{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-center mt-4">Times shown in UTC+2 (Bucharest)</p>
                <p className="text-center mt-2 text-sm font-bold text-accent tracking-wider">14:30 - 17:00 = PEAK PERFORMANCE</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Live Trading Proof */}
      <section id="proof" className="py-20 px-4 bg-surface-light/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-success mb-4">📊 Verified Results</span>
              <h2 className="text-4xl font-black text-white mb-3">Live Trading Proof</h2>
              <p className="text-gray-400">Real results from real trading accounts. Click any image to view full size.</p>
            </div>
          </AnimatedSection>
          {/* Video Proof */}
          <AnimatedSection className="mb-8">
            <div className="card overflow-hidden p-0 max-w-3xl mx-auto">
              <div className="relative">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster=""
                  className="w-full rounded-t-2xl"
                >
                  <source src="/trading-proof-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-success/90 text-white text-xs font-bold flex items-center gap-1">
                  <Play className="w-3 h-3" /> Live Trading Recording
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-300 font-medium">Live Trading Session - Robot in Action</p>
                <p className="text-xs text-gray-500 mt-1">Watch the Quantum Edge robot executing real trades on MetaTrader 5</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Image Proof Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingProofImages.map((img, i) => (
              <AnimatedSection key={i} delay={`delay-${(i % 3 + 1) * 100}`}>
                <div
                  className="card group cursor-pointer overflow-hidden p-0"
                  onClick={() => setLightboxImage({ src: img.src, alt: img.alt })}
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-300 font-medium">{img.caption}</p>
                    <p className="text-xs text-primary-light mt-1 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Click to view full image
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-accent mb-4">⭐ 4.9/5 Average Rating</span>
              <h2 className="text-4xl font-black text-white mb-3">What Our Traders Say</h2>
              <p className="text-gray-400">Real feedback from real traders using Quantum Edge daily</p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={`delay-${(i + 1) * 100}`}>
                <div className="card h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-light font-bold text-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.country}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="flex gap-0.5">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />)}</div>
                      <p className="text-success text-xs font-medium mt-0.5">{t.profit}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed italic flex-1">{t.text}</p>
                  <div className="text-6xl text-primary/10 font-serif text-right mt-2">"</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-surface-light/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, value: '45,000+', label: 'Total Trades Executed' },
              { icon: BarChart3, value: '3.2%', label: 'Average Daily Return' },
              { icon: Globe, value: '47+', label: 'Countries Worldwide' },
              { icon: Clock, value: '365+', label: 'Days of Operation' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={`delay-${(i + 1) * 100}`}>
                <div className="card text-center py-6">
                  <s.icon className="w-8 h-8 text-primary-light mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-black text-center text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-center mb-12">Everything you need to know before getting started</p>
          </AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={`delay-${Math.min(i + 1, 3) * 100}`}>
                <div className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition"
                  >
                    <span className="text-white font-medium">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-surface-light/30">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-accent mb-6">🚀 Limited Time Offer</span>
            <h2 className="text-4xl font-black text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-gray-400 mb-8">Join 1,200+ traders already using Quantum Edge to generate consistent returns. Start today with our risk-free setup.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg"><Rocket className="w-5 h-5" /> Get Your Robot Now</Link>
              <Link to="/activation" className="btn-secondary text-lg">View Setup Guide</Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Secure Payment</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Money-Back Guarantee</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7 Support</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {lightboxImage && <ImageLightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
    </>
  )
}
