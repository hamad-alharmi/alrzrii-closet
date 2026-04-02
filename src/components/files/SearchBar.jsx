import { Search, X } from 'lucide-react'
import { useFilesStore } from '../../store/filesStore'

export default function SearchBar() {
  const { search, setSearch } = useFilesStore()

  return (
    <div className="relative flex-1 max-w-md">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search files, tags..."
        className="input pl-10 pr-10"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
