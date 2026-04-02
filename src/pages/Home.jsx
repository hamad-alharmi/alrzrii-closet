import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Users, Folder, Zap } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'

const stats = [
  { icon: Folder, label: 'Files shared', value: '100+' },
  { icon: Users, label: 'Community members', value: '500+' },
  { icon: Download, label: 'Downloads', value: '2k+' },
]

const features = [
  {
    icon: Folder,
    title: 'Curated File Library',
    desc: 'Browse a growing library of hand-picked files, templates, and resources. Filter by category, search by name.',
  },
  {
    icon: Users,
    title: 'Community Hub',
    desc: 'Read announcements, engage in discussions, and connect with others. Real-time conversations.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    desc: 'Sign up free and get instant access to download any file. No ads, no paywalls.',
  },
]

export default function Home() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent-light text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <Zap size={12} /> Now live — browse the closet
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Welcome to{' '}
              <span className="glow-text">Alrzrii</span>
              <br />Closet
            </h1>
            <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Your go-to platform for curated files, community discussions,
              and creative resources. Built different.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/files" className="btn-primary flex items-center gap-2">
                Browse Files <ArrowRight size={16} />
              </Link>
              <Link to="/community" className="btn-ghost flex items-center gap-2">
                Join Community <Users size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="card p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-accent-light" />
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="section-title text-center mb-3">Everything you need</h2>
        <p className="text-white/40 text-center mb-12">One platform. All the tools.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
              className="card card-hover p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-accent-light" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
