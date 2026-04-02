import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <Icon size={28} className="text-accent/60" />
        </div>
      )}
      <p className="text-white/60 font-medium">{title}</p>
      {message && <p className="text-white/30 text-sm mt-1">{message}</p>}
    </motion.div>
  )
}
