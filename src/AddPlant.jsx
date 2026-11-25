import { useState } from 'react'
import Postcard from './Postcard.jsx'
import { lastCare } from './plants.js'

const LEAVES = [['broad', 'Широкие'], ['spiky', 'Острые'], ['bushy', 'Пышные'], ['round', 'Круглые'], ['drop', 'Капля'], ['heart', 'Сердечки']]
const LEAF_SIZES = [['s', 'Мелкие'], ['m', 'Средние'], ['l', 'Крупные']]
const LEAF_COUNTS = [['few', 'Мало'], ['mid', 'Средне'], ['many', 'Много']]
const SPREADS = [['narrow', 'Узкий'], ['normal', 'Обычный'], ['wide', 'Широкий']]
const PATTERNS = [['none', 'Однотонные'], ['midrib', 'Жилка'], ['stripes', 'Прожилки'], ['spots', 'Пятна'], ['edge', 'Кайма']]
const POTS = [['round', 'Круглый'], ['square', 'Квадратный'], ['tapered', 'Конус'], ['bowl', 'Чаша'], ['tall', 'Высокий']]
const POT_TEXTURES = [['smooth', 'Гладкий'], ['ribs', 'Рёбра'], ['grid', 'Клетка'], ['stripes', 'Полоски'], ['dots', 'Горошек']]
// Одна палитра и для листьев, и для узора
const LEAF_COLORS = [
  '#3f8a52', '#4d8f5a', '#2f6b3f', '#1f4d2e', '#7aa83f', '#6a8f9a',
  '#b9dcc0', '#f3e9c6', '#f2d36b', '#f4c6d2', '#e58aa6', '#c0587a',
  '#c9b8e8', '#d9b99b', '#8a5a3c',
]
const POT_COLORS = [
  '#c9774f', '#9a5c52', '#7a4a32', '#f2c9a5', '#e8dfcf', '#f6f3ee',
  '#d98aa8', '#e8735f', '#d9a43b', '#8fae93', '#2aa7a0', '#8fc1e3',
  '#2f55b8', '#25356b', '#b7a3dd', '#3a3d40',
]
const DEFAULT_ART = {
  leaf: 'broad', leafSize: 'm', leafCount: 'mid', spread: 'normal', pattern: 'none',
  leafColor: LEAF_COLORS[0], leaf2Color: LEAF_COLORS[7],
  pot: 'round', potTexture: 'smooth', potColor: POT_COLORS[0],
}
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const randomArt = () => ({
  leaf: pick(LEAVES)[0], leafSize: pick(LEAF_SIZES)[0], leafCount: pick(LEAF_COUNTS)[0], spread: pick(SPREADS)[0],
  pattern: pick(PATTERNS)[0], leafColor: pick(LEAF_COLORS), leaf2Color: pick(LEAF_COLORS),
  pot: pick(POTS)[0], potTexture: pick(POT_TEXTURES)[0], potColor: pick(POT_COLORS),
})

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
export default function AddPlant({ onClose, onSave, onDelete, initial }) {
  const editing = Boolean(initial)
  const canArt = !editing || initial.custom
  const start = {
    name: initial?.name ?? '',
    ...Object.fromEntries(TEXT_KEYS.map((k) => [k, initial?.[k] ?? ''])),
    ...Object.fromEntries(CARE_FIELDS.map(([type]) => [type, lastCare(initial?.care ?? [], type) ?? ''])),
  }
  const [form, setForm] = useState(start)
  const initialArt = { ...DEFAULT_ART, ...initial?.art }
  const [art, setArt] = useState(initialArt)
  const [photo, setPhoto] = useState(initial?.photo ?? null)
  const [photoError, setPhotoError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setA = (k) => (v) => setArt((a) => ({ ...a, [k]: v }))
  const name = form.name.trim()

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setPhoto(await resizePhoto(file))
      setPhotoError(null)
    } catch (err) {
      setPhotoError(err.message)
    }
  }

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
      if (photo !== (initial.photo ?? null)) plant.photo = photo
      if (canArt && JSON.stringify(art) !== JSON.stringify(initialArt)) plant.art = art
    } else {
      plant = { name, art }
      if (photo) plant.photo = photo
      for (const k of TEXT_KEYS) if (form[k].trim()) plant[k] = form[k].trim()
    }
    // новая дата подкормки/обработки = новое событие ухода; пустое поле историю не стирает
    const care = CARE_FIELDS.filter(([type]) => form[type] && form[type] !== start[type]).map(([type]) => ({ type, date: form[type] }))
    const ok = await onSave(plant, care)
    if (!ok) setSaving(false)
  }

  return (
    <form className="sheet" onSubmit={submit} aria-label={editing ? 'Изменить растение' : 'Новое растение'}>
      <button type="button" className="sheet__back" onClick={onClose}>← Назад</button>
      <Postcard plant={{ ...(initial ?? {}), ...form, name: name || 'Новое растение', art: canArt ? art : initial.art, photo, emoji: initial?.emoji ?? '' }} full />

      <section className="panel">
        <div className="field">
          <span className="field__label">Фото</span>
          <div className="chips">
            <label className="chip">
              {photo ? 'Заменить фото' : 'Загрузить фото'}
              <input type="file" accept="image/*" hidden onChange={pickPhoto} />
            </label>
            {photo?.startsWith('data:') && <button type="button" className="chip" onClick={() => setPhoto(null)}>Убрать фото</button>}
          </div>
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
        {canArt && (
          <>
            <div className="field">
              <button type="button" className="chip" onClick={() => setArt(randomArt())}>🎲 Случайный аватар</button>
            </div>
            <Choice label="Форма листа" options={LEAVES} value={art.leaf} onChange={setA('leaf')} />
            <Choice label="Размер листа" options={LEAF_SIZES} value={art.leafSize} onChange={setA('leafSize')} />
            <Choice label="Количество листьев" options={LEAF_COUNTS} value={art.leafCount} onChange={setA('leafCount')} />
            <Choice label="Раскрытие" options={SPREADS} value={art.spread} onChange={setA('spread')} />
            <Choice label="Узор листа" options={PATTERNS} value={art.pattern} onChange={setA('pattern')} />
            <Swatches label="Цвет листьев" colors={LEAF_COLORS} value={art.leafColor} onChange={setA('leafColor')} />
            {art.pattern !== 'none' && <Swatches label="Цвет узора" colors={LEAF_COLORS} value={art.leaf2Color} onChange={setA('leaf2Color')} />}
            <Choice label="Горшок" options={POTS} value={art.pot} onChange={setA('pot')} />
            <Choice label="Текстура горшка" options={POT_TEXTURES} value={art.potTexture} onChange={setA('potTexture')} />
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
