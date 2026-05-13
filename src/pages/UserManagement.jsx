import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' // Importación del menú unificado

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

  /* Se han eliminado las clases antiguas de .cb-navbar, .cb-logo-text y .cb-nav-btn */

  .cb-main-content { 
    flex: 1; display: flex; flex-direction: column; 
    align-items: center; padding: 40px 28px; 
  }

  .cb-card {
    width: 100%; max-width: 900px;
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
    width: 100%; max-width: 450px; background: white; 
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

  /* Footer */
  .cb-footer {
    background: ${C.navy}; color: rgba(255,255,255,.7);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px; font-size: 13px; margin-top: auto;
  }
  .cb-footer-logo { 
    font-family: 'Barlow Condensed', sans-serif; 
    font-weight: 700; font-size: 18px; color: ${C.white}; 
  }
  .cb-footer-logo span { color: ${C.yellow}; }
  .cb-footer-icons { display: flex; gap: 14px; font-size: 18px; }
`

export default function UserManagement({ user, onLogout }) {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });

  const cargarUsuarios = () => {
    fetch('http://localhost:8000/usuarios/')
      .then(res => res.json())
      .then(data => setUsuarios(data));
  };

  useEffect(() => {
    cargarUsuarios();
    const styleEl = document.createElement('style');
    styleEl.textContent = GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAdd(false);
      setFormData({ nombre: '', email: '', password: '' });
      cargarUsuarios();
    }
  };

  const handleUpdate = async () => {
    await fetch(`http://localhost:8000/usuarios/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowEdit(false);
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
      {/* MENÚ ADMINISTRADOR UNIFICADO */}
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
                <th style={{textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.fecha_alta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td style={{textAlign: 'center'}}>
                    <button className="btn-action btn-edit" onClick={() => {
                      setSelectedUser(u);
                      setFormData({ nombre: u.nombre, email: u.email, password: '' });
                      setShowEdit(true);
                    }}>Editar</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="cb-btn-add" onClick={() => setShowAdd(true)}>Añadir Usuario</button>
      </div>

      {/* POPUPS (Añadir, Editar, Borrar) - Se mantienen intactos */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header">Nuevo Usuario</div>
            <form className="modal-body" onSubmit={handleAdd}>
              <input className="cb-input" placeholder="Nombre completo" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input className="cb-input" type="email" placeholder="Correo electrónico" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="cb-input" type="password" placeholder="Contraseña" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button className="cb-btn-add" style={{marginTop: 10}}>Registrar Trabajador</button>
              <button type="button" className="btn-action" style={{marginTop: 10, background: '#eee', color: '#333'}} onClick={() => setShowAdd(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header">Editar Datos</div>
            <div className="modal-body">
              <input className="cb-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input className="cb-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="cb-input" type="password" placeholder="Nueva contraseña (opcional)" onChange={e => setFormData({...formData, password: e.target.value})} />
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
        <div>
          <span className="cb-footer-logo">Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div className="cb-footer-icons">
          <span>🐦</span> <span>📸</span> <span>📘</span>
        </div>
      </footer>
    </div>
  )
}
