import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// Web-конфиг Firebase не секрет: безопасность определяется правилами Firestore.
const firebaseConfig = {
  apiKey: 'AIzaSyDxuZp4R7Tk7klD9_ntgGo7TJad8o_ahFU',
  authDomain: 'plant-society-2026.firebaseapp.com',
  projectId: 'plant-society-2026',
  storageBucket: 'plant-society-2026.firebasestorage.app',
  messagingSenderId: '950951357137',
  appId: '1:950951357137:web:f604a7b76c3fa88fdc33f0',
}

const app = initializeApp(firebaseConfig)

// Локальный кэш в IndexedDB: приложение читает данные и офлайн.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export const auth = getAuth(app)
