import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Componente compartido [cite: 104]

export default function UserManagement() {
  // Datos de ejemplo basados en tu imagen
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Endika Matute', correo: 'endika@gmail.com' },
    { id: 2, nombre: 'Sandra Moll', correo: 'sandra@gmail.com' },
    { id: 3, nombre: 'Rocio Piquer', correo: 'rocio@gmail.com' },
    { id: 4, nombre: '——', correo: '——' },
  ]);

  return (
    <>
      <Navbar /> {/* Barra de navegación superior [cite: 107] */}
      
      <div style={{ padding: '20px', backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
        {/* Botón Volver con estilo primario [cite: 122] */}
        <button className="cb-btn--primary" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '5px' }}>❮</span> VOLVER
        </button>

        {/* Tarjeta contenedora [cite: 122] */}
        <div className="cb-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="cb-card-body">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a2d5a', color: '#1a2d5a', backgroundColor: '#e9effb' }}>
                  <th style={{ padding: '12px' }}>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                    <td style={{ padding: '15px' }}>{user.id || index + 1}</td>
                    <td>{user.nombre}</td>
                    <td>{user.correo}</td>
                    <td style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px' }}>
                      {/* Botón Editar (Gris azulado) */}
                      <button className="cb-btn--primary" style={{ backgroundColor: '#8ea3b3', border: 'none' }}>EDITAR</button>
                      {/* Botón Eliminar (Rojo/Danger) [cite: 120, 122] */}
                      <button className="cb-btn-danger">ELIMINAR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón Añadir Usuario (Amarillo/Yellow) [cite: 120, 122] */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="cb-btn-yellow" style={{ fontWeight: 'bold', padding: '10px 40px' }}>
            AÑADIR USUARIO
          </button>
        </div>
      </div>
    </>
  );
}
