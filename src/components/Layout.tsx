import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import AnimatedBackground from './AnimatedBackground'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
