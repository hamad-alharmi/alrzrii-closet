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

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0])
      if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, ''))
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleUpload = async () => {
    if (!file || !title.trim()) return toast.error('File and title are required')
    setUploading(true)
    setProgress(0)
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      await uploadFile(
        file,
        { title: title.trim(), description, category, tags },
        setProgress
      )
      setDone(true)
      toast.success('File uploaded!')
      await fetchFiles()
      setTimeout(() => {
        handleClose()
      }, 1200)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setTitle('')
    setDescription('')
    setCategory('')
    setTagsRaw('')
    setProgress(0)
    setDone(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload File" maxWidth="max-w-xl">
      <div className="flex flex-col gap-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
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
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <FileIcon size={32} className="text-accent-light" />
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1"
                >
                  <X size={12} /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <UploadCloud size={36} className="text-white/20" />
                <p className="text-white/50 text-sm">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop a file, or click to browse'}
                </p>
                <p className="text-white/20 text-xs">Max 100 MB</p>
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
            >
              <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Done state */}
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

        {/* Metadata fields */}
        {!done && (
          <>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Title <span className="text-red-400">*</span></label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="File title"
                className="input"
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input"
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
                />
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !title.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              <UploadCloud size={16} />
              {uploading ? `Uploading ${progress}%` : 'Upload File'}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
