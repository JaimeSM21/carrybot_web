import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/auth'
import Navbar from '../components/Navbar' // Importamos el nuevo menú unificado

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  gray: '#f4f5f7',
  border: '#dde1ea',
  text: '#1a2d5a',
  muted: '#6b7a99',
  success: '#22c55e',
  danger: '#ef4444',
  cardBg: '#ffffff',
}


const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

  .cb-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Se han eliminado .cb-navbar, .cb-logo-text, .cb-nav-links, .cb-nav-btn, etc. */

  .cb-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 20px 28px 8px;
    color: ${C.navy};
    font-size: 14px;
    font-weight: 700;
    background: ${C.white};
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    padding: 10px 18px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: .4px;
    transition: all .15s;
    box-shadow: 0 1px 3px rgba(15, 23, 42, .04);
    width: fit-content;
  }

  .cb-back:hover {
    background: ${C.navy};
    color: ${C.white};
  }

  .cb-auth-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 12px 28px 40px;
  }

  .cb-card {
    width: 100%;
    max-width: 700px;
    background: ${C.cardBg};
    border: 1.5px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(15, 23, 42, .06);
  }

  .cb-card-header {
    background: ${C.navy};
    color: ${C.white};
    font-family: 'Barlow', sans-serif;
    font-weight: 700;
    font-size: 28px;
    padding: 18px 24px;
    text-align: center;
  }

  .cb-card-body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cb-conn-input {
    width: 100%;
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    padding: 15px 18px;
    font-family: 'Barlow', sans-serif;
    font-size: 18px;
    color: ${C.text};
    outline: none;
    background: ${C.white};
  }

  .cb-conn-input:focus {
    border-color: ${C.navy};
    box-shadow: 0 0 0 3px rgba(26,45,90,.08);
  }

  .cb-btn {
    padding: 14px 18px;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    font-size: 16px;
    font-weight: 700;
    border: none;
    transition: all .15s;
    text-transform: uppercase;
    letter-spacing: .3px;
  }

  .cb-btn-yellow {
    background: ${C.yellow};
    color: ${C.navy};
  }
`

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  
const handleLogin = async (e) => {
  e.preventDefault()
  try {
    const user = await loginUser({ email, password })
    onLogin(user)
    navigate(user.tipo === 'administrador' ? '/admin/users' : '/home')
  } catch (err) {
    alert(err.message || 'Credenciales incorrectas')
  }
}

  return (
    <div className="cb-page">
      {/* Nuevo Menú Público Unificado */}
      <Navbar variant="publico" />

      <button className="cb-back" onClick={() => navigate('/')}>
        ‹ Volver a inicio
      </button>

      <div className="cb-auth-wrap">
        <div className="cb-card">
          <div className="cb-card-header">Acceso Operadores</div>
          
          <form className="cb-card-body" onSubmit={handleLogin}>
            <input
              className="cb-conn-input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="cb-conn-input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="cb-btn cb-btn-yellow">
              Entrar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
