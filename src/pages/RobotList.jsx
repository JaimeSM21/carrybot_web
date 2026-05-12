import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  navy: '#1a2d5a',     // Azul marino
  yellow: '#f5c518',   // Amarillo logo
  white: '#ffffff',
  bg: '#f4f7fa',       // Fondo claro
  text: '#1a2d5a',
  danger: '#ff4d4d',
  success: '#28a745', 
  warning: '#f39c12',
  blue: '#1d70b8',     // Azul botón cerrar sesión
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: ${C.bg}; color: ${C.text}; }

  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }

  /* Navbar superior */
  .cb-navbar { background: ${C.navy}; display: flex; align-items: center; padding: 0 40px; height: 70px; }
  .cb-logo { display: flex; align-items: center; gap: 12px; color: white; font-weight: 700; font-size: 24px; text-decoration: none; cursor: pointer; }
  .cb-logo span { color: ${C.yellow}; }
  
  .cb-logo-img { height: 45px; width: auto; object-fit: contain; }

  .cb-nav-links { display: flex; gap: 10px; margin-left: 40px; }
  .cb-nav-item { background: transparent; border: 1px solid white; color: white; padding: 8px 18px; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .cb-nav-item:hover { background: rgba(255,255,255,0.1); }
  .cb-nav-item.active { background: ${C.yellow}; color: ${C.navy}; }

  .cb-nav-right { margin-left: auto; display: flex; align-items: center; gap: 15px; }
  
  .cb-alert-btn { background: transparent; border: 1px solid white; color: white; padding: 8px 18px; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .cb-alert-btn:hover { background: rgba(255, 255, 255, 0.1); }

  .cb-logout-btn { background: ${C.blue}; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 13px; cursor: pointer; transition: background 0.2s; }
  .cb-logout-btn:hover { background: #155a96; }

  .cb-main { flex: 1; padding: 60px 40px; max-width: 1300px; margin: 0 auto; width: 100%; }
  .cb-title { text-align: center; font-size: 30px; font-weight: 700; color: #2c3e50; margin-bottom: 50px; }

  .cb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
  .cb-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
  
  .cb-card-header { background: ${C.navy}; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
  .cb-card-header h3 { font-size: 18px; font-weight: 600; }

  .cb-card-body { padding: 25px; display: flex; flex-direction: column; gap: 18px; }

  .cb-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 11px; width: fit-content; display: flex; align-items: center; gap: 6px; }
  .status-listo { background: #e6ffec; color: ${C.success}; }
  .status-ruta { background: #fff9e6; color: ${C.warning}; }
  .status-off { background: #ffe6e6; color: ${C.danger}; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

  .cb-info-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .cb-info-label { font-weight: 600; color: #333; }

  .cb-btn-main { background: ${C.yellow}; color: ${C.navy}; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; width: 100%; transition: transform 0.1s; }
  .cb-btn-main:active { transform: scale(0.98); }
  .cb-btn-outline { background: white; border: 2px solid ${C.navy}; color: ${C.navy}; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; width: 100%; }

  .cb-footer { background: ${C.navy}; padding: 30px 40px; margin-top: 50px; }
  .cb-footer-content { display: flex; align-items: center; gap: 15px; color: #8892b0; font-size: 14px; }
  .cb-footer-logo-img { height: 35px; width: auto; opacity: 0.7; }
`

export default function RobotList() {
  const navigate = useNavigate()
  const [robots, setRobots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    
    // Conexión con el backend de FastAPI
    fetch('http://localhost:8000/robots/')
      .then(res => res.json())
      .then(data => {
        setRobots(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error al conectar con el servidor:", err)
        setLoading(false)
      })

    return () => document.head.removeChild(styleEl)
  }, [])

  const handleNav = (path) => navigate(path)

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    navigate('/login')
    setTimeout(() => { window.location.href = '/login' }, 100)
  }

  return (
    <div className="cb-page">
      {/* MODAL DE ADVERTENCIA */}
      {showPopup && (
        <div className="cb-overlay" onClick={() => setShowPopup(false)}>
          <div className="cb-modal" onClick={e => e.stopPropagation()}>
            <h2 className="cb-modal-title">⚠️Unidad Fuera de Servicio⚠️</h2>
            <p className="cb-modal-desc">
              Este robot no está disponible actualmente. Verifique la conexión manual en el almacén o consulte el registro de incidencias.
            </p>
            <button className="cb-modal-btn" onClick={() => setShowPopup(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN */}
      <nav className="cb-navbar">
        <div className="cb-logo" onClick={() => handleNav('/')}>
          <div style={{ fontSize: 32, marginRight: 8 }}>🤖</div>
          <span>Carry<span>bot</span></span>
        </div>
        <div className="cb-nav-links">
          <button className="cb-nav-item active" onClick={() => handleNav('/')}>INICIO</button>
          <button className="cb-nav-item" onClick={() => handleNav('/inventario')}>INVENTARIO</button>
          <button className="cb-nav-item" onClick={() => handleNav('/contacto')}>INCIDENCIAS</button>
        </div>
        <div className="cb-nav-right">
          <button className="cb-alert-btn" onClick={() => handleNav('/alertas')}>ALERTAS</button>
          <button className="cb-logout-btn" onClick={handleLogout}>CERRAR SESIÓN</button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="cb-main">
        <h1 className="cb-title">Flota de Robots Activos</h1>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: C.navy }}>Estableciendo conexión con la flota...</p>
        ) : (
          <div className="cb-grid">
            {robots.map((robot) => (
              <div key={robot.id} className="cb-card">
                <div className="cb-card-header">
                  <h3>{robot.codigo || `Carrybot-${robot.id.toString().padStart(2, '0')}`}</h3>
                  <span style={{fontSize: '20px'}}>🤖</span>
                </div>
                
                <div className="cb-card-body">
                  {/* Etiqueta de estado dinámico */}
                  <div className={`cb-badge ${
                    robot.estado === 'activo' ? 'status-listo' : 
                    robot.estado === 'en_tarea' ? 'status-ruta' : 'status-off'
                  }`}>
                    <div className="dot"></div>
                    {robot.estado === 'activo' ? 'LISTO' : 
                     robot.estado === 'en_tarea' ? 'EN RUTA' : 'OFF'}
                  </div>

                  <div className="cb-info-row">
                    <span className="cb-info-label">ID del Robot:</span>
                    <span>{robot.id_etiqueta || robot.id}</span> 
                  </div>

                  <div className="cb-info-row">
                    <span className="cb-info-label">Última ubicación:</span>
                    <span>{robot.ubicacion || 'Almacén Central'}</span>
                  </div>

                  {/* Lógica de botones según disponibilidad */}
                  {['activo', 'en_tarea'].includes(robot.estado) ? (
                    <button className="cb-btn-main" onClick={() => handleNav(`/robot/${robot.id}`)}>
                      PANEL DE CONTROL
                    </button>
                  ) : (
                    <button className="cb-btn-outline" onClick={() => setShowPopup(true)}>
                      REVISAR ESTADO
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PIE DE PÁGINA */}
      <footer className="cb-footer">
        <div className="cb-footer-content">
          <div className="cb-logo" style={{ fontSize: '20px', cursor: 'default' }}>
            <div style={{ marginRight: 8 }}>🤖</div>
            <span>Carry<span>bot</span></span>
          </div>
          <span>© Copyright Carrybot</span>
        </div>
      </footer>
    </div>
  )
}