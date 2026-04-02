import { create } from 'zustand'
import { getFiles } from '../services/fileService'
import { getCategories } from '../services/categoryService'

export const useFilesStore = create((set, get) => ({
  files: [],
  categories: [],
  loading: false,
  search: '',
  selectedCategory: 'all',
  sort: 'newest',

  fetchFiles: async () => {
    set({ loading: true })
    try {
      const { selectedCategory, sort } = get()
      const files = await getFiles({ category: selectedCategory, sort })
      set({ files, loading: false })
    } catch (e) {
      set({ loading: false })
    }
  },

  fetchCategories: async () => {
    const categories = await getCategories()
    set({ categories })
  },

  setSearch: (search) => set({ search }),
  setCategory: (cat) => set({ selectedCategory: cat }),
  setSort: (sort) => set({ sort }),

  filteredFiles: () => {
    const { files, search } = get()
    if (!search.trim()) return files
    const q = search.toLowerCase()
    return files.filter(f =>
      f.title?.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q) ||
      f.tags?.some(t => t.toLowerCase().includes(q))
    )
  },
}))
