import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' // Importamos el nuevo menú

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

// Eliminamos todo lo referente a .cb-navbar y .cb-footer que ya está en index.css
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }

  .cb-back { display: inline-flex; align-items: center; gap: 6px; margin: 20px 28px 8px; color: ${C.navy}; font-size: 14px; font-weight: 700; background: ${C.white}; border: 1.5px solid ${C.border}; border-radius: 10px; padding: 10px 18px; cursor: pointer; text-transform: uppercase; letter-spacing: .4px; transition: all .15s; box-shadow: 0 1px 3px rgba(15, 23, 42, .04); width: fit-content; }
  .cb-back:hover { background: ${C.navy}; color: ${C.white}; }

  .cb-auth-wrap { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 12px 28px 40px; }
  
  .cb-card { width: 100%; max-width: 700px; background: ${C.cardBg}; border: 1.5px solid ${C.border}; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(15, 23, 42, .06); }
  .cb-card-header { background: ${C.navy}; color: ${C.white}; font-family: 'Barlow', sans-serif; font-weight: 700; font-size: 28px; padding: 18px 24px; text-align: center; }
  .cb-card-body { padding: 28px; display: flex; flex-direction: column; gap: 16px; }

  .cb-conn-input { width: 100%; border: 1.5px solid ${C.border}; border-radius: 10px; padding: 15px 18px; font-family: 'Barlow', sans-serif; font-size: 18px; color: ${C.text}; outline: none; background: ${C.white}; }
  .cb-conn-input:focus { border-color: ${C.navy}; box-shadow: 0 0 0 3px rgba(26,45,90,.08); }
  
  select.cb-conn-input { cursor: pointer; appearance: auto; }
  textarea.cb-conn-input { resize: none; min-height: 120px; font-family: 'Barlow', sans-serif; }

  .cb-btn { padding: 14px 18px; border-radius: 10px; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 16px; font-weight: 700; border: none; transition: all .15s; text-transform: uppercase; letter-spacing: .3px; }
  .cb-btn-yellow { background: ${C.yellow}; color: ${C.navy}; }
  .cb-btn-yellow:hover { background: #e0b310; }
`

const initialValues = {
  operario: '',
  robotId: '',
  tipo: 'Navegación',
  descripcion: '',
}

export default function FormularioIncidencias({ onLogout }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialValues)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    
    const incidenciasGuardadas = JSON.parse(localStorage.getItem('carrybot_incidencias')) || []
    const nuevaIncidencia = { 
      ...form, 
      id: crypto.randomUUID(), 
      fecha: new Date().toISOString() 
    }
    
    incidenciasGuardadas.push(nuevaIncidencia)
    localStorage.setItem('carrybot_incidencias', JSON.stringify(incidenciasGuardadas))

    alert('¡Incidencia registrada con éxito en el sistema local!')
    setForm(initialValues) 
  }

  return (
    <div className="cb-page">
      {/* Nuevo Menú Unificado (Variante Trabajador) */}
      <Navbar variant="trabajador" onLogout={onLogout} />

      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ Volver
      </button>

      <div className="cb-auth-wrap">
        <div className="cb-card">
          <div className="cb-card-header">Reportar una Incidencia</div>

          <form className="cb-card-body" onSubmit={handleSubmit}>
            
            <input
              className="cb-conn-input"
              type="text"
              placeholder="👤  Nombre del operario"
              value={form.operario}
              onChange={(e) => updateField('operario', e.target.value)}
              required
            />

            <input
              className="cb-conn-input"
              type="text"
              placeholder="🤖  ID del Robot implicado (ej. Carrybot-01)"
              value={form.robotId}
              onChange={(e) => updateField('robotId', e.target.value)}
              required
            />

            <select 
              className="cb-conn-input" 
              value={form.tipo}
              onChange={(e) => updateField('tipo', e.target.value)}
            >
              <option value="Navegación">🧭 Problema de Navegación / AMCL</option>
              <option value="Hardware">⚙️ Fallo Mecánico / Batería</option>
              <option value="Software">💻 Error de Software / Desconexión web</option>
              <option value="Colisión">💥 Colisión con obstáculo</option>
              <option value="Otro">❓ Otro</option>
            </select>

            <textarea
              className="cb-conn-input"
              placeholder="📝  Descripción detallada de la incidencia..."
              value={form.descripcion}
              onChange={(e) => updateField('descripcion', e.target.value)}
              required
            />

            <button type="submit" className="cb-btn cb-btn-yellow">
              REGISTRAR INCIDENCIA
            </button>

          </form>
        </div>
      </div>

      <footer className="cb-footer">
        <div>
          <span className="cb-footer-logo">Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div className="cb-footer-icons">
          <span>🐦</span> <span>📸</span> <span>📘</span>
        </div>
      </footer>
    </div>
  )
}
