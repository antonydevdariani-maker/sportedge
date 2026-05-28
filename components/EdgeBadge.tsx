interface Props {
  edge: number
  showSide?: boolean
}

export default function EdgeBadge({ edge, showSide = true }: Props) {
  const absEdge = Math.abs(edge)
  const pct = (absEdge * 100).toFixed(1)
  const isYes = edge > 0
  const isNo = edge < 0
  const hasEdge = absEdge > 0.02

  if (!hasEdge) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold font-mono bg-zinc-700/50 text-zinc-500 border border-zinc-700">
        No Edge
      </span>
    )
  }

  const side = isYes ? 'YES' : 'NO'
  const bg = isYes ? '#1a3a0f' : '#3a0f0f'
  const border = isYes ? '#639922' : '#A32D2D'
  const textColor = isYes ? '#86cc30' : '#e05555'

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold font-mono border"
      style={{ backgroundColor: bg, borderColor: border, color: textColor }}
    >
      {showSide && (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: border, color: '#fff' }}>
          {side}
        </span>
      )}
      +{pct}% edge
    </span>
  )
}
