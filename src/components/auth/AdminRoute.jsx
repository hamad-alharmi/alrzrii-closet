import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import PageLoader from '../ui/PageLoader'

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}
