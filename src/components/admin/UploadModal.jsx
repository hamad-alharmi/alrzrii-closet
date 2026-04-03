import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, X, FileIcon, CheckCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { uploadFile } from '../../services/fileService'
import { useFilesStore } from '../../store/filesStore'
import { formatBytes } from '../../lib/formatters'
import toast from 'react-hot-toast'

export default function UploadModal({ open, onClose }) {
  const { categories, fetchFiles } = useFilesStore()

  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length) {
      toast.error(`File rejected: ${rejected[0].errors[0]?.message || 'unknown error'}`)
      return
    }
    if (accepted[0]) {
      setFile(accepted[0])
      setError('')
      if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, ''))
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file')
    if (!title.trim()) return toast.error('Title is required')

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      await uploadFile(
        file,
        { title: title.trim(), description: description.trim(), category, tags },
        setProgress
      )
      setDone(true)
      toast.success('File uploaded successfully!')
      await fetchFiles()
      setTimeout(handleClose, 1500)
    } catch (err) {
      console.error('Upload error:', err)
      const msg = err?.message || 'Upload failed. Check console for details.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (uploading) return
    setFile(null)
    setTitle('')
    setDescription('')
    setCategory('')
    setTagsRaw('')
    setProgress(0)
    setDone(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload File" maxWidth="max-w-xl">
      <div className="flex flex-col gap-4">

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${
            isDragActive
              ? 'border-accent bg-accent/10'
              : file
              ? 'border-green-500/40 bg-green-500/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="has-file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-2"
              >
                <FileIcon size={32} className="text-accent-light" />
                <p className="font-medium text-sm text-white truncate max-w-full px-4">
                  {file.name}
                </p>
                <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); setTitle('') }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
                >
                  <X size={12} /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="no-file"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <UploadCloud size={36} className="text-white/20" />
                <p className="text-white/50 text-sm">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop a file, or click to browse'}
                </p>
                <p className="text-white/20 text-xs">Max 100 MB — any file type</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                <span>{
                  progress < 50 ? 'Uploading to storage...' :
                  progress < 90 ? 'Getting file URL...' :
                  'Saving to database...'
                }</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Done */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-green-400 text-sm justify-center py-2"
            >
              <CheckCircle size={18} /> Upload complete!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form fields */}
        {!done && (
          <>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="File title"
                className="input"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description..."
                rows={2}
                className="input resize-none"
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input"
                  disabled={uploading}
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Tags</label>
                <input
                  value={tagsRaw}
                  onChange={e => setTagsRaw(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="input"
                  disabled={uploading}
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file || !title.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
            >
              <UploadCloud size={16} />
              {uploading ? `Uploading... ${progress}%` : 'Upload File'}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
