import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full"
          />
        </div>
        <span className="text-sm text-white/40">Loading...</span>
      </motion.div>
    </div>
  )
}
