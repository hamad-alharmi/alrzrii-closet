import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldOff, Users, Search } from 'lucide-react'
import { getAllUsers, setUserRole } from '../../services/userService'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../lib/formatters'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getAllUsers().then(list => {
      setUsers(list)
      setLoading(false)
    })
  }, [])

  const handleRoleToggle = async (uid, currentRole) => {
    if (uid === me?.uid) return toast.error("Can't change your own role")
    setUpdating(uid)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      await setUserRole(uid, newRole)
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u))
      toast.success(`User ${newRole === 'admin' ? 'promoted to admin' : 'demoted to user'}`)
    } catch {
      toast.error('Role update failed')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">User Management</h2>
          <p className="text-white/40 text-sm">{users.length} members total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.uid || u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light flex-shrink-0">
                          {u.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium">{u.displayName || 'Unnamed'}</span>
                        {(u.uid || u.id) === me?.uid && (
                          <span className="text-xs text-white/30">(you)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${
                        u.role === 'admin'
                          ? 'bg-accent/15 text-accent-light border border-accent/20'
                          : 'bg-white/5 text-white/50 border border-white/10'
                      }`}>
                        {u.role === 'admin' && <Shield size={10} className="inline mr-1" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {(u.uid || u.id) !== me?.uid && (
                        <button
                          onClick={() => handleRoleToggle(u.uid || u.id, u.role)}
                          disabled={updating === (u.uid || u.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            u.role === 'admin'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                              : 'bg-accent/10 border-accent/20 text-accent-light hover:bg-accent/20'
                          } disabled:opacity-50`}
                        >
                          {u.role === 'admin'
                            ? <><ShieldOff size={12} /> Demote</>
                            : <><Shield size={12} /> Promote</>
                          }
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
