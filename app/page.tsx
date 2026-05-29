'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import MarketCard, { parsePrices, type Market } from '@/components/MarketCard'
import DetailPanel from '@/components/DetailPanel'

interface Analysis {
  yes_probability: number
  reasoning: string
  key_factors: string[]
  confidence: 'high' | 'medium' | 'low'
  edge: number
  limitedData?: boolean
  error?: string
}

interface BetResult {
  id: string
  question: string
  yesPrice: number
  noPrice: number
  yes_probability: number
  reasoning: string
  key_factors: string[]
  confidence: 'high' | 'medium' | 'low'
  edge: number
  verdict: 'BET_YES' | 'BET_NO' | 'PASS'
  verdict_reason: string
  betSide: 'YES' | 'NO' | null
  absEdge: number
}

const SPORT_ORDER = ['NBA', 'NHL', 'World Cup', 'Soccer', 'NFL', 'MLB', 'UFC/Boxing', 'Tennis', 'Golf', 'Sports']

function groupBySport(markets: Market[]): Record<string, Market[]> {
  const groups: Record<string, Market[]> = {}
  for (const m of markets) {
    if (!groups[m.sport]) groups[m.sport] = []
    groups[m.sport].push(m)
  }
  return groups
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function BestBetsPanel({ markets }: { markets: Market[] }) {
  const [bets, setBets] = useState<BetResult[]>([])
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)

  async function runScan() {
    setScanning(true)
    setBets([])
    setDone(false)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markets: markets.slice(0, 12) }),
      })
      const data = await res.json()
      setBets(Array.isArray(data) ? data : [])
    } catch {
      setBets([])
    } finally {
      setScanning(false)
      setDone(true)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            🎯 Best Bets
            <span className="text-xs font-normal text-zinc-500">AI scans top 12 markets for YES &amp; NO edges</span>
          </h2>
        </div>
        <button
          onClick={runScan}
          disabled={scanning || markets.length === 0}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ backgroundColor: scanning ? '#1e1e2e' : '#4c1d95', color: '#c4b5fd' }}
        >
          {scanning ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Scanning…
            </>
          ) : '⚡ Scan for Edges'}
        </button>
      </div>

      {scanning && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Researching markets with AI…</p>
          <p className="text-zinc-600 text-xs">This takes ~30-60 seconds</p>
        </div>
      )}

      {!scanning && done && bets.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
          No significant edges found in current markets
        </div>
      )}

      {!scanning && bets.length > 0 && (
        <div className="space-y-6">
          {/* Real bets */}
          {bets.filter(b => b.verdict !== 'PASS').length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">✅ Worth Betting</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bets.filter(b => b.verdict !== 'PASS').map((bet) => (
                  <div
                    key={bet.id}
                    className="rounded-2xl p-4 border animate-fadeIn"
                    style={
                      bet.verdict === 'BET_YES'
                        ? { backgroundColor: '#0a1f06', borderColor: '#2d5a12' }
                        : { backgroundColor: '#1f0606', borderColor: '#5a1212' }
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: bet.verdict === 'BET_YES' ? '#639922' : '#A32D2D', color: '#fff' }}
                      >
                        BET {bet.betSide}
                      </span>
                      <span className="font-mono text-sm font-bold" style={{ color: bet.verdict === 'BET_YES' ? '#86cc30' : '#e05555' }}>
                        +{(bet.absEdge * 100).toFixed(1)}% edge
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium leading-snug mb-2 line-clamp-2">{bet.question}</p>
                    <div className="flex gap-3 text-xs font-mono mb-2">
                      <span className="text-zinc-600">Market YES <span className="text-zinc-300">{(bet.yesPrice * 100).toFixed(0)}%</span></span>
                      <span className="text-zinc-600">AI <span className="text-white font-semibold">{(bet.yes_probability * 100).toFixed(0)}%</span></span>
                      <span className={`ml-auto ${bet.confidence === 'high' ? 'text-emerald-400' : bet.confidence === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                        {bet.confidence} conf
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-2">{bet.reasoning}</p>
                    {bet.verdict_reason && (
                      <p className="text-xs font-medium" style={{ color: bet.verdict === 'BET_YES' ? '#86cc30' : '#e05555' }}>
                        → {bet.verdict_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASS markets */}
          {bets.filter(b => b.verdict === 'PASS').length > 0 && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">🚫 Skip These</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bets.filter(b => b.verdict === 'PASS').map((bet) => (
                  <div key={bet.id} className="rounded-2xl p-4 border border-zinc-800 bg-zinc-900/50 animate-fadeIn opacity-60">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-800 text-zinc-500">PASS</span>
                      <span className="text-xs text-zinc-600 font-mono">{(bet.absEdge * 100).toFixed(1)}% edge</span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium leading-snug mb-2 line-clamp-2">{bet.question}</p>
                    <div className="flex gap-3 text-xs font-mono mb-2">
                      <span className="text-zinc-600">Market <span className="text-zinc-500">{(bet.yesPrice * 100).toFixed(0)}%</span></span>
                      <span className="text-zinc-600">AI <span className="text-zinc-500">{(bet.yes_probability * 100).toFixed(0)}%</span></span>
                    </div>
                    {bet.verdict_reason && (
                      <p className="text-zinc-600 text-xs">{bet.verdict_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!scanning && !done && (
        <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-600 text-sm">
          Press &quot;Scan for Edges&quot; to find value bets — checks both YES and NO sides
        </div>
      )}
    </div>
  )
}

interface BacktestResult {
  question: string
  outcome0: string
  outcome1: string
  actualWinner: string
  predictedWinner: string
  correct: boolean
  yes_probability: number
  confidence: string
  sport?: string
  reasoning: string
  key_factors: string[]
  endDate: string
}

interface BacktestData {
  accuracy: number
  correct: number
  total: number
  highConfAccuracy: number | null
  highConfTotal: number
  results: BacktestResult[]
}

const SPORT_FILTERS = [
  { key: 'All', emoji: '🏆' },
  { key: 'NBA', emoji: '🏀' },
  { key: 'NFL', emoji: '🏈' },
  { key: 'MLB', emoji: '⚾' },
  { key: 'NHL', emoji: '🏒' },
  { key: 'Soccer', emoji: '⚽' },
  { key: 'Tennis', emoji: '🎾' },
  { key: 'UFC', emoji: '🥊' },
  { key: 'Esports', emoji: '🎮' },
  { key: 'NCAAB', emoji: '🏫' },
  { key: 'CFB', emoji: '🎓' },
]

function BacktestPanel() {
  const [data, setData] = useState<BacktestData | null>(null)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(10)
  const [sport, setSport] = useState('All')
  const [error, setError] = useState<string | null>(null)

  async function runBacktest() {
    setRunning(true)
    setData(null)
    setError(null)
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, sport }),
      })
      const d = await res.json()
      if (d.error) { setError(d.error); return }
      setData(d)
    } catch {
      setError('Backtest failed')
    } finally {
      setRunning(false)
    }
  }

  const accuracyColor = data
    ? data.accuracy >= 0.65 ? '#10b981' : data.accuracy >= 0.55 ? '#f59e0b' : '#ef4444'
    : '#6b7280'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            🧪 Backtest
            <span className="text-xs font-normal text-zinc-500">AI predicts 110+ real historical games with web research</span>
          </h2>
          <p className="text-zinc-600 text-xs mt-1">NBA · NFL · MLB · NHL · Soccer · Tennis · UFC · Esports · NCAAB · CFB</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            disabled={running}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5"
          >
            {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} games</option>)}
          </select>
          <button
            onClick={runBacktest}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: running ? '#1e1e2e' : '#1e3a5f', color: '#93c5fd' }}
          >
            {running ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Testing {count} games…
              </>
            ) : '▶ Run Backtest'}
          </button>
        </div>
      </div>

      {/* Sport filter pills */}
      <div className="flex flex-wrap gap-2">
        {SPORT_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setSport(f.key)}
            disabled={running}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: sport === f.key ? '#1e3a5f' : '#18181b',
              color: sport === f.key ? '#93c5fd' : '#71717a',
              border: `1px solid ${sport === f.key ? '#2563eb' : '#27272a'}`,
            }}
          >
            {f.emoji} {f.key}
          </button>
        ))}
      </div>

      {running && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <p className="text-zinc-400 text-sm mb-1">Researching & predicting past games…</p>
          <p className="text-zinc-600 text-xs">~{count * 8}–{count * 12} seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-6 text-center text-red-400 text-sm">{error}</div>
      )}

      {!running && data && (
        <div className="space-y-5 animate-fadeIn">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 mb-1">Overall Accuracy</p>
              <p className="font-mono text-3xl font-bold" style={{ color: accuracyColor }}>
                {Math.round(data.accuracy * 100)}%
              </p>
              <p className="text-xs text-zinc-600 mt-1">{data.correct}/{data.total} correct</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 mb-1">High Conf Accuracy</p>
              <p className="font-mono text-3xl font-bold" style={{ color: data.highConfAccuracy != null && data.highConfAccuracy >= 0.65 ? '#10b981' : '#f59e0b' }}>
                {data.highConfAccuracy != null ? `${Math.round(data.highConfAccuracy * 100)}%` : '—'}
              </p>
              <p className="text-xs text-zinc-600 mt-1">{data.highConfTotal} high conf games</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 mb-1">Games Tested</p>
              <p className="font-mono text-3xl font-bold text-white">{data.total}</p>
              <p className="text-xs text-zinc-600 mt-1">resolved markets</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 mb-1">Baseline</p>
              <p className="font-mono text-3xl font-bold text-zinc-500">50%</p>
              <p className="text-xs text-zinc-600 mt-1">random guessing</p>
            </div>
          </div>

          {/* Calibration bar */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>Random (50%)</span>
              <span>AI Score</span>
              <span>Expert (~65%)</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-600" />
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${data.accuracy * 100}%`, backgroundColor: accuracyColor }}
              />
            </div>
            <p className="text-center text-xs mt-2" style={{ color: accuracyColor }}>
              {data.accuracy >= 0.65 ? '✅ Strong — beating expert baseline' :
               data.accuracy >= 0.55 ? '⚡ Decent — above random, below expert' :
               '⚠️ Weak — needs improvement'}
            </p>
          </div>

          {/* Game-by-game results */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Game Results</p>
            <div className="space-y-2">
              {data.results.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 border animate-fadeIn"
                  style={{
                    backgroundColor: r.correct ? '#0a1f06' : '#1f0606',
                    borderColor: r.correct ? '#2d5a12' : '#5a1212',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-lg">{r.correct ? '✅' : '❌'}</span>
                    <span className="text-white text-sm font-medium line-clamp-1 flex-1">{r.question}</span>
                    {r.sport && <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{r.sport}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.confidence === 'high' ? 'bg-emerald-900/50 text-emerald-400' :
                      r.confidence === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>{r.confidence}</span>
                    <span className="text-xs text-zinc-600">{r.endDate}</span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono mb-1.5">
                    <span className="text-zinc-500">Predicted: <span className="text-white font-semibold">{r.predictedWinner}</span></span>
                    <span className="text-zinc-500">Actual: <span style={{ color: r.correct ? '#86cc30' : '#e05555' }} className="font-semibold">{r.actualWinner}</span></span>
                    <span className="text-zinc-600 ml-auto">{Math.round(r.yes_probability * 100)}% → {r.outcome0}</span>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{r.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!running && !data && !error && (
        <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl p-10 text-center text-zinc-600 text-sm">
          Press &quot;Run Backtest&quot; — AI predicts past resolved games blind, scores itself on accuracy
        </div>
      )}
    </div>
  )
}

export default function PolymarketPage() {
  const [allMarkets, setAllMarkets] = useState<Market[]>([])
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'markets' | 'bets' | 'live' | 'backtest'>('markets')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { loadMarkets() }, [])

  async function loadMarkets(query = '') {
    if (query) setFilterLoading(true)
    else setLoading(true)
    setError(null)
    try {
      const url = query ? `/api/markets?query=${encodeURIComponent(query)}` : '/api/markets'
      const res = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data) || data.length === 0) {
        setMarkets([]); setAllMarkets([]); setError('No sports markets found')
      } else {
        setAllMarkets(data); setMarkets(data)
      }
    } catch { setError('Failed to load markets') }
    finally { setLoading(false); setFilterLoading(false) }
  }

  const displayedMarkets = activeTab === 'live' ? markets.filter(m => m.isLive) : markets
  const grouped = groupBySport(displayedMarkets)
  const liveCount = markets.filter(m => m.isLive).length

  const COMPETITION_KEYS = [
    'champions league', 'ucl', 'nba finals', 'nba championship', 'stanley cup',
    'world cup', 'super bowl', 'world series', 'wimbledon', 'us open',
    'french open', 'australian open', 'masters', 'western conference finals',
    'eastern conference finals', 'europa league', 'fa cup', 'copa del rey',
  ]

  function getRelatedMarkets(market: Market): { question: string; yesPrice: number }[] {
    const q = market.question.toLowerCase()
    const key = COMPETITION_KEYS.find(k => q.includes(k))
    if (!key) return []
    return allMarkets
      .filter(m => m.id !== market.id && m.question.toLowerCase().includes(key))
      .map(m => ({ question: m.question, yesPrice: parsePrices(m.outcomePrices)[0] ?? 0.5 }))
      .slice(0, 8)
  }

  const runAnalysis = useCallback(async (market: Market) => {
    setAnalyzeLoading(true)
    const prices = parsePrices(market.outcomePrices)
    const yesPrice = prices[0] ?? 0.5
    const relatedMarkets = getRelatedMarkets(market)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: market.question, polymarketYesPrice: yesPrice, relatedMarkets }),
      })
      setAnalysis(await res.json())
    } catch { setAnalysis({ error: 'Analysis unavailable' } as Analysis) }
    finally { setAnalyzeLoading(false) }
  }, [allMarkets])

  function clearPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  async function handleSelectMarket(market: Market) {
    clearPoll()
    setSelectedMarket(market)
    setAnalysis(null)
    await runAnalysis(market)
    if (isToday(market.endDate)) {
      pollRef.current = setInterval(() => runAnalysis(market), 3 * 60 * 1000)
    }
  }

  useEffect(() => () => clearPoll(), [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <div className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-lg font-bold tracking-tight">⚡ SportEdge</span>
          <span className="text-xs text-zinc-600">Polymarket + AI</span>
          <div className="ml-auto">
            <SearchBar onSearch={(q) => loadMarkets(q)} onClear={() => loadMarkets()} loading={filterLoading} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          {[
            { key: 'markets', label: 'All Markets', count: markets.length },
            { key: 'bets', label: '🎯 Best Bets', count: null },
            { key: 'live', label: '🔴 Live Today', count: liveCount || null },
            { key: 'backtest', label: '🧪 Backtest', count: null },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {tab.count != null && <span className="ml-1.5 text-xs text-zinc-600">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl h-48 animate-pulse border border-zinc-800" />
            ))}
          </div>
        )}

        {!loading && error && <div className="text-center py-20 text-zinc-500">{error}</div>}

        {!loading && !error && (
          <>
            {/* Best Bets tab */}
            {activeTab === 'bets' && <BestBetsPanel markets={markets} />}

            {/* Backtest tab */}
            {activeTab === 'backtest' && <BacktestPanel />}

            {/* Markets tabs */}
            {activeTab !== 'bets' && activeTab !== 'backtest' && (
              <div className="flex gap-6">
                <div className={`flex-1 min-w-0 ${selectedMarket ? 'lg:max-w-[58%]' : ''}`}>
                  {SPORT_ORDER.filter(s => grouped[s]?.length).map(sport => (
                    <div key={sport} className="mb-8">
                      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>{sport}</span>
                        <span className="h-px flex-1 bg-zinc-800" />
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {grouped[sport].map(m => (
                          <MarketCard key={m.id} market={m} onClick={() => handleSelectMarket(m)} selected={selectedMarket?.id === m.id} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {displayedMarkets.length === 0 && activeTab === 'live' && (
                    <div className="text-center py-16 text-zinc-600">
                      <p className="text-4xl mb-3">🏆</p>
                      <p>No live markets closing today</p>
                    </div>
                  )}
                </div>

                {/* Detail panel desktop */}
                {selectedMarket && (
                  <div className="hidden lg:block w-[400px] shrink-0">
                    <div className="sticky top-20">
                      <DetailPanel market={selectedMarket} analysis={analysis} loading={analyzeLoading} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile detail panel */}
      {selectedMarket && activeTab !== 'bets' && activeTab !== 'backtest' && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 bg-zinc-950 border-t border-zinc-800 max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-500">Analysis</span>
              <button onClick={() => { setSelectedMarket(null); clearPoll() }} className="text-zinc-600 text-xs">Close ✕</button>
            </div>
            <DetailPanel market={selectedMarket} analysis={analysis} loading={analyzeLoading} />
          </div>
        </div>
      )}
    </div>
  )
}
