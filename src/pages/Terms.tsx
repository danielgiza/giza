export default function Terms() {
  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Quantum Edge Trader service, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
            <p>Quantum Edge Trader provides an automated trading robot (Expert Advisor) for MetaTrader 5. The software is provided as a digital download and requires the user to operate it on their own hardware or VPS.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">3. License</h2>
            <p>Upon purchase, you receive a non-transferable, non-exclusive license to use the software on the number of trading accounts specified in your package. You may not redistribute, resell, or reverse-engineer the software.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">4. Risk Disclaimer</h2>
            <p>Trading foreign exchange carries a high level of risk. Past performance is not indicative of future results. You should only trade with capital you can afford to lose. Quantum Edge Trader does not guarantee any specific financial results.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">5. Refund Policy</h2>
            <p>We offer a 30-day money-back guarantee. If you are not satisfied with the product, contact our support team within 30 days of purchase for a full refund.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability</h2>
            <p>In no event shall Quantum Edge Trader, its founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any trading losses.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@quantumedgetrader.com" className="text-primary-light hover:text-primary">support@quantumedgetrader.com</a>.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
