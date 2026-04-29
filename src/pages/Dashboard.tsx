import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { downloadRobot } from '../services/downloadService'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Activity,
  Settings, LogOut, RefreshCw, Wifi, WifiOff, AlertTriangle,
  CheckCircle, User, Download, Package,
  ArrowUpCircle, ArrowDownCircle, Circle, Clock
} from 'lucide-react'

const API_URL = import.meta.env.VITE_MT5_API_URL || ''

interface MT5Data {
  login: string
  server: string
  name: string
  balance: number
  equity: number
  margin: number
  free_margin: number
  margin_level: number
  leverage: string
  currency: string
  type: 'demo' | 'live'
  connected: boolean
}

interface Position {
  ticket: number
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  open_price: number
  current_price: number
  sl: number
  tp: number
  profit: number
  open_time: string
  swap: number
  commission: number
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mt5Login, setMt5Login] = useState('')
  const [mt5Password, setMt5Password] = useState('')
  const [mt5Server, setMt5Server] = useState('')
  const [accountType, setAccountType] = useState<'demo' | 'live'>('demo')
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [mt5Data, setMt5Data] = useState<MT5Data | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const purchasedPlan = localStorage.getItem('qe_purchased_plan')
  const paymentConfirmed = !!purchasedPlan

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Check if backend is available
  useEffect(() => {
    if (!API_URL) {
      setBackendAvailable(false)
      return
    }
    fetch(`${API_URL}/health`)
      .then(r => { if (r.ok) setBackendAvailable(true); else setBackendAvailable(false) })
      .catch(() => setBackendAvailable(false))
  }, [])

  const connectMT5 = async () => {
    if (!mt5Login || !mt5Password || !mt5Server) {
      setError('Please fill in all MT5 credentials.')
      return
    }
    setError('')
    setConnecting(true)

    if (!API_URL || !backendAvailable) {
      // No backend - just save connection info, no fake data
      setConnected(true)
      setMt5Data({
        login: mt5Login,
        server: mt5Server,
        name: user?.name || 'Trader',
        balance: 0,
        equity: 0,
        margin: 0,
        free_margin: 0,
        margin_level: 0,
        leverage: '-',
        currency: 'USD',
        type: accountType,
        connected: true,
      })
      setPositions([])
      setConnecting(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: parseInt(mt5Login),
          password: mt5Password,
          server: mt5Server,
          type: accountType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Failed to connect to MT5. Check your credentials.')
        setConnecting(false)
        return
      }
      setMt5Data(data.account)
      setPositions(data.positions || [])
      setConnected(true)
      setLastUpdate(new Date())
    } catch {
      setError('Cannot reach MT5 server. Please try again later.')
    }
    setConnecting(false)
  }

  const fetchLiveData = useCallback(async () => {
    if (!API_URL || !backendAvailable || !connected) return
    try {
      const res = await fetch(`${API_URL}/account`)
      if (res.ok) {
        const data = await res.json()
        setMt5Data(data.account)
        setPositions(data.positions || [])
        setLastUpdate(new Date())
      }
    } catch { /* silent refresh failure */ }
  }, [connected, backendAvailable])

  useEffect(() => {
    if (!connected || !API_URL || !backendAvailable) return
    intervalRef.current = setInterval(fetchLiveData, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [connected, backendAvailable, fetchLiveData])

  const disconnect = () => {
    setConnected(false)
    setMt5Data(null)
    setPositions([])
    setLastUpdate(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (API_URL && backendAvailable) {
      fetch(`${API_URL}/disconnect`, { method: 'POST' }).catch(() => {})
    }
  }

  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0)
  const totalSwap = positions.reduce((sum, p) => sum + p.swap, 0)
  const totalCommission = positions.reduce((sum, p) => sum + p.commission, 0)

  if (!user) return null

  return (
    <section className="pt-20 pb-10 px-4 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-light" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connected && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium">
                <Wifi className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Connected</span>
                <span className="text-gray-500">|</span>
                <span className={accountType === 'live' ? 'text-accent' : 'text-primary-light'}>
                  {accountType === 'live' ? 'LIVE' : 'DEMO'}
                </span>
              </span>
            )}
            <button onClick={logout} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Robot Download Section - only visible after purchase */}
        {paymentConfirmed && (
          <div className="mb-6">
            <div className="card border-success/30 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center shrink-0">
                    <Package className="w-7 h-7 text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">Quantum Edge V2.0</h3>
                      <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold">
                        {purchasedPlan?.toUpperCase()} PLAN
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Your robot is ready to download. Extract the ZIP and follow the README instructions.</p>
                  </div>
                </div>
                <button onClick={() => downloadRobot()} className="btn-primary shrink-0">
                  <Download className="w-5 h-5" /> Download ZIP
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">Version:</span> <span className="text-white font-medium">2.0.0</span></div>
                <div><span className="text-gray-500">Pairs:</span> <span className="text-white font-medium">XAUUSD</span></div>
                <div><span className="text-gray-500">Platform:</span> <span className="text-white font-medium">MT5</span></div>
                <div><span className="text-gray-500">License:</span> <span className="text-success font-medium">Active</span></div>
              </div>
            </div>
          </div>
        )}

        {!connected ? (
          /* MT5 Connection Form */
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <div className="card !p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-7 h-7 text-primary-light" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Connect MT5 Account</h2>
                <p className="text-gray-400 text-sm">Enter your MetaTrader 5 credentials to connect</p>
              </div>

              {!backendAvailable && backendAvailable !== null && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4 text-sm text-accent flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-gray-300">MT5 backend server is not connected. Account data will not show live balances until the backend is configured.</span>
                </div>
              )}

              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4 text-sm text-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-surface rounded-lg">
                  <button
                    onClick={() => setAccountType('demo')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${accountType === 'demo' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Demo Account
                  </button>
                  <button
                    onClick={() => setAccountType('live')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${accountType === 'live' ? 'bg-accent text-surface' : 'text-gray-400 hover:text-white'}`}
                  >
                    Live Account
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">MT5 Login (Account Number)</label>
                  <input type="text" value={mt5Login} onChange={e => setMt5Login(e.target.value)} placeholder="e.g. 12345678" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">MT5 Password</label>
                  <input type="password" value={mt5Password} onChange={e => setMt5Password(e.target.value)} placeholder="Your MT5 password" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Server</label>
                  <input type="text" value={mt5Server} onChange={e => setMt5Server(e.target.value)} placeholder="e.g. ICMarketsSC-Demo" className="input-field" />
                </div>

                <button onClick={connectMT5} disabled={connecting} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
                  {connecting ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : (
                    <><Wifi className="w-5 h-5" /> Connect to MT5</>
                  )}
                </button>
              </div>

              {accountType === 'live' && (
                <div className="mt-4 bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-gray-300">Live account trading involves real money. Make sure you understand the risks involved.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Connected Dashboard */
          <div className="animate-fade-in">
            {/* Account Info Cards */}
            {backendAvailable && mt5Data ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Balance', value: `$${mt5Data.balance.toLocaleString()}`, icon: DollarSign, color: 'text-white' },
                  { label: 'Equity', value: `$${mt5Data.equity.toLocaleString()}`, icon: BarChart3, color: mt5Data.equity >= mt5Data.balance ? 'text-success' : 'text-danger' },
                  { label: 'Free Margin', value: `$${mt5Data.free_margin.toLocaleString()}`, icon: Activity, color: 'text-primary-light' },
                  { label: 'Floating P/L', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`, icon: totalProfit >= 0 ? TrendingUp : TrendingDown, color: totalProfit >= 0 ? 'text-success' : 'text-danger' },
                ].map((card, i) => (
                  <div key={i} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card mb-6 border-accent/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Live data unavailable</p>
                    <p className="text-sm text-gray-400">
                      The MT5 backend server is not connected. Balance, equity, and live positions will appear here once the backend is running. 
                      Your connection details are saved below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details + Positions */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div className="card lg:col-span-1">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-light" /> Account Details
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Account', value: mt5Data?.login || mt5Login },
                    { label: 'Name', value: mt5Data?.name || user.name },
                    { label: 'Server', value: mt5Data?.server || mt5Server },
                    { label: 'Type', value: accountType.toUpperCase(), highlight: accountType === 'live' },
                    { label: 'Leverage', value: mt5Data?.leverage || '-' },
                    { label: 'Currency', value: mt5Data?.currency || 'USD' },
                    ...(backendAvailable && mt5Data ? [
                      { label: 'Margin Used', value: `$${mt5Data.margin.toLocaleString()}` },
                      { label: 'Margin Level', value: mt5Data.margin_level > 0 ? `${mt5Data.margin_level.toFixed(1)}%` : '-' },
                    ] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={`font-medium ${'highlight' in item && item.highlight ? 'text-accent' : 'text-gray-300'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {lastUpdate && (
                  <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last update: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
                <button
                  onClick={disconnect}
                  className="mt-4 w-full py-2 rounded-lg bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition flex items-center justify-center gap-2"
                >
                  <WifiOff className="w-4 h-4" /> Disconnect
                </button>
              </div>

              {/* Open Positions */}
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-success" /> Open Positions
                    {positions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">{positions.length} active</span>
                    )}
                  </h3>
                  {backendAvailable && connected && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Circle className="w-2 h-2 fill-success text-success animate-pulse" />
                      Live updating
                    </div>
                  )}
                </div>

                {!backendAvailable ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="mb-1">Waiting for MT5 backend connection...</p>
                    <p className="text-xs text-gray-600">Live positions will appear here when the backend server is running and connected to your MT5 account.</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No open positions at the moment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-white/5">
                          <th className="text-left py-2 font-medium">Symbol</th>
                          <th className="text-left py-2 font-medium">Type</th>
                          <th className="text-right py-2 font-medium">Volume</th>
                          <th className="text-right py-2 font-medium">Open</th>
                          <th className="text-right py-2 font-medium">Current</th>
                          <th className="text-right py-2 font-medium">SL</th>
                          <th className="text-right py-2 font-medium">TP</th>
                          <th className="text-right py-2 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map(p => (
                          <tr key={p.ticket} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="py-2.5 font-medium text-white">{p.symbol}</td>
                            <td className="py-2.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${p.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                {p.type === 'BUY' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                {p.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-right text-gray-300">{p.volume}</td>
                            <td className="py-2.5 text-right text-gray-400">{p.open_price}</td>
                            <td className="py-2.5 text-right text-white font-medium">{p.current_price}</td>
                            <td className="py-2.5 text-right text-danger/70">{p.sl}</td>
                            <td className="py-2.5 text-right text-success/70">{p.tp}</td>
                            <td className={`py-2.5 text-right font-bold ${p.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                              {p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/10">
                          <td colSpan={5} className="py-2.5 text-xs text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Swap: ${totalSwap.toFixed(2)} | Commission: ${totalCommission.toFixed(2)}
                          </td>
                          <td colSpan={3} className="py-2.5 text-right">
                            <span className="text-xs text-gray-500 mr-2">Total P/L:</span>
                            <span className={`font-black ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Robot Status */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Robot Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Status', value: backendAvailable ? 'Running' : 'Awaiting Backend', color: backendAvailable ? 'text-success' : 'text-accent' },
                  { label: 'Strategy', value: 'Quantum Edge V2.0', color: 'text-primary-light' },
                  { label: 'Pairs', value: 'XAUUSD', color: 'text-gray-300' },
                  { label: 'Connection', value: backendAvailable ? 'Live' : 'Offline', color: backendAvailable ? 'text-success' : 'text-gray-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-medium ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
