import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Heart, Eye, FileText, Package, Wrench, BookOpen, MoreHorizontal, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const categoryIcons = {
  'Minecraft Clients': Package,
  'Mods': Package,
  'Tools': Wrench,
  'School': BookOpen,
  'default': FileText,
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileCard({ file, onLike, liked, isAdmin, onDelete, onEdit }) {
  const Icon = categoryIcons[file.category] || categoryIcons.default
  const createdAt = file.createdAt?.toDate ? file.createdAt.toDate() : new Date()
  const isImage = file.fileURL && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.fileName || '')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group flex flex-col"
    >
      {/* Image Preview */}
      {isImage ? (
        <div className="h-40 bg-surface overflow-hidden">
          <img src={file.fileURL} alt={file.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-accent/10 to-surface flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center">
            <Icon size={24} className="text-accent" />
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Category + Tags */}
        <div className="flex flex-wrap gap-1.5">
          {file.category && (
            <span className="badge bg-accent/10 text-accent border border-accent/20">{file.category}</span>
          )}
          {file.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="badge bg-white/5 text-text-muted border border-border">{tag}</span>
          ))}
        </div>

        {/* Title + Desc */}
        <div>
          <Link to={`/files/${file.id}`} className="block">
            <h3 className="font-display font-bold text-text-primary text-base leading-snug hover:text-accent transition-colors line-clamp-1">
              {file.title}
            </h3>
          </Link>
          {file.description && (
            <p className="text-text-muted text-sm mt-1 line-clamp-2 leading-relaxed">{file.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-muted mt-auto">
          <span className="flex items-center gap-1"><Calendar size={11} />{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          <span className="flex items-center gap-1"><Eye size={11} />{file.viewCount || 0}</span>
          {file.fileSize && <span>{formatBytes(file.fileSize)}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <a
              href={file.fileURL}
              download={file.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-display font-medium text-accent hover:text-accent-glow transition-colors"
            >
              <Download size={13} /> Download
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLike?.(file.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? 'text-crimson' : 'text-text-muted hover:text-crimson'
              }`}
            >
              <Heart size={13} className={liked ? 'fill-crimson' : ''} />
              {file.likesCount || 0}
            </button>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit?.(file)} className="p-1 rounded text-text-muted hover:text-accent transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
