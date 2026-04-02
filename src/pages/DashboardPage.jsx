import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Trash2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { subscribeToMessages, postMessage, deleteMessage, replyToMessage, subscribeToMessageReplies } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

async function getUsername(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data().email?.split('@')[0] : 'user'
  } catch { return 'user' }
}

function MessageThread({ msg, currentUser, isAdmin }) {
  const [replies, setReplies] = useState([])
  const [show, setShow] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('...')
  const [replyAuthors, setReplyAuthors] = useState({})

  useEffect(() => { getUsername(msg.authorUID).then(setAuthorName) }, [msg.authorUID])

  useEffect(() => {
    if (!show) return
    return subscribeToMessageReplies(msg.id, async (rps) => {
      setReplies(rps)
      rps.forEach(r => {
        if (!replyAuthors[r.authorUID]) {
          getUsername(r.authorUID).then(name => setReplyAuthors(p => ({ ...p, [r.authorUID]: name })))
        }
      })
    })
  }, [msg.id, show])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await replyToMessage(msg.id, currentUser.uid, text.trim()).catch(() => toast.error('Failed'))
    setText('')
    setSubmitting(false)
  }

  const createdAt = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-ember text-sm font-display font-semibold">{authorName}</span>
            <span className="badge bg-ember/10 text-ember border border-ember/20 text-[10px]"><ShieldCheck size={9} />admin</span>
            <span className="text-text-muted text-xs">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
          <p className="text-text-secondary leading-relaxed">{msg.text}</p>
        </div>
        {isAdmin && (
          <button onClick={() => deleteMessage(msg.id)} className="p-1.5 text-text-muted hover:text-crimson transition-colors flex-shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <button onClick={() => setShow(s => !s)} className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors">
        {show ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {show ? 'Hide' : 'View'} replies {replies.length > 0 && `(${replies.length})`}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 border-l-2 border-border pl-4">
            {replies.map(r => {
              const rDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date()
              return (
                <div key={r.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-xs font-medium">{replyAuthors[r.authorUID] || '...'}</span>
                    <span className="text-text-muted text-xs">{formatDistanceToNow(rDate, { addSuffix: true })}</span>
                  </div>
                  <p className="text-text-secondary text-sm">{r.text}</p>
                </div>
              )
            })}
            <form onSubmit={handleReply} className="flex gap-2 mt-2">
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Reply to announcement..." className="input text-sm flex-1" />
              <button type="submit" disabled={submitting || !text.trim()} className="btn-primary px-4">
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const unsub = subscribeToMessages(setMessages)
    return unsub
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    setPosting(true)
    await postMessage(user.uid, newMsg.trim()).catch(() => toast.error('Failed to post'))
    setNewMsg('')
    setPosting(false)
    toast.success('Announcement posted')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title text-3xl mb-1">Community Dashboard</h1>
          <p className="text-text-muted text-sm">Announcements, updates, and discussions</p>
        </div>

        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
            <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-ember" /> Post Announcement
            </h2>
            <form onSubmit={handlePost} className="flex flex-col gap-3">
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Write an announcement..."
                className="input resize-none"
                rows={3}
              />
              <button type="submit" disabled={posting || !newMsg.trim()} className="btn-primary self-end flex items-center gap-2">
                {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Post</>}
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
              <p>No announcements yet.</p>
            </div>
          ) : (
            messages.map(msg => (
              <MessageThread key={msg.id} msg={msg} currentUser={user} isAdmin={isAdmin} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
