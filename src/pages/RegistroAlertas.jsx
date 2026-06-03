import { useEffect, useState } from 'react'
import { authHeaders } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import logoImg from "../assets/logo.png"

const CSS = `
.alertas-page {
  min-height: 100vh;
  background: #eef1f7;
  display: flex;
  flex-direction: column;
  font-family: 'Barlow', sans-serif;
}

.alertas-main {
  flex: 1;
  padding: 18px 26px;
}

.alertas-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.alertas-back {
  background: white;
  border: 1px solid #ddd;
  color: #1a2d5a;
  font-weight: 800;
  padding: 12px 20px;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  text-transform: uppercase;
}

.alertas-report {
  background: #1a2d5a;
  color: white;
  border: none;
  border-radius: 13px;
  padding: 13px 22px;
  font-weight: 800;
  font-size: 17px;
  cursor: pointer;
  text-transform: uppercase;
}

.alertas-card {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border: 1px solid #d7dbe5;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.alertas-title {
  background: #1a2d5a;
  color: white;
  text-align: center;
  font-weight: 800;
  font-size: 30px;
  padding: 18px;
}

.alertas-content {
  padding: 28px 42px;
}

.alertas-table {
  width: 100%;
  border-collapse: collapse;
}

.alertas-table th {
  text-align: left;
  font-size: 18px;
  color: #1a2d5a;
  padding-bottom: 22px;
}

.alertas-table td {
  padding: 12px 0;
  color: #333;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 1px solid #eee;
}

.alertas-select {
  border: 1.5px solid #aaa;
  border-radius: 8px;
  padding: 5px 14px;
  background: white;
  font-size: 16px;
  font-weight: 700;
}

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

export default function RegistroAlertas({ user, onLogout }) {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = CSS
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    
    fetch(`http://localhost:8000/alertas/usuario/${user.id}`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setAlertas(data))
      .catch(console.error)
    
  }, [user])

  const recargarAlertas = () => {
    if (!user?.id) return
    fetch(`http://localhost:8000/alertas/usuario/${user.id}`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setAlertas(data))
      .catch(console.error)
  }

  const cambiarEstado = (id, nuevoEstado) => {
    // Actualización optimista en el frontend
    setAlertas(actuales =>
      actuales.map(alerta =>
        alerta.id === id ? { ...alerta, estado: nuevoEstado } : alerta
      )
    )
    fetch(`http://localhost:8000/alertas/${id}/estado`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
      .then(res => {
        if (res.ok) {
          recargarAlertas() // Sincronizar con la BBDD tras el PUT
        } else {
          recargarAlertas() // Revertir si hubo error
        }
      })
      .catch(() => recargarAlertas())
  }

  return (
    <div className="alertas-page">
      {/* IMPORTANTE: Verifica que en App.jsx estés pasando onLogout={handleLogout}.
        Si no se lo pasas en App.jsx, el botón no hará nada.
      */}
      <Navbar variant="trabajador" user={user} onLogout={onLogout} />

      <main className="alertas-main">
        <div className="alertas-top">
          <button className="alertas-back" onClick={() => navigate(-1)}>
            ‹ VOLVER
          </button>

          <button className="alertas-report" onClick={() => navigate('/contacto')}>
            INFORMAR INCIDENCIA
          </button>
        </div>

        <section className="alertas-card">
          <div className="alertas-title">Registro de alertas</div>

          <div className="alertas-content">
            <table className="alertas-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Id_robot</th>
                  <th>Descripcion</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {alertas.map(alerta => (
                  <tr key={alerta.id}>
                    <td>{alerta.fecha}</td>
                    <td>{alerta.hora}</td>
                    <td>{alerta.robot_codigo || alerta.id_robot}</td>
                    <td>{alerta.descripcion}</td>
                    <td>
                      <select
                        className="alertas-select"
                        value={alerta.estado}
                        onChange={e => cambiarEstado(alerta.id, e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Atendida">Atendida</option>
                        <option value="Resuelta">Resuelta</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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