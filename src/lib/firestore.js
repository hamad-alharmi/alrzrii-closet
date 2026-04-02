import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, startAfter, setDoc
} from 'firebase/firestore'
import { db } from './firebase'

// Users
export async function createUserProfile(uid, email) {
  await setDoc(doc(db, 'users', uid), { uid, email, role: 'user', createdAt: serverTimestamp() })
}
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role })
}
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Files
export async function createFile(data) {
  return await addDoc(collection(db, 'files'), { ...data, createdAt: serverTimestamp(), likesCount: 0, viewCount: 0 })
}
export async function updateFile(id, data) { await updateDoc(doc(db, 'files', id), data) }
export async function deleteFile(id) { await deleteDoc(doc(db, 'files', id)) }
export async function getFile(id) {
  const snap = await getDoc(doc(db, 'files', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function getFiles({ categoryFilter, sortBy = 'newest', pageSize = 20, lastDoc } = {}) {
  const constraints = []
  if (categoryFilter && categoryFilter !== 'all') constraints.push(where('category', '==', categoryFilter))
  constraints.push(orderBy(sortBy === 'popular' ? 'likesCount' : 'createdAt', 'desc'))
  constraints.push(limit(pageSize))
  if (lastDoc) constraints.push(startAfter(lastDoc))
  const snap = await getDocs(query(collection(db, 'files'), ...constraints))
  return { files: snap.docs.map(d => ({ id: d.id, ...d.data() })), lastDoc: snap.docs[snap.docs.length - 1] || null, hasMore: snap.docs.length === pageSize }
}
export async function incrementViewCount(id) { await updateDoc(doc(db, 'files', id), { viewCount: increment(1) }) }

// Likes
export async function likeFile(fileId, userId) {
  const likeRef = doc(db, 'likes', `${userId}_${fileId}`)
  const snap = await getDoc(likeRef)
  if (snap.exists()) {
    await deleteDoc(likeRef)
    await updateDoc(doc(db, 'files', fileId), { likesCount: increment(-1) })
    return false
  } else {
    await setDoc(likeRef, { userId, fileId, createdAt: serverTimestamp() })
    await updateDoc(doc(db, 'files', fileId), { likesCount: increment(1) })
    return true
  }
}
export async function getUserLikes(userId) {
  const snap = await getDocs(query(collection(db, 'likes'), where('userId', '==', userId)))
  return snap.docs.map(d => d.data().fileId)
}

// Comments
export function subscribeToComments(fileId, callback) {
  return onSnapshot(query(collection(db, 'comments'), where('fileId', '==', fileId), orderBy('createdAt', 'asc')), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
export async function addComment(fileId, authorUID, text) {
  return await addDoc(collection(db, 'comments'), { fileId, authorUID, text, createdAt: serverTimestamp() })
}
export async function deleteComment(id) { await deleteDoc(doc(db, 'comments', id)) }

// Replies
export function subscribeToReplies(commentId, callback) {
  return onSnapshot(query(collection(db, 'replies'), where('commentId', '==', commentId), orderBy('createdAt', 'asc')), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
export async function addReply(commentId, authorUID, text) {
  return await addDoc(collection(db, 'replies'), { commentId, authorUID, text, createdAt: serverTimestamp() })
}

// Categories
export async function getCategories() {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
export function subscribeToCategories(callback) {
  return onSnapshot(query(collection(db, 'categories'), orderBy('createdAt', 'asc')), snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
export async function createCategory(name, color) {
  return await addDoc(collection(db, 'categories'), { name, color, createdAt: serverTimestamp() })
}
export async function deleteCategory(id) { await deleteDoc(doc(db, 'categories', id)) }

// Messages
export function subscribeToMessages(callback) {
  return onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50)), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
export async function postMessage(authorUID, text) {
  return await addDoc(collection(db, 'messages'), { authorUID, text, createdAt: serverTimestamp() })
}
export async function deleteMessage(id) { await deleteDoc(doc(db, 'messages', id)) }
export function subscribeToMessageReplies(messageId, callback) {
  return onSnapshot(query(collection(db, 'messageReplies'), where('messageId', '==', messageId), orderBy('createdAt', 'asc')), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
export async function replyToMessage(messageId, authorUID, text) {
  return await addDoc(collection(db, 'messageReplies'), { messageId, authorUID, text, createdAt: serverTimestamp() })
}

// Site Config
export async function getSiteConfig() {
  const snap = await getDoc(doc(db, 'config', 'site'))
  return snap.exists() ? snap.data() : {
    heroTitle: 'Alrzrii Closet',
    heroSubtitle: 'Minecraft clients, mods, tools & more — crafted with care.',
    heroTagline: 'Browse. Download. Explore.',
  }
}
export async function updateSiteConfig(data) {
  await setDoc(doc(db, 'config', 'site'), data, { merge: true })
}
