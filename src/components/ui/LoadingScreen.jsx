import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-accent font-display font-bold text-xl">A</span>
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
