import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Grid3X3, List, Upload, X, ChevronDown } from 'lucide-react'
import { getFiles, getUserLikes, likeFile, subscribeToCategories } from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import FileCard from '@/components/ui/FileCard'
import EmptyState from '@/components/ui/EmptyState'
import UploadModal from '@/components/files/UploadModal'
import EditFileModal from '@/components/files/EditFileModal'
import toast from 'react-hot-toast'
import { FolderOpen } from 'lucide-react'

export default function FilesPage() {
  const { user, profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [categories, setCategories] = useState([])
  const [likedIds, setLikedIds] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [editFile, setEditFile] = useState(null)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const unsub = subscribeToCategories(setCategories)
    return unsub
  }, [])

  useEffect(() => {
    if (user) getUserLikes(user.uid).then(setLikedIds)
  }, [user])

  const fetchFiles = useCallback(async (reset = true) => {
    setLoading(true)
    try {
      const result = await getFiles({ categoryFilter: category, sortBy, pageSize: 18, lastDoc: reset ? null : lastDoc })
      setFiles(prev => reset ? result.files : [...prev, ...result.files])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } finally {
      setLoading(false)
    }
  }, [category, sortBy])

  useEffect(() => { fetchFiles(true) }, [category, sortBy])

  const handleLike = async (fileId) => {
    if (!user) { toast.error('Sign in to like files'); return }
    const liked = await likeFile(fileId, user.uid)
    setLikedIds(prev => liked ? [...prev, fileId] : prev.filter(id => id !== fileId))
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, likesCount: (f.likesCount || 0) + (liked ? 1 : -1) } : f))
  }

  const filtered = files.filter(f =>
    !search || f.title?.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()) || f.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title text-3xl">Files</h1>
            <p className="text-text-muted text-sm mt-1">{filtered.length} item{filtered.length !== 1 ? 's' : ''} available</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
              <Upload size={15} /> Upload File
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files, tags..."
              className="input pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select value={category} onChange={e => setCategory(e.target.value)} className="input pr-8 appearance-none cursor-pointer min-w-[140px]">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input pr-8 appearance-none cursor-pointer min-w-[130px]">
                <option value="newest">Newest</option>
                <option value="popular">Most Liked</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setCategory('all')}
              className={`badge transition-all cursor-pointer ${
                category === 'all' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-muted border border-border hover:border-accent/30'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.name)}
                className={`badge transition-all cursor-pointer ${
                  category === c.name ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-muted border border-border hover:border-accent/30'
                }`}
                style={category === c.name && c.color ? { backgroundColor: c.color + '22', color: c.color, borderColor: c.color + '55' } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Files Grid */}
        {loading && files.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-32 bg-surface" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-surface rounded w-1/3" />
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No files found"
            description={search ? `No results for "${search}"` : 'No files in this category yet.'}
            action={isAdmin && <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2"><Upload size={14} />Upload First File</button>}
          />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onLike={handleLike}
                    liked={likedIds.includes(file.id)}
                    isAdmin={isAdmin}
                    onEdit={setEditFile}
                    onDelete={async () => {
                      const { deleteFile } = await import('@/lib/firestore')
                      await deleteFile(file.id)
                      setFiles(prev => prev.filter(f => f.id !== file.id))
                      toast.success('File deleted')
                    }}
                  />
                ))}
              </div>
            </AnimatePresence>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={() => fetchFiles(false)} disabled={loading} className="btn-ghost flex items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); fetchFiles(true) }} />
      {editFile && <EditFileModal file={editFile} onClose={() => setEditFile(null)} onSaved={() => { setEditFile(null); fetchFiles(true) }} />}
    </div>
  )
}
