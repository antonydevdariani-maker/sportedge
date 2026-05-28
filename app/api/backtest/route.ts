import { NextRequest, NextResponse } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY

const SPORTS_KW = [
  'nba:','nhl:','ufc','mma','boxing match','tennis','wimbledon','champions league','ucl',
  'premier league','la liga','bundesliga','serie a','world cup','fifa',
  'nfl:','mlb:','ncaab:','world series','stanley cup','super bowl',
  'who will win the nba','who will win the nhl','who will win the ufc',
  'will the lakers','will the celtics','will the warriors','will the heat',
  'will the bruins','will the leafs','will the oilers','will the hurricanes',
]

const SPORTS_TEAM_PATTERN = /\b(vs\.?|vs\s)\s*\w/i

const BACKTEST_SYSTEM_PROMPT = `You are a sports historian and prediction analyst being tested on a past game. Use ONLY knowledge available before the game date.

STRICT CUTOFF: Do NOT use game results, post-game recaps, or any information from after the game date. Do NOT use current (2025) rosters or standings.

PREDICTION HIERARCHY — reason in this order:
1. Team efficiency IN THAT SEASON — NBA: net rating/ORTG/DRTG, NHL: Corsi%/goals-for%, soccer: xG/xGA. These are far more predictive than win-loss records.
2. Implied Vegas odds from that period (if you know them from training data) — Vegas lines are the gold standard
3. Star player injury status at game time — missing a star = 10-20% shift
4. Back-to-back schedule penalty — ~7% disadvantage for tired team
5. Home court/ice advantage — +4-5% NBA/NHL, +6-8% soccer
6. Playoff seeding pressure, rivalry intensity

CALIBRATION:
- "high" ONLY when P > 72% or P < 28% — reserve for clear tier mismatches
- "medium" for 55-72%
- Never exceed 80% on any single regular-season game
- A team with clearly better net rating/xG is a ~62-68% favorite, not 80%

Return ONLY raw JSON, no markdown:
{
  "yes_probability": 0.XX,
  "reasoning": "2-3 sentences referencing specific efficiency stats or known Vegas lines from that season",
  "key_factors": ["efficiency stat or known odds", "injury or fatigue factor", "context factor"],
  "confidence": "high|medium|low"
}

yes_probability = probability outcome[0] wins.`

interface ClobToken {
  outcome: string
  price: number
  winner: boolean
}

interface ClobMarket {
  question: string
  end_date_iso: string
  tokens: ClobToken[]
  market_slug?: string
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
  reasoning: string
  key_factors: string[]
  endDate: string
}


async function predictGame(question: string, outcome0: string, outcome1: string, gameDate: string): Promise<{
  yes_probability: number
  confidence: string
  reasoning: string
  key_factors: string[]
} | null> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 1,
        max_completion_tokens: 800,
        reasoning_effort: 'medium',
        stream: false,
        messages: [
          { role: 'system', content: BACKTEST_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Game Date: ${gameDate}\nQuestion: ${question}\nOutcome[0] (YES): ${outcome0}\nOutcome[1] (NO): ${outcome1}\n\nUsing ONLY your knowledge of ${outcome0} and ${outcome1} as of ${gameDate} (the day before this game), what is your probability estimate?`,
          },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const cleaned = content.replace(/```[a-z]*\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch { return null }
}

// Exclude prop/special markets that aren't clean win/loss outcomes
const EXCLUDE_PATTERNS = [
  'at least','more than','less than','over','under','how many','total points',
  'will there be','score more','points in','goals in','rebounds','assists',
  'first to','last to','by more than','margin','spread','mvp',
  'draft','trade','sign','retire','contract','transfer',
  'oscar','award','grammy','win the election','primary','nominee',
]

function isSports(question: string): boolean {
  const q = question.toLowerCase()
  if (EXCLUDE_PATTERNS.some(p => q.includes(p))) return false
  // Must match a sports keyword OR be a "Team A vs Team B" pattern with sport prefix
  return SPORTS_KW.some(k => q.includes(k)) ||
    (SPORTS_TEAM_PATTERN.test(question) && /\b(nba|nhl|nfl|mlb|ncaa|ufc|soccer|tennis|golf)\b/i.test(question))
}

async function fetchResolvedSportsMarkets(count: number): Promise<ClobMarket[]> {
  const pool: ClobMarket[] = []
  const seen = new Set<string>()
  const target = Math.max(count * 6, 120) // build large pool then sample
  let cursor = 'MA=='

  // Paginate until we have enough candidates
  for (let page = 0; page < 20 && pool.length < target; page++) {
    try {
      const res = await fetch(
        `https://clob.polymarket.com/markets?closed=true&limit=1000&next_cursor=${cursor}`
      )
      if (!res.ok) break
      const data = await res.json()
      const markets: ClobMarket[] = data.data ?? []
      if (!markets.length) break

      for (const m of markets) {
        if (!m.tokens || m.tokens.length !== 2) continue
        if (!m.question || seen.has(m.question)) continue
        if (!isSports(m.question)) continue
        if (!m.tokens.find(t => t.winner)) continue
        seen.add(m.question)
        pool.push(m)
      }

      cursor = data.next_cursor
      if (!cursor) break
    } catch { break }
  }

  // Random sample from the pool
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}

export async function POST(req: NextRequest) {
  const { count = 10 } = await req.json().catch(() => ({})) as { count?: number }
  const n = Math.min(count, 20)

  const markets = await fetchResolvedSportsMarkets(n)
  if (!markets.length) {
    return NextResponse.json({ error: 'No resolved sports markets found' }, { status: 200 })
  }

  const results: BacktestResult[] = []
  let correct = 0
  let highConfCorrect = 0
  let highConfTotal = 0

  for (const m of markets) {
    const outcome0 = m.tokens[0].outcome
    const outcome1 = m.tokens[1].outcome
    const actualWinner = m.tokens.find(t => t.winner)?.outcome ?? outcome0

    const gameDate = m.end_date_iso?.slice(0, 10) ?? ''
    const prediction = await predictGame(m.question, outcome0, outcome1, gameDate)
    if (!prediction) continue

    const predictedWinner = prediction.yes_probability >= 0.5 ? outcome0 : outcome1
    const isCorrect = predictedWinner === actualWinner

    if (isCorrect) correct++
    if (prediction.confidence === 'high') {
      highConfTotal++
      if (isCorrect) highConfCorrect++
    }

    results.push({
      question: m.question,
      outcome0,
      outcome1,
      actualWinner,
      predictedWinner,
      correct: isCorrect,
      yes_probability: prediction.yes_probability,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      key_factors: prediction.key_factors ?? [],
      endDate: m.end_date_iso?.slice(0, 10) ?? '',
    })
  }

  const total = results.length
  const accuracy = total > 0 ? correct / total : 0
  const highConfAccuracy = highConfTotal > 0 ? highConfCorrect / highConfTotal : null

  return NextResponse.json({
    accuracy,
    correct,
    total,
    highConfAccuracy,
    highConfTotal,
    results,
  })
}
