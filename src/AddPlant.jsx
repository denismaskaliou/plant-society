import { useState } from 'react'
import Postcard from './Postcard.jsx'
import AvatarEditor from './AvatarEditor.jsx'
import { randomArt, DEFAULT_ART } from './avatarOptions.js'
import { lastCare } from './plants.js'

// Дата: точная (ГГГГ-ММ-ДД) или, если день неизвестен, только месяц и год (ГГГГ-ММ).
function DateField({ label, value, onChange }) {
  const [monthOnly, setMonthOnly] = useState(value.length === 7)
  const toggle = () => {
    const next = !monthOnly
    setMonthOnly(next)
    // точная → месяц: обрезаем день; месяц → точная: день неизвестен, выбрать заново
    onChange(next ? value.slice(0, 7) : '')
  }
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <input
        className="input"
        type={monthOnly ? 'month' : 'date'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="field__check">
        <input type="checkbox" checked={monthOnly} onChange={toggle} /> Точной даты не знаю 🤷‍♀️
      </label>
    </div>
  )
}

// Фото сжимается на устройстве (до 900 px, JPEG) и хранится в документе Firestore как data URL (~100–200 КБ, лимит документа 1 МБ).
function resizePhoto(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не удалось прочитать картинку'))
    }
    img.src = url
  })
}

// Подкормка и обработка — это события ухода (как «Удобрил сегодня»): форма задаёт дату последнего.
const CARE_FIELDS = [['fertilize', '📅 Подкормка'], ['pest', '📅 Обработка']]
const TEXT_KEYS = ['aka', 'latin', 'location', 'acquired', 'repotted', 'notes']

// Форма добавления; с initial — редактирование. Для встроенных растений (не custom) внешний вид не меняется:
// у них свои иллюстрации или фото.
export default function AddPlant({ onClose, onSave, onDelete, initial, initialPhotos = [] }) {
  const editing = Boolean(initial)
  const start = {
    name: initial?.name ?? '',
    ...Object.fromEntries(TEXT_KEYS.map((k) => [k, initial?.[k] ?? ''])),
    ...Object.fromEntries(CARE_FIELDS.map(([type]) => [type, lastCare(initial?.care ?? [], type) ?? ''])),
  }
  const [form, setForm] = useState(start)
  const initialArt = { ...DEFAULT_ART, ...initial?.art }
  // новое растение сразу получает случайный аватар; он висит сверху, пока не добавят фото
  const [art, setArt] = useState(() => (initial ? initialArt : randomArt()))
  const [avatarOpen, setAvatarOpen] = useState(false)
  // галерея: items[0] — главное фото, остальные — карусель. id есть у фото из подколлекции
  const [items, setItems] = useState(() => initialPhotos.map((p, i) => ({ key: p.id ?? `m${i}`, ...p })))
  const photo = items[0]?.src ?? null
  const [photoError, setPhotoError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const name = form.name.trim()

  const addPhotos = async (e) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (!files.length) return
    try {
      const srcs = await Promise.all(files.map((f) => resizePhoto(f)))
      setItems((prev) => [...prev, ...srcs.map((src) => ({ key: `n${Math.random().toString(36).slice(2)}`, src }))])
      setPhotoError(null)
    } catch (err) {
      setPhotoError(err.message)
    }
  }
  const makeMain = (i) => setItems((prev) => [prev[i], ...prev.filter((_, k) => k !== i)])
  const removePhoto = (i) => setItems((prev) => prev.filter((_, k) => k !== i))

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
      if (JSON.stringify(art) !== JSON.stringify(initialArt)) {
        plant.art = art
        // у встроенных растений своя иллюстрация в сетке: флаг говорит рисовать вместо неё выбранный аватар
        if (!initial.custom) plant.artCustom = true
      }
    } else {
      plant = { name, art }
      for (const k of TEXT_KEYS) if (form[k].trim()) plant[k] = form[k].trim()
    }
    // новая дата подкормки/обработки = новое событие ухода; пустое поле историю не стирает
    const care = CARE_FIELDS.filter(([type]) => form[type] && form[type] !== start[type]).map(([type]) => ({ type, date: form[type] }))
    // null — галерея не менялась; иначе полный новый список (главное первым)
    const sig = (list) => list.map((p) => p.id ?? p.src).join('|')
    const photos = sig(items) === sig(initialPhotos) ? null : items
    const ok = await onSave(plant, care, photos)
    if (!ok) setSaving(false)
  }

  if (avatarOpen) {
    return <AvatarEditor art={art} onCancel={() => setAvatarOpen(false)} onDone={(a) => { setArt(a); setAvatarOpen(false) }} />
  }

  return (
    <form className="sheet" onSubmit={submit} aria-label={editing ? 'Изменить растение' : 'Новое растение'}>
      <button type="button" className="sheet__back" onClick={onClose}>← Назад</button>
      <Postcard plant={{ ...(initial ?? {}), ...form, name: name || 'Новое растение', art, photo, emoji: initial?.emoji ?? '' }} full />
      <button type="button" className="btn btn--wide" onClick={() => setAvatarOpen(true)}>🎨 Настроить аватар</button>

      <section className="panel">
        <div className="field">
          <span className="field__label">Фото</span>
          <div className="thumbs">
            {items.map((it, i) => (
              <div key={it.key} className={`thumb${i === 0 ? ' thumb--main' : ''}`}>
                <img src={it.src} alt="" onClick={() => makeMain(i)} title={i === 0 ? 'Главное фото' : 'Сделать главным'} />
                <button type="button" className="thumb__x" onClick={() => removePhoto(i)} aria-label="Убрать фото">×</button>
                {i === 0 && <span className="thumb__badge">Главное</span>}
              </div>
            ))}
            <label className="thumb thumb--add" aria-label="Добавить фото">
              ＋
              <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
            </label>
          </div>
          {items.length > 1 && <span className="field__hint">Нажми на фото, чтобы сделать его главным</span>}
          {photoError && <span className="field__hint">{photoError}</span>}
        </div>
        <label className="field"><span className="field__label">Название *</span>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Например, Монстера" /></label>
        <label className="field"><span className="field__label">Nickname</span>
          <input className="input" value={form.aka} onChange={set('aka')} /></label>
        <label className="field"><span className="field__label">Латинское название</span>
          <input className="input" value={form.latin} onChange={set('latin')} /></label>
        <label className="field"><span className="field__label">📍 Location</span>
          <input className="input" value={form.location} onChange={set('location')} placeholder="Например, зал, подоконник" /></label>
        <DateField label="📅 Приобретено" value={form.acquired} onChange={(v) => setForm((f) => ({ ...f, acquired: v }))} />
        <DateField label="📅 Пересадка" value={form.repotted} onChange={(v) => setForm((f) => ({ ...f, repotted: v }))} />
        {CARE_FIELDS.map(([type, label]) => (
          <DateField key={type} label={label} value={form[type]} onChange={(v) => setForm((f) => ({ ...f, [type]: v }))} />
        ))}
        <label className="field"><span className="field__label">✍️ Заметки</span>
          <textarea className="input" rows="3" value={form.notes} onChange={set('notes')} /></label>
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
