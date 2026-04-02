import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, Trash2 } from 'lucide-react'
import { createCategory, deleteCategory } from '../../services/categoryService'
import { useFilesStore } from '../../store/filesStore'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const { categories, fetchCategories } = useFilesStore()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Category name required')
    setAdding(true)
    try {
      await createCategory(name.trim(), desc.trim())
      setName('')
      setDesc('')
      await fetchCategories()
      toast.success('Category created')
    } catch {
      toast.error('Failed to create category')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      await fetchCategories()
      toast.success('Category deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold">Categories</h2>
        <p className="text-white/40 text-sm">{categories.length} categories</p>
      </div>

      {/* Add form */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4">Create New Category</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Templates"
                className="input"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Description</label>
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Optional description"
                className="input"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={adding || !name.trim()} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> {adding ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" message="Create one above" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex items-start justify-between gap-3 card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-accent-light" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete category">
        <p className="text-white/60 mb-6">
          Delete category <strong className="text-white">{deleteTarget?.name}</strong>?
          Files using this category will become uncategorized.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 py-2.5">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1 py-2.5">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
