import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  gray: '#f4f5f7',
  border: '#aab7d4', 
  text: '#1a2d5a',
  access: '#1d70b8', 
  danger: '#ef4444',
  edit: '#94a3b8',
  success: '#22c55e', 
  warning: '#f59e0b', 
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f8fafc; }

  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }

  /* Navbar */
  .cb-navbar { background: ${C.navy}; display: flex; align-items: center; gap: 12px; padding: 0 28px; height: 64px; box-shadow: 0 2px 12px rgba(26,45,90,.18); }
  .cb-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: ${C.white}; letter-spacing: -0.5px; }
  .cb-logo-text span { color: ${C.yellow}; }
  .cb-nav-links { display: flex; gap: 4px; margin-left: 20px; }
  .cb-nav-btn { background: transparent; border: 1px solid transparent; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600; color: ${C.white}; padding: 8px 16px; border-radius: 4px; text-transform: uppercase; transition: all .15s; }
  .cb-nav-btn:hover { border-color: ${C.white}; }
  
  /* Ya no hay clase .active en amarillo por defecto */
  
  .cb-nav-spacer { flex: 1; }
  .cb-nav-logout { background: ${C.yellow}; color: ${C.navy}; border: none; border-radius: 4px; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700; padding: 8px 18px; text-transform: uppercase; transition: all .15s; }

  .cb-back { display: inline-flex; align-items: center; gap: 6px; margin: 20px 28px; color: ${C.white}; font-size: 14px; font-weight: 600; background: #5b8bba; border: 1px solid ${C.navy}; border-radius: 4px; padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all .15s; width: fit-content; }

  .cb-main-wrap { flex: 1; padding: 0 28px 40px; max-width: 1200px; margin: 0 auto; width: 100%; }
  .cb-title { color: ${C.navy}; text-align: center; font-size: 32px; font-weight: 700; margin-bottom: 30px; }

  .cb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
  .cb-card { background: ${C.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
  .cb-card-header { background: ${C.navy}; color: ${C.white}; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .cb-card-header h3 { font-size: 20px; font-weight: 700; }
  .cb-card-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

  .cb-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; width: fit-content; }
  .status-listo { background: #dcfce7; color: ${C.success}; }
  .status-ruta { background: #fef3c7; color: ${C.warning}; }
  .status-off { background: #fee2e2; color: ${C.danger}; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

  .cb-info-row { display: flex; justify-content: space-between; font-size: 15px; color: ${C.text}; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
  .cb-info-label { font-weight: 700; }

  .cb-btn-main { background: ${C.yellow}; color: ${C.navy}; border: none; padding: 12px; border-radius: 6px; font-weight: 700; cursor: pointer; text-transform: uppercase; transition: opacity .15s; margin-top: 10px; }
  .cb-btn-outline { background: transparent; border: 2px solid ${C.navy}; color: ${C.navy}; padding: 10px; border-radius: 6px; font-weight: 700; cursor: pointer; text-transform: uppercase; margin-top: 10px; }

  .cb-footer { background: transparent; color: ${C.navy}; display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; border-top: 1px solid ${C.border}; margin-top: auto; }
`

export default function RobotList() {
  const navigate = useNavigate()

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  const [robots] = useState([
    { id: 1, nombre: 'Carrybot-01', robotId: '123456664', estado: 'LISTO', ubicacion: 'Almacén Central' },
    { id: 2, nombre: 'Carrybot-02', robotId: '543218887', estado: 'EN RUTA', ubicacion: 'Almacén Central' },
    { id: 3, nombre: 'Carrybot-03', robotId: '543218958', estado: 'DESCONECTADO', ubicacion: 'Almacén Central' },
  ])

  return (
    <div className="cb-page">
      <nav className="cb-navbar">
        <div style={{ fontSize: 32, marginRight: 4 }}>🤖</div>
        <span className="cb-logo-text">Carry<span>bot</span></span>
        
        <div className="cb-nav-links">
          <button className="cb-nav-btn" onClick={() => navigate('/')}>Inicio</button>
          <button className="cb-nav-btn" onClick={() => navigate('/robots')}>Robots</button>
          <button className="cb-nav-btn" onClick={() => navigate('/incidencias')}>Incidencias</button>
        </div>

        <div className="cb-nav-spacer" />
        <button className="cb-nav-logout" onClick={() => navigate('/login')}>CERRAR SESIÓN</button>
      </nav>

      <button className="cb-back" onClick={() => navigate(-1)}>‹ VOLVER</button>

      <div className="cb-main-wrap">
        <h1 className="cb-title">Flota de Robots Activos</h1>
        
        <div className="cb-grid">
          {robots.map((robot) => (
            <div key={robot.id} className="cb-card">
              <div className="cb-card-header">
                <h3>{robot.nombre}</h3>
                <div style={{fontSize: 20}}>🤖</div>
              </div>
              
              <div className="cb-card-body">
                <div className={`cb-badge ${
                  robot.estado === 'LISTO' ? 'status-listo' : 
                  robot.estado === 'EN RUTA' ? 'status-ruta' : 'status-off'
                }`}>
                  <div className="dot"></div>
                  {robot.estado}
                </div>

                <div className="cb-info-row">
                  <span className="cb-info-label">ID del Robot:</span>
                  <span>{robot.robotId}</span>
                </div>

                <div className="cb-info-row">
                  <span className="cb-info-label">Última ubicación:</span>
                  <span>{robot.ubicacion}</span>
                </div>

                {robot.estado === 'DESCONECTADO' ? (
                  <button className="cb-btn-outline" onClick={() => alert('Viendo registros...')}>VER REGISTRO</button>
                ) : (
                  <button 
                    className="cb-btn-main"
                    onClick={() => navigate(`/robot/${robot.id}`)}
                  >
                    PANEL DE CONTROL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="cb-footer">
        <div>
          <span className="cb-footer-logo">🤖 Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div className="cb-footer-icons">
          <span>🐦</span> <span>📸</span> <span>📘</span>
        </div>
      </footer>
    </div>
  )
}