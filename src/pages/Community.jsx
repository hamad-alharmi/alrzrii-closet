import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Send, ChevronDown, ChevronUp, Trash2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  subscribeAnnouncements,
  deleteAnnouncement,
  subscribeAnnouncementReplies,
  addAnnouncementReply,
} from '../services/communityService'
import { formatRelative } from '../lib/formatters'
import PageTransition from '../components/ui/PageTransition'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'

function AnnouncementCard({ ann, isAdmin }) {
  const { user, profile } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Keep subscription alive as long as the card is mounted once expanded
  const subscribedRef = useRef(false)
  const unsubRef = useRef(null)

  // Subscribe to replies permanently once the card is first expanded
  useEffect(() => {
    if (expanded && !subscribedRef.current) {
      subscribedRef.current = true
      unsubRef.current = subscribeAnnouncementReplies(ann.id, setReplies)
    }
    return () => {
      // Only unsub when the component unmounts entirely
    }
  }, [expanded, ann.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    if (!user) return toast.error('Sign in to reply')
    setSubmitting(true)
    try {
      await addAnnouncementReply(
        ann.id,
        user.uid,
        profile?.displayName || user.email,
        replyText.trim()
      )
      setReplyText('')
      toast.success('Reply posted!')
    } catch (err) {
      console.error('Reply error:', err)
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpanded = () => setExpanded(prev => !prev)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-accent/15 text-accent-light border border-accent/20 text-xs">
                <Megaphone size={10} className="inline mr-1" />Announcement
              </span>
              <span className="text-xs text-white/30">{formatRelative(ann.createdAt)}</span>
              <span className="text-xs text-white/20">by {ann.authorName}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">{ann.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{ann.body}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={() => deleteAnnouncement(ann.id).catch(() => toast.error('Delete failed'))}
                className="p-1.5 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all"
                title="Delete announcement"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-2.5 py-1.5 hover:bg-white/5 rounded-lg border border-white/5"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span>
                {replies.length > 0
                  ? `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`
                  : 'Replies'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="replies-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-white/5 bg-dark-800 p-4">

              {/* Replies list */}
              {replies.length > 0 ? (
                <div className="flex flex-col gap-3 mb-4">
                  {replies.map(r => (
                    <div key={r.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold flex-shrink-0 text-accent-light">
                        {(r.authorName || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-white/80">{r.authorName}</span>
                          <span className="text-xs text-white/25">{formatRelative(r.createdAt)}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-0.5">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/25 text-xs mb-4">No replies yet — be the first!</p>
              )}

              {/* Reply input — any authenticated user */}
              {user ? (
                <form onSubmit={handleReply} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold flex-shrink-0 text-accent-light mt-1">
                    {(profile?.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="input text-sm py-2 flex-1"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="btn-primary text-sm py-2 px-4 flex-shrink-0 flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    {submitting ? '...' : 'Send'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-sm text-white/30">
                  <LogIn size={14} />
                  <Link to="/login" className="text-accent-light hover:underline">Sign in</Link>
                  <span>to join the conversation</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Community() {
  const { profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const unsub = subscribeAnnouncements(setAnnouncements)
    return unsub
  }, [])

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="section-title mb-1">Community Hub</h1>
          <p className="text-white/40">Announcements and discussions — open to everyone</p>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            message="Check back soon for updates!"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map(a => (
              <AnnouncementCard key={a.id} ann={a} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
