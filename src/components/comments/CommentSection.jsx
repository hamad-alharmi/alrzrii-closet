import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import {
  subscribeComments, addComment, deleteComment, editComment,
} from '../../services/commentService'
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

export default function CommentSection({ fileId }) {
  const { user, profile } = useAuthStore()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = subscribeComments(fileId, setComments)
    return unsub
  }, [fileId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!user) return toast.error('Sign in to comment')
    setSubmitting(true)
    try {
      await addComment(fileId, user.uid, profile?.displayName || user.email, text)
      setText('')
      toast.success('Comment posted')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-white mb-5">
        <MessageSquare size={18} className="text-accent-light" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light flex-shrink-0 mt-1">
            {(profile?.displayName || user.email)?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="input resize-none text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn-primary text-sm py-2"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <AnimatePresence initial={false}>
        {comments.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                fileId={fileId}
                onDelete={() => deleteComment(fileId, c.id)}
                onEdit={(newText) => editComment(fileId, c.id, newText)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
