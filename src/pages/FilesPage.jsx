import { useEffect } from 'react'
import { Folder } from 'lucide-react'
import { useFilesStore } from '../store/filesStore'
import FileGrid from '../components/files/FileGrid'
import SearchBar from '../components/files/SearchBar'
import FilterBar from '../components/files/FilterBar'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'

export default function FilesPage() {
  const { fetchFiles, fetchCategories, loading } = useFilesStore()
  const filteredFiles = useFilesStore(s => s.filteredFiles())

  useEffect(() => {
    fetchCategories()
    fetchFiles()
  }, [])

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-1">File Library</h1>
          <p className="text-white/40">Browse and download curated files</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <SearchBar />
          </div>
          <FilterBar />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No files found"
            message="Try a different search or category"
          />
        ) : (
          <FileGrid files={filteredFiles} />
        )}
      </div>
    </PageTransition>
  )
}
