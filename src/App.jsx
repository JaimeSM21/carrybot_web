import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage   from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import GestionRobot from './pages/GestionRobot'
import ProtectedRoute from './components/ProtectedRoute'
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
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/home" replace /> : <Register onLogin={handleLogin} />}
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={!!user}>
              <GestionRobot user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
        <Route path="/robot"  element={<GestionRobot />} />
      </Routes>
    </BrowserRouter>
  )
}
 
export default App