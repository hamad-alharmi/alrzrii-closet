import React from 'react'
import { motion } from 'framer-motion'

export default function ProgressBar({ progress, label }) {
  return (
    <div className="space-y-2">
      {label && <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </div>}
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}
