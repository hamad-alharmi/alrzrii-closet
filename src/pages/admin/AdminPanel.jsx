import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UploadCloud, Users, Tag, Megaphone, LayoutDashboard
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'

const links = [
  { to: '/admin/files',         label: 'Files',         icon: UploadCloud },
  { to: '/admin/users',         label: 'Users',         icon: Users },
  { to: '/admin/categories',    label: 'Categories',    icon: Tag },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminPanel() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-white/40 text-sm">Manage your platform</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <nav className="card p-2 flex lg:flex-col gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent/15 text-accent-light'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </PageTransition>
  )
}
