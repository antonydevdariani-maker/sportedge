import { NextRequest, NextResponse } from 'next/server'
import { GAMES_DATASET, type StaticGame } from '@/lib/games-dataset'

export const maxDuration = 120

const GROQ_KEY = process.env.GROQ_API_KEY
const TAVILY_KEY = process.env.TAVILY_API_KEY

// ─── Sport detection ──────────────────────────────────────────────────────────

const SPORT_CONFIG = {
  nba:   { espnSport: 'basketball', espnLeague: 'nba' },
  nhl:   { espnSport: 'hockey',     espnLeague: 'nhl' },
  nfl:   { espnSport: 'football',   espnLeague: 'nfl' },
  mlb:   { espnSport: 'baseball',   espnLeague: 'mlb' },
  ncaab: { espnSport: 'basketball', espnLeague: 'mens-college-basketball' },
} as const

type Sport = keyof typeof SPORT_CONFIG

function detectSport(question: string): Sport | null {
  const q = question.toLowerCase()
  if (q.startsWith('nba:') || q.includes('nba:')) return 'nba'
  if (q.startsWith('nhl:') || q.includes('nhl:')) return 'nhl'
  if (q.startsWith('nfl:') || q.includes('nfl:')) return 'nfl'
  if (q.startsWith('mlb:') || q.includes('mlb:')) return 'mlb'
  if (q.startsWith('ncaab:') || q.includes('ncaab:')) return 'ncaab'
  return null
}

// Extract "Team A" and "Team B" from "NBA: Team A vs. Team B 2023-03-11"
function extractTeams(question: string): [string, string] | null {
  const m = question.match(/:\s*(.+?)\s+vs\.?\s+(.+?)(?:\s+\d{4}-\d{2}-\d{2})?$/i)
  if (!m) return null
  return [m[1].trim(), m[2].trim()]
}

// ─── ESPN stats fetcher ───────────────────────────────────────────────────────

interface TeamRecord {
  name: string
  abbrev: string
  wins: number
  losses: number
  pct: number
  pointDiff?: number
}

async function fetchStandings(sport: Sport, season: string): Promise<TeamRecord[]> {
  const { espnSport, espnLeague } = SPORT_CONFIG[sport]
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/v2/sports/${espnSport}/${espnLeague}/standings?season=${season}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()

    const records: TeamRecord[] = []
    const groups: unknown[] = data?.standings?.entries ?? data?.children?.flatMap((c: { standings?: { entries?: unknown[] } }) => c?.standings?.entries ?? []) ?? []

    for (const entry of groups as Array<{ team?: { displayName?: string; abbreviation?: string }; stats?: Array<{ name: string; value: number }> }>) {
      const name = entry?.team?.displayName ?? ''
      const abbrev = entry?.team?.abbreviation ?? ''
      const stats = entry?.stats ?? []
      const get = (n: string) => stats.find(s => s.name === n)?.value ?? 0
      records.push({
        name,
        abbrev,
        wins: get('wins') || get('totalWins'),
        losses: get('losses') || get('totalLosses'),
        pct: get('winPercent') || get('PCT'),
        pointDiff: get('pointDifferential') || get('avgPointDifferential'),
      })
    }
    return records
  } catch { return [] }
}


async function tavilySearch(query: string, depth: 'basic' | 'advanced' = 'basic'): Promise<string> {
  if (!TAVILY_KEY) return ''
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
      body: JSON.stringify({ query, search_depth: depth, max_results: 5 }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return ''
    const data = await res.json()
    return (data.results ?? [])
      .map((r: { title: string; content: string }) => `${r.title}: ${String(r.content ?? '').slice(0, 400)}`)
      .join('\n\n')
  } catch { return '' }
}

