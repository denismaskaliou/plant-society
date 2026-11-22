// Простая SVG-иллюстрация растения в горшке на полке (пока вместо фото).
const LEAVES = {
  spiky: { angles: [-52, -34, -16, 0, 16, 34, 52], rx: 5, ry: 30 },
  broad: { angles: [-58, -30, 0, 30, 58], rx: 13, ry: 24 },
  bushy: { angles: [-65, -45, -25, -8, 8, 25, 45, 65], rx: 10, ry: 17 },
}

const POTS = {
  round: 'M30 78 H70 Q73 104 50 106 Q27 104 30 78Z',
  square: 'M32 78 H68 V104 Q68 106 66 106 H34 Q32 106 32 104Z',
  tapered: 'M29 78 H71 L64 106 H36Z',
}

export default function PlantArt({ leaf, leafColor, pot, potColor }) {
  const { angles, rx, ry } = LEAVES[leaf] ?? LEAVES.broad
  return (
    <svg viewBox="0 0 100 120" className="plant-art" aria-hidden="true">
      <ellipse cx="50" cy="109" rx="38" ry="5" fill="rgba(0,0,0,.35)" />
      {angles.map((a, i) => (
        <ellipse
          key={a}
          cx="50"
          cy={80 - ry}
          rx={rx}
          ry={ry}
          fill={leafColor}
          opacity={i % 2 ? 0.85 : 1}
          stroke="rgba(0,0,0,.18)"
          strokeWidth="0.8"
          transform={`rotate(${a} 50 80)`}
        />
      ))}
      <path d={POTS[pot] ?? POTS.round} fill={potColor} />
      <rect x="28" y="76" width="44" height="5" rx="2.5" fill={potColor} filter="brightness(1.12)" />
    </svg>
  )
}
