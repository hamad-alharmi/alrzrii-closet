import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import PageLoader from '../ui/PageLoader'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}
