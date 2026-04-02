import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { toggleLike, getLike } from '../../services/fileService'
import toast from 'react-hot-toast'

export default function LikeButton({ fileId, initialCount = 0 }) {
  const { user } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      getLike(fileId, user.uid).then(setLiked)
    }
  }, [fileId, user])

  const handleLike = async () => {
    if (!user) return toast.error('Sign in to like files')
    if (loading) return
    setLoading(true)
    const newLiked = !liked
    setLiked(newLiked)
    setCount(c => newLiked ? c + 1 : c - 1)
    try {
      await toggleLike(fileId, user.uid, liked)
    } catch {
      setLiked(liked)
      setCount(initialCount)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleLike}
      whileTap={{ scale: 0.88 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
        liked
          ? 'bg-red-500/15 border-red-500/30 text-red-400'
          : 'bg-white/5 border-white/10 text-white/60 hover:border-red-500/30 hover:text-red-400'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={liked ? 'liked' : 'not-liked'}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </motion.div>
      </AnimatePresence>
      {count}
    </motion.button>
  )
}
