import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import FilesPage from '@/pages/FilesPage'
import FileDetailPage from '@/pages/FileDetailPage'
import DashboardPage from '@/pages/DashboardPage'
import AdminPage from '@/pages/AdminPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import LoadingScreen from '@/components/ui/LoadingScreen'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const init = useAuthStore(s => s.init)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => {
    const unsub = init()
    return () => unsub?.()
  }, [init])

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121c',
            color: '#e8e8f0',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#050508' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#050508' } },
        }}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/:id" element={<FileDetailPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/profile/:uid" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
