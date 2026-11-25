import { useId } from 'react'

// SVG-аватар растения в горшке. Все параметры необязательные: старые записи
// { leaf, leafColor, pot, potColor } рисуются как раньше.
//
// Листья:  leaf (форма), leafSize, leafCount, spread, pattern + leaf2Color (узор), leafColor
// Горшок:  pot (форма), potTexture, potColor

// Форма листа: rx/ry — полуширина и длина/2 по умолчанию, kind — как рисуем.
export const LEAVES = {
  spiky: { angles: [-52, -34, -16, 0, 16, 34, 52], rx: 5, ry: 30, kind: 'oval' },
  broad: { angles: [-58, -30, 0, 30, 58], rx: 13, ry: 24, kind: 'oval' },
  bushy: { angles: [-65, -45, -25, -8, 8, 25, 45, 65], rx: 10, ry: 17, kind: 'oval' },
  round: { angles: [-60, -30, 0, 30, 60], rx: 15, ry: 16, kind: 'oval' },
  drop: { angles: [-58, -30, 0, 30, 58], rx: 11, ry: 24, kind: 'drop' },
  heart: { angles: [-58, -30, 0, 30, 58], rx: 12, ry: 21, kind: 'heart' },
}

const SIZES = { s: 0.78, m: 1, l: 1.2 }
const COUNTS = { few: 3, mid: 5, many: 9 }
const SPREADS = { narrow: 32, normal: 56, wide: 78 }

// Горшки: тело, обод (x1..x2 на высоте top).
export const POTS = {
  round: { d: 'M30 78 H70 Q73 104 50 106 Q27 104 30 78Z', rim: [28, 72, 76] },
  square: { d: 'M32 78 H68 V104 Q68 106 66 106 H34 Q32 106 32 104Z', rim: [28, 72, 76] },
  tapered: { d: 'M29 78 H71 L64 106 H36Z', rim: [28, 72, 76] },
  bowl: { d: 'M23 80 H77 Q77 106 50 106 Q23 106 23 80Z', rim: [21, 79, 78] },
  tall: { d: 'M35 68 H65 Q66 90 62 106 H38 Q34 90 35 68Z', rim: [33, 67, 66] },
}

function lerpAngles(n, max) {
  if (n === 1) return [0]
  return Array.from({ length: n }, (_, i) => -max + (2 * max * i) / (n - 1))
}

// Контур листа от основания (0,0) вверх до кончика (0, -2ry).
function leafPath(kind, rx, ry) {
  if (kind === 'drop') {
    return `M0 0 C${-rx * 1.3} ${-ry * 0.5} ${-rx * 0.7} ${-ry * 1.5} 0 ${-2 * ry} C${rx * 0.7} ${-ry * 1.5} ${rx * 1.3} ${-ry * 0.5} 0 0Z`
  }
  // heart
  return `M0 ${-2 * ry} C${-0.5 * rx} ${-1.5 * ry} ${-1.4 * rx} ${-1.1 * ry} ${-1.1 * rx} ${-0.5 * ry} C${-0.9 * rx} ${0.1 * ry} ${-0.2 * rx} ${0.1 * ry} 0 ${-0.2 * ry} C${0.2 * rx} ${0.1 * ry} ${0.9 * rx} ${0.1 * ry} ${1.1 * rx} ${-0.5 * ry} C${1.4 * rx} ${-1.1 * ry} ${0.5 * rx} ${-1.5 * ry} 0 ${-2 * ry}Z`
}

function Pattern({ pattern, rx, ry, color }) {
  if (pattern === 'midrib') return <path d={`M0 ${-ry * 0.15} L0 ${-ry * 1.85}`} stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  if (pattern === 'stripes') {
    return (
      <g stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d={`M0 ${-ry * 0.15} L0 ${-ry * 1.85}`} />
        {[0.55, 0.95, 1.35].map((k) => (
          <g key={k}>
            <path d={`M0 ${-ry * k} L${-rx * 0.75} ${-ry * (k + 0.28)}`} />
            <path d={`M0 ${-ry * k} L${rx * 0.75} ${-ry * (k + 0.28)}`} />
          </g>
        ))}
      </g>
    )
  }
  if (pattern === 'spots') {
    return (
      <g fill={color}>
        {[[-0.35, 0.7, 1.7], [0.4, 1.0, 1.4], [-0.2, 1.4, 1.5], [0.25, 0.5, 1.2]].map(([x, k, r], i) => (
          <circle key={i} cx={rx * x} cy={-ry * k} r={r} />
        ))}
      </g>
    )
  }
  return null
}

