// Слой хранения на Firestore (коллекция "plants").
// Компоненты знают только про loadPlants / savePlant / deletePlant.
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase.js'
import { PLANT_POOL } from './plantPool.js'

const plantsCol = collection(db, 'plants')

function pickRandom(list, n) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function seed() {
  return pickRandom(PLANT_POOL, 3).map((p, i) => ({
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
    order: i,
    ...p,
  }))
}

// Один общий промис: StrictMode (и любые повторные вызовы) не засеют базу дважды.
let loading = null

export function loadPlants() {
  loading ??= (async () => {
    const snap = await getDocs(plantsCol)
    if (snap.empty) {
      const plants = seed()
      const batch = writeBatch(db)
      plants.forEach((p) => batch.set(doc(plantsCol, p.id), p))
      await batch.commit()
      return plants
    }
    return snap.docs.map((d) => d.data()).sort((a, b) => a.order - b.order)
  })().catch((e) => {
    loading = null
    throw e
  })
  return loading
}

export function savePlant(plant) {
  return setDoc(doc(plantsCol, plant.id), plant)
}

export function deletePlant(id) {
  return deleteDoc(doc(plantsCol, id))
}
