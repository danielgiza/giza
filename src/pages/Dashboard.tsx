import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Activity,
  Settings, LogOut, RefreshCw, Wifi, WifiOff, Clock, ArrowUpCircle,
  ArrowDownCircle, Circle, AlertTriangle, CheckCircle, User
} from 'lucide-react'

interface MT5Account {
  login: string
  server: string
  name: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
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
  openPrice: number
  currentPrice: number
  sl: number
  tp: number
  profit: number
  openTime: string
  swap: number
  commission: number
}

const generatePositions = (): Position[] => {
  const symbols = ['XAUUSD', 'EURUSD']
  const positions: Position[] = []
  const count = Math.floor(Math.random() * 4) + 1

  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const isBuy = Math.random() > 0.5
    const isGold = symbol === 'XAUUSD'
    const basePrice = isGold ? 2340 + Math.random() * 20 : 1.085 + Math.random() * 0.005
    const spread = isGold ? Math.random() * 5 - 2.5 : Math.random() * 0.003 - 0.0015
    const volume = isGold ? +(Math.random() * 0.5 + 0.01).toFixed(2) : +(Math.random() * 2 + 0.1).toFixed(2)
    const profit = isBuy ? spread * volume * (isGold ? 100 : 100000) : -spread * volume * (isGold ? 100 : 100000)

    positions.push({
      ticket: 100000000 + Math.floor(Math.random() * 9000000),
      symbol,
      type: isBuy ? 'BUY' : 'SELL',
      volume,
      openPrice: +basePrice.toFixed(isGold ? 2 : 5),
      currentPrice: +(basePrice + spread).toFixed(isGold ? 2 : 5),
      sl: +(basePrice - (isBuy ? 1 : -1) * (isGold ? 10 : 0.005)).toFixed(isGold ? 2 : 5),
      tp: +(basePrice + (isBuy ? 1 : -1) * (isGold ? 15 : 0.008)).toFixed(isGold ? 2 : 5),
      profit: +profit.toFixed(2),
      openTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      swap: +(Math.random() * 2 - 1).toFixed(2),
      commission: +(-Math.random() * 3).toFixed(2),
    })
  }
  return positions
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mt5Login, setMt5Login] = useState('')
  const [mt5Password, setMt5Password] = useState('')
  const [mt5Server, setMt5Server] = useState('')
  const [accountType, setAccountType] = useState<'demo' | 'live'>('demo')
  const [connecting, setConnecting] = useState(false)
  const [account, setAccount] = useState<MT5Account | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const connectMT5 = async () => {
    if (!mt5Login || !mt5Password || !mt5Server) {
      setError('Please fill in all MT5 credentials.')
      return
    }
    setError('')
    setConnecting(true)
    await new Promise(r => setTimeout(r, 2000))

    const balance = accountType === 'demo' ? 10000 + Math.random() * 5000 : 1000 + Math.random() * 9000
    const unrealizedPL = (Math.random() - 0.3) * 500

    setAccount({
      login: mt5Login,
      server: mt5Server,
      name: user?.name || 'Trader',
      balance: +balance.toFixed(2),
      equity: +(balance + unrealizedPL).toFixed(2),
      margin: +(Math.random() * 500 + 50).toFixed(2),
      freeMargin: +(balance + unrealizedPL - Math.random() * 500).toFixed(2),
      leverage: '1:500',
      currency: 'USD',
      type: accountType,
      connected: true,
    })
    setPositions(generatePositions())
    setConnecting(false)
  }

  const updatePositions = useCallback(() => {
    if (!account) return
    setPositions(prev => prev.map(p => {
      const isGold = p.symbol === 'XAUUSD'
      const change = isGold ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.001
      const newPrice = +(p.currentPrice + change).toFixed(isGold ? 2 : 5)
      const profit = p.type === 'BUY'
        ? (newPrice - p.openPrice) * p.volume * (isGold ? 100 : 100000)
        : (p.openPrice - newPrice) * p.volume * (isGold ? 100 : 100000)
      return { ...p, currentPrice: newPrice, profit: +profit.toFixed(2) }
    }))

    setAccount(prev => {
      if (!prev) return prev
      const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0)
      return { ...prev, equity: +(prev.balance + totalProfit).toFixed(2) }
    })
  }, [account, positions])

  useEffect(() => {
    if (!account?.connected) return
    const interval = setInterval(updatePositions, 2000)
    return () => clearInterval(interval)
  }, [account?.connected, updatePositions])

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
            {account?.connected && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium">
                <Wifi className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Connected</span>
                <span className="text-gray-500">|</span>
                <span className={`${account.type === 'live' ? 'text-accent' : 'text-primary-light'}`}>
                  {account.type === 'live' ? 'LIVE' : 'DEMO'}
                </span>
              </span>
            )}
            <button onClick={logout} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!account?.connected ? (
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Balance', value: `$${account.balance.toLocaleString()}`, icon: DollarSign, color: 'text-white' },
                { label: 'Equity', value: `$${account.equity.toLocaleString()}`, icon: BarChart3, color: account.equity >= account.balance ? 'text-success' : 'text-danger' },
                { label: 'Free Margin', value: `$${account.freeMargin.toLocaleString()}`, icon: Activity, color: 'text-primary-light' },
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

            {/* Account Details */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div className="card lg:col-span-1">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-light" /> Account Details
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Account', value: account.login },
                    { label: 'Name', value: account.name },
                    { label: 'Server', value: account.server },
                    { label: 'Type', value: account.type.toUpperCase(), highlight: account.type === 'live' },
                    { label: 'Leverage', value: account.leverage },
                    { label: 'Currency', value: account.currency },
                    { label: 'Margin Used', value: `$${account.margin.toLocaleString()}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={`font-medium ${item.highlight ? 'text-accent' : 'text-gray-300'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setAccount(null); setPositions([]) }}
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
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">{positions.length} active</span>
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Circle className="w-2 h-2 fill-success text-success animate-pulse" />
                    Live updating
                  </div>
                </div>

                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No open positions. Robot is scanning for opportunities...</p>
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
                            <td className="py-2.5 text-right text-gray-400">{p.openPrice}</td>
                            <td className="py-2.5 text-right text-white font-medium">{p.currentPrice}</td>
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
                  { label: 'Status', value: 'Running', color: 'text-success' },
                  { label: 'Strategy', value: 'Phoenix Scalper V2.0', color: 'text-primary-light' },
                  { label: 'Pairs', value: 'XAUUSD, EURUSD', color: 'text-gray-300' },
                  { label: 'Uptime', value: `${Math.floor(Math.random() * 48 + 1)}h ${Math.floor(Math.random() * 60)}m`, color: 'text-gray-300' },
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
