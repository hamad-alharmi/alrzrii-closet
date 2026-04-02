import FileCard from './FileCard'
import { motion } from 'framer-motion'

export default function FileGrid({ files }) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      {files.map((f, i) => (
        <FileCard key={f.id} file={f} index={i} />
      ))}
    </motion.div>
  )
}
