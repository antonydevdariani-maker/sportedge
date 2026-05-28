import { NextRequest, NextResponse } from 'next/server'

const SPORTS_KEYWORDS = [
  'nba','nhl','ufc','mma','boxing','tennis','golf','pga',
  'world cup','fifa','stanley cup','super bowl','playoffs',
  'wimbledon','us open','australian open','french open','masters',
  'thunder','knicks','spurs','cavaliers','lakers','celtics','heat','bulls',
  'warriors','nets','bucks','suns','nuggets','clippers','76ers',
  'hurricanes','avalanche','golden knights','canadiens','maple leafs',
  'rangers','penguins','oilers','flames','sharks','canucks','bruins',
  'chiefs','ravens','eagles','cowboys','patriots','49ers','packers',
  'bills','bengals','dolphins','rams','broncos','bears','lions',
  'yankees','dodgers','red sox','cubs','mets','braves','astros',
  'real madrid','barcelona','manchester','liverpool','arsenal','chelsea',
  'champions league','premier league','la liga','serie a','bundesliga',
  'nba finals','nhl finals','world series','eastern conference','western conference',
  'basketball','hockey','baseball','soccer','football game',
]

function detectSport(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('nba') || q.includes('basketball') || q.includes('eastern conference') || q.includes('western conference') || ['thunder','knicks','spurs','cavalier','laker','celtic','heat','bulls','warriors','nets','buck','sun','nugget','clipper'].some(t => q.includes(t))) return 'NBA'
  if (q.includes('nhl') || q.includes('hockey') || q.includes('stanley') || ['hurricane','avalanche','golden knights','canadien','maple leaf','ranger','penguin','oiler','flame','shark','canuck','bruin'].some(t => q.includes(t))) return 'NHL'
  if (q.includes('world cup') || q.includes('fifa')) return 'World Cup'
  if (q.includes('champions league') || q.includes('premier league') || q.includes('la liga') || q.includes('bundesliga') || q.includes('serie a') || ['real madrid','barcelona','manchester','liverpool','arsenal','chelsea','psg','atletico'].some(t => q.includes(t))) return 'Soccer'
  if (q.includes('nfl') || q.includes('super bowl') || ['chiefs','ravens','eagles','cowboys','patriots','49ers','packers','bills','bengals','dolphins','rams','broncos','bear','lion'].some(t => q.includes(t))) return 'NFL'
  if (q.includes('mlb') || q.includes('world series') || q.includes('baseball') || ['yankees','dodgers','red sox','cubs','mets','braves','astros','padres'].some(t => q.includes(t))) return 'MLB'
  if (q.includes('ufc') || q.includes('mma') || q.includes('fight') || q.includes('boxing')) return 'UFC/Boxing'
  if (q.includes('tennis') || q.includes('wimbledon') || q.includes('grand slam')) return 'Tennis'
  if (q.includes('golf') || q.includes('masters') || q.includes('pga')) return 'Golf'
  return 'Sports'
}

function isSports(question: string): boolean {
  const q = question.toLowerCase()
  return SPORTS_KEYWORDS.some(k => q.includes(k))
}

async function fetchPage(offset: number): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=100&offset=${offset}&active=true&closed=false`,
      { next: { revalidate: 120 } }
    )
    if (!res.ok) return []
    const d = await res.json()
    return Array.isArray(d) ? d : d.markets ?? []
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') ?? ''

  try {
    // Fetch pages known to contain sports markets in parallel
    const pages = await Promise.all([fetchPage(0), fetchPage(200)])
    const all = pages.flat()

    // Deduplicate
    const seen = new Set<string>()
    const unique: Record<string, unknown>[] = []
    for (const m of all) {
      const id = String(m.id ?? '')
      if (!seen.has(id)) { seen.add(id); unique.push(m) }
    }

    const now = new Date().toISOString()
    let markets = unique.filter((m) =>
      m.active === true &&
      m.closed === false &&
      typeof m.endDate === 'string' &&
      m.endDate > now &&
      isSports(String(m.question ?? ''))
    )

    // Client search filter
    if (query) {
      const q = query.toLowerCase()
      markets = markets.filter((m) =>
        String(m.question ?? '').toLowerCase().includes(q)
      )
    }

    // Sort by volume desc, cap at 60
    markets = markets
      .sort((a, b) => parseFloat(String(b.volume ?? 0)) - parseFloat(String(a.volume ?? 0)))
      .slice(0, 60)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const result = markets.map((m) => {
      const question = String(m.question ?? '')
      const endsAt = String(m.endDate ?? '')
      const endsDate = new Date(endsAt)
      const isLive = endsDate >= today && endsDate < tomorrow

      return {
        id: m.id,
        question,
        outcomes: m.outcomes ?? '["Yes","No"]',
        outcomePrices: m.outcomePrices,
        volume: m.volume,
        endDate: endsAt,
        url: m.url ?? `https://polymarket.com/event/${m.slug ?? m.id}`,
        sport: detectSport(question),
        isLive,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[markets]', err)
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 })
  }
}
