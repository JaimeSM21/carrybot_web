import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import GestionRobot from './pages/GestionRobot'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import UserManagement from './pages/UserManagement'
import Inventario from './pages/Inventario'
import RegistroAlertas from './pages/RegistroAlertas'
import RegistroIncidencias from './pages/RegistroIncidencias' // <-- IMPORTANTE: Faltaba esta importación
import FormularioIncidencias from './pages/FormularioIncidencias'
import RobotList from './pages/RobotList'
import { getSessionUser, logoutSession, seedDemoUser } from './utils/auth'

function App() {
  const [user, setUser] = useState(() => getSessionUser())

  useEffect(() => {
    seedDemoUser()
    setUser(getSessionUser())
  }, [])

  const handleLogin = (sessionUser) => setUser(sessionUser)

  const handleLogout = () => {
    logoutSession()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<LandingPage user={user} onLogout={handleLogout} />} />

        <Route
          path="/login"
          element={user ? <Navigate to={user.tipo === 'administrador' ? '/admin/users' : '/home'} replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/home" replace /> : <Register onLogin={handleLogin} />}
        />

        {/* RUTAS PROTEGIDAS TRABAJADOR */}
        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <RobotList user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <Inventario user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacto"  // Ruta que usa el trabajador para reportar
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <FormularioIncidencias user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <RegistroAlertas user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS ADMINISTRADOR */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <UserManagement user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registro-incidencias"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <RegistroIncidencias user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* CONTROL DE ROBOT INDIVIDUAL */}
        <Route
          path="/robot/:id"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <GestionRobot user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App;
