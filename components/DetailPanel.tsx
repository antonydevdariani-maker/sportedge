'use client'

import EdgeBadge from './EdgeBadge'
import { parsePrices, parseOutcomes, formatVolume, type Market } from './MarketCard'

interface Analysis {
  yes_probability: number
  reasoning: string
  key_factors: string[]
  confidence: 'high' | 'medium' | 'low'
  edge: number
  verdict?: 'BET_YES' | 'BET_NO' | 'PASS'
  verdict_reason?: string
  limitedData?: boolean
  error?: string
}

interface Props {
  market: Market
  analysis: Analysis | null
  loading: boolean
}

const confidencePill: Record<string, string> = {
  high: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30',
  medium: 'bg-amber-900/50 text-amber-400 border border-amber-500/30',
  low: 'bg-red-900/50 text-red-400 border border-red-500/30',
}

function ProbBar({ label, value, color, sublabel }: { label: string; value: number; color: string; sublabel?: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex-1 bg-zinc-900 rounded-xl p-3">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      {sublabel && <p className="text-[10px] text-zinc-600 mb-2">{sublabel}</p>}
      <p className="font-mono text-2xl font-bold mb-2" style={{ color }}>{pct}%</p>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function DetailPanel({ market, analysis, loading }: Props) {
  const prices = parsePrices(market.outcomePrices)
  const outcomes = parseOutcomes(market.outcomes)
  const yesPrice = prices[0] ?? 0.5

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-zinc-800/50 px-5 py-4 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 mb-1">{market.sport}</p>
        <h2 className="text-white font-semibold text-sm leading-snug">{market.question}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
          <span>Vol {formatVolume(market.volume)}</span>
          <span>Closes {new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <a href={market.url} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 ml-auto">
            View on Polymarket ↗
          </a>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Current odds */}
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Current Polymarket Odds</p>
          <div className="flex gap-2">
            {outcomes.slice(0, 2).map((outcome, i) => {
              const pct = prices[i] != null ? Math.round(prices[i] * 100) : null
              const isYes = i === 0
              return (
                <div key={i} className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                  <p className={`text-xs font-medium mb-1 ${isYes ? 'text-emerald-400' : 'text-red-400'}`}>{outcome}</p>
                  <p className={`font-mono text-2xl font-bold ${isYes ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pct != null ? `${pct}%` : '—'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spinner */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <svg className="animate-spin h-7 w-7 text-violet-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-zinc-500 text-sm">Researching & analyzing…</p>
          </div>
        )}

        {/* Error */}
        {!loading && analysis?.error && (
          <div className="bg-zinc-800 rounded-xl p-4 text-center text-zinc-500 text-sm">
            {analysis.error}
          </div>
        )}

        {/* Analysis results */}
        {!loading && analysis && !analysis.error && (
          <div className="space-y-4 animate-fadeIn">
            {analysis.limitedData && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-900/20 border border-amber-500/20 px-3 py-2 rounded-lg">
                <span>⚠</span> Limited research data — analysis based on market data only
              </div>
            )}

            {/* AI vs Market probability */}
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">AI Model vs Market</p>
              <div className="flex gap-2">
                <ProbBar
                  label="Market Price"
                  value={yesPrice}
                  color="#8b5cf6"
                  sublabel="Polymarket YES"
                />
                <ProbBar
                  label="AI Estimate"
                  value={analysis.yes_probability}
                  color={analysis.edge > 0 ? '#10b981' : analysis.edge < -0.02 ? '#ef4444' : '#6b7280'}
                  sublabel="Real probability"
                />
              </div>
            </div>

            {/* Verdict */}
            {analysis.verdict === 'PASS' ? (
              <div className="rounded-xl px-4 py-3 border border-zinc-700 bg-zinc-800/50 flex items-start gap-3">
                <span className="text-2xl mt-0.5">🚫</span>
                <div>
                  <p className="text-zinc-400 font-bold text-sm">Don&apos;t Bet This</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{analysis.verdict_reason ?? 'Edge too small or insufficient data.'}</p>
                </div>
              </div>
            ) : analysis.verdict && (
              <div
                className="rounded-xl px-4 py-3 border flex items-center justify-between"
                style={
                  analysis.verdict === 'BET_YES'
                    ? { backgroundColor: '#0f2208', borderColor: '#639922' }
                    : { backgroundColor: '#220808', borderColor: '#A32D2D' }
                }
              >
                <div>
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: analysis.verdict === 'BET_YES' ? '#639922' : '#A32D2D' }}>
                    Recommended Bet
                  </p>
                  <p className="text-white font-bold text-lg">
                    Take the <span style={{ color: analysis.verdict === 'BET_YES' ? '#86cc30' : '#e05555' }}>
                      {analysis.verdict === 'BET_YES' ? 'YES' : 'NO'}
                    </span>
                  </p>
                  {analysis.verdict_reason && (
                    <p className="text-xs text-zinc-500 mt-0.5">{analysis.verdict_reason}</p>
                  )}
                </div>
                <EdgeBadge edge={analysis.edge} />
              </div>
            )}

            {/* Confidence */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${confidencePill[analysis.confidence] ?? 'bg-zinc-800 text-zinc-400'}`}>
                {analysis.confidence} confidence
              </span>
            </div>

            {/* Reasoning */}
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Analysis</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{analysis.reasoning}</p>
            </div>

            {/* Key factors */}
            {analysis.key_factors?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Key Factors</p>
                <ul className="space-y-1.5">
                  {analysis.key_factors.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-violet-500 mt-0.5 shrink-0">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
