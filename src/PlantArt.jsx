import { useId } from 'react'

// SVG-аватар растения в горшке. Все параметры необязательные: старые записи
// { leaf, leafColor, pot, potColor } рисуются как раньше.
//
// Листья:  leaf (форма), leafSize, leafCount, spread, pattern + leaf2Color (узор), leafColor
// Ствол:   trunk ('single'), trunkHeight, trunkThick, trunkBend, trunkColor, leafPlace (top | along)
// Горшок:  pot (форма), potTexture, potColor

// Форма листа: rx/ry — полуширина и длина/2 по умолчанию, kind — как рисуем.
export const LEAVES = {
  spiky: { angles: [-52, -34, -16, 0, 16, 34, 52], rx: 5, ry: 30, kind: 'oval' },
  broad: { angles: [-58, -30, 0, 30, 58], rx: 13, ry: 24, kind: 'oval' },
  bushy: { angles: [-65, -45, -25, -8, 8, 25, 45, 65], rx: 10, ry: 17, kind: 'oval' },
  round: { angles: [-60, -30, 0, 30, 60], rx: 15, ry: 16, kind: 'oval' },
  drop: { angles: [-58, -30, 0, 30, 58], rx: 11, ry: 24, kind: 'drop' },
  heart: { angles: [-58, -30, 0, 30, 58], rx: 12, ry: 21, kind: 'heart' },
  lance: { angles: [-56, -28, 0, 28, 56], rx: 7, ry: 28, kind: 'drop' },
  needle: { angles: [-52, -34, -16, 0, 16, 34, 52], rx: 2.6, ry: 30, kind: 'oval' },
  fan: { angles: [-58, -30, 0, 30, 58], rx: 11, ry: 19, kind: 'fan' },
  scallop: { angles: [-58, -30, 0, 30, 58], rx: 14, ry: 22, kind: 'scallop' },
}

const TRUNK_HEIGHTS = { low: 14, mid: 26, high: 38 }
const TRUNK_WIDTHS = { thin: 2.8, thick: 5.6 }
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
  vase: { d: 'M40 74 H60 Q60 82 66 88 Q72 98 64 106 H36 Q28 98 34 88 Q40 82 40 74Z', rim: [38, 62, 72] },
  trough: { d: 'M18 86 H82 V104 Q82 106 80 106 H20 Q18 106 18 104Z', rim: [16, 84, 84] },
  egg: { d: 'M32 78 H68 Q80 96 62 106 H38 Q20 96 32 78Z', rim: [30, 70, 76] },
}

function lerpAngles(n, max) {
  if (n === 1) return [0]
  return Array.from({ length: n }, (_, i) => -max + (2 * max * i) / (n - 1))
}

// Контур листа от основания (0,0) вверх до кончика (0, -2ry).
function leafPath(kind, rx, ry) {
  if (kind === 'fan') {
    return `M0 0 C${-rx * 0.3} ${-ry * 0.6} ${-rx * 1.8} ${-ry * 1.1} ${-rx * 1.3} ${-ry * 1.8} Q0 ${-ry * 2.4} ${rx * 1.3} ${-ry * 1.8} C${rx * 1.8} ${-ry * 1.1} ${rx * 0.3} ${-ry * 0.6} 0 0Z`
  }
  if (kind === 'drop') {
    return `M0 0 C${-rx * 1.3} ${-ry * 0.5} ${-rx * 0.7} ${-ry * 1.5} 0 ${-2 * ry} C${rx * 0.7} ${-ry * 1.5} ${rx * 1.3} ${-ry * 0.5} 0 0Z`
  }
  // heart
  return `M0 ${-2 * ry} C${-0.5 * rx} ${-1.5 * ry} ${-1.4 * rx} ${-1.1 * ry} ${-1.1 * rx} ${-0.5 * ry} C${-0.9 * rx} ${0.1 * ry} ${-0.2 * rx} ${0.1 * ry} 0 ${-0.2 * ry} C${0.2 * rx} ${0.1 * ry} ${0.9 * rx} ${0.1 * ry} ${1.1 * rx} ${-0.5 * ry} C${1.4 * rx} ${-1.1 * ry} ${0.5 * rx} ${-1.5 * ry} 0 ${-2 * ry}Z`
}

