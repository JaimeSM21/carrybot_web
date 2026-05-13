import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar' // Importación del nuevo menú

const C = {
  navy: '#1a2d5a',
  yellow: '#f5c518',
  white: '#ffffff',
  border: '#dde1ea',
  overlay: 'rgba(26, 45, 90, 0.7)',
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

  /* Se eliminan estilos manuales de .cb-navbar, .cb-logo, .cb-nav-btn y .cb-btn-outline */

  .cb-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
  
  .cb-card {
    width: 100%; max-width: 1000px; background: white; 
    border-radius: 14px; border: 1.5px solid ${C.border}; overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  }
  .cb-card-header { background: ${C.navy}; color: white; padding: 18px; text-align: center; font-weight: 700; font-size: 22px; }

  .cb-table { width: 100%; border-collapse: collapse; }
  .cb-table th { padding: 15px; text-align: left; background: #f8fafc; color: ${C.navy}; border-bottom: 2px solid ${C.border}; }
  .cb-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }

  .status-pill { padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
  .status-almacenado { background: #dcfce7; color: #166534; }
  .status-transito { background: #fef9c3; color: #854d0e; }

  .btn-add-prod { 
    background: ${C.yellow}; color: ${C.navy}; border: none; 
    padding: 14px 40px; border-radius: 10px; font-weight: 700; 
    margin-top: 30px; cursor: pointer; font-size: 16px;
  }

  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ${C.overlay}; display: flex; justify-content: center; align-items: center; z-index: 2000; }
  .modal-box { width: 400px; background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
  .modal-body { padding: 25px; display: flex; flex-direction: column; gap: 15px; }
  .cb-input { width: 100%; padding: 12px; border: 1.5px solid ${C.border}; border-radius: 8px; outline: none; font-family: 'Barlow', sans-serif; }

  .cb-footer {
    background: ${C.navy}; color: white; padding: 15px 28px; 
    display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-top: auto;
  }
`

export default function Inventario({ onLogout }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [form, setForm] = useState({ 
    codigo_barras: '', 
    descripcion: '', 
    peso_kg: '', 
    id_estanteria: '',
    sector_visual: '' 
  });

  const fetchInventario = () => {
    fetch('http://localhost:8000/inventario/')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Error cargando inventario:", err));
  };

  useEffect(() => {
    fetchInventario();
    const styleEl = document.createElement('style');
    styleEl.textContent = GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/inventario/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setShowAdd(false);
        setForm({ codigo_barras: '', descripcion: '', peso_kg: '', id_estanteria: '', sector_visual: '' });
        fetchInventario();
      } else {
        alert("Hubo un error al guardar en la base de datos.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* MENÚ TRABAJADOR UNIFICADO */}
      <Navbar variant="trabajador" onLogout={onLogout} />

      <div className="cb-container">
        <div className="cb-card">
          <div className="cb-card-header">Control de Inventario</div>
          <table className="cb-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Estantería</th>
                <th>Código Barras</th>
                <th>Peso</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.sector || 'Sin sector'}</td>
                  <td>{item.estanteria || 'Sin asignar'}</td>
                  <td style={{fontWeight: 700}}>{item.codigo_barras}</td>
                  <td>{item.peso_kg} kg</td>
                  <td>{item.descripcion}</td>
                  <td>
                    <span className={`status-pill ${item.estado === 'almacenado' ? 'status-almacenado' : 'status-transito'}`}>
                      {item.estado === 'almacenado' ? 'En estantería' : 'En tránsito'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-add-prod" onClick={() => setShowAdd(true)}>AÑADIR PRODUCTO</button>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="cb-card-header">Nuevo Producto</div>
            <form className="modal-body" onSubmit={handleAdd}>
              <input className="cb-input" placeholder="Sector (Ej: Zona 1)" onChange={e => setForm({...form, sector_visual: e.target.value})} />
              <input className="cb-input" placeholder="ID Estantería (Número)" required onChange={e => setForm({...form, id_estanteria: e.target.value})} />
              <input className="cb-input" placeholder="Código de barras" required onChange={e => setForm({...form, codigo_barras: e.target.value})} />
              <input className="cb-input" placeholder="Descripción" required onChange={e => setForm({...form, descripcion: e.target.value})} />
              <input className="cb-input" type="number" step="0.01" placeholder="Peso (kg)" required onChange={e => setForm({...form, peso_kg: e.target.value})} />
              
              <button className="btn-add-prod" style={{marginTop: 10}}>GUARDAR</button>
              <button type="button" className="cb-nav-btn" style={{color: C.navy, fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer'}} onClick={() => setShowAdd(false)}>CANCELAR</button>
            </form>
          </div>
        </div>
      )}

      <footer className="cb-footer">
        <div><span style={{fontWeight: 700}}>Carry<span>bot</span></span> © Copyright Carrybot</div>
        <div style={{display: 'flex', gap: '10px'}}><span>🐦</span><span>📸</span><span>📘</span></div>
      </footer>
    </div>
  );
}
