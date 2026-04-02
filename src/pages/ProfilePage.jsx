import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { getUserDoc, updateUserProfile } from '../services/userService'
import { useAuthStore } from '../store/authStore'
import { formatDate } from '../lib/formatters'
import PageTransition from '../components/ui/PageTransition'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { uid } = useParams()
  const { user, profile: myProfile, setProfile } = useAuthStore()
  const isOwn = user?.uid === uid

  const [profile, setLocalProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUserDoc(uid).then(p => {
      setLocalProfile(p)
      setDisplayName(p?.displayName || '')
      setBio(p?.bio || '')
      setLoading(false)
    })
  }, [uid])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(uid, { displayName, bio })
      setLocalProfile(prev => ({ ...prev, displayName, bio }))
      if (isOwn) setProfile({ ...myProfile, displayName, bio })
      setEditing(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-32"><Spinner size={32} /></div>
  if (!profile) return null

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent-light flex-shrink-0">
              {profile.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              {editing && isOwn ? (
                <div className="flex flex-col gap-3">
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="input text-lg font-bold py-2"
                    placeholder="Display name"
                  />
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="input resize-none text-sm"
                    rows={3}
                    placeholder="Short bio..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold">{profile.displayName}</h1>
                    {profile.role === 'admin' && (
                      <span className="badge bg-accent/15 text-accent-light border border-accent/20 text-xs flex items-center gap-1">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                  </div>
                  {profile.bio && <p className="text-white/50 text-sm mb-3">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-white/30">
                    <span className="flex items-center gap-1.5"><Mail size={13} /> {profile.email}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {isOwn && (
                    <button onClick={() => setEditing(true)} className="btn-ghost text-sm py-2 px-4 mt-4">
                      Edit profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
