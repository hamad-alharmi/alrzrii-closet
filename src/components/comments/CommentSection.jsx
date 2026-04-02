import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { subscribeToComments, addComment, deleteComment } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

export default function CommentSection({ fileId }) {
  const { user, profile } = useAuthStore()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = subscribeToComments(fileId, setComments)
    return unsub
  }, [fileId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!user) { toast.error('Sign in to comment'); return }
    setSubmitting(true)
    try {
      await addComment(fileId, user.uid, text.trim())
      setText('')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} className="text-accent" />
        <h2 className="font-display font-bold text-lg text-text-primary">Comments</h2>
        <span className="text-text-muted text-sm">({comments.length})</span>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="input flex-1"
          />
          <button type="submit" disabled={submitting || !text.trim()} className="btn-primary px-4 flex items-center gap-2">
            <Send size={14} />
          </button>
        </form>
      )}

      {!user && (
        <div className="bg-surface rounded-xl p-4 mb-6 text-center">
          <p className="text-text-muted text-sm">Sign in to join the conversation</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                isAdmin={profile?.role === 'admin'}
                onDelete={() => deleteComment(comment.id).catch(() => toast.error('Failed to delete'))}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
