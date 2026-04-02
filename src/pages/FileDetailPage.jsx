import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Heart, Eye, Calendar, Tag, ArrowLeft, FileText } from 'lucide-react'
import { getFile, incrementViewCount, likeFile, getUserLikes } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import CommentSection from '@/components/comments/CommentSection'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

function formatBytes(bytes) {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    async function load() {
      const f = await getFile(id)
      setFile(f)
      setLoading(false)
      if (f) await incrementViewCount(id)
      if (user && f) {
        const likes = await getUserLikes(user.uid)
        setLiked(likes.includes(id))
      }
    }
    load()
  }, [id, user])

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return }
    const isNowLiked = await likeFile(id, user.uid)
    setLiked(isNowLiked)
    setFile(f => ({ ...f, likesCount: (f.likesCount || 0) + (isNowLiked ? 1 : -1) }))
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  )

  if (!file) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
      <FileText size={48} className="text-text-muted" />
      <p className="text-text-secondary">File not found</p>
      <Link to="/files" className="btn-primary">Back to Files</Link>
    </div>
  )

  const createdAt = file.createdAt?.toDate ? file.createdAt.toDate() : new Date()
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.fileName || '')

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/files" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Files
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden mb-8">
          {/* Preview */}
          {isImage && (
            <div className="border-b border-border bg-surface/50 flex items-center justify-center p-6" style={{ maxHeight: 400 }}>
              <img src={file.fileURL} alt={file.title} className="max-w-full max-h-80 rounded-xl object-contain" />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {file.category && <span className="badge bg-accent/10 text-accent border border-accent/20">{file.category}</span>}
              {file.tags?.map(t => <span key={t} className="badge bg-white/5 text-text-muted border border-border">{t}</span>)}
            </div>

            <h1 className="font-display font-bold text-3xl text-text-primary mb-3">{file.title}</h1>
            {file.description && <p className="text-text-secondary leading-relaxed mb-6">{file.description}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-surface rounded-xl">
              <div>
                <div className="text-text-muted text-xs mb-1 flex items-center gap-1"><Calendar size={11} /> Uploaded</div>
                <div className="text-text-primary text-sm font-medium">{formatDistanceToNow(createdAt, { addSuffix: true })}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs mb-1">File Size</div>
                <div className="text-text-primary text-sm font-medium">{formatBytes(file.fileSize)}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs mb-1 flex items-center gap-1"><Eye size={11} /> Views</div>
                <div className="text-text-primary text-sm font-medium">{file.viewCount || 0}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs mb-1">Likes</div>
                <div className="text-text-primary text-sm font-medium">{file.likesCount || 0}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href={file.fileURL}
                download={file.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <Download size={16} /> Download {file.fileName && <span className="font-mono text-xs opacity-70">({file.fileName})</span>}
              </a>
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-200 font-display font-medium text-sm ${
                  liked
                    ? 'border-crimson/40 bg-crimson/10 text-crimson'
                    : 'border-border hover:border-crimson/40 text-text-secondary hover:text-crimson hover:bg-crimson/5'
                }`}
              >
                <Heart size={15} className={liked ? 'fill-crimson' : ''} />
                {liked ? 'Liked' : 'Like'} · {file.likesCount || 0}
              </button>
            </div>
          </div>
        </motion.div>

        <CommentSection fileId={id} />
      </div>
    </div>
  )
}
