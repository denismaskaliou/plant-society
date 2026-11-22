import { useEffect, useState } from 'react'
import PlantArt from './PlantArt.jsx'
import { loadPlants, savePlants } from './storage.js'

export default function App() {
  const [plants, setPlants] = useState(loadPlants)

  useEffect(() => {
    savePlants(plants)
  }, [plants])

  return (
    <div className="app">
      <header className="topbar">
        <h1>My Greenhouse</h1>
        <span className="subtitle">Plant Society · {plants.length} растений</span>
      </header>

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
    </div>
  )
}
