import {
  collection, doc, getDoc, getDocs, updateDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function setUserRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}
