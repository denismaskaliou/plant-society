// Слой хранения на Firestore (коллекция "plants").
// Описания растений лежат в plants.js; сюда пишутся только события ухода,
// добавленные в приложении. Документ растения: plants/{id} = { care: [{ type, date }] }.
// Старые документы с другими id игнорируются.
import { arrayRemove, arrayUnion, collection, doc, getDocs, setDoc } from 'firebase/firestore'
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
