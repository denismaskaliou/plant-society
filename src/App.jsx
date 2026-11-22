import { useEffect, useState } from 'react'
import PlantArt from './PlantArt.jsx'
import { loadPlants } from './storage.js'

export default function App() {
  const [plants, setPlants] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPlants().then(setPlants).catch((e) => setError(e.message))
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <h1>My Greenhouse</h1>
        <span className="subtitle">
          Plant Society{plants ? ` · ${plants.length} растений` : ''}
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
    </div>
  )
}
