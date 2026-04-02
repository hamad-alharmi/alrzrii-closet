import { useFilesStore } from '../../store/filesStore'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'liked', label: 'Most Liked' },
]

export default function FilterBar() {
  const { categories, selectedCategory, setCategory, sort, setSort, fetchFiles } = useFilesStore()

  const handleCategory = (cat) => {
    setCategory(cat)
    setTimeout(fetchFiles, 0)
  }

  const handleSort = (e) => {
    setSort(e.target.value)
    setTimeout(fetchFiles, 0)
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
            selectedCategory === 'all'
              ? 'bg-accent text-white border-accent'
              : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              selectedCategory === cat.name
                ? 'bg-accent text-white border-accent'
                : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort select */}
      <select
        value={sort}
        onChange={handleSort}
        className="ml-auto bg-dark-600 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-accent/50"
      >
        {sortOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
