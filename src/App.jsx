import { useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import PlantArt from './PlantArt.jsx'
import { auth } from './firebase.js'
import { loadPlants } from './storage.js'

function Greenhouse({ user }) {
  const [plants, setPlants] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPlants().then(setPlants).catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <header className="topbar">
        <h1>My Greenhouse</h1>
        <span className="subtitle">
          Plant Society{plants ? ` · ${plants.length} растений` : ''} ·{' '}
          <button className="link" onClick={() => signOut(auth)}>Выйти</button>
        </span>
      </header>

      {error && <p className="status">Не удалось загрузить: {error}</p>}
      {!plants && !error && <p className="status">Загружаем теплицу…</p>}

      {plants && (
        <main className="grid">
          {plants.map((p) => (
            <article key={p.id} className="card">
              <div className="art-wrap">
                <PlantArt {...p} />
              </div>
              <h2>{p.nickname}</h2>
              <p>{p.species}</p>
            </article>
          ))}
        </main>
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
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, setUser), [])

  return (
    <div className="app">
      {user === undefined ? null : user ? <Greenhouse user={user} /> : <SignIn />}
    </div>
  )
}
