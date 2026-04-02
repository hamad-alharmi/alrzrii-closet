import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Calendar, ShieldCheck, FileText } from 'lucide-react'
import { getUserProfile, getFiles } from '@/lib/firestore'
import FileCard from '@/components/ui/FileCard'
import { formatDistanceToNow } from 'date-fns'

export default function ProfilePage() {
  const { uid } = useParams()
  const [profile, setProfile] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getUserProfile(uid)
      setProfile(p)
      // Get files owned by this user if admin
      if (p?.role === 'admin') {
        const result = await getFiles({ pageSize: 12 })
        setFiles(result.files.filter(f => f.ownerUID === uid))
      }
      setLoading(false)
    }
    load()
  }, [uid])

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
  if (!profile) return <div className="min-h-screen pt-24 flex items-center justify-center text-text-muted">User not found</div>

  const joinedAt = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <User size={32} className="text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-text-primary">{profile.email?.split('@')[0]}</h1>
                {profile.role === 'admin' && (
                  <span className="badge bg-ember/10 text-ember border border-ember/20"><ShieldCheck size={11} /> Admin</span>
                )}
              </div>
              <p className="text-text-muted text-sm">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3 text-text-muted text-sm">
                <Calendar size={13} />
                <span>Joined {formatDistanceToNow(joinedAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {files.length > 0 && (
          <div>
            <h2 className="section-title mb-5 flex items-center gap-2"><FileText size={20} className="text-accent" /> Uploaded Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {files.map(f => <FileCard key={f.id} file={f} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
