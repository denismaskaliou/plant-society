// Ряд кнопок-вариантов и ряд цветных кружков для форм.
export function Choice({ label, options, value, onChange }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="chips">
        {options.map(([v, text]) => (
          <button key={v} type="button" className={`chip${value === v ? ' chip--on' : ''}`} onClick={() => onChange(v)}>{text}</button>
        ))}
      </div>
    </div>
  )
}

export function Swatches({ label, colors, value, onChange }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="chips">
        {colors.map((c) => (
          <button key={c} type="button" aria-label={c} className={`swatch${value === c ? ' swatch--on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} />
        ))}
      </div>
    </div>
  )
}
