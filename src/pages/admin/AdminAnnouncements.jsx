import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import {
  subscribeAnnouncements,
  postAnnouncement,
  deleteAnnouncement,
} from '../../services/communityService'
import { formatRelative } from '../../lib/formatters'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

export default function AdminAnnouncements() {
  const { user, profile } = useAuthStore()
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const unsub = subscribeAnnouncements(setAnnouncements)
    return unsub
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return toast.error('Fill in all fields')
    setPosting(true)
    try {
      await postAnnouncement(user.uid, profile?.displayName || user.email, title.trim(), body.trim())
      setTitle('')
      setBody('')
      toast.success('Announcement posted!')
    } catch {
      toast.error('Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAnnouncement(deleteTarget.id)
      toast.success('Announcement deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold">Announcements</h2>
        <p className="text-white/40 text-sm">Post updates for the community</p>
      </div>

      {/* Compose */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Megaphone size={15} className="text-accent-light" />
          New Announcement
        </h3>
        <form onSubmit={handlePost} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title <span className="text-red-400">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="input"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Message <span className="text-red-400">*</span></label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message to the community..."
              rows={4}
              className="input resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting || !title.trim() || !body.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} /> {posting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" message="Post one above to get started" />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {announcements.map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 flex gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={16} className="text-accent-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{ann.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{ann.body}</p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(ann)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/25">
                    <span>By {ann.authorName}</span>
                    <span>·</span>
                    <span>{formatRelative(ann.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete announcement">
        <p className="text-white/60 mb-6">
          Delete <strong className="text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>? This cannot be undone.
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
