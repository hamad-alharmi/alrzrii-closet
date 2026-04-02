import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import PageLoader from './components/ui/PageLoader'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

const Home = lazy(() => import('./pages/Home'))
const FilesPage = lazy(() => import('./pages/FilesPage'))
const FileDetail = lazy(() => import('./pages/FileDetail'))
const Community = lazy(() => import('./pages/Community'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./pages/auth/SignupPage'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))

export default function App() {
  const location = useLocation()
  const { init, loading } = useAuthStore()

  useEffect(() => { init() }, [init])

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/files/:id" element={<FileDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile/:uid" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>}>
              <Route index element={<Navigate to="files" replace />} />
              <Route path="files" element={<AdminFiles />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  )
}
