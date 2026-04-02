import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { updateFile, deleteFile, getCategories } from '@/lib/firestore'
import { deleteFileFromSupabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function EditFileModal({ file, onClose, onSaved }) {
  const [title, setTitle] = useState(file.title || '')
  const [description, setDescription] = useState(file.description || '')
  const [category, setCategory] = useState(file.category || '')
  const [tags, setTags] = useState(file.tags?.join(', ') || '')
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { getCategories().then(setCategories) }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateFile(file.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      toast.success('File updated')
      onSaved()
    } catch (err) {
      toast.error('Failed to update')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      if (file.filePath) await deleteFileFromSupabase(file.filePath).catch(() => {})
      await deleteFile(file.id)
      toast.success('File deleted')
      onSaved()
    } catch (err) {
      toast.error('Failed to delete')
    } finally { setSaving(false) }
  }

  return (
    <Modal open onClose={onClose} title="Edit File" size="md">
      <div className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <option value="Misc">Misc</option>
              </select>
            </div>
            <div>
              <label className="label">Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className="input" placeholder="tag1, tag2" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <div className="border-t border-border/50 mt-6 pt-4">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="btn-danger flex items-center gap-2 w-full justify-center">
              <Trash2 size={14} /> Delete File
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 text-sm">Confirm Delete</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
