import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 1. Constantes de color corporativas (Punto 7 del manual)
const C = {
  navy: '#1a2d5a',     // 
  yellow: '#f5c518',   // 
  white: '#ffffff',    // 
  gray: '#f4f5f7',     // 
  border: '#aab7d4', 
  text: '#1a2d5a',
  danger: '#ef4444',   // 
  edit: '#94a3b8', 
}

// 2. Estilos Globales inyectados (Siguiendo tu ejemplo de RobotList)
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f8fafc; }

  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }

  /* Navbar corporativo [cite: 101] */
  .cb-navbar { background: ${C.navy}; display: flex; align-items: center; gap: 12px; padding: 0 28px; height: 64px; box-shadow: 0 2px 12px rgba(26,45,90,.18); }
  .cb-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: ${C.white}; letter-spacing: -0.5px; }
  .cb-logo-text span { color: ${C.yellow}; }
  
  .cb-nav-spacer { flex: 1; }
  .cb-nav-logout { background: ${C.yellow}; color: ${C.navy}; border: none; border-radius: 4px; cursor: pointer; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700; padding: 8px 18px; text-transform: uppercase; transition: all .15s; }

  /* Botón Volver */
  .cb-back { display: inline-flex; align-items: center; gap: 6px; margin: 20px 28px; color: ${C.white}; font-size: 14px; font-weight: 600; background: #5b8bba; border: 1px solid ${C.navy}; border-radius: 4px; padding: 8px 16px; cursor: pointer; text-transform: uppercase; width: fit-content; }

  .cb-main-wrap { flex: 1; padding: 0 28px 40px; max-width: 1000px; margin: 0 auto; width: 100%; text-align: center; }

  /* Tabla de usuarios (cb-card [cite: 122]) */
  .cb-table-container { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 2px; margin-bottom: 30px; overflow-x: auto; }
  .cb-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 16px; }
  .cb-table th { padding: 16px 20px; color: ${C.navy}; font-weight: 700; border-bottom: 1px solid ${C.border}; background: #f4f6fa; }
  .cb-table td { padding: 14px 20px; border-bottom: 1px solid ${C.border}; color: ${C.text}; font-weight: 500; }

  /* Botones */
  .cb-btn-edit { background: ${C.edit}; color: ${C.white}; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; text-transform: uppercase; font-size: 13px; }
  .cb-btn-delete { background: ${C.danger}; color: ${C.white}; border: 1px solid #b91c1c; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; text-transform: uppercase; font-size: 13px; }
  .cb-btn-add { background: ${C.yellow}; color: ${C.navy}; border: 1px solid ${C.navy}; padding: 12px 30px; border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 15px; margin-top: 10px; }

  /* Footer */
  .cb-footer { background: transparent; color: ${C.navy}; display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; font-size: 14px; margin-top: auto; border-top: 1px solid ${C.border}; }
`

export default function UserManagement({ onLogout }) {
  const navigate = useNavigate() // [cite: 53, 54]

  // Inyección de CSS al montar el componente
  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  // 3. Lógica: Estado de usuarios (idéntico a tu imagen de Endika Matute)
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Endika Matute', correo: 'endika@gmail.com' },
    { id: 2, nombre: 'Sandra Moll', correo: 'sandra@gmail.com' },
    { id: 3, nombre: 'Rocio Piquer', correo: 'rocio@gmail.com' },
    { id: 4, nombre: '——', correo: '——' },
  ])

  // Función para cerrar sesión de forma segura
  const handleCerrarSesion = () => {
    if (onLogout) onLogout(); 
    navigate('/login'); 
  }

  // Función para eliminar usuario localmente
  const handleEliminar = (id) => {
    if (window.confirm("¿Deseas eliminar a este usuario?")) {
      setUsuarios(usuarios.filter(u => u.id !== id))
    }
  }

  return (
    <div className="cb-page">
      {/* Navbar compartida [cite: 102] */}
      <nav className="cb-navbar">
        <div style={{ fontSize: 32, marginRight: 4 }}>🤖</div>
        <span className="cb-logo-text">Carry<span>bot</span></span>
        <div className="cb-nav-spacer" />
        <button className="cb-nav-logout" onClick={handleCerrarSesion}>
          CERRAR SESIÓN
        </button>
      </nav>

      {/* Botón Volver */}
      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ VOLVER
      </button>

      <div className="cb-main-wrap">
        {/* Contenedor de Tabla */}
        <div className="cb-table-container">
          <table className="cb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user, index) => (
                <tr key={index}>
                  <td>{index === 0 ? user.id : '^'}</td>
                  <td>{user.nombre}</td>
                  <td>{user.correo}</td>
                  <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="cb-btn-edit">EDITAR</button>
                    <button 
                      className="cb-btn-delete"
                      onClick={() => handleEliminar(user.id)}
                    >
                      ELIMINAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón de Acción Principal */}
        <button 
            className="cb-btn-add"
            onClick={() => alert('Abriendo formulario de nuevo usuario...')}
        >
          AÑADIR USUARIO
        </button>
      </div>

      {/* Footer [cite: 100] */}
      <footer className="cb-footer">
        <div>
          <span style={{ fontWeight: 700 }}>🤖 Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '20px' }}>
          <span>🐦</span> <span>📸</span> <span>📘</span>
        </div>
      </footer>
    </div>
  )
}
