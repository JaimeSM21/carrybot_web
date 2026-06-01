import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' 
import logoImg from "../assets/logo.png"

// Paleta de colores y tokens de diseño corporativos
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
  .cb-footer {
    background: #1a2d5a; /* Tu azul corporativo */
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 40px;
    margin-top: auto; /* Truco para que el footer se quede siempre abajo */
  }

  .cb-footer-brand {
    display: flex;
    align-items: center;
    gap: 10px; /* Espacio entre el robot y el texto */
  }

  .cb-footer-logo-img {
    height: 30px; /* Tamaño ideal para el pie de página */
    width: auto;
    object-fit: contain;
    display: block;
  }

  .cb-footer-logo-text {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: white;
  }

  .cb-footer-logo-text span {
    color: #f5c518; /* El color amarillo corporativo para "bot" */
  }

  .cb-footer-copy {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8); /* Blanco suave para el copyright */
  }
`

// EXPORTACIÓN POR DEFECTO RESTAURADA: Soluciona el error SyntaxError de Vite
export default function FormularioIncidencias({ onLogout }) {
  const navigate = useNavigate()
  const [listaRobots, setListaRobots] = useState([])

  // Buscador inteligente de sesión de usuario activa
  const obtenerNombreOperario = () => {
    try {
      const storages = [window.localStorage, window.sessionStorage]
      for (const storage of storages) {
        if (!storage) continue
        const keys = ['carrybot_session', 'user', 'usuario', 'session', 'login', 'userData']
        for (const key of keys) {
          const raw = storage.getItem(key)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && typeof parsed === 'object') {
                const nombre = parsed.nombre || parsed.username || parsed.email || parsed.user || parsed.name
                if (nombre) return String(nombre)
              }
            } catch {
              if (raw.length < 50 && !raw.includes('eyJ') && !raw.includes('.')) {
                return raw
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error leyendo operario:", e)
    }
    return 'Operario Desconocido'
  }

  // Obtiene el ID numérico del trabajador para evitar errores de clave ajena
  const obtenerIdTrabajador = () => {
    try {
      const storages = [window.localStorage, window.sessionStorage]
      for (const storage of storages) {
        if (!storage) continue
        const keys = ['carrybot_session', 'user', 'usuario', 'session', 'login', 'userData']
        for (const key of keys) {
          const raw = storage.getItem(key)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && parsed.id) {
                return parseInt(parsed.id)
              }
            } catch { /* ignorar */ }
          }
        }
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          const raw = storage.getItem(key)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && parsed.id) return parseInt(parsed.id)
            } catch { /* ignorar */ }
          }
        }
      }
    } catch (e) {
      console.error("Error obteniendo ID de trabajador:", e)
    }
    return null
  }

  const [form, setForm] = useState({
    operario: obtenerNombreOperario(),
    robotId: '',
    tipo: 'Navegación',
    descripcion: '',
  })

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)

    const idTrabajador = obtenerIdTrabajador();

    console.log("🔍 --- DIAGNÓSTICO DE SESIÓN CARRYBOT ---")
    console.log("👤 Nombre leído:", obtenerNombreOperario())
    console.log("🆔 ID de Trabajador leído:", obtenerIdTrabajador())
    console.log("-----------------------------------------")

    // CONEXIÓN AL NUEVO ENDPOINT FILTRADO:
    // Si tenemos el ID del trabajador, llamamos a la ruta relacional que acabas de modificar.
    // Si no lo tenemos, usamos el listado completo como fallback de seguridad.
    const fetchUrl = idTrabajador 
      ? `http://localhost:8000/incidencias/robots-asignados/${idTrabajador}`
      : 'http://localhost:8000/robots/';

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener la flota de robots")
        return res.json()
      })
      .then((data) => setListaRobots(data))
      .catch((err) => {
        console.error("Error cargando los robots asignados de XAMPP, usando fallback de simulación:", err)
        setListaRobots([
          { id: 1, codigo: 'CB-01', modelo: 'Turtlebot Burger (Simulado)' },
          { id: 2, codigo: 'CB-02', modelo: 'Carrybot Real' }
        ])
      })

    return () => document.head.removeChild(styleEl)
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const idTrabajador = obtenerIdTrabajador()

    
    const payload = {
      robot_id: form.robotId ? parseInt(form.robotId) : null,
      descripcion: form.descripcion,
      gravedad: form.tipo === 'Colisión' || form.tipo === 'Hardware' ? 'alta' : 'media',
      operario: form.operario,

      id_trabajador: idTrabajador && !isNaN(idTrabajador) ? idTrabajador : 1,
      id_robot: form.robotId ? parseInt(form.robotId) : null,
      asunto: `Fallo [${form.tipo.toUpperCase()}]`,
      cuerpo: form.descripcion
    }

    fetch('http://localhost:8000/incidencias/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          let mensajeError = `Error en servidor (Código ${res.status})`;
          
          if (errorData && errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              mensajeError = "Campos incompatibles entre Web y Backend (Error 422):\n" + 
                errorData.detail.map(err => {
                  const campo = err.loc ? err.loc.slice(1).join('.') : 'campo';
                  return `- Campo "${campo}": ${err.msg}`;
                }).join('\n');
            } else if (typeof errorData.detail === 'string') {
              mensajeError = errorData.detail;
            } else {
              mensajeError = JSON.stringify(errorData.detail);
            }
          }
          throw new Error(mensajeError);
        }
        return res.json()
      })
      .then((data) => {
        if (data.ok) {
          alert('¡Incidencia registrada correctamente!')
          setForm({
            ...form,
            robotId: '',
            tipo: 'Navegación',
            descripcion: '',
          })
        }
      })
      .catch((err) => {
        console.error("Fallo al enviar:", err)
        alert(`❌ Error al guardar la incidencia:\n${err.message}`)
      })
  }

  return (
    <div className="cb-page">
      
      <Navbar variant="trabajador" onLogout={onLogout} />

      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ Volver
      </button>

      <div className="cb-auth-wrap">
        <div className="cb-card">
          <div className="cb-card-header">Reportar una Incidencia</div>

          <form className="cb-card-body" onSubmit={handleSubmit}>
            
            <label className="form-label-incidencia">👤 Operario Identificado</label>
            <input
              className="cb-conn-input"
              type="text"
              value={form.operario}
              readOnly
              required
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}
            />

            <label className="form-label-incidencia">🤖 Seleccionar Robot Implicado</label>
            <select
              className="cb-conn-input"
              value={form.robotId}
              onChange={(e) => updateField('robotId', e.target.value)}
              required
            >
              <option value="">-- Elige un robot de la flota --</option>
              {listaRobots.map((robot) => (
                <option key={robot.id} value={robot.id}>
                  {robot.codigo || `CB-0${robot.id}`} [{robot.modelo || 'Carrybot'}]
                </option>
              ))}
            </select>

            <label className="form-label-incidencia">🧭 Tipo de Incidencia</label>
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

            <label className="form-label-incidencia">📝 Detalles de la avería</label>
            <textarea
              className="cb-conn-input"
              placeholder="Describa con precisión qué error muestra el terminal de ROS2 o qué comportamiento físico extraño ha tenido el Carrybot..."
              value={form.descripcion}
              onChange={(e) => updateField('descripcion', e.target.value)}
              required
            />

            <button type="submit" className="cb-btn cb-btn-yellow" style={{ marginTop: '10px' }}>
              REGISTRAR INCIDENCIA
            </button>

          </form>
        </div>
      </div>

      <footer className="cb-footer">
	  <div className="cb-footer-brand">
	    <img 
	      src={logoImg} 
	      alt="Logo" 
	      className="cb-footer-logo-img" 
	    />
	    <span className="cb-footer-logo-text">Carry<span>bot</span></span>
	  </div>
	  <div className="cb-footer-copy">
	    © Copyright Carrybot
	  </div>
	</footer>
    </div>
  )
}