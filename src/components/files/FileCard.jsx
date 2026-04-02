import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Heart, Eye, FileIcon, ImageIcon, Tag } from 'lucide-react'
import { formatBytes, formatRelative, isImage } from '../../lib/formatters'

export default function FileCard({ file, index = 0 }) {
  const image = isImage(file.contentType)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={`/files/${file.id}`} className="block card card-hover overflow-hidden group">
        {/* Preview */}
        <div className="h-44 bg-dark-600 flex items-center justify-center overflow-hidden relative">
          {image && file.fileURL ? (
            <img
              src={file.fileURL}
              alt={file.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/20">
              <FileIcon size={36} />
              <span className="text-xs">{file.originalName?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
            </div>
          )}
          {/* Category badge */}
          {file.category && (
            <span className="absolute top-3 left-3 badge bg-dark-800/90 text-white/70 border border-white/10 backdrop-blur-sm">
              {file.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate mb-1">{file.title}</h3>
          {file.description && (
            <p className="text-white/40 text-sm line-clamp-2 mb-3">{file.description}</p>
          )}

          {/* Tags */}
          {file.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {file.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag text-xs">{tag}</span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-white/30 pt-2 border-t border-white/5">
            <span>{formatBytes(file.size)}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {file.viewsCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={12} /> {file.likesCount || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
