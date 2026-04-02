import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, Eye, Calendar, Tag, Folder,
  ArrowLeft, Trash2, Edit2, ImageIcon, FileIcon
} from 'lucide-react'
import { getFileById, deleteFile } from '../services/fileService'
import { useAuthStore } from '../store/authStore'
import { formatBytes, formatDate, isImage } from '../lib/formatters'
import LikeButton from '../components/files/LikeButton'
import CommentSection from '../components/comments/CommentSection'
import PageTransition from '../components/ui/PageTransition'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import EditFileModal from '../components/admin/EditFileModal'
import toast from 'react-hot-toast'

export default function FileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getFileById(id).then(f => {
      setFile(f)
      setLoading(false)
    }).catch(() => {
      toast.error('File not found')
      navigate('/files')
    })
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteFile(id)
      toast.success('File deleted')
      navigate('/files')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-32"><Spinner size={32} /></div>
  if (!file) return null

  const image = isImage(file.contentType)

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Preview */}
            <div className="card overflow-hidden">
              {image ? (
                <img
                  src={file.fileURL}
                  alt={file.title}
                  className="w-full max-h-96 object-contain bg-dark-600"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-dark-600 text-white/20 gap-3">
                  <FileIcon size={48} />
                  <span className="text-sm">{file.originalName}</span>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl font-bold mb-3">{file.title}</h1>
              {file.description && (
                <p className="text-white/50 leading-relaxed">{file.description}</p>
              )}
            </div>

            {/* Tags */}
            {file.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {file.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            {/* Comments */}
            <div className="card p-6">
              <CommentSection fileId={id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Actions */}
            <div className="card p-5 flex flex-col gap-3">
              <a
                href={file.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                download={file.originalName}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download
              </a>
              <LikeButton fileId={id} initialCount={file.likesCount} />
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 btn-ghost text-sm"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="flex-1 btn-danger text-sm flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="card p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white/70 mb-1">File info</h3>
              {[
                { icon: Folder, label: 'Category', value: file.category || 'Uncategorized' },
                { icon: Calendar, label: 'Uploaded', value: formatDate(file.createdAt) },
                { icon: Tag, label: 'Size', value: formatBytes(file.size) },
                { icon: Eye, label: 'Views', value: file.viewsCount || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Icon size={13} /> {label}
                  </span>
                  <span className="text-white/70">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {isAdmin && (
        <EditFileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          file={file}
          onSaved={(updated) => setFile({ ...file, ...updated })}
        />
      )}

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete file">
        <p className="text-white/60 mb-6">Are you sure you want to delete <strong>{file.title}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 py-2.5">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => setDeleteOpen(false)} className="btn-ghost flex-1 py-2.5">
            Cancel
          </button>
        </div>
      </Modal>
    </PageTransition>
  )
}