export default function PlantArt({
  leaf, leafColor, leaf2Color = '#f3e9c6', leafSize, leafCount, spread, pattern,
  pot, potColor, potTexture,
}) {
  const uid = useId().replace(/:/g, '')
  const base = LEAVES[leaf] ?? LEAVES.broad
  const k = SIZES[leafSize] ?? 1
  const rx = base.rx * k
  const ry = base.ry * k
  const angles = leafCount || spread
    ? lerpAngles(COUNTS[leafCount] ?? COUNTS.mid, SPREADS[spread] ?? SPREADS.normal)
    : base.angles
  const potDef = POTS[pot] ?? POTS.round
  const [rimX1, rimX2, rimTop] = potDef.rim
  const rimColor = potColor

  return (
    <svg viewBox="0 0 100 120" className="plant-art" aria-hidden="true">
      <defs>
        <clipPath id={`pot-${uid}`}><path d={potDef.d} /></clipPath>
      </defs>
      <ellipse cx="50" cy="109" rx="38" ry="5" fill="rgba(0,0,0,.35)" />
      {angles.map((a, i) => (
        <g key={a} transform={`translate(50 80) rotate(${a})`} opacity={i % 2 ? 0.85 : 1}>
          {base.kind === 'oval' ? (
            <ellipse cx="0" cy={-ry} rx={rx} ry={ry} fill={leafColor} stroke="rgba(0,0,0,.18)" strokeWidth="0.8" />
          ) : (
            <path d={leafPath(base.kind, rx, ry)} fill={leafColor} stroke="rgba(0,0,0,.18)" strokeWidth="0.8" />
          )}
          {pattern === 'edge' ? (
            base.kind === 'oval' ? (
              <ellipse cx="0" cy={-ry} rx={rx * 0.86} ry={ry * 0.9} fill="none" stroke={leaf2Color} strokeWidth="1.6" />
            ) : (
              <path d={leafPath(base.kind, rx * 0.85, ry * 0.9)} fill="none" stroke={leaf2Color} strokeWidth="1.6" transform={`translate(0 ${-ry * 0.1})`} />
            )
          ) : (
            <Pattern pattern={pattern} rx={rx} ry={ry} color={leaf2Color} />
          )}
        </g>
      ))}
      <path d={potDef.d} fill={potColor} />
      <g clipPath={`url(#pot-${uid})`}>
        <PotTexture texture={potTexture} />
      </g>
      <rect x={rimX1} y={rimTop} width={rimX2 - rimX1} height="5" rx="2.5" fill={rimColor} filter="brightness(1.12)" />
    </svg>
  )
}

function PotTexture({ texture }) {
  if (texture === 'ribs') {
    return (
      <g stroke="rgba(0,0,0,.22)" strokeWidth="1.3">
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${24 + i * 5} 66 V108`} />)}
      </g>
    )
  }
  if (texture === 'grid') {
    // клетка, как скатерть
    const cells = []
    for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) if ((r + c) % 2 === 0) cells.push(<rect key={`${r}${c}`} x={23 + c * 5} y={64 + r * 5.5} width="5" height="5.5" />)
    return <g fill="rgba(255,255,255,.42)">{cells}</g>
  }
  if (texture === 'stripes') {
    return (
      <g fill="rgba(255,255,255,.3)">
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="20" y={66 + i * 9} width="60" height="4.5" />)}
      </g>
    )
  }
  if (texture === 'dots') {
    const dots = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 10; c++) dots.push(<circle key={`${r}${c}`} cx={27 + c * 5.4 + (r % 2) * 2.7} cy={68 + r * 5.6} r="1.3" />)
    return <g fill="rgba(255,255,255,.55)">{dots}</g>
  }
  return null
}
