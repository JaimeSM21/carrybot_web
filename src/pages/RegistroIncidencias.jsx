import { useEffect, useState } from 'react'
import { authHeaders } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' 
import logoImg from "../assets/logo.png"

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  border: '#dde1ea',
  text: '#1a2d5a',
  muted: '#6b7a99',
}

const GLOBAL_CSS = `
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }
  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }
  
  /* Se han eliminado .cb-navbar y sus estilos hijos porque ya están en index.css */

  .cb-back { margin: 20px 28px 8px; color: ${C.navy}; font-size: 14px; font-weight: 700; background: white; border: 1.5px solid ${C.border}; border-radius: 10px; padding: 10px 18px; cursor: pointer; text-transform: uppercase; width: fit-content; }
  .cb-main { flex: 1; display: flex; justify-content: center; align-items: flex-start; gap: 45px; padding: 20px 28px 50px; }
  .inc-card { width: 560px; background: white; border: 1.5px solid ${C.border}; border-radius: 8px; overflow: hidden; }
  .inc-header { background: ${C.navy}; color: white; text-align: center; padding: 12px; font-size: 24px; font-weight: 700; }
  .inc-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .inc-table th { color: ${C.navy}; padding: 12px; font-size: 15px; }
  .inc-table td { text-align: center; padding: 10px 12px; font-size: 14px; color: ${C.text}; }
  .inc-table tr { cursor: pointer; }
  .inc-table tr:hover { background: #f4f6fa; }
  .estado-select { border: 1px solid ${C.border}; border-radius: 14px; padding: 4px 8px; color: ${C.navy}; background: white; font-size: 13px; }
  .detail-card { width: 360px; background: white; border: 1.5px solid ${C.border}; border-radius: 8px; overflow: hidden; margin-top: 24px; }
  .detail-header { background: ${C.navy}; color: white; text-align: center; padding: 9px; font-weight: 700; }
  .detail-body { padding: 18px; color: ${C.text}; font-size: 14px; }
  .detail-body p { margin-bottom: 14px; }
  .close-btn { display: block; margin: 10px auto 0; background: ${C.yellow}; color: ${C.navy}; border: none; border-radius: 8px; padding: 8px 30px; font-weight: 700; cursor: pointer; }
  .empty { padding: 30px; text-align: center; color: ${C.muted}; }

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

export default function RegistroIncidencias({ user, onLogout }) {
  const navigate = useNavigate()
  const [incidencias, setIncidencias] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = GLOBAL_CSS
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  useEffect(() => {
    fetch('http://localhost:8000/incidencias/', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setIncidencias(data))
      .catch(err => console.error('Error cargando incidencias:', err))
  }, [])

  const cambiarEstado = (id, nuevoEstado) => {
    setIncidencias(actuales =>
      actuales.map(inc =>
        inc.id === id ? { ...inc, estado: nuevoEstado } : inc
      )
    )

    fetch(`http://localhost:8000/incidencias/${id}/estado`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
  }

  return (
    <div className="cb-page">
      {/* MENÚ ADMINISTRADOR UNIFICADO */}
      <Navbar variant="admin" user={user} onLogout={onLogout} />

      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ Volver
      </button>

      <main className="cb-main">
        <section className="inc-card">
          <div className="inc-header">Registro de incidencias</div>

          {incidencias.length === 0 ? (
            <div className="empty">No hay incidencias registradas.</div>
          ) : (
            <table className="inc-table">
              <thead>
                <tr>
                  <th>Id_robot</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((inc) => (
                  <tr key={inc.id} onClick={() => setSeleccionada(inc)}>
                    <td>{inc.robot_codigo || inc.id_robot}</td>
                    <td>{inc.asunto}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="estado-select"
                        value={inc.estado}
                        onChange={(e) => cambiarEstado(inc.id, e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Resuelta">Resuelta</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {seleccionada && (
          <aside className="detail-card">
            <div className="detail-header">
              ID_robot: {seleccionada.robot_codigo || seleccionada.id_robot}
            </div>

            <div className="detail-body">
              <p><strong>Asunto:</strong> {seleccionada.asunto}</p>
              <p><strong>Mensaje:</strong></p>
              <p>{seleccionada.cuerpo}</p>

              <button className="close-btn" onClick={() => setSeleccionada(null)}>
                CERRAR
              </button>
            </div>
          </aside>
        )}
      </main>

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
