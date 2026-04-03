import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, query, orderBy, limit,
  where, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { supabase } from '../lib/supabase'
import { v4 as uuid } from '../lib/uuid'

// ─── Upload via Supabase Storage ─────────────────────────────────────────────
export async function uploadFile(file, metadata, onProgress) {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.'
    )
  }

  const ext        = file.name.split('.').pop()
  const uniqueName = `${uuid()}.${ext}`
  const storagePath = `uploads/${uniqueName}`

  onProgress && onProgress(10)

  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  onProgress && onProgress(75)

  const { data: urlData } = supabase.storage
    .from('files')
    .getPublicUrl(storagePath)

  const fileURL = urlData.publicUrl
  if (!fileURL) throw new Error('Could not get public URL from Supabase')

  onProgress && onProgress(90)

  const docRef = await addDoc(collection(db, 'files'), {
    ...metadata,
    fileURL,
    storagePath,
    size:         file.size,
    originalName: file.name,
    contentType:  file.type || '',
    likesCount:    0,
    viewsCount:    0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  onProgress && onProgress(100)
  return docRef.id
}

// ─── Update metadata ──────────────────────────────────────────────────────────
export async function updateFileMeta(id, data) {
  await updateDoc(doc(db, 'files', id), { ...data, updatedAt: serverTimestamp() })
}

// ─── Delete file from Supabase + Firestore ────────────────────────────────────
export async function deleteFile(id) {
  const snap = await getDoc(doc(db, 'files', id))
  if (snap.exists() && supabase) {
    const { storagePath } = snap.data()
    if (storagePath) {
      await supabase.storage.from('files').remove([storagePath]).catch(() => {})
    }
  }
  await deleteDoc(doc(db, 'files', id))
}

// ─── Query files ──────────────────────────────────────────────────────────────
export async function getFiles({ category, sort = 'newest', pageSize = 20 } = {}) {
  const sortField = sort === 'liked' ? 'likesCount' : 'createdAt'
  let q
  if (category && category !== 'all') {
    q = query(
      collection(db, 'files'),
      where('category', '==', category),
      orderBy(sortField, 'desc'),
      limit(pageSize)
    )
  } else {
    q = query(
      collection(db, 'files'),
      orderBy(sortField, 'desc'),
      limit(pageSize)
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Get single file + increment view count ───────────────────────────────────
export async function getFileById(id) {
  const snap = await getDoc(doc(db, 'files', id))
  if (!snap.exists()) return null
  updateDoc(doc(db, 'files', id), { viewsCount: increment(1) }).catch(() => {})
  return { id: snap.id, ...snap.data() }
}

// ─── Like / unlike ────────────────────────────────────────────────────────────
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
