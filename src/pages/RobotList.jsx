import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' // Importación del menú unificado

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

  /* Se han eliminado los estilos antiguos de .cb-navbar, .cb-logo, .cb-nav-links, etc. */

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

export default function RobotList({ user, onLogout }) {
  const navigate = useNavigate()
  const [robots, setRobots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    
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

  return (
    <div className="cb-page">
      {/* MENÚ TRABAJADOR UNIFICADO */}
      <Navbar variant="trabajador" user={user} onLogout={onLogout} />

      {/* MODAL DE ADVERTENCIA */}
      {showPopup && (
        <div className="cb-overlay" style={{position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex: 1000, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={() => setShowPopup(false)}>
          <div className="cb-modal" style={{background:'white', padding:'40px', borderRadius:'15px', maxWidth:'500px', textAlign:'center'}} onClick={e => e.stopPropagation()}>
            <h2 className="cb-modal-title" style={{color: C.navy, marginBottom: '20px'}}>⚠️Unidad Fuera de Servicio⚠️</h2>
            <p className="cb-modal-desc" style={{marginBottom: '30px', lineHeight: '1.6'}}>
              Este robot no está disponible actualmente. Verifique la conexión manual en el almacén o consulte el registro de incidencias.
            </p>
            <button className="cb-btn-main" onClick={() => setShowPopup(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

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

      <footer className="cb-footer">
        <div className="cb-footer-content">
          <div style={{ fontSize: '20px', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: 8 }}>🤖</div>
            <span>Carrybot</span>
          </div>
          <span style={{ marginLeft: '15px', color: '#8892b0' }}>© Copyright Carrybot</span>
        </div>
      </footer>
    </div>
  )
}
