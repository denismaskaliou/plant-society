import { useRef, useState } from 'react'
import Postcard from './Postcard.jsx'

// Карусель фото как в Telegram: первый слайд — главное фото (открытка растения), дальше остальные.
// Свайп, тап по краям и сегменты сверху показывают, где мы.
export default function Carousel({ plant, extra }) {
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const count = extra.length + 1

  const go = (k) => {
    const el = track.current
    if (el) el.scrollTo({ left: el.clientWidth * k, behavior: 'smooth' })
  }
  const onScroll = () => {
    const el = track.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="carousel">
      <div className="carousel__track" ref={track} onScroll={onScroll}>
        <div className="carousel__slide"><Postcard plant={plant} full /></div>
        {extra.map((src, k) => (
          <div className="carousel__slide" key={k}>
            <div className="postcard postcard--full postcard--clean">
              <img className="postcard__photo" src={src} alt="" loading="lazy" />
            </div>
          </div>
        ))}
      </div>
      <div className="carousel__bars" aria-hidden="true">
        {Array.from({ length: count }, (_, k) => <span key={k} className={k === index ? 'on' : ''} />)}
      </div>
      {index > 0 && <button type="button" className="carousel__nav carousel__nav--prev" aria-label="Предыдущее фото" onClick={() => go(index - 1)} />}
      {index < count - 1 && <button type="button" className="carousel__nav carousel__nav--next" aria-label="Следующее фото" onClick={() => go(index + 1)} />}
    </div>
  )
}
