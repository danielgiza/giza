import { Clock, Check, AlertTriangle, Terminal, Download, Play, Settings } from 'lucide-react'
import { useInView } from '../hooks/useInView'

function AnimatedSection({ children, className = '', delay = '' }: { children: React.ReactNode; className?: string; delay?: string }) {
  const { ref, inView } = useInView(0.1)
  return <div ref={ref} className={`${inView ? `animate-fade-in-up ${delay}` : 'opacity-0'} ${className}`}>{children}</div>
}

const prerequisites = [
  { icon: '💻', title: 'Windows 10 or 11', desc: 'The robot runs on Windows OS' },
  { icon: '📊', title: 'MetaTrader 5', desc: 'Download from metatrader5.com' },
  { icon: '🐍', title: 'Python 3.10+', desc: 'Download from python.org' },
  { icon: '🏦', title: 'MT5 Broker Account', desc: 'Any broker with MT5 support' },
]

const steps = [
  {
    icon: Download,
    title: 'Install Python',
    content: (
      <>
        <p className="text-gray-400 mb-4">If Python is not installed, open <strong className="text-white">CMD (Command Prompt)</strong> as Administrator and run:</p>
        <div className="bg-surface rounded-lg p-4 font-mono text-sm text-accent mb-3">
          <span className="text-gray-500">{'>'}</span> winget install Python.Python.3.12
        </div>
        <p className="text-gray-400 text-sm">After installation, close and reopen CMD. Verify with: <code className="bg-surface px-2 py-0.5 rounded text-accent">python --version</code></p>
        <div className="mt-3 flex items-start gap-2 text-sm bg-accent/10 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <span className="text-gray-300">If installing Python manually from python.org, make sure to check "Add Python to PATH" during installation.</span>
        </div>
      </>
    ),
  },
  {
    icon: Settings,
    title: 'Install MetaTrader 5',
    content: (
      <>
        <p className="text-gray-400 mb-4">Download MT5 from your broker or from <a href="https://www.metatrader5.com/en/download" target="_blank" rel="noopener noreferrer" className="text-primary-light underline">metatrader5.com</a></p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-success mt-0.5 shrink-0" /> Install and create/login to your broker account</li>
          <li className="flex items-start gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-success mt-0.5 shrink-0" /> Enable Algo Trading: Tools → Options → Expert Advisors → Allow Algo Trading</li>
          <li className="flex items-start gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-success mt-0.5 shrink-0" /> Keep MT5 running while the robot operates</li>
        </ul>
      </>
    ),
  },
  {
    icon: Terminal,
    title: 'Extract & Configure Robot',
    content: (
      <>
        <p className="text-gray-400 mb-4">Extract the downloaded ZIP file and configure:</p>
        <div className="bg-surface rounded-lg p-4 font-mono text-sm space-y-2 mb-3">
          <div><span className="text-gray-500">{'>'}</span> <span className="text-accent">cd</span> C:\Users\YourName\Desktop\QuantumEdge</div>
          <div><span className="text-gray-500">{'>'}</span> <span className="text-accent">pip install</span> -r requirements.txt</div>
          <div><span className="text-gray-500">{'>'}</span> <span className="text-accent">copy</span> config.example.ini config.ini</div>
        </div>
        <p className="text-gray-400 text-sm">Edit <code className="bg-surface px-2 py-0.5 rounded text-accent">config.ini</code> with your MT5 credentials and preferences.</p>
      </>
    ),
  },
  {
    icon: Play,
    title: 'Start Trading',
    content: (
      <>
        <p className="text-gray-400 mb-4">Run the robot and start trading:</p>
        <div className="bg-surface rounded-lg p-4 font-mono text-sm space-y-2 mb-3">
          <div><span className="text-gray-500">{'>'}</span> <span className="text-accent">python</span> main.py</div>
        </div>
        <p className="text-gray-400 text-sm mb-3">The robot will connect to MT5, verify your license, and begin scanning for trading opportunities.</p>
        <div className="flex items-start gap-2 text-sm bg-success/10 p-3 rounded-lg">
          <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
          <span className="text-gray-300">For 24/5 operation, we recommend running on a VPS (Virtual Private Server) to ensure uninterrupted trading.</span>
        </div>
      </>
    ),
  },
]

export default function Activation() {
  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-primary-light mb-4">📋 Step-by-Step Guide</span>
            <h1 className="text-5xl font-black text-white mb-3">Robot Activation Guide</h1>
            <p className="text-gray-400">Follow these steps to get your Quantum Edge Trader robot running on MetaTrader 5. Takes about 10 minutes.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay="delay-100">
          <div className="card flex items-start gap-4 mb-8 border-accent/30">
            <Clock className="w-6 h-6 text-accent mt-1 shrink-0" />
            <div>
              <h3 className="text-white font-bold mb-1">Best Trading Hours: 14:30 - 17:00 (UTC+2)</h3>
              <p className="text-sm text-gray-400">The robot performs best during the London/New York session overlap. For Bucharest/Eastern Europe time, this is between 14:30 and 17:00. The robot can run outside these hours but peak performance is during this window.</p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay="delay-200">
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">⊙ Prerequisites</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {prerequisites.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm">{p.title}</p>
                    <p className="text-gray-500 text-xs">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <AnimatedSection key={i} delay={`delay-${Math.min(i + 1, 3) * 100}`}>
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light font-bold text-sm">{i + 1}</div>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                </div>
                {step.content}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
