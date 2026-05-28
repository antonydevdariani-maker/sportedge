'use client'

export interface Market {
  id: string
  question: string
  outcomes: string | string[]
  outcomePrices: string | string[]
  volume: number | string
  endDate: string
  url: string
  sport: string
  isLive: boolean
}

interface Props {
  market: Market
  onClick: () => void
  selected: boolean
}

export function parsePrices(outcomePrices: string | string[]): number[] {
  try {
    const arr = typeof outcomePrices === 'string' ? JSON.parse(outcomePrices) : outcomePrices
    return arr.map((v: string) => parseFloat(v)).filter((n: number) => !isNaN(n))
  } catch {
    return []
  }
}

export function parseOutcomes(outcomes: string | string[]): string[] {
  try {
    return typeof outcomes === 'string' ? JSON.parse(outcomes) : outcomes
  } catch {
    return ['Yes', 'No']
  }
}

export function formatVolume(v: number | string): string {
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (isNaN(n)) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NHL: '🏒', 'World Cup': '⚽', NFL: '🏈',
  MLB: '⚾', 'UFC/Boxing': '🥊', Tennis: '🎾', Golf: '⛳', Sports: '🏆',
}

export default function MarketCard({ market, onClick, selected }: Props) {
  const prices = parsePrices(market.outcomePrices)
  const outcomes = parseOutcomes(market.outcomes)
  const yesPrice = prices[0] ?? null
  const noPrice = prices[1] ?? null

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 group animate-fadeIn ${
        selected
          ? 'bg-zinc-800 border-violet-500/60 ring-1 ring-violet-500/40'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-850'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-500">{sportEmoji[market.sport] ?? '🏆'} {market.sport}</span>
          {market.isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              LIVE
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{formatDate(market.endDate)}</span>
      </div>

      {/* Question */}
      <p className="text-white text-sm font-medium leading-snug mb-4 line-clamp-2">
        {market.question}
      </p>

      {/* Outcome bars */}
      <div className="space-y-2">
        {outcomes.slice(0, 2).map((outcome, i) => {
          const pct = prices[i] != null ? Math.round(prices[i] * 100) : null
          const isYes = i === 0
          return (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className={isYes ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {outcome}
                </span>
                <span className="font-mono text-white font-semibold">
                  {pct != null ? `${pct}%` : '—'}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                {pct != null && (
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isYes ? '#10b981' : '#ef4444',
                      opacity: 0.7,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-zinc-600">Vol {formatVolume(market.volume)}</span>
        <span className={`text-xs transition-colors ${selected ? 'text-violet-400' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
          {selected ? 'Analyzing ↓' : 'Analyze →'}
        </span>
      </div>
    </button>
  )
}
