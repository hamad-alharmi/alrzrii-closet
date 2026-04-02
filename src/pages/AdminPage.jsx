import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Users, Tag, Settings, Trash2, Plus, CheckCircle, XCircle, PenLine
} from 'lucide-react'
import {
  getAllUsers, updateUserRole,
  subscribeToCategories, createCategory, deleteCategory,
  getSiteConfig, updateSiteConfig
} from '@/lib/firestore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const PALETTE = [
  '#7c6af7', '#f97316', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'
]

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${
        active ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  )
}

export default function AdminPage() {
  const { user, refreshProfile } = useAuthStore()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [siteConfig, setSiteConfig] = useState(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(PALETTE[0])
  const [savingConfig, setSavingConfig] = useState(false)

  useEffect(() => {
    getAllUsers().then(setUsers)
    const unsub = subscribeToCategories(setCategories)
    getSiteConfig().then(setSiteConfig)
    return unsub
  }, [])

  const toggleAdmin = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    await updateUserRole(u.uid, newRole)
    setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, role: newRole } : x))
    if (u.uid === user.uid) refreshProfile()
    toast.success(`${u.email?.split('@')[0]} is now ${newRole}`)
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    await createCategory(newCatName.trim(), newCatColor)
    setNewCatName('')
    toast.success('Category created')
  }

  const handleDeleteCategory = async (id, name) => {
    await deleteCategory(id)
    toast.success(`"${name}" deleted`)
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    setSavingConfig(true)
    await updateSiteConfig(siteConfig)
    toast.success('Site config saved')
    setSavingConfig(false)
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'site', label: 'Site Config', icon: Settings },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-ember/15 border border-ember/30 flex items-center justify-center">
            <ShieldCheck size={20} className="text-ember" />
          </div>
          <div>
            <h1 className="section-title text-3xl">Admin Panel</h1>
            <p className="text-text-muted text-sm">Manage your platform</p>
          </div>
        </div>

        <div className="flex gap-1 bg-surface p-1 rounded-xl mb-8 w-fit">
          {tabs.map(t => <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />)}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-text-muted text-sm">{users.length} registered users</p>
            {users.map(u => (
              <div key={u.uid} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-display font-bold text-sm">
                    {u.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-text-primary text-sm font-medium">{u.email}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {u.role === 'admin'
                        ? <span className="badge bg-ember/10 text-ember border border-ember/20 text-[10px]"><ShieldCheck size={9} /> admin</span>
                        : <span className="badge bg-white/5 text-text-muted border border-border text-[10px]">user</span>
                      }
                      {u.uid === user.uid && <span className="text-xs text-text-muted">(you)</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleAdmin(u)}
                  disabled={u.uid === user.uid}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    u.role === 'admin'
                      ? 'border-crimson/30 bg-crimson/10 text-crimson hover:bg-crimson/20'
                      : 'border-jade/30 bg-jade/10 text-jade hover:bg-jade/20'
                  }`}
                >
                  {u.role === 'admin' ? <><XCircle size={12} /> Revoke Admin</> : <><CheckCircle size={12} /> Make Admin</>}
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <form onSubmit={handleAddCategory} className="card p-5 space-y-4">
              <h3 className="font-display font-semibold text-text-primary">New Category</h3>
              <div className="flex gap-3">
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  className="input flex-1"
                  required
                />
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newCatColor === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-panel scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </form>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No categories yet.</p>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || '#7c6af7' }} />
                      <span className="text-text-primary font-medium">{c.name}</span>
                    </div>
                    <button onClick={() => handleDeleteCategory(c.id, c.name)} className="p-1.5 text-text-muted hover:text-crimson transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Site Config Tab */}
        {tab === 'site' && siteConfig && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSaveConfig} className="card p-6 space-y-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <PenLine size={16} className="text-accent" /> Hero Section
              </h3>
              <div>
                <label className="label">Hero Title</label>
                <input
                  value={siteConfig.heroTitle || ''}
                  onChange={e => setSiteConfig(s => ({ ...s, heroTitle: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Hero Subtitle</label>
                <textarea
                  value={siteConfig.heroSubtitle || ''}
                  onChange={e => setSiteConfig(s => ({ ...s, heroSubtitle: e.target.value }))}
                  className="input resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input
                  value={siteConfig.heroTagline || ''}
                  onChange={e => setSiteConfig(s => ({ ...s, heroTagline: e.target.value }))}
                  className="input"
                />
              </div>
              <button type="submit" disabled={savingConfig} className="btn-primary flex items-center gap-2">
                {savingConfig ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
