import { NextRequest, NextResponse } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY
const TAVILY_KEY = process.env.TAVILY_API_KEY

const SYSTEM_PROMPT = `You are a brutally honest sports betting analyst. Your job is finding REAL edges where the market is genuinely mispriced. Most bets are NOT worth taking.

RESEARCH HIERARCHY — trust signals in this order:
1. Vegas moneyline / betting line — the single most reliable signal. If Vegas and Polymarket agree, strong evidence the price is correct. If they diverge, that divergence is the edge.
2. Team efficiency metrics — NBA: net rating, ORTG, DRTG (not win-loss). Soccer: xG, xGA. NHL: Corsi%, goals-for%. These are far more predictive than records.
3. Star player injury status — missing a star shifts probability 10-20%
4. Rest/fatigue — back-to-back costs ~7% win probability
5. Current momentum (last 5-7 games) — more predictive than season record
6. Home/away advantage — ~4-5% NBA/NHL, ~6-8% soccer
7. Head-to-head RECENT history (this season, not career)
8. Tactical matchup, big-game pressure, cultural stakes

CRITICAL RULES:
- Win-loss records alone are WEAK. Always prefer efficiency metrics (net rating, xG, Corsi) over W-L.
- If Vegas odds are in the research, weight them heavily — Vegas has access to the same info plus sharps.
- If Polymarket price ≈ Vegas implied probability → market is efficient → likely PASS.
- If Polymarket price diverges significantly from Vegas → potential edge.
- CROSS-MARKET CONSISTENCY: if related markets provided, estimates must sum to ~100%.

Calibration:
- "high" confidence only when P > 72% or P < 28%
- "medium" for 55-72%
- Never exceed 80% for any single game
- Edge threshold for a bet: abs(edge) >= 7% AND confidence medium+

Return ONLY raw JSON, no markdown, no backticks:
{
  "yes_probability": 0.XX,
  "reasoning": "2-3 sentences citing specific stats, Vegas line, or efficiency metrics from research",
  "key_factors": ["specific stat/fact 1", "specific stat/fact 2", "specific stat/fact 3"],
  "confidence": "high|medium|low",
  "edge": 0.XX,
  "verdict": "BET_YES|BET_NO|PASS",
  "verdict_reason": "One sentence: specific reason to bet or pass"
}

edge = yes_probability minus polymarket_price (negative = NO has value).
verdict MUST be PASS when: confidence low, OR abs(edge) < 0.07, OR research thin/conflicting.`

async function callGroq(
  question: string,
  polymarketYesPrice: number,
  research: string,
  limitedData: boolean,
  relatedMarkets?: { question: string; yesPrice: number }[]
): Promise<Record<string, unknown>> {
  let relatedCtx = ''
  if (relatedMarkets && relatedMarkets.length > 0) {
    relatedCtx = '\n\nRELATED MARKETS IN SAME COMPETITION (use for cross-market consistency):\n' +
      relatedMarkets.map(m => `- "${m.question}" → Market YES price: ${Math.round(m.yesPrice * 100)}%`).join('\n')
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 1,
      max_completion_tokens: 4096,
      reasoning_effort: 'medium',
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Contract: ${question}\nPolymarket YES price: ${polymarketYesPrice}${relatedCtx}\n\nResearch:\n${research || '(no research available — be extra skeptical, likely PASS)'}`,
        },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(content)
  } catch {
    const cleaned = content.replace(/```[a-z]*\n?/g, '').trim()
    parsed = JSON.parse(cleaned)
  }

  if (limitedData) parsed.limitedData = true

  // Enforce PASS rule client-side as safety net
  const edge = Math.abs(Number(parsed.edge ?? 0))
  if ((parsed.confidence === 'low' || edge < 0.07) && parsed.verdict !== 'PASS') {
    parsed.verdict = 'PASS'
    parsed.verdict_reason = parsed.verdict_reason ?? 'Edge too small or confidence too low to justify a bet.'
  }

  return parsed
}

function extractTeams(question: string): [string, string] {
  // Try "Team A vs Team B" pattern
  const vsMatch = question.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s+\d{4}|\?|$)/i)
  if (vsMatch) return [vsMatch[1].trim(), vsMatch[2].trim()]
  // Try "Will X win" pattern
  const willMatch = question.match(/will\s+(.+?)\s+win/i)
  if (willMatch) return [willMatch[1].trim(), '']
  return [question.slice(0, 30), '']
}

