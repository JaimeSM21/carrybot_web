import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CSS = `
.alertas-page {
  min-height: 100vh;
  background: #eef1f7;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.alertas-header {
  height: 70px;
  background: #1c3263;
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 45px;
}

.alertas-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 28px;
  font-weight: 800;
}

.alertas-logo-icon {
  font-size: 42px;
}

.alertas-nav {
  display: flex;
  gap: 38px;
}

.alertas-nav button {
  background: none;
  border: none;
  color: white;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
}

.alertas-spacer {
  flex: 1;
}

.alertas-btn-active {
  background: #f5c518;
  color: #1c3263;
  border: none;
  border-radius: 13px;
  padding: 13px 35px;
  font-weight: 800;
  font-size: 17px;
}

.alertas-logout {
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 13px;
  padding: 12px 18px;
  font-weight: 800;
  font-size: 17px;
  cursor: pointer;
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
  color: #666;
  font-weight: 800;
  padding: 12px 20px;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
}

.alertas-report {
  background: #1c3263;
  color: white;
  border: none;
  border-radius: 13px;
  padding: 13px 22px;
  font-weight: 800;
  font-size: 17px;
  cursor: pointer;
}

.alertas-card {
  max-width: 1200px;
  min-height: 430px;
  margin: 0 auto;
  background: white;
  border: 1px solid #d7dbe5;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.alertas-title {
  background: #1c3263;
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
  font-size: 20px;
  color: #333;
  padding-bottom: 22px;
}

.alertas-table td {
  padding: 9px 0;
  color: #333;
  font-weight: 700;
  font-size: 16px;
}

.alertas-table th:last-child,
.alertas-table td:last-child {
  text-align: center;
}

.alertas-select {
  border: 1px solid #aaa;
  border-radius: 18px;
  padding: 5px 14px;
  background: white;
  font-size: 16px;
}

.alertas-footer {
  height: 82px;
  background: #1c3263;
  display: flex;
  align-items: center;
  padding: 0 30px;
  color: white;
}

.alertas-footer-logo {
  display: flex;
  align-items: center;
  gap: 13px;
}

.alertas-footer-title {
  font-size: 26px;
  font-weight: 800;
}

.alertas-footer-copy {
  color: rgba(255,255,255,0.65);
  font-size: 16px;
}
`

const datosPrueba = [
  {
    id: 1,
    fecha: '15 febrero 2025',
    hora: '13:56',
    robot_codigo: '15895596',
    trabajador: 'Sandra Moll',
    descripcion: 'Robot no encuentra zona 1',
    estado: 'Pendiente',
  },
  {
    id: 2,
    fecha: '15 febrero 2025',
    hora: '10:15',
    robot_codigo: '84848515',
    trabajador: 'Rocio Piquer',
    descripcion: 'Robot se ha saltado paquete',
    estado: 'Pendiente',
  },
  {
    id: 3,
    fecha: '14 febrero 2025',
    hora: '18:36',
    robot_codigo: '15895596',
    trabajador: 'Sandra Moll',
    descripcion: 'Robot atascado',
    estado: 'Resuelta',
  },
]

export default function RegistroAlertas({ onLogout }) {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = CSS
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    fetch('http://localhost:8000/alertas/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAlertas(data)
        } else {
          setAlertas(datosPrueba)
        }
      })
      .catch(() => setAlertas(datosPrueba))
  }, [])

  const cambiarEstado = (id, nuevoEstado) => {
    setAlertas(actuales =>
      actuales.map(alerta =>
        alerta.id === id ? { ...alerta, estado: nuevoEstado } : alerta
      )
    )

    fetch(`http://localhost:8000/alertas/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    }).catch(() => {})
  }

  return (
    <div className="alertas-page">
      <header className="alertas-header">
        <div className="alertas-logo">
          <span className="alertas-logo-icon">🤖</span>
          <span>Carrybot</span>
        </div>

        <nav className="alertas-nav">
          <button onClick={() => navigate('/home')}>INICIO</button>
          <button>INVENTARIO</button>
          <button onClick={() => navigate('/incidencias')}>INCIDENCIAS</button>
        </nav>

        <div className="alertas-spacer" />

        <button className="alertas-btn-active">ALERTAS</button>

        <button className="alertas-logout" onClick={onLogout}>
          CERRAR SESIÓN
        </button>
      </header>

      <main className="alertas-main">
        <div className="alertas-top">
          <button className="alertas-back" onClick={() => navigate(-1)}>
            &lt; VOLVER
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
                  <th>Trabajador</th>
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
                    <td>{alerta.trabajador}</td>
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

      <footer className="alertas-footer">
        <div className="alertas-footer-logo">
          <span className="alertas-logo-icon">🤖</span>
          <div>
            <div className="alertas-footer-title">Carrybot</div>
            <div className="alertas-footer-copy">© Copyright Carrybot</div>
          </div>
        </div>
      </footer>
    </div>
  )
}