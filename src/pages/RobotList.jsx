import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  gray: '#f4f5f7',
  border: '#aab7d4', 
  text: '#1a2d5a',
  access: '#1d70b8', // Azul del botón de acceso
  danger: '#ef4444',
  edit: '#94a3b8', 
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
  .cb-nav-btn.active { background: ${C.yellow}; color: ${C.navy}; border-color: ${C.yellow}; }
  
  .cb-nav-spacer { flex: 1; }
  
  .cb-nav-logout { background: ${C.yellow}; color: ${C.navy}; border: none; border-radius: 4px; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700; padding: 8px 18px; text-transform: uppercase; transition: all .15s; }
  .cb-nav-logout:hover { background: #e0b310; }

  /* Main & Volver */
  .cb-back { display: inline-flex; align-items: center; gap: 6px; margin: 20px 28px; color: ${C.white}; font-size: 14px; font-weight: 600; background: #5b8bba; border: 1px solid ${C.navy}; border-radius: 4px; padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all .15s; width: fit-content; }
  .cb-back:hover { background: ${C.navy}; }

  .cb-main-wrap { flex: 1; padding: 0 28px 40px; max-width: 1000px; margin: 0 auto; width: 100%; }

  /* Tabla de robots */
  .cb-table-container { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 2px; margin-bottom: 30px; overflow-x: auto; }
  .cb-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 16px; }
  .cb-table th { padding: 16px 20px; color: ${C.navy}; font-weight: 700; border-bottom: 1px solid ${C.border}; background: #f4f6fa; }
  .cb-table td { padding: 14px 20px; border-bottom: 1px solid ${C.border}; color: ${C.text}; font-weight: 500; vertical-align: middle; }
  .cb-table tr:last-child td { border-bottom: none; }

  /* Botones de acción */
  .cb-action-cell { display: flex; gap: 10px; align-items: center; }
  .cb-btn-access { background: ${C.access}; color: ${C.white}; border: 1px solid #155e91; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 13px; transition: background .15s; }
  .cb-btn-access:hover { background: #155e91; }
  .cb-btn-edit { background: ${C.edit}; color: ${C.white}; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; text-transform: uppercase; font-size: 13px; }
  .cb-btn-delete { background: ${C.danger}; color: ${C.white}; border: 1px solid #b91c1c; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; text-transform: uppercase; font-size: 13px; }

  /* Footer */
  .cb-footer { background: transparent; color: ${C.navy}; display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; font-size: 14px; margin-top: auto; border-top: 1px solid ${C.border}; }
  .cb-footer-logo { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; color: ${C.navy}; }
  .cb-footer-logo span { color: ${C.yellow}; }
  .cb-footer-icons { display: flex; gap: 14px; font-size: 20px; color: ${C.navy}; }
`

export default function RobotList() {
  const navigate = useNavigate()

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  // Datos simulados idénticos a tu imagen
  const [robots, setRobots] = useState([
    { id: 1, nombre: 'Robot_1', robotId: '123456664' },
    { id: 2, nombre: 'Robot 2', robotId: '543218887' },
    { id: 3, nombre: 'Robot 3', robotId: '543218958' },
  ])

  const handleCerrarSesion = () => {
    if (onLogout) onLogout(); // Esto borra el usuario de la memoria (App.jsx)
    navigate('/login');       // Esto te echa al login
  }

  return (
    <div className="cb-page">
      <nav className="cb-navbar">
        <div style={{ fontSize: 32, marginRight: 4 }}>🤖</div>
        <span className="cb-logo-text">Carry<span>bot</span></span>

        <div className="cb-nav-links">
          <button className="cb-nav-btn active">Inicio</button>
          <button className="cb-nav-btn">¡Conéctate!</button>
          <button className="cb-nav-btn">Registro</button>
        </div>

        <div className="cb-nav-spacer" />
        
        <button className="cb-nav-logout" onClick={handleCerrarSesion}>
          CERRAR SESIÓN
        </button>
      </nav>

      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ VOLVER
      </button>

      <div className="cb-main-wrap">
        <div className="cb-table-container">
          <table className="cb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>ID del Robot</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {robots.map((robot, index) => (
                <tr key={robot.id}>
                  {/* Replicamos el símbolo '^' de tu foto para los items siguientes */}
                  <td>{index === 0 ? robot.id : '^'}</td>
                  <td>{robot.nombre}</td>
                  <td>{robot.robotId}</td>
                  <td className="cb-action-cell">
                    {/* El botón de acceso que redirige al control del robot */}
                    <button 
                      className="cb-btn-access" 
                      onClick={() => navigate(`/robot/${robot.id}`)}
                    >
                      Acceso al Robot
                    </button>
                    <button className="cb-btn-edit">EDITAR</button>
                    <button 
                      className="cb-btn-delete" 
                      onClick={() => alert('¿Seguro que quieres eliminar este robot?')}
                    >
                      ELIMINAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="cb-footer">
        <div>
          <span className="cb-footer-logo">🤖 Carry<span>bot</span></span>
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