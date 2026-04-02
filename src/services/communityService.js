import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function subscribeAnnouncements(callback) {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function postAnnouncement(authorId, authorName, title, body) {
  return addDoc(collection(db, 'announcements'), {
    authorId, authorName, title, body, createdAt: serverTimestamp(),
  })
}

export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, 'announcements', id))
}

export function subscribeAnnouncementReplies(annId, callback) {
  const q = query(
    collection(db, 'announcements', annId, 'replies'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function addAnnouncementReply(annId, authorId, authorName, text) {
  await addDoc(collection(db, 'announcements', annId, 'replies'), {
    authorId, authorName, text, createdAt: serverTimestamp(),
  })
}
