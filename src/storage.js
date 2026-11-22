// Слой хранения. Сейчас — localStorage, позже заменим на запросы в базу,
// не трогая компоненты: достаточно переписать эти две функции.
import { PLANT_POOL } from './plantPool.js'

const KEY = 'plantsociety.plants.v1'

function pickRandom(list, n) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function seed() {
  return pickRandom(PLANT_POOL, 3).map((p) => ({
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
    ...p,
  }))
}

export function loadPlants() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // повреждённые данные или недоступный storage — просто пересоздаём
  }
  const plants = seed()
  savePlants(plants)
  return plants
}

export function savePlants(plants) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plants))
  } catch {
    // storage недоступен — работаем в памяти
  }
}
