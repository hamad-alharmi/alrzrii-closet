import {
  collection, addDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function getCategories() {
  const q = query(collection(db, 'categories'), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createCategory(name, description = '') {
  return addDoc(collection(db, 'categories'), {
    name, description, createdAt: serverTimestamp(),
  })
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, 'categories', id))
}
