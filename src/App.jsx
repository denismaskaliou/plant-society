import { useEffect, useMemo, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import MiniCard from './MiniCard.jsx'
import AddPlant from './AddPlant.jsx'
import Carousel from './Carousel.jsx'
import Postcard from './Postcard.jsx'
import { auth } from './firebase.js'
import { addCare, addPhoto, addPlant, deletePhotos, loadGallery, loadCare, loadCustomPlants, deletePlant, loadOverrides, removeCare, updatePlant } from './storage.js'
import { CARE_TYPES, PLANTS, agoText, daysSince, formatDate, lastCare, today } from './plants.js'

// Вход через Google включается при сборке: VITE_AUTH=1 (нужен включённый провайдер в Firebase).
const AUTH_ENABLED = import.meta.env.VITE_AUTH === '1'

function Detail({ plant, extra, onClose, onCare, onEdit, canEdit }) {
  const rows = Object.entries(CARE_TYPES).filter(([type]) => lastCare(plant.care, type))
  return (
    <div className="sheet" role="dialog" aria-label={plant.name}>
      <div className="sheet__bar">
        <button className="sheet__back" onClick={onClose}>← Назад</button>
        <button className="sheet__back" onClick={onEdit} disabled={!canEdit}>Изменить</button>
      </div>
      {extra.length ? <Carousel plant={plant} extra={extra} /> : <Postcard plant={plant} full />}

      <section className="panel">
        {rows.map(([type, { label, staleDays }]) => {
          const date = lastCare(plant.care, type)
          const stale = staleDays && daysSince(date) >= staleDays
          return (
            <div className="row" key={type}>
              <span>{label}</span>
              <span className={stale ? 'warn' : 'ok'}>{agoText(date)}</span>
            </div>
          )
        })}
        {plant.location && (
          <div className="row"><span>Location</span><span>{plant.location}</span></div>
        )}
        {plant.acquired && (
          <div className="row"><span>Приобретено</span><span>{formatDate(plant.acquired)}</span></div>
        )}
        {plant.repotted && (
          <div className="row"><span>Пересадка</span><span>{formatDate(plant.repotted)}</span></div>
        )}
        <div className="actions">
          {Object.entries(CARE_TYPES).map(([type, { button }]) => (
            <button key={type} className="btn btn--small" onClick={() => onCare(plant.id, type)}>
              {button}
            </button>
          ))}
        </div>
      </section>

      {plant.notes && <p className="note">{plant.notes}</p>}
    </div>
  )
}

function Greenhouse() {
  const [extra, setExtra] = useState({}) // события, добавленные в приложении
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [custom, setCustom] = useState([]) // растения, добавленные в приложении
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const [overrides, setOverrides] = useState({}) // правки встроенных растений
  const [galleries, setGalleries] = useState({}) // { plantId: { photoId: src } } — загружается при открытии растения
  const [toast, setToast] = useState(null) // { id, event } — последняя запись, которую можно отменить

  useEffect(() => {
    loadCare().then(setExtra).catch((e) => setError(e.message))
    loadCustomPlants().then(setCustom).catch((e) => setError(e.message))
    loadOverrides().then(setOverrides).catch((e) => setError(e.message))
  }, [])

  const plants = useMemo(
    () => [...PLANTS.map((p) => ({ ...p, ...overrides[p.id] })), ...custom].filter((p) => !p.hidden).map((p) => ({ ...p, care: [...p.care, ...(extra[p.id] ?? [])] })),
    [extra, custom, overrides],
  )
  const open = plants.find((p) => p.id === openId)

  useEffect(() => {
    if (!openId) return
    loadGallery(openId)
      .then((g) => setGalleries((prev) => ({ ...prev, [openId]: g })))
      .catch((e) => setError(e.message))
  }, [openId])
  const galleryReady = !open?.gallery?.length || Boolean(galleries[open.id])
  const extraPhotos = open ? (open.gallery ?? []).map((id) => galleries[open.id]?.[id]).filter(Boolean) : []
  // главное фото + остальные: то, что редактируется в форме
  const photoItems = open
    ? [
        ...(open.photo ? [{ src: open.photo }] : []),
        ...(open.gallery ?? []).filter((id) => galleries[open.id]?.[id]).map((id) => ({ id, src: galleries[open.id][id] })),
      ]
    : []

  // Сохраняет список фото растения (главное первым): новые уходят в подколлекцию, убранные удаляются.
  // Возвращает поля для документа растения и кэш галереи.
  const persistPhotos = async (id, isCustom, items, plant) => {
    const rest = items.slice(1)
    const ids = await Promise.all(rest.map((it) => (it.id ? it.id : addPhoto(id, it.src))))
    const keep = new Set(ids)
    const gone = (plant?.gallery ?? []).filter((x) => !keep.has(x))
    if (gone.length) await deletePhotos(id, gone)
    const patch = { gallery: ids }
    const main = items[0]?.src ?? null
    if (main !== (plant?.photo || null)) patch.photo = main ?? (isCustom ? null : '')
    const map = Object.fromEntries(rest.map((it, k) => [ids[k], it.src]))
    setGalleries((prev) => ({ ...prev, [id]: map }))
    return patch
  }

  // Главная: сверху те, кого давно не поливали (или не поливали вовсе), недавно политые — в конце.
  // sort в JS стабильный, поэтому при равных датах порядок остаётся как в plants.js.
  const sorted = useMemo(
    () => [...plants].sort((a, b) => (lastCare(a.care, 'water') ?? '').localeCompare(lastCare(b.care, 'water') ?? '')),
    [plants],
  )

  const onCare = (id, type) => {
    const event = { type, date: today() }
    setExtra((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), event] }))
    addCare(id, event).catch((e) => setError(e.message))
    setToast({ id, event })
  }

  const undo = () => {
    if (!toast) return
    const { id, event } = toast
    setExtra((prev) => {
      const list = [...(prev[id] ?? [])]
      const i = list.findIndex((c) => c.type === event.type && c.date === event.date)
      if (i >= 0) list.splice(i, 1)
      return { ...prev, [id]: list }
    })
    removeCare(id, event).catch((e) => setError(e.message))
    setToast(null)
  }

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  const onAdd = async (data, care = [], photos = null) => {
    try {
      let plant = await addPlant(data)
      await Promise.all(care.map((ev) => addCare(plant.id, ev)))
      if (photos?.length) {
        const photoPatch = await persistPhotos(plant.id, true, photos, null)
        await updatePlant(plant.id, photoPatch)
        plant = { ...plant, ...photoPatch }
      }
      setCustom((prev) => [...prev, { ...plant, care }])
      setAdding(false)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const onEditSave = async (patch, care = [], photos = null) => {
    if (!Object.keys(patch).length && !care.length && !photos) {
      setEditing(false)
      return true
    }
    try {
      if (photos) Object.assign(patch, await persistPhotos(openId, custom.some((p) => p.id === openId), photos, open))
      if (care.length) {
        await Promise.all(care.map((ev) => addCare(openId, ev)))
        setExtra((prev) => ({ ...prev, [openId]: [...(prev[openId] ?? []), ...care] }))
      }
      if (!Object.keys(patch).length) {
        setEditing(false)
        return true
      }
      await updatePlant(openId, patch)
      const apply = (p) => {
        const next = { ...p, ...patch }
        for (const [k, v] of Object.entries(patch)) if (v === null) delete next[k]
        return next
      }
      if (custom.some((p) => p.id === openId)) setCustom((prev) => prev.map((p) => (p.id === openId ? apply(p) : p)))
      else {
        // у встроенного растения null возвращает значение из plants.js
        setOverrides((prev) => {
          const next = { ...(prev[openId] ?? {}), ...patch }
          for (const [k, v] of Object.entries(patch)) if (v === null) delete next[k]
          return { ...prev, [openId]: next }
        })
      }
      setEditing(false)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const onDelete = async () => {
    const isCustom = custom.some((p) => p.id === openId)
    try {
      if (isCustom && open?.gallery?.length) await deletePhotos(openId, open.gallery)
      await deletePlant(openId, isCustom)
      if (isCustom) setCustom((prev) => prev.filter((p) => p.id !== openId))
      else setOverrides((prev) => ({ ...prev, [openId]: { ...(prev[openId] ?? {}), hidden: true } }))
      setEditing(false)
      setOpenId(null)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  if (editing && open) return <AddPlant initial={open} initialPhotos={photoItems} onClose={() => setEditing(false)} onSave={onEditSave} onDelete={onDelete} />
  if (adding) return <AddPlant onClose={() => setAdding(false)} onSave={onAdd} />
  if (open) return <Detail plant={open} extra={extraPhotos} canEdit={galleryReady} onClose={() => setOpenId(null)} onCare={onCare} onEdit={() => setEditing(true)} />

  return (
    <>
      <header className="topbar">
        <div className="topbar__text">
          <h1>My Greenhouse</h1>
          <span className="subtitle">
            {plants.length} растений {AUTH_ENABLED && <button className="link" onClick={() => signOut(auth)}>Выйти</button>}
          </span>
        </div>
        <div className="topbar__actions">
          <button className="add-btn" onClick={() => window.location.reload()} aria-label="Обновить страницу" title="Обновить страницу">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.6-5.9" />
              <path d="M20 4v5h-5" />
            </svg>
          </button>
          <button className="add-btn" onClick={() => setAdding(true)} aria-label="Добавить растение" title="Добавить растение">+</button>
        </div>
      </header>

      {error && <p className="status">Не удалось сохранить: {error}</p>}

      <main className="grid">
        {sorted.map((p) => (
          <MiniCard key={p.id} plant={p} onOpen={() => setOpenId(p.id)} onWater={() => onCare(p.id, 'water')} />
        ))}
      </main>

      {toast && (
        <div className="toast" role="status">
          Полив записан
          <button className="link" onClick={undo}>Отменить</button>
        </div>
      )}
    </>
  )
}

function SignIn() {
  const [error, setError] = useState(null)
  const signIn = () =>
    signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => setError(e.message))

  return (
    <div className="signin">
      <h1>Plant Society</h1>
      <p className="status">Личная теплица. Войдите, чтобы продолжить.</p>
      <button className="btn" onClick={signIn}>Войти через Google</button>
      {error && <p className="status">{error}</p>}
    </div>
  )
}

export default function App() {
  // undefined — ещё проверяем сессию, null — не вошли
  const [user, setUser] = useState(AUTH_ENABLED ? undefined : null)
  useEffect(() => (AUTH_ENABLED ? onAuthStateChanged(auth, setUser) : undefined), [])

  return (
    <div className="app">
      {!AUTH_ENABLED ? <Greenhouse /> : user === undefined ? null : user ? <Greenhouse /> : <SignIn />}
    </div>
  )
}
