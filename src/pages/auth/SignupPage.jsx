import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { registerUser } from '../../services/authService'
import toast from 'react-hot-toast'
import PageTransition from '../../components/ui/PageTransition'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Fill in all fields')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await registerUser(email, password, name)
      toast.success('Account created! Welcome 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Create account</h1>
                <p className="text-white/40 text-sm">Join Alrzrii Closet for free</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Display name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" className="input" required
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" required
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" className="input" required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-light hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
