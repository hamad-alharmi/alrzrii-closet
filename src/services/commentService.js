import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function subscribeComments(fileId, callback) {
  const q = query(
    collection(db, 'files', fileId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(comments)
  })
}

export function subscribeReplies(fileId, commentId, callback) {
  const q = query(
    collection(db, 'files', fileId, 'comments', commentId, 'replies'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addComment(fileId, authorId, authorName, text) {
  const ref = await addDoc(collection(db, 'files', fileId, 'comments'), {
    authorId, authorName, text,
    createdAt: serverTimestamp(),
    editedAt: null,
  })
  await updateDoc(doc(db, 'files', fileId), { commentsCount: increment(1) })
  return ref.id
}

export async function deleteComment(fileId, commentId) {
  await deleteDoc(doc(db, 'files', fileId, 'comments', commentId))
  await updateDoc(doc(db, 'files', fileId), { commentsCount: increment(-1) })
}

export async function editComment(fileId, commentId, text) {
  await updateDoc(doc(db, 'files', fileId, 'comments', commentId), {
    text, editedAt: serverTimestamp(),
  })
}

export async function addReply(fileId, commentId, authorId, authorName, text) {
  await addDoc(collection(db, 'files', fileId, 'comments', commentId, 'replies'), {
    authorId, authorName, text, createdAt: serverTimestamp(),
  })
}
