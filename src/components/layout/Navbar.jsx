import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield, LogOut, User, Folder, Home, Users } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { logoutUser } from '../../services/authService'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/files', label: 'Files', icon: Folder },
  { to: '/community', label: 'Community', icon: Users },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/')
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm font-bold group-hover:shadow-glow transition-all">
            AC
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            Alrzrii <span className="glow-text">Closet</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-accent/15 text-accent-light' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  isActive ? 'bg-accent/15 text-accent-light' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Shield size={14} /> Admin
            </NavLink>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light">
                  {(profile?.displayName || user.email)?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-white/80 max-w-[120px] truncate">
                  {profile?.displayName || user.email}
                </span>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 card shadow-xl z-50"
                  >
                    <div className="p-1">
                      <Link
                        to={`/profile/${user.uid}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <User size={14} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-all"
                      >
                        <LogOut size={14} /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2">Sign in</Link>
              <Link to="/signup" className="btn-primary text-sm py-2">Join free</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-dark-800"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-accent/15 text-accent-light' : 'text-white/60 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost text-sm flex-1 text-center">
                    Sign in
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center">
                    Join free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