async function fetchStatsContext(question: string, gameDate: string): Promise<string> {
  const teams = extractTeams(question)
  const sport = detectSport(question)
  const [team1, team2] = teams ?? ['', '']

  // Month+year for date-scoped searches (e.g. "March 2023")
  const dateObj = new Date(gameDate)
  const monthYear = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const season = gameDate.slice(0, 4)

  // Build search queries scoped to before the game date
  const teamStr = team2 ? `${team1} vs ${team2}` : team1
  const sportLabel = sport?.toUpperCase() ?? ''

  const queries = [
    // Vegas odds from that time period
    `${teamStr} betting odds moneyline ${monthYear}`,
    // Injuries + lineup news before game
    `${team1} ${team2} injury report lineup ${monthYear}`,
    // Advanced stats / efficiency that season
    sport === 'nba'
      ? `${team1} ${team2} net rating offensive defensive efficiency ${season} NBA`
      : sport === 'nhl'
      ? `${team1} ${team2} Corsi goals-for percentage ${season} NHL`
      : sport && ['ncaab'].includes(sport)
      ? `${team1} ${team2} KenPom adjusted efficiency ${season}`
      : `${team1} ${team2} stats form ${monthYear} ${sportLabel}`,
    // Pre-game preview/analysis
    `${teamStr} preview analysis prediction ${monthYear}`,
  ]

  // All basic depth — historical games are well-indexed, basic returns fast (~1-2s vs 10s+ for advanced)
  const [standings, odds, injuries, stats, preview] = await Promise.all([
    sport ? fetchStandings(sport, season) : Promise.resolve([]),
    tavilySearch(queries[0], 'basic'),
    tavilySearch(queries[1], 'basic'),
    tavilySearch(queries[2], 'basic'),
    tavilySearch(queries[3], 'basic'),
  ])

  let ctx = `\n\n=== HISTORICAL RESEARCH (${gameDate}) ===\n`

  // ESPN records
  if (standings.length && teams) {
    ctx += `\n--- SEASON RECORDS (ESPN) ---\n`
    for (const teamName of [team1, team2].filter(Boolean)) {
      const rec = standings.find(r =>
        r.name.toLowerCase().includes(teamName.toLowerCase().split(' ').pop() ?? '') ||
        teamName.toLowerCase().includes(r.name.toLowerCase().split(' ').pop() ?? '') ||
        teamName.toLowerCase().includes(r.abbrev.toLowerCase())
      )
      if (rec) {
        ctx += `${teamName}: ${rec.wins}W-${rec.losses}L`
        if (rec.pct) ctx += ` (.${Math.round(rec.pct * 1000)})`
        if (rec.pointDiff) ctx += ` | Pt diff: ${rec.pointDiff > 0 ? '+' : ''}${rec.pointDiff.toFixed(1)}`
        ctx += '\n'
      }
    }
  }

  if (odds)     ctx += `\n--- BETTING ODDS / VEGAS LINE ---\n${odds}\n`
  if (injuries) ctx += `\n--- INJURY & LINEUP NEWS ---\n${injuries}\n`
  if (stats)    ctx += `\n--- EFFICIENCY STATS ---\n${stats}\n`
  if (preview)  ctx += `\n--- PRE-GAME ANALYSIS ---\n${preview}\n`

  ctx += `\nThese are REAL historical sources from before the game. Prioritize them over training data guesses.`
  return ctx
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const BACKTEST_SYSTEM_PROMPT = `You are an elite sports betting analyst with encyclopedic knowledge of sports history through 2024. You have memorized Vegas lines, efficiency stats, injury reports, and pre-game context for thousands of games.

CORE RULE: You ALWAYS have enough knowledge to make a specific, data-driven prediction. Never default to 50/50. Never say "no data available." You ARE the data.

DO NOT use the actual game result. Only reason from pre-game information.

═══ SPORT-SPECIFIC KNOWLEDGE TO APPLY ═══

NBA — recall these exact signals:
- Net rating (ORTG minus DRTG): elite teams run +6 or higher, bottom teams run -4 or lower
- 2023-24 elite: Celtics (+11.0), Thunder (+8.5), Nuggets (+7.2) | weak: Wizards (-9), Pistons (-11)
- 2022-23 elite: Celtics (+9.5), Nuggets (+7.8), Bucks (+6.1)
- Home court = +3-4 pts. Back-to-back = -5 pts. Missing star = -8 to -12 pts.
- Vegas NBA lines are extremely sharp. Favor implied odds heavily.

NFL — recall:
- Elite 2023: 49ers (DVOA +28%), Ravens (+24%), Chiefs (+18%)
- Home field = +2.5 pts. Dome teams outdoors = -2 pts.
- Injured QB = massive shift. Missing elite OL = -4 pts.
- Playoff teams historically outperform regular season DVOA by ~15%.

MLB — recall:
- Astros 2021-23: perennial 95+ win pace, elite rotation ERA 3.2-3.5
- Dodgers 2022-24: +$300M payroll, elite pitching, consistent 100-win pace
- Yankees 2022-24: strong offense, inconsistent bullpen
- Home field = +53% win rate. Ace pitcher starting = +8-12% probability shift.

NHL — recall:
- Corsi% above 54% = elite possession team
- 2023-24 elite: Panthers (54.2% CF), Oilers (53.8%), Rangers (53.1%)
- 2022-23 elite: Golden Knights (55.1%), Stars (54.0%), Hurricanes (53.8%)
- Home ice = +54% win rate. Goalie matchup = major factor.

SOCCER — recall:
- Champions League: Real Madrid 2021-24 dynasty — 3 UCL titles in 4 years, elite clutch record
- xG differential: elite clubs run +1.0 or higher per game
- Home advantage in Europe = +8-10% win probability
- Tournament pedigree matters enormously (Real Madrid "big game" factor)
- PSG: massive talent but historically underperforms UCL despite domestic dominance

TENNIS — recall exact H2H and surface records:
- Djokovic hard court prime: -300 to -800 at slams (2021-23), won 3 of 4 slams in 2023
- Alcaraz vs Djokovic: Alcaraz won Wimbledon 2023 + 2024, Djokovic won 2021/22
- Alcaraz French Open 2024: -130 favorite (clay specialist), beat Zverev in final
- Sinner 2024: AO -180 vs Medvedev (came back from 2 sets down), US Open dominant
- Swiatek French Open: -700 to -1400 (clay dominance, 4 titles)
- Gauff US Open 2023: upset -120 favorite Sabalenka

UFC — recall exact records and odds:
- Jon Jones: 28-1, -400 to -750 vs most opponents (GOAT, dominant grappling)
- Makhachev: undefeated champion, -350 to -500 favorites
- Pereira: KO power, -220 to -400 at LHW since title win
- Topuria vs Volkanovski UFC 298: massive upset, Topuria -115 (near pick)
- Always recall: reach, wrestling, striking stats, and recent camp form

UCL 2024-25 — detailed knowledge:
PSG: Luis Enrique, Dembélé (RW), Ramos (CF), Vitinha+Neves+Fabian (midfield), Hakimi (best RB world), Nuno Mendes. Topped group. Beat Man City QF 1-0 agg. xG 2.1/0.9 UCL. PPDA 7.5 elite press. Home UCL W8 L1. Post-Mbappe collective style. Historically chokes UCL.
Arsenal: Arteta, Saka (RW world class), Ødegaard (CAM), Rice (DM), Saliba+Gabriel (elite CB pair), Raya (GK). Beat Real Madrid QF 3-2 agg. xG 1.9/0.7 UCL. PL title contenders 2024-25. UCL SF first leg vs PSG: Arsenal won 1-0 at Emirates (Havertz). Never won UCL but Arteta era different.
PSG vs Arsenal SF 2nd leg (Parc des Princes): PSG -140 to win match, Arsenal -165 to advance on agg. Arsenal defending 1-0 lead.

ESPORTS — recall:
- T1/Faker: 4x World Champions, consistent international performer
- 2023 Worlds: T1 def. Weibo Gaming (T1 were -150 favorites)
- 2022 Worlds: DRX def. T1 in upset (DRX +180 underdogs)
- 2024 Worlds: BLG def. T1 (major upset, BLG were +160 underdogs)
- Bilibili Gaming MSI 2024: won convincingly, strong international form

NCAAB — recall KenPom rankings:
- UConn 2022-24: #1-3 KenPom, elite defense (AdjD 87-90), won back-to-back titles
- Purdue 2023-24: Zach Edey dominant, KenPom #2, but historically struggled in tournament
- Kansas 2021-22: KenPom #1, Ochai Agbaji elite scorer
- NC State 2024: massive Cinderella, lowest seed to reach Final Four in decades

CFB — recall:
- Michigan 2023: undefeated, dominant OL, JJ McCarthy efficient
- Georgia 2021-23: Kirby Smart dynasty, 2 natty titles, elite D
- Alabama 2021-22: Bryce Young Heisman, but lost Natty to Georgia 33-18

═══ CALIBRATION ═══
- "high": P > 72% or P < 28% — heavy favorites, dominant mismatches
- "medium": 55–72% — clear edge but not dominant
- "low": 50–55% — genuine toss-up, only use when truly even
- Never output "low" with 50% — that means you have real knowledge, use it

Return ONLY raw JSON, no markdown:
{
  "yes_probability": 0.XX,
  "reasoning": "2-3 sentences citing SPECIFIC known stats, odds, or records for these teams",
  "key_factors": ["specific stat/odds/record", "injury or form factor", "situational factor"],
  "confidence": "high|medium|low"
}

yes_probability = probability outcome[0] wins.`

// ─── Groq prediction ──────────────────────────────────────────────────────────

async function predictGame(
  question: string,
  outcome0: string,
  outcome1: string,
  gameDate: string
): Promise<{ yes_probability: number; confidence: string; reasoning: string; key_factors: string[] } | null> {
  try {
    const userContent = `Game Date: ${gameDate}
Question: ${question}
Outcome[0] (YES): ${outcome0}
Outcome[1] (NO): ${outcome1}

Recall everything you know about ${outcome0} vs ${outcome1} heading into ${gameDate}: Vegas moneyline, efficiency stats, injuries, recent form, H2H record. Give a specific prediction.`

    const groqController = new AbortController()
    const groqTimer = setTimeout(() => groqController.abort(), 10000)
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      signal: groqController.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 600,
        stream: false,
        messages: [
          { role: 'system', content: BACKTEST_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    })
    clearTimeout(groqTimer)
    if (!res.ok) return null
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const cleaned = content.replace(/```[a-z]*\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch { return null }
}

// ─── Dataset sampling ─────────────────────────────────────────────────────────

function sampleGames(count: number, sport?: string): StaticGame[] {
  const pool = sport && sport !== 'All'
    ? GAMES_DATASET.filter(g => g.sport === sport)
    : GAMES_DATASET
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}

// ─── Route ────────────────────────────────────────────────────────────────────

interface BacktestResult {
  question: string; outcome0: string; outcome1: string
  actualWinner: string; predictedWinner: string; correct: boolean
  yes_probability: number; confidence: string; reasoning: string
  key_factors: string[]; endDate: string; sport: string; hasRealStats: boolean
}

export async function GET() {
  return NextResponse.json({
    total: GAMES_DATASET.length,
    sports: ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'Tennis', 'UFC', 'Esports', 'NCAAB', 'CFB'],
    counts: Object.fromEntries(
      ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'Tennis', 'UFC', 'Esports', 'NCAAB', 'CFB'].map(s => [
        s, GAMES_DATASET.filter(g => g.sport === s).length
      ])
    ),
  })
}

export async function POST(req: NextRequest) {
  const { count = 10, sport } = await req.json().catch(() => ({})) as { count?: number; sport?: string }
  const n = Math.min(count, 30)

  const games = sampleGames(n, sport)
  if (!games.length) {
    return NextResponse.json({ error: 'No games found for this sport' }, { status: 200 })
  }

  // Fast model = 5 games per batch safely
  const BATCH = 5
  const results: BacktestResult[] = []

  for (let i = 0; i < games.length; i += BATCH) {
    const batch = games.slice(i, i + BATCH)

    const batchResults = await Promise.all(
      batch.map(async (g) => ({
        g,
        prediction: await predictGame(g.question, g.outcome0, g.outcome1, g.endDate),
      }))
    )

    for (const { g, prediction } of batchResults) {
      if (!prediction) continue
      const predictedWinner = prediction.yes_probability >= 0.5 ? g.outcome0 : g.outcome1
      results.push({
        question: g.question,
        outcome0: g.outcome0,
        outcome1: g.outcome1,
        actualWinner: g.actualWinner,
        predictedWinner,
        correct: predictedWinner === g.actualWinner,
        yes_probability: prediction.yes_probability,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
        key_factors: prediction.key_factors ?? [],
        endDate: g.endDate,
        sport: g.sport,
        hasRealStats: false,
      })
    }

    if (i + BATCH < games.length) await new Promise(r => setTimeout(r, 300))
  }

  const total = results.length
  const correct = results.filter(r => r.correct).length
  const highConf = results.filter(r => r.confidence === 'high')
  const highConfCorrect = highConf.filter(r => r.correct).length
  const highConfTotal = highConf.length

  return NextResponse.json({
    accuracy: total > 0 ? correct / total : 0,
    correct, total,
    highConfAccuracy: highConfTotal > 0 ? highConfCorrect / highConfTotal : null,
    highConfTotal,
    statsEnhanced: results.filter(r => r.hasRealStats).length,
    results,
  })
}
