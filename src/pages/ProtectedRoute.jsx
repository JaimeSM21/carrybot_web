import { Navigate, useLocation } from 'react-router-dom'

/**
 * ProtectedRoute — protege rutas por autenticación y opcionalmente por rol.
 *
 * Props:
 *   isAuthenticated  boolean   — hay sesión activa
 *   requiredRole     string    — (opcional) 'administrador' | 'trabajador'
 *   user             object    — objeto de sesión (necesario si usas requiredRole)
 *   children         node      — componente a renderizar si pasa los checks
 */
export default function ProtectedRoute({ isAuthenticated, requiredRole, user, children }) {
  const location = useLocation()

  // 1. Sin sesión → al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // 2. Hay sesión pero el rol no coincide → a home (o a donde tenga acceso)
  if (requiredRole && user?.tipo !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  return children
}
