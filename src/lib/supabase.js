import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET || 'closet-files'
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export function generateUniqueFileName(originalName) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  const base = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 40)
  return `${base}_${timestamp}_${random}.${ext}`
}

export async function uploadFileToSupabase(file, onProgress) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }
  const uniqueName = generateUniqueFileName(file.name)
  const filePath = `uploads/${uniqueName}`
  let progressInterval
  if (onProgress) {
    let progress = 0
    progressInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 15, 90)
      onProgress(progress)
    }, 200)
  }
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    if (onProgress) { clearInterval(progressInterval); onProgress(100) }
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
    return { fileURL: urlData.publicUrl, fileName: file.name, fileSize: file.size, filePath }
  } catch (err) {
    if (progressInterval) clearInterval(progressInterval)
    throw err
  }
}

export async function deleteFileFromSupabase(filePath) {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
  if (error) throw error
}
