import { AlertTriangle } from 'lucide-react'

export default function RiskDisclaimer() {
  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-accent" />
          <h1 className="text-4xl font-black text-white">Risk Disclaimer</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <div className="card border-accent/30">
            <h2 className="text-xl font-bold text-accent mb-3">Important Notice</h2>
            <p>Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange, you should carefully consider your investment objectives, level of experience, and risk appetite.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">No Guarantee of Profits</h2>
            <p>Past performance is not indicative of future results. The possibility exists that you could sustain a loss of some or all of your initial investment. Therefore, you should not invest money that you cannot afford to lose.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">Automated Trading Risks</h2>
            <p>Automated trading systems carry additional risks including but not limited to: software failures, connectivity issues, broker execution delays, and market conditions that may affect performance. The robot's performance may differ from historical backtests.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">Your Responsibility</h2>
            <p>You are solely responsible for all trading decisions made through the use of our software. Quantum Edge Trader provides a tool to assist with trading; it does not provide financial advice. Always consult with a qualified financial advisor before making investment decisions.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
