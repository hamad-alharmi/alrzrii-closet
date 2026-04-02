import { useState } from 'react'
import Modal from '../ui/Modal'
import { updateFileMeta } from '../../services/fileService'
import { useFilesStore } from '../../store/filesStore'
import toast from 'react-hot-toast'

export default function EditFileModal({ open, onClose, file, onSaved }) {
  const { categories } = useFilesStore()
  const [title, setTitle] = useState(file?.title || '')
  const [description, setDescription] = useState(file?.description || '')
  const [category, setCategory] = useState(file?.category || '')
  const [tagsRaw, setTagsRaw] = useState(file?.tags?.join(', ') || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      await updateFileMeta(file.id, { title, description, category, tags })
      onSaved({ title, description, category, tags })
      toast.success('File updated')
      onClose()
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit File">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="input resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Tags</label>
            <input
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              placeholder="tag1, tag2"
              className="input"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
