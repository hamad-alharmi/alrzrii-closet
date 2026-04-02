import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, query, orderBy, limit,
  where, serverTimestamp, increment,
} from 'firebase/firestore'
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { v4 as uuid } from '../lib/uuid'

export async function uploadFile(file, metadata, onProgress) {
  const ext = file.name.split('.').pop()
  const uniqueName = `${uuid()}.${ext}`
  const storageRef = ref(storage, `files/${uniqueName}`)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) {
          onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        }
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          const docRef = await addDoc(collection(db, 'files'), {
            ...metadata,
            fileURL: url,
            storagePath: `files/${uniqueName}`,
            size: file.size,
            originalName: file.name,
            contentType: file.type,
            likesCount: 0,
            viewsCount: 0,
            commentsCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          resolve(docRef.id)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

export async function updateFileMeta(id, data) {
  await updateDoc(doc(db, 'files', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteFile(id) {
  const snap = await getDoc(doc(db, 'files', id))
  if (snap.exists()) {
    const { storagePath } = snap.data()
    if (storagePath) {
      try { await deleteObject(ref(storage, storagePath)) } catch (_) {}
    }
  }
  await deleteDoc(doc(db, 'files', id))
}

export async function getFiles({ category, sort = 'newest', pageSize = 20 } = {}) {
  let q
  if (category && category !== 'all') {
    q = query(
      collection(db, 'files'),
      where('category', '==', category),
      orderBy(sort === 'liked' ? 'likesCount' : 'createdAt', 'desc'),
      limit(pageSize)
    )
  } else {
    q = query(
      collection(db, 'files'),
      orderBy(sort === 'liked' ? 'likesCount' : 'createdAt', 'desc'),
      limit(pageSize)
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getFileById(id) {
  const snap = await getDoc(doc(db, 'files', id))
  if (!snap.exists()) return null
  // increment view count but don't await it — don't block page load
  updateDoc(doc(db, 'files', id), { viewsCount: increment(1) }).catch(() => {})
  return { id: snap.id, ...snap.data() }
}

export async function toggleLike(fileId, userId, isLiked) {
  const likeRef = doc(db, 'files', fileId, 'likes', userId)
  const fileRef = doc(db, 'files', fileId)
  if (isLiked) {
    await deleteDoc(likeRef)
    await updateDoc(fileRef, { likesCount: increment(-1) })
  } else {
    await setDoc(likeRef, { userId, createdAt: serverTimestamp() })
    await updateDoc(fileRef, { likesCount: increment(1) })
  }
}

export async function getLike(fileId, userId) {
  const snap = await getDoc(doc(db, 'files', fileId, 'likes', userId))
  return snap.exists()
}