// Один контур листа; props (fill, stroke, ...) передаются фигурам.
function LeafShape({ kind, rx, ry, ...props }) {
  if (kind === 'oval') return <ellipse cx="0" cy={-ry} rx={rx} ry={ry} {...props} />
  if (kind === 'scallop') {
    // овал с «волнистым» краем из кружков
    return (
      <g>
        {Array.from({ length: 10 }, (_, i) => {
          const t = (i / 10) * Math.PI * 2
          return <circle key={i} cx={rx * Math.cos(t)} cy={-ry + ry * Math.sin(t)} r={rx * 0.3} {...props} stroke="none" />
        })}
        <ellipse cx="0" cy={-ry} rx={rx} ry={ry} {...props} />
      </g>
    )
  }
  return <path d={leafPath(kind, rx, ry)} {...props} />
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
  if (pattern === 'speckle') {
    return (
      <g fill={color}>
        {[[-0.4, 0.5], [0.35, 0.65], [0, 0.9], [-0.3, 1.2], [0.4, 1.25], [0.05, 1.55], [-0.15, 0.3], [0.2, 0.35]].map(([x, k], i) => (
          <circle key={i} cx={rx * x} cy={-ry * k} r="0.8" />
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
  trunk, trunkHeight, trunkThick, trunkBend, trunkColor = '#7a4a32', leafPlace,
  pot, potColor, potTexture, hanger, hangerColor = '#e8dfcf',
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
  const pivot = rimTop + 4 // откуда растут листья
  const hanging = hanger && hanger !== 'none'

  // Ствол: кривая Безье от горшка вверх; листья либо на верхушке, либо по всей длине.
  const hasTrunk = trunk === 'single'
  const H = TRUNK_HEIGHTS[trunkHeight] ?? TRUNK_HEIGHTS.mid
  const bend = trunkBend === 'curved' ? 9 : 0
  const P0 = [50, pivot]
  const C = [50 - bend, pivot - H * 0.55]
  const P2 = [50 + bend * 0.6, pivot - H]
  const at = (t) => [0, 1].map((j) => (1 - t) ** 2 * P0[j] + 2 * (1 - t) * t * C[j] + t ** 2 * P2[j])
  let placements
  if (!hasTrunk) placements = angles.map((a) => ({ x: 50, y: pivot, a }))
  else if (leafPlace === 'along') {
    const n = angles.length
    placements = Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 1 : 0.3 + (0.7 * i) / (n - 1)
      const [x, y] = at(t)
      return { x, y, a: i === n - 1 ? 0 : (i % 2 ? 1 : -1) * (72 - 34 * t) }
    })
  } else placements = angles.map((a) => ({ x: P2[0], y: P2[1], a }))
  // чтобы высокое растение не вылезало за рамку, листья и ствол сжимаются к основанию
  const fit = hasTrunk ? Math.min(1, (pivot - 3) / (H + 2 * ry)) : 1

  return (
    <svg viewBox="0 0 100 120" className="plant-art" aria-hidden="true">
      <defs>
        <clipPath id={`pot-${uid}`}><path d={potDef.d} /></clipPath>
      </defs>
      {hanging ? <Hanger kind={hanger} color={hangerColor} rimX1={rimX1} rimX2={rimX2} rimTop={rimTop} /> : <ellipse cx="50" cy="109" rx="38" ry="5" fill="rgba(0,0,0,.35)" />}
      <g transform={hanging ? 'translate(5 14) scale(.9)' : undefined}>
      <g transform={fit < 1 ? `translate(50 ${pivot}) scale(${fit}) translate(-50 ${-pivot})` : undefined}>
      {hasTrunk && (
        <g fill="none" strokeLinecap="round">
          <path d={`M${P0[0]} ${P0[1]} Q${C[0]} ${C[1]} ${P2[0]} ${P2[1]}`} stroke="rgba(0,0,0,.25)" strokeWidth={(TRUNK_WIDTHS[trunkThick] ?? 2.8) + 1.4} />
          <path d={`M${P0[0]} ${P0[1]} Q${C[0]} ${C[1]} ${P2[0]} ${P2[1]}`} stroke={trunkColor} strokeWidth={TRUNK_WIDTHS[trunkThick] ?? 2.8} />
        </g>
      )}
      {placements.map(({ x, y, a }, i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} opacity={i % 2 ? 0.85 : 1}>
          <LeafShape kind={base.kind} rx={rx} ry={ry} fill={leafColor} stroke="rgba(0,0,0,.18)" strokeWidth="0.8" />
          {pattern === 'edge' && (
            <g transform={`translate(0 ${-ry}) scale(.86) translate(0 ${ry})`}>
              <LeafShape kind={base.kind === 'scallop' ? 'oval' : base.kind} rx={rx} ry={ry} fill="none" stroke={leaf2Color} strokeWidth="1.8" />
            </g>
          )}
          {pattern === 'center' && (
            <g transform={`translate(0 ${-ry}) scale(.55) translate(0 ${ry})`} opacity=".85">
              <LeafShape kind={base.kind === 'scallop' ? 'oval' : base.kind} rx={rx} ry={ry} fill={leaf2Color} />
            </g>
          )}
          {pattern !== 'edge' && pattern !== 'center' && <Pattern pattern={pattern} rx={rx} ry={ry} color={leaf2Color} />}
        </g>
      ))}
      </g>
      <path d={potDef.d} fill={potColor} />
      <g clipPath={`url(#pot-${uid})`}>
        <PotTexture texture={potTexture} />
      </g>
      <rect x={rimX1} y={rimTop} width={rimX2 - rimX1} height="5" rx="2.5" fill={rimColor} filter="brightness(1.12)" />
      </g>
    </svg>
  )
}

// Подвес: три нити от обода к кольцу наверху (координаты уже с учётом сжатия горшка).
function Hanger({ kind, color, rimX1, rimX2, rimTop }) {
  const at = (x, y) => [5 + 0.9 * x, 14 + 0.9 * y]
  const [lx, ly] = at(rimX1 + 3, rimTop + 3)
  const [rx, ry] = at(rimX2 - 3, rimTop + 3)
  const [mx, my] = at(50, rimTop + 1)
  const style = {
    rope: { strokeWidth: 1.4 },
    chain: { strokeWidth: 2, strokeDasharray: '2.4 1.6' },
    beads: { strokeWidth: 3.2, strokeDasharray: '0 5.2', strokeLinecap: 'round' },
  }[kind] ?? { strokeWidth: 1.4 }
  return (
    <g fill="none" stroke={color} strokeLinecap="round" {...{}}>
      {[[lx, ly], [mx, my], [rx, ry]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} L50 4`} {...style} />
      ))}
      <circle cx="50" cy="3.5" r="2.4" strokeWidth="1.4" />
    </g>
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
  if (texture === 'waves') {
    return (
      <g fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="1.4" strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M14 ${72 + i * 8} q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0`} />)}
      </g>
    )
  }
  if (texture === 'diamonds') {
    const d = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) if ((r + c) % 2 === 0) d.push(<path key={`${r}${c}`} d={`M${22 + c * 7} ${66 + r * 6} l3.5 3 l-3.5 3 l-3.5 -3z`} />)
    return <g fill="rgba(255,255,255,.38)">{d}</g>
  }
  if (texture === 'terrazzo') {
    const bits = [[30, 82, 2, 0], [42, 90, 1.5, 1], [55, 80, 2.2, 1], [66, 88, 1.6, 0], [36, 98, 1.8, 1], [50, 96, 2.4, 0], [62, 100, 1.5, 1], [72, 94, 2, 0], [28, 92, 1.4, 0], [48, 86, 1.3, 1], [58, 92, 1.2, 0], [70, 82, 1.5, 1], [40, 104, 1.6, 0], [34, 76, 1.5, 1], [60, 74, 1.8, 0]]
    return <g>{bits.map(([x, y, r, w], i) => <circle key={i} cx={x} cy={y} r={r} fill={w ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.28)'} />)}</g>
  }
  if (texture === 'dots') {
    const dots = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 10; c++) dots.push(<circle key={`${r}${c}`} cx={27 + c * 5.4 + (r % 2) * 2.7} cy={68 + r * 5.6} r="1.3" />)
    return <g fill="rgba(255,255,255,.55)">{dots}</g>
  }
  return null
}
