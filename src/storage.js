// Слой хранения на Firestore (коллекция "plants").
// Описания растений лежат в plants.js; сюда пишутся только события ухода,
// добавленные в приложении. Документ растения: plants/{id} = { care: [{ type, date }] }.
// Старые документы с другими id игнорируются.
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, deleteField, doc, getDocs, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

const plantsCol = collection(db, 'plants')

// { [plantId]: [{ type, date }] }
export async function loadCare() {
  const snap = await getDocs(plantsCol)
  const byId = {}
  snap.forEach((d) => {
    const care = d.data().care
    if (Array.isArray(care)) byId[d.id] = care
  })
  return byId
}

export function addCare(plantId, event) {
  return setDoc(doc(plantsCol, plantId), { care: arrayUnion(event) }, { merge: true })
}

// Отмена только что записанного события (на случай случайного тапа).
export function removeCare(plantId, event) {
  return setDoc(doc(plantsCol, plantId), { care: arrayRemove(event) }, { merge: true })
}

// ---------- растения, добавленные в приложении ----------
// Документ plants/{autoId} = { custom: true, name, aka, latin, acquired, notes, art, care: [] }.
// Встроенные растения (без custom) сюда не попадают.
export async function loadCustomPlants() {
  const snap = await getDocs(plantsCol)
  const list = []
  snap.forEach((d) => {
    const data = d.data()
    if (data.custom) list.push({ emoji: '', photo: null, ...data, id: d.id, care: Array.isArray(data.care) ? data.care : [] })
  })
  return list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
}

export async function addPlant(plant) {
  const ref = doc(plantsCol)
  await setDoc(ref, { ...plant, custom: true, care: [], createdAt: Date.now() })
  return { emoji: '', photo: null, ...plant, id: ref.id, care: [], createdAt: Date.now() }
}

// Правки встроенных растений: поля поверх plants.js. { [plantId]: { name, notes, ... } }
const META = new Set(['care', 'custom', 'createdAt'])
export async function loadOverrides() {
  const snap = await getDocs(plantsCol)
  const byId = {}
  snap.forEach((d) => {
    const data = d.data()
    if (data.custom) return
    const fields = Object.fromEntries(Object.entries(data).filter(([k]) => !META.has(k)))
    if (Object.keys(fields).length) byId[d.id] = fields
  })
  return byId
}

// patch: { поле: значение | null }, null удаляет поле (для встроенных — возвращает значение из plants.js)
export function updatePlant(id, patch) {
  const data = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v === null ? deleteField() : v]))
  return setDoc(doc(plantsCol, id), data, { merge: true })
}

// Добавленное растение удаляется вместе с историей ухода; встроенное (оно в plants.js) только скрывается.
export function deletePlant(id, isCustom) {
  return isCustom ? deleteDoc(doc(plantsCol, id)) : setDoc(doc(plantsCol, id), { hidden: true }, { merge: true })
}

// ---------- галерея ----------
// Главное фото лежит в самом документе растения (поле photo), остальные — отдельными документами
// plants/{id}/photos/{photoId} = { src, createdAt }: у документа лимит 1 МБ, а фото может быть много.
// Порядок остальных фото хранится в поле растения gallery: [photoId, ...].
const photosCol = (plantId) => collection(db, 'plants', plantId, 'photos')

// { [photoId]: src }
export async function loadGallery(plantId) {
  const snap = await getDocs(photosCol(plantId))
  const byId = {}
  snap.forEach((d) => {
    byId[d.id] = d.data().src
  })
  return byId
}

export async function addPhoto(plantId, src) {
  const ref = await addDoc(photosCol(plantId), { src, createdAt: Date.now() })
  return ref.id
}

export function deletePhotos(plantId, ids) {
  return Promise.all(ids.map((id) => deleteDoc(doc(photosCol(plantId), id))))
}
