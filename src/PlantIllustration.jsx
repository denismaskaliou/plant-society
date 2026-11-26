// Минималистичные плоские иллюстрации растений для карточек в сетке.
// Силуэт повторяет настоящее растение; цвета взяты с фото.
import PlantArt from './PlantArt.jsx'

const heart = 'M0 0 C-9 -7 -12 7 0 16 C12 7 9 -7 0 0Z'

function Leaf({ x, y, r, s = 1, fill, vein }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={heart} fill={fill} stroke="rgba(0,0,0,.22)" strokeWidth=".8" />
      <path d="M0 2 L0 13" stroke={vein} strokeWidth=".9" strokeLinecap="round" />
    </g>
  )
}

// Филодендрон бархатный: подвесное синее кашпо на розовых бусинах, плети с листьями-сердечками.
function Philodendron() {
  const dark = '#3f6b3f'
  const mid = '#4f7d45'
  const copper = '#9a5c52'
  const vein = '#a8c77a'
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <ellipse cx="50" cy="112" rx="34" ry="4" fill="rgba(0,0,0,.28)" />
      {[40, 60].map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="24" stroke="#f08fb0" strokeWidth="1.6" />
          {[4, 10, 16, 22].map((y) => (
            <circle key={y} cx={x} cy={y} r="2.4" fill="#f4a9c4" />
          ))}
        </g>
      ))}
      <g transform="translate(6 1) scale(.88)">
      <path d="M30 26 H70 L66 46 Q50 51 34 46Z" fill="#2f55b8" stroke="rgba(0,0,0,.25)" strokeWidth=".8" />
      <g fill="none" stroke="#9fc46a" strokeWidth="1.2" strokeLinecap="round">
        <path d="M38 46 Q20 62 24 84 Q28 98 36 106" />
        <path d="M62 46 Q80 60 78 80 Q76 94 66 106" />
        <path d="M50 48 Q44 66 52 82 Q54 92 48 104" />
      </g>
      <Leaf x={34} y={30} r={-40} s={1.05} fill={dark} vein={vein} />
      <Leaf x={66} y={30} r={40} s={1.05} fill={mid} vein={vein} />
      <Leaf x={30} y={54} r={-55} s={1.25} fill={copper} vein="#d9a9a0" />
      <Leaf x={24} y={74} r={-70} s={1.3} fill={dark} vein={vein} />
      <Leaf x={26} y={92} r={-35} s={1.2} fill={mid} vein={vein} />
      <Leaf x={36} y={106} r={-10} s={1.15} fill={dark} vein={vein} />
      <Leaf x={71} y={56} r={55} s={1.25} fill={dark} vein={vein} />
      <Leaf x={78} y={74} r={70} s={1.3} fill={mid} vein={vein} />
      <Leaf x={74} y={92} r={35} s={1.2} fill={dark} vein={vein} />
      <Leaf x={64} y={106} r={10} s={1.1} fill={mid} vein={vein} />
      <Leaf x={46} y={62} r={-15} s={1.2} fill={mid} vein={vein} />
      <Leaf x={54} y={80} r={12} s={1.25} fill={dark} vein={vein} />
      <Leaf x={48} y={98} r={0} s={1.1} fill={mid} vein={vein} />
      </g>
    </svg>
  )
}

