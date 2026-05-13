import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
export default function Navbar({ variant, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  
  const getBtnClass = (path) => 
    location.pathname === path ? "cb-nav-btn active" : "cb-nav-btn";

  return (
    <nav className="cb-navbar">
      {/* LOGO: Siempre lleva a la Landing */}
      <div className="cb-logo-section" onClick={() => navigate('/')}>
        <img src={logoImg} alt="Logo" className="cb-nav-logo-img" />
        <span className="cb-logo-text">Carry<span>bot</span></span>
      </div>

      <div className="cb-nav-left">
        {/* MENÚ TRABAJADOR */}
        {variant === 'trabajador' && (
          <>
            <button className={getBtnClass('/home')} onClick={() => navigate('/home')}>Inicio</button>
            <button className={getBtnClass('/inventario')} onClick={() => navigate('/inventario')}>Inventario</button>
            {/* El trabajador va a la página de reportar incidencia */}
            <button className={getBtnClass('/contacto')} onClick={() => navigate('/contacto')}>Incidencias</button>
          </>
        )}

        {/* MENÚ ADMIN */}
        {variant === 'admin' && (
          <>
            <button className={getBtnClass('/admin/users')} onClick={() => navigate('/admin/users')}>Usuarios</button>
            {/* El admin va a la página de ver todas las incidencias */}
            <button className={getBtnClass('/registro-incidencias')} onClick={() => navigate('/registro-incidencias')}>Incidencias</button>
          </>
        )}
      </div>

      <div className="cb-nav-spacer" />

      <div className="cb-nav-right">
        {variant === 'publico' ? (
          <>
            <button className={getBtnClass('/login')} onClick={() => navigate('/login')}>Iniciar Sesión</button>
            <button className={getBtnClass('/register')} onClick={() => navigate('/register')}>Registrarse</button>
          </>
        ) : (
          <>
            {variant === 'trabajador' && (
              <button className={getBtnClass('/alertas')} onClick={() => navigate('/alertas')}>Alertas</button>
            )}
            <button className="cb-nav-session" onClick={onLogout}>Cerrar Sesión</button>
          </>
        )}
      </div>
    </nav>
  );
}
