import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
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

  useEffect(() => {
    if (expanded) {
      const unsub = subscribeAnnouncementReplies(ann.id, setReplies)
      return unsub
    }
  }, [expanded, ann.id])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !user) return
    setSubmitting(true)
    try {
      await addAnnouncementReply(ann.id, user.uid, profile?.displayName || user.email, replyText)
      setReplyText('')
    } catch { toast.error('Failed to reply') }
    finally { setSubmitting(false) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-accent/15 text-accent-light border border-accent/20 text-xs">
                <Megaphone size={10} className="inline mr-1" />Announcement
              </span>
              <span className="text-xs text-white/30">{formatRelative(ann.createdAt)}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">{ann.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{ann.body}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={() => deleteAnnouncement(ann.id)}
                className="p-1.5 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors px-2 py-1 hover:bg-white/5 rounded-lg"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {replies.length > 0 ? `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}` : 'Reply'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-dark-800"
          >
            <div className="p-4">
              {/* Replies */}
              {replies.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {replies.map(r => (
                    <div key={r.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {r.authorName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium">{r.authorName}</span>
                          <span className="text-xs text-white/25">{formatRelative(r.createdAt)}</span>
                        </div>
                        <p className="text-white/60 text-sm">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {user ? (
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="input text-sm py-2"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="btn-primary text-sm py-2 px-4 flex-shrink-0 flex items-center gap-1.5"
                  >
                    <Send size={13} /> Send
                  </button>
                </form>
              ) : (
                <p className="text-white/30 text-sm">Sign in to reply</p>
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
          <p className="text-white/40">Announcements and discussions</p>
        </div>

        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" message="Check back soon!" />
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
