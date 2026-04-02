import React from 'react'
import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
          <Icon size={28} className="text-accent/60" />
        </div>
      )}
      <h3 className="font-display font-bold text-text-secondary text-lg mb-2">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
