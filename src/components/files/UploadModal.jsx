import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, Image, CheckCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import { uploadFileToSupabase, MAX_FILE_SIZE } from '@/lib/supabase'
import { createFile, getCategories } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function UploadModal({ open, onClose, onUploaded }) {
  const { user } = useAuthStore()
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState([])
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef()

  React.useEffect(() => {
    if (open) getCategories().then(setCategories)
  }, [open])

  const resetForm = () => {
    setSelectedFile(null); setTitle(''); setDescription(''); setCategory('')
    setTags(''); setProgress(0); setUploading(false); setDone(false)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleFileSelect = (file) => {
    if (file.size > MAX_FILE_SIZE) { toast.error('File exceeds 100MB limit'); return }
    setSelectedFile(file)
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) { toast.error('Select a file'); return }
    if (!title.trim()) { toast.error('Enter a title'); return }
    setUploading(true)
    try {
      const { fileURL, fileName, fileSize, filePath } = await uploadFileToSupabase(selectedFile, setProgress)
      await createFile({
        title: title.trim(),
        description: description.trim(),
        category: category || 'Misc',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        fileURL,
        fileName,
        fileSize,
        filePath,
        ownerUID: user.uid,
      })
      setDone(true)
      toast.success('File uploaded!')
      setTimeout(() => { handleClose(); onUploaded?.() }, 1200)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload File" size="md">
      <div className="p-6">
        {done ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-jade/20 border border-jade/40 flex items-center justify-center">
              <CheckCircle size={28} className="text-jade" />
            </div>
            <p className="font-display font-semibold text-text-primary">Upload complete!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragging ? 'border-accent bg-accent/10' : selectedFile ? 'border-jade/40 bg-jade/5' : 'border-border hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files[0] && handleFileSelect(e.target.files[0])} />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File size={20} className="text-jade" />
                  <div className="text-left">
                    <p className="text-text-primary text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-text-muted text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }} className="ml-auto text-text-muted hover:text-crimson">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-text-muted mx-auto mb-2" />
                  <p className="text-text-secondary text-sm">Drag & drop or click to browse</p>
                  <p className="text-text-muted text-xs mt-1">Max 100MB</p>
                </>
              )}
            </div>

            <div>
              <label className="label">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="File title" required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input resize-none" rows={3} placeholder="Describe this file..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="Misc">Misc</option>
                </select>
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input" placeholder="tag1, tag2" />
              </div>
            </div>

            {uploading && <ProgressBar progress={progress} label="Uploading..." />}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={uploading || !selectedFile} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload size={14} /> Upload</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
