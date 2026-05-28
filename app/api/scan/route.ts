import { NextRequest, NextResponse } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY
const TAVILY_KEY = process.env.TAVILY_API_KEY

const SCAN_SYSTEM_PROMPT = `You are a brutally honest sports betting analyst. Only flag REAL edges where the market is genuinely mispriced. Most bets are NOT worth taking.

RESEARCH HIERARCHY — trust in this order:
1. Vegas moneyline / betting odds — most reliable signal. If Vegas ≈ Polymarket price, market is efficient → PASS.
2. Efficiency metrics — NBA net rating, soccer xG/xGA, NHL Corsi — far better than win-loss records.
3. Injury reports — missing star = 10-20% shift
4. Back-to-back / fatigue — ~7% penalty
5. Home advantage — 4-5% NBA/NHL, 6-8% soccer
6. CROSS-MARKET: if related markets provided, estimates must sum to ~100%

Rules:
- abs(edge) >= 7% AND confidence medium/high to recommend a bet.
- If Vegas and Polymarket agree, strong evidence price is correct → PASS.
- Thin research = PASS. Don't manufacture edges.

Return ONLY raw JSON, no markdown:
{"yes_probability":0.XX,"reasoning":"1-2 sentences citing specific stats or Vegas line","key_factors":["...","..."],"confidence":"high|medium|low","edge":0.XX,"verdict":"BET_YES|BET_NO|PASS","verdict_reason":"one direct sentence"}

edge = yes_probability - polymarket_price. Negative = NO has value.
verdict MUST be PASS if: confidence low, OR abs(edge) < 0.07, OR research doesn't clearly support estimate.`

const COMPETITION_KEYS = [
  'champions league', 'ucl', 'nba finals', 'nba championship', 'stanley cup',
  'world cup', 'super bowl', 'world series', 'wimbledon', 'us open',
  'french open', 'australian open', 'masters', 'western conference finals',
  'eastern conference finals', 'europa league', 'fa cup', 'copa del rey',
]

function getCompetitionKey(question: string): string | null {
  const q = question.toLowerCase()
  for (const kw of COMPETITION_KEYS) {
    if (q.includes(kw)) return kw
  }
  return null
}

function extractTeams(question: string): [string, string] {
  const vsMatch = question.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s+\d{4}|\?|$)/i)
  if (vsMatch) return [vsMatch[1].trim(), vsMatch[2].trim()]
  const willMatch = question.match(/will\s+(.+?)\s+win/i)
  if (willMatch) return [willMatch[1].trim(), '']
  return [question.slice(0, 30), '']
}

async function scanTavilySearch(query: string): Promise<string> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
      body: JSON.stringify({ query, search_depth: 'basic', max_results: 3 }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.results ?? [])
      .map((r: { title: string; content: string }) => `${r.title}: ${String(r.content ?? '').slice(0, 250)}`)
      .join('\n\n')
  } catch { return '' }
}

async function analyzeOne(question: string, yesPrice: number, relatedMarkets?: { question: string; yesPrice: number }[]): Promise<{
  yes_probability: number
  reasoning: string
  key_factors: string[]
  confidence: 'high' | 'medium' | 'low'
  edge: number
  verdict: 'BET_YES' | 'BET_NO' | 'PASS'
  verdict_reason: string
} | null> {
  let research = ''
  try {
    const [t1, t2] = extractTeams(question)
    const q = question.toLowerCase()
    const isNBA = q.includes('nba')
    const isNHL = q.includes('nhl') || q.includes('stanley')
    const isSoccer = q.includes('champions league') || q.includes('premier league') || q.includes('la liga') || q.includes('bundesliga') || q.includes('serie a')

    const oddsQ = t2 ? `${t1} vs ${t2} moneyline betting odds 2025` : `${question} odds 2025`
    const statsQ = isNBA ? `${t1} ${t2} net rating offensive defensive efficiency NBA 2025`
      : isNHL ? `${t1} ${t2} Corsi goals-for NHL 2025`
      : isSoccer ? `${t1} ${t2} xG xGA expected goals 2025`
      : `${question} advanced stats 2025`
    const newsQ = `${question} injury lineup news 2025`

    const [r1, r2, r3] = await Promise.all([
      scanTavilySearch(oddsQ),
      scanTavilySearch(statsQ),
      scanTavilySearch(newsQ),
    ])
    research = [
      r1 ? `=== ODDS ===\n${r1}` : '',
      r2 ? `=== STATS ===\n${r2}` : '',
      r3 ? `=== NEWS ===\n${r3}` : '',
    ].filter(Boolean).join('\n\n').slice(0, 3500)
  } catch { /* skip */ }

  let relatedCtx = ''
  if (relatedMarkets && relatedMarkets.length > 0) {
    relatedCtx = '\n\nRELATED MARKETS IN SAME COMPETITION:\n' +
      relatedMarkets.map(m => `- "${m.question}" → Market YES price: ${Math.round(m.yesPrice * 100)}%`).join('\n')
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 1,
        max_completion_tokens: 1500,
        reasoning_effort: 'low',
        stream: false,
        messages: [
          { role: 'system', content: SCAN_SYSTEM_PROMPT },
          { role: 'user', content: `Contract: ${question}\nPolymarket YES price: ${yesPrice}${relatedCtx}\n\nResearch:\n${research || '(none — be extra skeptical, likely PASS)'}` },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const cleaned = content.replace(/```[a-z]*\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Safety net: enforce PASS rules
    const absEdge = Math.abs(Number(parsed.edge ?? 0))
    if ((parsed.confidence === 'low' || absEdge < 0.07) && parsed.verdict !== 'PASS') {
      parsed.verdict = 'PASS'
      parsed.verdict_reason = 'Edge too small or confidence too low to justify a bet.'
    }

    return parsed
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { markets } = await req.json() as {
    markets: { id: string; question: string; outcomePrices: string | string[] }[]
  }

  const toScan = markets.slice(0, 12)

  // Pre-compute yesPrice for all markets
  const withPrices = toScan.map(m => {
    const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices
    return { ...m, yesPrice: parseFloat(prices[0]) || 0.5 }
  })

  // Group by competition for cross-market context
  const competitionGroups: Record<string, { question: string; yesPrice: number }[]> = {}
  for (const m of withPrices) {
    const key = getCompetitionKey(m.question)
    if (key) {
      if (!competitionGroups[key]) competitionGroups[key] = []
      competitionGroups[key].push({ question: m.question, yesPrice: m.yesPrice })
    }
  }

  const results = []

  for (const m of withPrices) {
    try {
      const compKey = getCompetitionKey(m.question)
      const relatedMarkets = compKey
        ? (competitionGroups[compKey] ?? []).filter(r => r.question !== m.question)
        : undefined
      const analysis = await analyzeOne(m.question, m.yesPrice, relatedMarkets)
      if (analysis) {
        results.push({
          id: m.id,
          question: m.question,
          yesPrice: m.yesPrice,
          noPrice: 1 - m.yesPrice,
          ...analysis,
          absEdge: Math.abs(analysis.edge),
          betSide: analysis.verdict === 'BET_YES' ? 'YES' : analysis.verdict === 'BET_NO' ? 'NO' : null,
        })
      }
    } catch { /* skip */ }
  }

  // Sort: real bets first (by edge size), then PASSes
  results.sort((a, b) => {
    const aIsBet = a.verdict !== 'PASS' ? 1 : 0
    const bIsBet = b.verdict !== 'PASS' ? 1 : 0
    if (aIsBet !== bIsBet) return bIsBet - aIsBet
    return b.absEdge - a.absEdge
  })

  return NextResponse.json(results)
}