function buildTavilyQueries(question: string): string[] {
  const q = question.toLowerCase()
  const [team1, team2] = extractTeams(question)
  const isNBA = q.includes('nba') || q.includes('basketball')
  const isNHL = q.includes('nhl') || q.includes('hockey') || q.includes('stanley')
  const isSoccer = q.includes('champions league') || q.includes('premier league') || q.includes('la liga') || q.includes('bundesliga') || q.includes('serie a') || q.includes('ucl')
  const isUFC = q.includes('ufc') || q.includes('mma') || q.includes('boxing') || q.includes('fight')

  // Q1: Vegas betting line / moneyline — most important signal
  const oddsQuery = team2
    ? `${team1} vs ${team2} moneyline betting odds spread today 2025`
    : `${question} betting odds moneyline 2025`

  // Q2: Efficiency / advanced stats — better than win-loss
  let statsQuery: string
  if (isNBA) {
    statsQuery = team2
      ? `${team1} ${team2} net rating offensive defensive rating 2025 NBA stats`
      : `${question} NBA net rating offensive defensive efficiency 2025`
  } else if (isNHL) {
    statsQuery = team2
      ? `${team1} ${team2} Corsi goals-for percentage NHL 2025 stats`
      : `${question} NHL Corsi goals-for percentage 2025`
  } else if (isSoccer) {
    statsQuery = team2
      ? `${team1} ${team2} xG xGA expected goals possession stats 2025`
      : `${question} xG expected goals possession 2025`
  } else if (isUFC) {
    statsQuery = `${question} significant strikes takedowns grappling stats record`
  } else {
    statsQuery = `${question} advanced stats efficiency metrics 2025`
  }

  // Q3: Pre-match news — injuries, squad, form
  const newsQuery = `${question} injury report lineup news preview 2025`

  // Q4: H2H + pressure/cultural factors
  const contextQuery = q.includes('final') || q.includes('cup') || q.includes('playoff') || q.includes('champions')
    ? `${question} head to head history big game record pressure rivalry crowd`
    : team2
      ? `${team1} vs ${team2} head to head recent form home away 2024 2025`
      : `${question} recent form home away history`

  return [oddsQuery, statsQuery, newsQuery, contextQuery]
}

async function tavilySearch(query: string, depth: 'basic' | 'advanced' = 'basic'): Promise<string> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
      body: JSON.stringify({ query, search_depth: depth, max_results: 5 }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.results ?? [])
      .map((r: { title: string; content: string }) => `${r.title}: ${String(r.content ?? '').slice(0, 350)}`)
      .join('\n\n')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { question, polymarketYesPrice, relatedMarkets } = await req.json() as {
    question: string
    polymarketYesPrice: number
    relatedMarkets?: { question: string; yesPrice: number }[]
  }

  let tavilyResearch = ''
  let limitedData = false
  try {
    const queries = buildTavilyQueries(question)
    // Run 4 parallel searches: Vegas odds, efficiency stats, injury news, h2h+context
    const results = await Promise.all([
      tavilySearch(queries[0], 'advanced'), // Vegas odds — most important
      tavilySearch(queries[1], 'advanced'), // efficiency stats
      tavilySearch(queries[2], 'basic'),    // injury/lineup news
      tavilySearch(queries[3], 'basic'),    // h2h + context
    ])
    // Label each section so AI knows what it's reading
    const labels = ['BETTING ODDS / VEGAS LINE', 'EFFICIENCY STATS', 'INJURY & LINEUP NEWS', 'HEAD-TO-HEAD & CONTEXT']
    const combined = results
      .map((r, i) => r ? `=== ${labels[i]} ===\n${r}` : '')
      .filter(Boolean)
      .join('\n\n')
    tavilyResearch = combined.slice(0, 8000)
    if (!tavilyResearch) limitedData = true
  } catch {
    limitedData = true
  }

  try {
    const result = await callGroq(question, polymarketYesPrice, tavilyResearch, limitedData, relatedMarkets)
    return NextResponse.json(result)
  } catch (e1) {
    console.error('[analyze] first attempt:', e1)
    try {
      const result = await callGroq(question, polymarketYesPrice, tavilyResearch, limitedData, relatedMarkets)
      return NextResponse.json(result)
    } catch (e2) {
      console.error('[analyze] retry failed:', e2)
      return NextResponse.json({ error: 'Analysis unavailable' }, { status: 200 })
    }
  }
}
