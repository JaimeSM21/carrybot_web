import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/auth'

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

  .cb-navbar {
    background: ${C.navy};
    display: flex; align-items: center; gap: 12px;
    padding: 0 28px; height: 64px;
    box-shadow: 0 2px 12px rgba(26,45,90,.18);
  }

  .cb-logo-text {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: ${C.white};
    letter-spacing: -0.5px;
  }

  .cb-logo-text span { color: ${C.yellow}; }

  .cb-nav-links { display: flex; gap: 4px; margin-left: 20px; }

  .cb-nav-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: ${C.white};
    padding: 8px 16px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: .5px;
    transition: background .15s;
  }

  .cb-nav-btn:hover { background: rgba(255,255,255,.12); }
  .cb-nav-btn.active { background: ${C.yellow}; color: ${C.navy}; }

  .cb-nav-spacer { flex: 1; }

  .cb-nav-session {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,.4);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: ${C.white};
    padding: 7px 18px;
    letter-spacing: .4px;
    text-transform: uppercase;
    transition: all .15s;
  }

  .cb-nav-session:hover {
    background: rgba(255,255,255,.1);
    border-color: ${C.white};
  }

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

  .cb-btn-yellow:hover {
    background: #e0b310;
  }

  .cb-alert-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    font-size: 16px;
    border-radius: 10px;
    padding: 14px 18px;
    text-align: center;
    font-weight: 600;
  }

  .cb-alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 15px;
    border-radius: 10px;
    padding: 12px 16px;
    text-align: center;
    font-weight: 600;
  }

  .cb-auth-switch {
    text-align: center;
    font-size: 16px;
    color: ${C.muted};
    margin-top: 4px;
    font-weight: 600;
  }

  .cb-auth-link {
    color: ${C.navy};
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .cb-footer {
    background: ${C.navy};
    color: rgba(255,255,255,.7);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    font-size: 13px;
    margin-top: auto;
  }

  .cb-footer-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: ${C.white};
  }

  .cb-footer-logo span { color: ${C.yellow}; }
  .cb-footer-icons { display: flex; gap: 14px; font-size: 18px; }

  @media (max-width: 768px) {
    .cb-navbar {
      flex-wrap: wrap;
      height: auto;
      padding: 16px 20px;
    }

    .cb-nav-links {
      order: 3;
      width: 100%;
      margin-left: 0;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .cb-auth-wrap {
      padding: 12px 16px 32px;
    }

    .cb-card-header {
      font-size: 22px;
    }

    .cb-card-body {
      padding: 20px;
    }

    .cb-conn-input {
      font-size: 16px;
    }
  }
`

const initialValues = {
  email: '',
  password: '',
}

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialValues)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectedFrom = useMemo(() => location.state?.from || '/home', [location.state])

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    const email = form.email.trim()
    const password = form.password.trim()

    if (!email || !password) {
      return 'Rellena el correo y la contraseña.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Introduce un correo válido.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError('')
      const sessionUser = await loginUser(form)
      onLogin(sessionUser)
      navigate(redirectedFrom, { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cb-page">
      <nav className="cb-navbar">
        <div style={{ fontSize: 32, marginRight: 4 }}>🤖</div>
        <span className="cb-logo-text">Carry<span>bot</span></span>

        <div className="cb-nav-links">
          <button className="cb-nav-btn active">Inicio</button>
          <button className="cb-nav-btn active">¡Conéctate!</button>
          <button className="cb-nav-btn" onClick={() => navigate('/register')}>Registro</button>
        </div>

        <div className="cb-nav-spacer" />

        <button className="cb-nav-session" onClick={() => navigate('/register')}>
          Contáctanos
        </button>
      </nav>

      <button className="cb-back" onClick={() => navigate('/')}>
        ‹ Volver
      </button>

      <div className="cb-auth-wrap">
        <div className="cb-card">
          <div className="cb-card-header">Inicio de sesión</div>

          <form className="cb-card-body" onSubmit={handleSubmit}>
            <div className="cb-alert-info">
              Demo disponible: <strong>demo@carrybot.com</strong> / <strong>Carrybot123</strong>
            </div>

            {error && <div className="cb-alert-error">{error}</div>}

            <input
              className="cb-conn-input"
              type="email"
              placeholder="✉  Correo"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              autoComplete="email"
            />

            <input
              className="cb-conn-input"
              type="password"
              placeholder="🔒  Contraseña"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="cb-btn cb-btn-yellow"
              disabled={loading}
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading ? 'Accediendo...' : 'Accede'}
            </button>

            <div className="cb-auth-switch">
              ¿No tienes cuenta?{' '}
              <span className="cb-auth-link" onClick={() => navigate('/register')}>
                Regístrate
              </span>
            </div>
          </form>
        </div>
      </div>

      <footer className="cb-footer">
        <div>
          <span className="cb-footer-logo">Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div className="cb-footer-icons">
          <span>🐦</span>
          <span>📸</span>
          <span>📘</span>
        </div>
      </footer>
    </div>
  )
}