import PlantIllustration from './PlantIllustration.jsx'
import { agoText, daysSince, lastCare } from './plants.js'

function WateringCan() {
  return (
    <svg viewBox="0 0 28 28" width="26" height="26" fill="none" aria-hidden="true">
      <g className="can__body">
        <path d="M5 11.5h11l-.8 9.2a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8z" fill="currentColor" />
        <path d="M16 14l5.5-5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 6.5l4 3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M5.3 13.5C2 13.5 2 19 5.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 11.5c0-3.5 6-3.5 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <g className="can__drops" fill="currentColor">
        <circle cx="24.5" cy="13.5" r="1.1" />
        <circle cx="22" cy="16.5" r="1.1" />
        <circle cx="25" cy="18.5" r="1.1" />
      </g>
    </svg>
  )
}

// Минималистичная карточка для сетки: иллюстрация, имя, «полив N дней назад», лейка.
export default function MiniCard({ plant, onOpen, onWater }) {
  const last = lastCare(plant.care, 'water')
  const stale = last && daysSince(last) >= 7
  const justWatered = last && daysSince(last) === 0
  return (
    <div className="mini">
      <button className="mini__open" onClick={onOpen} aria-label={plant.name}>
        <div className="mini__art">
          <PlantIllustration plant={plant} />
        </div>
        <div className="mini__name">{plant.name}</div>
        <div className={`mini__ago${stale ? ' warn' : ''}`}>
          {last ? `полив ${agoText(last)}` : 'ещё не поливали'}
        </div>
      </button>
      <button
        className={`mini__can${justWatered ? ' mini__can--done' : ''}`}
        onClick={onWater}
        aria-label="Полил сегодня"
      >
        <WateringCan />
      </button>
    </div>
  )
}