// Пилея Кадье: терракотовый горшок в сиреневом макраме, округлые серебристые листья.
function Pilea() {
  const edge = '#2f6b45'
  const silver = '#bcd9c8'
  const leaf = (cx, cy, rx, ry, r, k) => (
    <g key={k} transform={`rotate(${r} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={edge} stroke="rgba(0,0,0,.2)" strokeWidth=".7" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.62} ry={ry * 0.7} fill={silver} opacity=".9" />
      <path d={`M${cx} ${cy - ry * 0.8} L${cx} ${cy + ry * 0.8}`} stroke={edge} strokeWidth=".9" />
    </g>
  )
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <ellipse cx="50" cy="112" rx="30" ry="4" fill="rgba(0,0,0,.28)" />
      <g stroke="#b89cf0" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M50 0 L36 62" />
        <path d="M50 0 L64 62" />
        <path d="M50 0 L50 60" />
        <path d="M34 64 Q50 104 66 64" />
        <path d="M38 70 Q50 92 62 70" />
      </g>
      <path d="M50 96 L46 108 M50 96 L54 108 M50 96 L50 110" stroke="#b89cf0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M33 62 H67 L62 90 Q50 94 38 90Z" fill="#c9774f" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
      <rect x="31" y="58" width="38" height="7" rx="2" fill="#d98a62" />
      {[
        [34, 48, 9, 14, -40],
        [66, 48, 9, 14, 40],
        [50, 40, 10, 15, 0],
        [40, 32, 9, 13, -22],
        [60, 32, 9, 13, 22],
        [50, 22, 9, 12, 0],
        [30, 36, 7, 11, -60],
        [70, 36, 7, 11, 60],
      ].map(([cx, cy, rx, ry, r], i) => leaf(cx, cy, rx, ry, r, i))}
    </svg>
  )
}


// Листья-овалы, которыми собраны остальные растения. Поворот вокруг основания листа (cx, base).
function Oval({ x, y, len, wid, r, fill, vein, tint, tintOpacity = 0.55 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path
        d={`M0 0 C${wid} ${-len * 0.25} ${wid} ${-len * 0.8} 0 ${-len} C${-wid} ${-len * 0.8} ${-wid} ${-len * 0.25} 0 0Z`}
        fill={fill}
        stroke="rgba(0,0,0,.22)"
        strokeWidth=".8"
      />
      {tint && (
        <path
          d={`M0 ${-len * 0.12} C${wid * 0.45} ${-len * 0.3} ${wid * 0.45} ${-len * 0.7} 0 ${-len * 0.9} C${-wid * 0.45} ${-len * 0.7} ${-wid * 0.45} ${-len * 0.3} 0 ${-len * 0.12}Z`}
          fill={tint}
          opacity={tintOpacity}
        />
      )}
      {vein && <path d={`M0 -2 L0 ${-len * 0.9}`} stroke={vein} strokeWidth=".9" strokeLinecap="round" />}
    </g>
  )
}

const Shadow = ({ rx = 30 }) => <ellipse cx="50" cy="112" rx={rx} ry="4" fill="rgba(0,0,0,.28)" />

// Афеландра: тёмные глянцевые листья с белыми прожилками, бирюзовый граненый горшок.
function Aphelandra() {
  const leaves = [
    [50, 74, 40, 12, -62], [50, 74, 42, 12, 62], [50, 72, 46, 13, -32], [50, 72, 46, 13, 32],
    [50, 70, 48, 13, 0], [50, 76, 32, 10, -86], [50, 76, 32, 10, 86],
  ]
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <Shadow />
      <path d="M49 74 H51 V84 H49Z" fill="#6b4a2d" />
      {leaves.map(([x, y, len, wid, r], i) => (
        <Oval key={i} x={x} y={y} len={len} wid={wid} r={r} fill="#2c6a45" vein="#eef2d6" tint="#3f8a58" tintOpacity={0.5} />
      ))}
      <path d="M30 80 H70 L65 106 Q50 110 35 106Z" fill="#2aa7a0" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
      <path d="M38 88 L45 84 L52 88 L59 84 M38 96 L45 92 L52 96 L59 92" fill="none" stroke="#1d7f7a" strokeWidth="1" />
      <rect x="28" y="77" width="44" height="6" rx="3" fill="#5fcfc6" />
    </svg>
  )
}

// Строманта: узкие остроконечные листья с розово-кремовым рисунком, клетчатое кашпо.
function Stromanthe() {
  const green = '#6a8a46'
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <Shadow />
      <Oval x={46} y={76} len={42} wid={8} r={-70} fill="#b4306a" vein="#e8789e" />
      <Oval x={54} y={76} len={36} wid={7} r={64} fill="#c0386f" vein="#e8789e" />
      <Oval x={48} y={76} len={52} wid={11} r={-34} fill={green} tint="#eab6a8" tintOpacity={0.7} vein="#f4d3c8" />
      <Oval x={52} y={76} len={56} wid={12} r={30} fill={green} tint="#eab6a8" tintOpacity={0.7} vein="#f4d3c8" />
      <Oval x={50} y={76} len={60} wid={12} r={-4} fill="#5d7f3e" tint="#f0b9ae" tintOpacity={0.75} vein="#f8dcd0" />
      <Oval x={42} y={78} len={34} wid={9} r={-88} fill={green} tint="#eab6a8" tintOpacity={0.65} />
      <Oval x={58} y={78} len={34} wid={9} r={88} fill={green} tint="#eab6a8" tintOpacity={0.65} />
      <defs>
        <pattern id="gingham" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ece3e6" />
          <rect width="4" height="8" fill="#6f666b" opacity=".55" />
          <rect width="8" height="4" fill="#6f666b" opacity=".55" />
        </pattern>
      </defs>
      <path d="M33 78 H67 L64 106 Q50 109 36 106Z" fill="url(#gingham)" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
      <rect x="31" y="75" width="38" height="6" rx="3" fill="#e6d9dc" />
    </svg>
  )
}

// Белый эпик: подвесное зелёное макраме, разноцветный горшок с ручками, пёстрые листья вверх.
function Epipremnum() {
  const g = '#6fae4a'
  const cream = '#f3efc4'
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <Shadow rx={26} />
      <g stroke="#4fa57a" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M50 0 L36 64" />
        <path d="M50 0 L64 64" />
        <path d="M50 0 L50 60" />
        <path d="M34 72 Q50 108 66 72" />
        <path d="M39 78 Q50 98 61 78" />
      </g>
      <path d="M33 62 H67 L63 90 Q50 95 37 90Z" fill="#5a3b2c" />
      <path d="M36 74 H64 L63 80 H37Z" fill="#c85d78" />
      <path d="M37 80 H63 L62 85 H38Z" fill="#a98ad0" />
      <path d="M38 85 H62 L60 91 Q50 94 40 91Z" fill="#f1e8d8" />
      <path d="M33 66 H28 V76 H33 M67 66 H72 V76 H67" fill="none" stroke="#a8683c" strokeWidth="2" />
      <rect x="31" y="59" width="38" height="6" rx="2" fill="#7a4e36" />
      <path d="M48 60 Q46 40 52 22 Q54 14 50 8" fill="none" stroke="#a9cf62" strokeWidth="1.6" strokeLinecap="round" />
      <Oval x={50} y={14} len={16} wid={8} r={-20} fill={g} tint={cream} />
      <Oval x={50} y={30} len={20} wid={10} r={55} fill={g} tint={cream} />
      <Oval x={50} y={34} len={20} wid={10} r={-55} fill={cream} tint={g} tintOpacity={0.7} />
      <Oval x={48} y={46} len={20} wid={10} r={70} fill={g} tint={cream} />
      <Oval x={48} y={50} len={20} wid={10} r={-68} fill={g} tint={cream} />
      <Oval x={50} y={60} len={16} wid={9} r={-95} fill={cream} tint={g} tintOpacity={0.6} />
      <Oval x={50} y={60} len={16} wid={9} r={95} fill={g} tint={cream} />
    </svg>
  )
}

// Фикус лирата: высокий ствол с опорой, крупные листья-«скрипки», синий рифлёный горшок.
function FicusLyrata() {
  const g = '#5fa04a'
  const leaf = (x, y, r, k) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0 0 C-12 -4 -15 -20 -8 -28 C-4 -32 4 -32 8 -28 C15 -20 12 -4 0 0Z" fill={g} stroke="rgba(0,0,0,.22)" strokeWidth=".8" />
      <path d="M0 -2 L0 -26" stroke="#d8e68c" strokeWidth=".9" strokeLinecap="round" />
    </g>
  )
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <Shadow />
      <g transform="translate(5 14) scale(.9)">
      <path d="M50 88 V8" stroke="#6b4a2d" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M52 90 V6" stroke="#e3b86f" strokeWidth="1.6" strokeLinecap="round" />
      {[
        [50, 20, -8], [50, 26, 62], [50, 34, -62], [50, 44, 52], [50, 52, -55],
        [50, 62, 58], [50, 70, -60], [50, 78, 45],
      ].map(([x, y, r], i) => leaf(x, y, r, i))}
      </g>
      <path d="M33 86 H67 L63 108 H37Z" fill="#2d4f73" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
      {[40, 46, 52, 58].map((x) => <path key={x} d={`M${x} 88 V106`} stroke="#3d6591" strokeWidth="1" />)}
      <rect x="31" y="83" width="38" height="6" rx="2" fill="#3d6591" />
    </svg>
  )
}

// Фикус эластика: вертикальные пёстрые листья с кремовой каймой, розовые молодые листья, розовый горшок.
function FicusElastica() {
  const g = '#5b7f3e'
  const cream = '#efe3a8'
  return (
    <svg viewBox="0 0 100 120" className="illus" aria-hidden="true">
      <Shadow />
      <path d="M50 88 V30" stroke="#8a5a3a" strokeWidth="2.6" strokeLinecap="round" />
      <Oval x={50} y={30} len={22} wid={7} r={-6} fill="#d95f6f" vein="#b03a4f" />
      <Oval x={50} y={36} len={30} wid={10} r={-48} fill={g} tint={cream} tintOpacity={0.8} vein="#a33c52" />
      <Oval x={50} y={40} len={30} wid={10} r={50} fill={g} tint={cream} tintOpacity={0.8} vein="#a33c52" />
      <Oval x={50} y={52} len={34} wid={11} r={-62} fill="#e8a09a" tint={g} tintOpacity={0.7} vein="#a33c52" />
      <Oval x={50} y={54} len={34} wid={11} r={64} fill={g} tint={cream} tintOpacity={0.8} vein="#a33c52" />
      <Oval x={50} y={66} len={34} wid={11} r={-76} fill={g} tint={cream} tintOpacity={0.8} vein="#a33c52" />
      <Oval x={50} y={68} len={34} wid={11} r={78} fill="#e8a09a" tint={g} tintOpacity={0.7} vein="#a33c52" />
      <Oval x={50} y={80} len={26} wid={9} r={-96} fill={g} tint={cream} tintOpacity={0.8} />
      <Oval x={50} y={80} len={26} wid={9} r={96} fill={g} tint={cream} tintOpacity={0.8} />
      <path d="M36 88 H64 L61 110 H39Z" fill="#d4789a" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
      {[42, 47, 52, 57].map((x) => <path key={x} d={`M${x} 90 V108`} stroke="#b9577c" strokeWidth="1" />)}
      <rect x="34" y="85" width="32" height="6" rx="2" fill="#e08aab" />
    </svg>
  )
}

const ART = {
  aphelandra: Aphelandra,
  stromanthe: Stromanthe,
  philodendron: Philodendron,
  pilea: Pilea,
  epipremnum: Epipremnum,
  'ficus-lyrata': FicusLyrata,
  'ficus-elastica': FicusElastica,
}
const FALLBACK = { leaf: 'broad', leafColor: '#4d8f5a', pot: 'round', potColor: '#c9774f' }

export default function PlantIllustration({ plant }) {
  const Custom = plant.artCustom ? null : ART[plant.id]
  if (Custom) return <Custom />
  return <PlantArt {...(plant.art ?? FALLBACK)} />
}
