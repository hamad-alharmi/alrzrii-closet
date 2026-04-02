import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Zap, Users, FolderOpen, Star } from 'lucide-react'
import { getSiteConfig } from '@/lib/firestore'
import { getFiles } from '@/lib/firestore'
import FileCard from '@/components/ui/FileCard'
import { useAuthStore } from '@/store/authStore'
import { likeFile, getUserLikes } from '@/lib/firestore'

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
}

export default function HomePage() {
  const { user } = useAuthStore()
  const [config, setConfig] = useState({ heroTitle: 'Alrzrii Closet', heroSubtitle: 'Minecraft clients, mods, tools & more.', heroTagline: 'Browse. Download. Explore.' })
  const [recentFiles, setRecentFiles] = useState([])
  const [likedIds, setLikedIds] = useState([])

  useEffect(() => {
    getSiteConfig().then(setConfig)
    getFiles({ pageSize: 6 }).then(r => setRecentFiles(r.files))
    if (user) getUserLikes(user.uid).then(setLikedIds)
  }, [user])

  const handleLike = async (fileId) => {
    if (!user) return
    const liked = await likeFile(fileId, user.uid)
    setLikedIds(prev => liked ? [...prev, fileId] : prev.filter(id => id !== fileId))
    setRecentFiles(prev => prev.map(f => f.id === fileId ? { ...f, likesCount: (f.likesCount || 0) + (liked ? 1 : -1) } : f))
  }

  const stats = [
    { icon: FolderOpen, label: 'Files Released', value: recentFiles.length + '+' },
    { icon: Download, label: 'Downloads', value: '1K+' },
    { icon: Star, label: 'Community Likes', value: recentFiles.reduce((a, f) => a + (f.likesCount || 0), 0) + '+' },
    { icon: Users, label: 'Users', value: '100+' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,106,247,0.12),transparent)]" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(124,106,247,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-mono mb-6">
              <Zap size={13} /> {config.heroTagline}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display font-extrabold text-5xl sm:text-7xl text-text-primary leading-none tracking-tight mb-6"
          >
            {config.heroTitle.split(' ').map((word, i) => (
              <span key={i}>{i > 0 ? ' ' : ''}
                {i === config.heroTitle.split(' ').length - 1
                  ? <span className="text-gradient">{word}</span>
                  : word}
              </span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {config.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link to="/files" className="btn-primary flex items-center gap-2">
              Browse Files <ArrowRight size={16} />
            </Link>
            {!user && <Link to="/auth" className="btn-ghost">Join Community</Link>}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <motion.div key={label} variants={stagger.item} className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-accent" />
              </div>
              <div className="font-display font-bold text-2xl text-text-primary">{value}</div>
              <div className="text-text-muted text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Latest Releases</h2>
              <p className="text-text-muted text-sm mt-1">Fresh from the closet</p>
            </div>
            <Link to="/files" className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {recentFiles.map(file => (
              <motion.div key={file.id} variants={stagger.item}>
                <FileCard file={file} onLike={handleLike} liked={likedIds.includes(file.id)} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  )
}
