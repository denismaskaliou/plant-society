import { useEffect, useMemo, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import MiniCard from './MiniCard.jsx'
import AddPlant from './AddPlant.jsx'
import Postcard from './Postcard.jsx'
import { auth } from './firebase.js'
import { addCare, addPlant, loadCare, loadCustomPlants, deletePlant, loadOverrides, removeCare, updatePlant } from './storage.js'
import { CARE_TYPES, PLANTS, agoText, daysSince, formatDate, lastCare, today } from './plants.js'

// Вход через Google включается при сборке: VITE_AUTH=1 (нужен включённый провайдер в Firebase).
const AUTH_ENABLED = import.meta.env.VITE_AUTH === '1'

function Detail({ plant, onClose, onCare, onEdit }) {
  const rows = Object.entries(CARE_TYPES).filter(([type]) => lastCare(plant.care, type))
  return (
    <div className="sheet" role="dialog" aria-label={plant.name}>
      <div className="sheet__bar">
        <button className="sheet__back" onClick={onClose}>← Назад</button>
        <button className="sheet__back" onClick={onEdit}>Изменить</button>
      </div>
      <Postcard plant={plant} full />

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

  const onAdd = async (data) => {
    try {
      const plant = await addPlant(data)
      setCustom((prev) => [...prev, plant])
      setAdding(false)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const onEditSave = async (patch) => {
    if (!Object.keys(patch).length) {
      setEditing(false)
      return true
    }
    try {
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

  if (editing && open) return <AddPlant initial={open} onClose={() => setEditing(false)} onSave={onEditSave} onDelete={onDelete} />
  if (adding) return <AddPlant onClose={() => setAdding(false)} onSave={onAdd} />
  if (open) return <Detail plant={open} onClose={() => setOpenId(null)} onCare={onCare} onEdit={() => setEditing(true)} />

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
