export default function Privacy() {
  return (
    <section className="pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-400 leading-relaxed">
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, and payment information when you create an account or purchase our products. We also automatically collect certain information about your device and usage of our services.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment processing is handled through Stripe with 256-bit SSL encryption.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">4. MT5 Account Credentials</h2>
            <p>Your MetaTrader 5 login credentials are used solely for connecting the trading robot to your account. We do not store your MT5 passwords on our servers. All connections are established locally on your machine.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">5. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">6. Third-Party Services</h2>
            <p>We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@quantumedgetrader.com" className="text-primary-light hover:text-primary">support@quantumedgetrader.com</a>.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
