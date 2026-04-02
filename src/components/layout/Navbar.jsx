import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Home, FolderOpen, LayoutDashboard, ShieldCheck, LogIn, LogOut, Menu, X, User, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/files', label: 'Files', icon: FolderOpen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
]

export default function Navbar() {
  const { user, profile, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location.pathname])

  const handleLogout = async () => { await logout(); toast.success('Signed out'); navigate('/') }
  const isAdmin = profile?.role === 'admin'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-void/90 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <span className="text-accent font-display font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-text-primary text-lg tracking-tight">
              alrzrii<span className="text-accent">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, auth }) => {
              if (auth && !user) return null
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
              return (
                <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 ${
                  active ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}>
                  <Icon size={15} />{label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link to="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 ${
                location.pathname === '/admin' ? 'bg-ember/15 text-ember' : 'text-text-secondary hover:text-ember hover:bg-ember/5'
              }`}>
                <ShieldCheck size={15} />Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:border-accent/40 transition-all duration-200">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <User size={12} className="text-accent" />
                  </div>
                  <span className="text-sm text-text-secondary font-display max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  {isAdmin && <span className="text-xs bg-ember/15 text-ember px-1.5 py-0.5 rounded-md font-mono">admin</span>}
                  <ChevronDown size={13} className={`text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-panel border border-border rounded-xl shadow-card overflow-hidden z-50"
                    >
                      <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                        <User size={14} /> My Profile
                      </Link>
                      <div className="border-t border-border/50" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-crimson hover:bg-crimson/5 w-full transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary text-sm py-2"><LogIn size={14} className="inline mr-1.5" />Sign In</Link>
            )}
          </div>

          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-void/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, icon: Icon, auth }) => {
                if (auth && !user) return null
                const active = location.pathname === to
                return (
                  <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium transition-all ${
                    active ? 'bg-accent/15 text-accent' : 'text-text-secondary'
                  }`}>
                    <Icon size={16} /> {label}
                  </Link>
                )
              })}
              {isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium text-text-secondary hover:text-ember"><ShieldCheck size={16} /> Admin Panel</Link>}
              <div className="pt-2 border-t border-border/50">
                {user ? (
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-crimson w-full"><LogOut size={16} /> Sign Out</button>
                ) : (
                  <Link to="/auth" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display text-accent"><LogIn size={16} /> Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
