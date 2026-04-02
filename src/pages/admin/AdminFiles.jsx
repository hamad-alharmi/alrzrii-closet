import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Trash2, Edit2, FileIcon, Eye, Heart } from 'lucide-react'
import { useFilesStore } from '../../store/filesStore'
import { deleteFile } from '../../services/fileService'
import { formatBytes, formatDate } from '../../lib/formatters'
import UploadModal from '../../components/admin/UploadModal'
import EditFileModal from '../../components/admin/EditFileModal'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'

export default function AdminFiles() {
  const { files, fetchFiles, fetchCategories, loading } = useFilesStore()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editFile, setEditFile] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchFiles()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteFile(deleteTarget.id)
      toast.success('File deleted')
      fetchFiles()
      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">File Management</h2>
          <p className="text-white/40 text-sm">{files.length} files total</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UploadCloud size={16} /> Upload File
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : files.length === 0 ? (
        <EmptyState icon={FileIcon} title="No files yet" message="Upload your first file above" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Title', 'Category', 'Size', 'Views', 'Likes', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileIcon size={14} className="text-accent-light flex-shrink-0" />
                        <span className="font-medium truncate max-w-[160px]">{f.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-white/5 text-white/50 border border-white/10">
                        {f.category || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatBytes(f.size)}</td>
                    <td className="px-4 py-3 text-white/50">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {f.viewsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      <span className="flex items-center gap-1">
                        <Heart size={12} /> {f.likesCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatDate(f.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditFile(f)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all text-white/40 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Edit modal */}
      {editFile && (
        <EditFileModal
          open={!!editFile}
          onClose={() => setEditFile(null)}
          file={editFile}
          onSaved={() => { fetchFiles(); setEditFile(null) }}
        />
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete file">
        <p className="text-white/60 mb-6">
          Delete <strong className="text-white">{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 py-2.5">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1 py-2.5">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
