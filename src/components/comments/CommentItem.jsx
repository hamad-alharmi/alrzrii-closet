import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Reply, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { subscribeToReplies, addReply } from '@/lib/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatDistanceToNow } from 'date-fns'

async function fetchEmail(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data().email?.split('@')[0] : 'user'
  } catch { return 'user' }
}

export default function CommentItem({ comment, currentUser, isAdmin, onDelete }) {
  const [replies, setReplies] = useState([])
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('...')

  useEffect(() => { fetchEmail(comment.authorUID).then(setAuthorName) }, [comment.authorUID])

  useEffect(() => {
    if (!showReplies) return
    const unsub = subscribeToReplies(comment.id, setReplies)
    return unsub
  }, [comment.id, showReplies])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !currentUser) return
    setSubmitting(true)
    try {
      await addReply(comment.id, currentUser.uid, replyText.trim())
      setReplyText('')
      setShowReplies(true)
    } finally { setSubmitting(false) }
  }

  const canDelete = isAdmin || currentUser?.uid === comment.authorUID
  const createdAt = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="border-l-2 border-border pl-4 space-y-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent text-sm font-display font-medium">{authorName}</span>
            <span className="text-text-muted text-xs">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {currentUser && (
            <button onClick={() => setShowReplyForm(s => !s)} className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors">
              <Reply size={13} />
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg text-text-muted hover:text-crimson transition-colors">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {showReplyForm && currentUser && (
        <form onSubmit={handleReply} className="flex gap-2 mt-2">
          <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply..." className="input text-xs py-1.5 flex-1" />
          <button type="submit" disabled={submitting || !replyText.trim()} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1">
            <Send size={11} />
          </button>
        </form>
      )}

      <button onClick={() => setShowReplies(s => !s)} className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors">
        {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showReplies ? 'Hide replies' : 'Show replies'} {replies.length > 0 && `(${replies.length})`}
      </button>

      <AnimatePresence>
        {showReplies && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 space-y-3 border-l border-border/50 pl-3">
            {replies.map(reply => {
              const rDate = reply.createdAt?.toDate ? reply.createdAt.toDate() : new Date()
              return (
                <div key={reply.id} className="space-y-0.5">
                  <ReplyAuthor uid={reply.authorUID} createdAt={rDate} />
                  <p className="text-text-secondary text-xs leading-relaxed">{reply.text}</p>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ReplyAuthor({ uid, createdAt }) {
  const [name, setName] = useState('...')
  useEffect(() => { fetchEmail(uid).then(setName) }, [uid])
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent text-xs font-medium">{name}</span>
      <span className="text-text-muted text-xs">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
    </div>
  )
}
