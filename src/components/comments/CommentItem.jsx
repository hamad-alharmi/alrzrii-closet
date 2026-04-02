import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Reply, Check, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { formatRelative } from '../../lib/formatters'
import { subscribeReplies, addReply } from '../../services/commentService'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function CommentItem({ comment, fileId, onDelete, onEdit }) {
  const { user, profile } = useAuthStore()
  const isOwner = user?.uid === comment.authorId
  const isAdmin = profile?.role === 'admin'
  const canModify = isOwner || isAdmin

  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState([])
  const [showReplies, setShowReplies] = useState(false)

  useEffect(() => {
    if (showReplies) {
      const unsub = subscribeReplies(fileId, comment.id, setReplies)
      return unsub
    }
  }, [showReplies, fileId, comment.id])

  const handleSaveEdit = async () => {
    if (!editText.trim()) return
    await onEdit(editText)
    setEditing(false)
    toast.success('Comment updated')
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !user) return
    await addReply(fileId, comment.id, user.uid, profile?.displayName || user.email, replyText)
    setReplyText('')
    setReplying(false)
    setShowReplies(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {comment.authorName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-white/30">{formatRelative(comment.createdAt)}</span>
          {comment.editedAt && <span className="text-xs text-white/20">(edited)</span>}
        </div>

        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={2}
              className="input text-sm resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="flex items-center gap-1 text-xs btn-primary py-1.5 px-3">
                <Check size={12} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs btn-ghost py-1.5 px-3">
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white/70 text-sm leading-relaxed">{comment.text}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-accent-light transition-colors"
            >
              <Reply size={12} /> Reply
            </button>
          )}
          {canModify && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-accent-light/70 hover:text-accent-light"
            >
              {showReplies ? 'Hide' : `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`}
            </button>
          )}
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {replying && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReply}
              className="mt-3 flex gap-2"
            >
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.authorName}...`}
                className="input text-sm py-2"
              />
              <button type="submit" disabled={!replyText.trim()} className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                Reply
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Replies */}
        <AnimatePresence>
          {showReplies && replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 pl-4 border-l-2 border-white/5 flex flex-col gap-3"
            >
              {replies.map(r => (
                <div key={r.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {r.authorName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{r.authorName}</span>
                      <span className="text-xs text-white/25">{formatRelative(r.createdAt)}</span>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed mt-0.5">{r.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
