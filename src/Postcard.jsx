import PlantArt from './PlantArt.jsx'
import { captionLine } from './plants.js'

const CARD_DATE = '15th November'

// Сердечки и лучики поверх фото. Рисуются в приложении, поэтому не «запечены» в картинку.
function Doodles() {
  const heart = (x, y, s, r) => (
    <path
      key={`h${x}${y}`}
      d="M0 8 C-9 -2 -4 -10 0 -4 C4 -10 9 -2 0 8Z"
      transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}
      fill="none"
      stroke="#f08fb0"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
  const rays = (x, y, r) => (
    <g key={`r${x}${y}`} transform={`translate(${x} ${y}) rotate(${r})`} stroke="#fff7e6" strokeWidth="1" strokeLinecap="round">
      <path d="M-5 0 L-1 0" />
      <path d="M-3 -4 L-1 -2" />
      <path d="M-3 4 L-1 2" />
    </g>
  )
  return (
    <svg className="doodles" viewBox="0 0 100 133" aria-hidden="true">
      {heart(9, 13, 1.1, -12)}
      {heart(91, 10, 0.9, 14)}
      {heart(93, 36, 0.7, 8)}
      {rays(21, 8, 20)}
      {rays(80, 10, 200)}
      {rays(6, 40, -20)}
    </svg>
  )
}

export default function Postcard({ plant, full = false }) {
  const { photo, latin, name, emoji, art } = plant
  return (
    <div className={`postcard${full ? ' postcard--full' : ''}`}>
      {photo ? (
        <img className="postcard__photo" src={photo} alt={name} loading="lazy" />
      ) : (
        <div className="postcard__photo postcard__photo--art">
          <PlantArt {...art} />
        </div>
      )}
      {full && <Doodles />}
      <div className="postcard__caption">
        <div className="postcard__latin">{latin}</div>
        <div className="postcard__line" />
        <div className="postcard__date">— {CARD_DATE} —</div>
        <div className="postcard__sub">
          {captionLine(plant)} {emoji}
        </div>
      </div>
    </div>
  )
}
