import { useState } from 'react'
import Postcard from './Postcard.jsx'
import { formatDate } from './plants.js'

const LEAVES = [['broad', 'Широкие'], ['spiky', 'Острые'], ['bushy', 'Пышные']]
const POTS = [['round', 'Круглый'], ['square', 'Квадратный'], ['tapered', 'Конус']]
const LEAF_COLORS = ['#3f8a52', '#4d8f5a', '#2f6b3f', '#7aa83f', '#c0587a']
const POT_COLORS = ['#c9774f', '#2aa7a0', '#2f55b8', '#e8dfcf', '#9a5c52']

function Choice({ label, options, value, onChange }) {
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

function Swatches({ label, colors, value, onChange }) {
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

const TEXT_KEYS = ['aka', 'latin', 'acquired', 'repotted', 'notes']

// Форма добавления; с initial — редактирование. Для встроенных растений (не custom) внешний вид не меняется:
// у них свои иллюстрации или фото.
export default function AddPlant({ onClose, onSave, onDelete, initial }) {
  const editing = Boolean(initial)
  const canArt = !editing || initial.custom
  const start = { name: initial?.name ?? '', ...Object.fromEntries(TEXT_KEYS.map((k) => [k, initial?.[k] ?? ''])) }
  const [form, setForm] = useState(start)
  const [art, setArt] = useState(initial?.art ?? { leaf: 'broad', leafColor: LEAF_COLORS[0], pot: 'round', potColor: POT_COLORS[0] })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setA = (k) => (v) => setArt((a) => ({ ...a, [k]: v }))
  const name = form.name.trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!name || saving) return
    setSaving(true)
    let plant
    if (editing) {
      // только изменённые поля; пустое значение = null (удалить поле)
      plant = {}
      if (name !== start.name) plant.name = name
      for (const k of TEXT_KEYS) if (form[k].trim() !== start[k]) plant[k] = form[k].trim() || null
      if (canArt && JSON.stringify(art) !== JSON.stringify(initial.art)) plant.art = art
    } else {
      plant = { name, art }
      for (const k of TEXT_KEYS) if (form[k].trim()) plant[k] = form[k].trim()
    }
    const ok = await onSave(plant)
    if (!ok) setSaving(false)
  }

  return (
    <form className="sheet" onSubmit={submit} aria-label={editing ? 'Изменить растение' : 'Новое растение'}>
      <button type="button" className="sheet__back" onClick={onClose}>← Назад</button>
      <Postcard plant={{ ...(initial ?? {}), ...form, name: name || 'Новое растение', art: canArt ? art : initial.art, photo: initial?.photo ?? null, emoji: initial?.emoji ?? '' }} full />

      <section className="panel">
        <label className="field"><span className="field__label">Название *</span>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Например, Монстера" /></label>
        <label className="field"><span className="field__label">Ласковое имя</span>
          <input className="input" value={form.aka} onChange={set('aka')} /></label>
        <label className="field"><span className="field__label">Латинское название</span>
          <input className="input" value={form.latin} onChange={set('latin')} /></label>
        <label className="field"><span className="field__label">Приобретено</span>
          <input className="input" type="date" value={form.acquired.length === 10 ? form.acquired : ''} onChange={set('acquired')} />
          {form.acquired.length === 7 && <span className="field__hint">Сейчас: {formatDate(form.acquired)}</span>}</label>
        <label className="field"><span className="field__label">Пересадка</span>
          <input className="input" type="date" value={form.repotted.length === 10 ? form.repotted : ''} onChange={set('repotted')} />
          {form.repotted.length === 7 && <span className="field__hint">Сейчас: {formatDate(form.repotted)}</span>}</label>
        <label className="field"><span className="field__label">Заметки</span>
          <textarea className="input" rows="3" value={form.notes} onChange={set('notes')} /></label>
        {canArt && (
          <>
            <Choice label="Листья" options={LEAVES} value={art.leaf} onChange={setA('leaf')} />
            <Swatches label="Цвет листьев" colors={LEAF_COLORS} value={art.leafColor} onChange={setA('leafColor')} />
            <Choice label="Горшок" options={POTS} value={art.pot} onChange={setA('pot')} />
            <Swatches label="Цвет горшка" colors={POT_COLORS} value={art.potColor} onChange={setA('potColor')} />
          </>
        )}
        <button className="btn" type="submit" disabled={!name || saving}>{saving ? 'Сохраняю…' : 'Сохранить'}</button>
        {editing && onDelete && (
          <button
            type="button"
            className="btn btn--danger"
            disabled={saving}
            onClick={async () => {
              if (!window.confirm(`Удалить «${initial.name}»? Это нельзя отменить.`)) return
              setSaving(true)
              if (!(await onDelete())) setSaving(false)
            }}
          >
            Удалить растение
          </button>
        )}
      </section>
    </form>
  )
}
