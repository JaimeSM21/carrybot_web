import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' 
import logoImg from "../assets/logo.png"

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  gray: '#f4f5f7',
  border: '#dde1ea',
  text: '#1a2d5a',
  success: '#22c55e',
  danger: '#ef4444',
  overlay: 'rgba(26, 45, 90, 0.7)', 
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

  .cb-page { min-height: 100vh; display: flex; flex-direction: column; }

  .cb-main-content { 
    flex: 1; display: flex; flex-direction: column; 
    align-items: center; padding: 40px 28px; 
  }

  .cb-card {
    width: 100%; max-width: 1050px;
    background: ${C.white}; border: 1.5px solid ${C.border};
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 8px 30px rgba(15, 23, 42, .06);
  }

  .cb-card-header {
    background: ${C.navy}; color: ${C.white};
    font-family: 'Barlow', sans-serif; font-weight: 700;
    font-size: 24px; padding: 18px 24px; text-align: center;
    text-transform: uppercase;
  }

  /* Tabla */
  .cb-table { width: 100%; border-collapse: collapse; }
  .cb-table th { padding: 18px; text-align: left; color: ${C.navy}; border-bottom: 2px solid ${C.gray}; font-weight: 700; }
  .cb-table td { padding: 14px 18px; border-bottom: 1px solid ${C.border}; font-size: 15px; color: ${C.text}; }

  /* Botones */
  .btn-action { border: none; padding: 6px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 12px; }
  .btn-edit { background: ${C.success}; color: white; margin-right: 8px; }
  .btn-delete { background: ${C.danger}; color: white; }
  
  .cb-btn-add { 
    background: ${C.yellow}; color: ${C.navy}; 
    border: none; padding: 14px 40px; border-radius: 10px; 
    font-weight: 700; cursor: pointer; text-transform: uppercase; 
    margin-top: 30px; font-size: 16px; transition: all .15s;
  }
  .cb-btn-add:hover { background: #e0b310; }

  .modal-overlay { 
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: ${C.overlay}; display: flex; 
    justify-content: center; align-items: center; z-index: 1000; 
  }
  .modal-box { 
    width: 100%; max-width: 480px; background: white; 
    border-radius: 14px; overflow: hidden; border: 1.5px solid ${C.border};
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  }
  .modal-body { padding: 28px; display: flex; flex-direction: column; gap: 15px; }
  
  .cb-input { 
    width: 100%; border: 1.5px solid ${C.border}; 
    border-radius: 10px; padding: 12px 15px; font-size: 16px; outline: none;
    font-family: 'Barlow', sans-serif;
  }
  .cb-input:focus { border-color: ${C.navy}; box-shadow: 0 0 0 3px rgba(26,45,90,.08); }

  /* Contenedor de Checkboxes de Robots */
  .cb-robots-selection-title { font-size: 14px; font-weight: 700; color: ${C.navy}; margin-top: 5px; }
  .cb-robots-checkbox-list {
    display: flex; flex-direction: column; gap: 8px; 
    max-height: 120px; overflow-y: auto;
    border: 1.5px solid ${C.border}; border-radius: 10px; padding: 10px;
  }
  .cb-robot-option { display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; }
  .cb-robot-option input { width: 18px; height: 18px; cursor: pointer; }

  .cb-robot-tag {
    background: #eef2f6; border: 1px solid ${C.border};
    padding: 3px 8px; border-radius: 6px; font-size: 12px;
    font-weight: 600; color: ${C.navy}; display: inline-flex;
    align-items: center; gap: 4px; margin-right: 4px; margin-bottom: 4px;
  }
  .cb-robot-none { color: ${C.muted}; font-style: italic; font-size: 13px; }

  /* Footer */
  .cb-footer {
    background: #1a2d5a; color: #ffffff; display: flex;
    align-items: center; justify-content: space-between; padding: 15px 40px; margin-top: auto;
  }
  .cb-footer-brand { display: flex; align-items: center; gap: 10px; }
  .cb-footer-logo-img { height: 30px; width: auto; object-fit: contain; display: block; }
  .cb-footer-logo-text { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; color: white; }
  .cb-footer-logo-text span { color: #f5c518; }
  .cb-footer-copy { font-size: 13px; color: rgba(255, 255, 255, 0.8); }
`

export default function UserManagement({ user, onLogout }) {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [robotsDisponibles, setRobotsDisponibles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [robotsSeleccionados, setRobotsSeleccionados] = useState([]);

  const cargarUsuarios = () => {
    fetch('http://localhost:8000/usuarios/')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => console.error("Error cargando usuarios"));
  };

  const cargarRobots = () => {
    fetch('http://localhost:8000/robots/')
      .then(res => res.json())
      .then(data => setRobotsDisponibles(data))
      .catch(() => console.warn("No se pudieron cargar los robots"));
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRobots();
    
    const styleEl = document.createElement('style');
    styleEl.textContent = GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleRobotToggle = (robotId) => {
    if (robotsSeleccionados.includes(robotId)) {
      setRobotsSeleccionados(robotsSeleccionados.filter(id => id !== robotId));
    } else {
      setRobotsSeleccionados([...robotsSeleccionados, robotId]);
    }
  };

 const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Enviamos todo junto, incluyendo el array id_robots que espera tu nuevo Python
      const res = await fetch('http://localhost:8000/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          id_robots: robotsSeleccionados
        })
      });
      
      if (res.ok) {
        console.log("Trabajador registrado y robots vinculados con éxito.");
      }
    } catch (error) {
      console.error("Error en la petición de registro:", error);
    } finally {
      // Forzamos el cierre del modal y la recarga de la tabla pase lo que pase
      setShowAdd(false);
      setFormData({ nombre: '', email: '', password: '' });
      setRobotsSeleccionados([]);
      cargarUsuarios(); // ¡Esto hará que aparezca en la lista al instante!
    }
  };

  const handleUpdate = async () => {
    // Tu usuarios.py recibe 'id_robots' dentro del body del PUT y actualiza la tabla intermedia sola
    await fetch(`http://localhost:8000/usuarios/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        id_robots: robotsSeleccionados 
      })
    });
    setShowEdit(false);
    setRobotsSeleccionados([]);
    cargarUsuarios();
  };

  const handleDelete = async (user) => {
    await fetch(`http://localhost:8000/usuarios/${user.id}`, { method: 'DELETE' });
    setSelectedUser(user);
    setShowDeleteSuccess(true);
    cargarUsuarios();
  };

  return (
    <div className="cb-page">
      <Navbar variant="admin" user={user} onLogout={onLogout} />

      <div className="cb-main-content">
        <div className="cb-card">
          <div className="cb-card-header">Gestión de Usuarios</div>
          <table className="cb-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>E-mail</th>
                <th>Fecha alta</th>
                <th>Robots Asignados</th>
                <th style={{textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.fecha_alta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td>
                    {u.robots && u.robots.length > 0 ? (
                      u.robots.map(rId => (
                        <span key={rId} className="cb-robot-tag">🤖 ID: {rId}</span>
                      ))
                    ) : (
                      <span className="cb-robot-none">Ninguno asignado</span>
                    )}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <button className="btn-action btn-edit" onClick={() => {
                      setSelectedUser(u);
                      setFormData({ nombre: u.nombre, email: u.email, password: '' });
                      setRobotsSeleccionados(u.robots || []);
                      setShowEdit(true);
                    }}>Editar</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="cb-btn-add" onClick={() => {
          setFormData({ nombre: '', email: '', password: '' });
          setRobotsSeleccionados([]);
          setShowAdd(true);
        }}>Añadir Usuario</button>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header">Nuevo Usuario</div>
            <form className="modal-body" onSubmit={handleAdd}>
              <input className="cb-input" placeholder="Nombre completo" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input className="cb-input" type="email" placeholder="Correo electrónico" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="cb-input" type="password" placeholder="Contraseña" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <div className="cb-robots-selection-title">Asignar Flota de Robots:</div>
              <div className="cb-robots-checkbox-list">
                {robotsDisponibles.map(r => (
                  <label key={r.id} className="cb-robot-option">
                    <input 
                      type="checkbox" 
                      checked={robotsSeleccionados.includes(r.id)}
                      onChange={() => handleRobotToggle(r.id)}
                    />
                    <span>🤖 {r.modelo || 'TurtleBot'} (ID: {r.id})</span>
                  </label>
                ))}
              </div>

              <button className="cb-btn-add" style={{marginTop: 10}}>Registrar Trabajador</button>
              <button type="button" className="btn-action" style={{marginTop: 10, background: '#eee', color: '#333'}} onClick={() => setShowAdd(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header">Editar Datos y Flota</div>
            <div className="modal-body">
              <input className="cb-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input className="cb-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="cb-input" type="password" placeholder="Nueva contraseña (opcional)" onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <div className="cb-robots-selection-title">Modificar Robots Asignados:</div>
              <div className="cb-robots-checkbox-list">
                {robotsDisponibles.map(r => (
                  <label key={r.id} className="cb-robot-option">
                    <input 
                      type="checkbox" 
                      checked={robotsSeleccionados.includes(r.id)}
                      onChange={() => handleRobotToggle(r.id)}
                    />
                    <span>🤖 {r.modelo || 'TurtleBot'} (ID: {r.id})</span>
                  </label>
                ))}
              </div>

              <button className="cb-btn-add" style={{marginTop: 10}} onClick={handleUpdate}>Guardar Cambios</button>
              <button className="btn-action" style={{marginTop: 10, background: '#eee', color: '#333', width: '100%'}} onClick={() => setShowEdit(false)}>Volver</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header" style={{background: C.danger}}>Usuario Eliminado</div>
            <div className="modal-body" style={{textAlign: 'center'}}>
              <p>El usuario <strong>{selectedUser?.nombre}</strong> ha sido borrado con éxito.</p>
              <button className="cb-btn-add" onClick={() => setShowDeleteSuccess(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      <footer className="cb-footer">
        <div className="cb-footer-brand">
          <img src={logoImg} alt="Logo" className="cb-footer-logo-img" />
          <span className="cb-footer-logo-text">Carry<span>bot</span></span>
        </div>
        <div className="cb-footer-copy">© Copyright Carrybot</div>
      </footer>
    </div>
  )
}
