import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500;600&display=swap');

.lp-root * { box-sizing: border-box; margin: 0; padding: 0; }
.lp-root {
  font-family: 'Barlow', sans-serif;
  background: #f7f8fc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* NAV */
.lp-nav {
  background: #1a2d5a;
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(26,45,90,.25);
}
.lp-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.lp-logo-icon {
  width: 44px;
  height: 44px;
  background: #f5c518;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.lp-logo-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.lp-logo-text span { color: #f5c518; }
.lp-nav-links {
  display: flex;
  gap: 4px;
  margin-left: 24px;
}
.lp-nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.8);
  padding: 8px 16px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: .6px;
  transition: all .15s;
}
.lp-nav-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
.lp-nav-btn.active { background: #f5c518; color: #1a2d5a; }
.lp-nav-spacer { flex: 1; }
.lp-nav-contact {
  background: transparent;
  border: 1.5px solid rgba(255,255,255,.35);
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  padding: 8px 18px;
  text-transform: uppercase;
  letter-spacing: .6px;
  transition: all .15s;
}
.lp-nav-contact:hover { background: rgba(255,255,255,.1); border-color: #fff; }

/* HERO */
.lp-hero {
  background: #fff;
  padding: 72px 40px 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  border-bottom: 1px solid #e8eaf0;
}
.lp-hero-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 56px;
  font-weight: 800;
  color: #1a2d5a;
  line-height: 1.05;
  letter-spacing: -1px;
  margin-bottom: 24px;
}
.lp-hero-title span { color: #f5c518; }
.lp-hero-desc {
  background: #f0f4ff;
  border: 1.5px dashed #b0bde0;
  border-radius: 12px;
  padding: 28px 32px;
  font-size: 15px;
  color: #4a5778;
  line-height: 1.7;
}
.lp-hero-desc p { margin: 0; }
.lp-hero-cta {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}
.lp-btn-primary {
  background: #f5c518;
  color: #1a2d5a;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-family: 'Barlow', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: .6px;
  transition: all .15s;
}
.lp-btn-primary:hover { background: #e0b310; transform: translateY(-1px); }
.lp-btn-secondary {
  background: transparent;
  color: #1a2d5a;
  border: 2px solid #1a2d5a;
  border-radius: 8px;
  padding: 14px 28px;
  font-family: 'Barlow', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: .6px;
  transition: all .15s;
}
.lp-btn-secondary:hover { background: #1a2d5a; color: #fff; }

/* VIDEO BOX */
.lp-video-box {
  background: #fffbeb;
  border: 2.5px dashed #f5c518;
  border-radius: 16px;
  aspect-ratio: 16/10;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  overflow: hidden;
}
.lp-video-box:hover { border-color: #1a2d5a; background: #f0f4ff; }
.lp-video-play {
  width: 64px;
  height: 64px;
  background: #f5c518;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 4px 16px rgba(245,197,24,.4);
}
.lp-video-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a2d5a;
  text-transform: uppercase;
  letter-spacing: .5px;
}
.lp-robot-img {
  position: absolute;
  bottom: -8px;
  right: 16px;
  font-size: 80px;
  opacity: .9;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* ABOUT SECTION */
.lp-about {
  padding: 64px 40px;
  background: #fff;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 48px;
  align-items: center;
  border-top: 4px solid #f5c518;
}
.lp-about-img-box {
  background: #f0f4ff;
  border: 2px solid #d0d8f0;
  border-radius: 16px;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 90px;
  position: relative;
  overflow: hidden;
}
.lp-about-img-box::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #1a2d5a;
}
.lp-about-content {}
.lp-about-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #1a2d5a;
  line-height: 1.1;
  margin-bottom: 20px;
}
.lp-about-title span { color: #f5c518; }
.lp-about-desc {
  background: #f7f8fc;
  border: 1.5px dashed #b0bde0;
  border-radius: 12px;
  padding: 24px 28px;
  font-size: 15px;
  color: #4a5778;
  line-height: 1.7;
  margin-bottom: 28px;
}

/* FEATURES */
.lp-features {
  padding: 64px 40px;
  background: #f7f8fc;
}
.lp-features-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1a2d5a;
  text-align: center;
  margin-bottom: 40px;
}
.lp-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.lp-feature-card {
  background: #fff;
  border: 1.5px solid #e0e5f0;
  border-radius: 12px;
  padding: 28px 24px;
  text-align: center;
  transition: all .2s;
}
.lp-feature-card:hover {
  border-color: #f5c518;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(26,45,90,.08);
}
.lp-feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #1a2d5a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
}
.lp-feature-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a2d5a;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: .3px;
}
.lp-feature-desc {
  font-size: 13px;
  color: #6b7a99;
  line-height: 1.6;
}

/* FOOTER */
.lp-footer {
  background: #1a2d5a;
  color: rgba(255,255,255,.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  margin-top: auto;
}
.lp-footer-logo {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #fff;
}
.lp-footer-logo span { color: #f5c518; }
.lp-footer-copy { font-size: 13px; }
.lp-footer-icons { display: flex; gap: 16px; font-size: 20px; cursor: pointer; }

/* ANIMATIONS */
.lp-fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .6s ease, transform .6s ease;
}
.lp-fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const sectionsRef = useRef([]);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Animacion de entrada al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".lp-fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">

      {/* NAVBAR */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-icon">🤖</div>
          <span className="lp-logo-text">Carry<span>bot</span></span>
        </div>
        <div className="lp-nav-links">
          <button className="lp-nav-btn active">Inicio</button>
          <button className="lp-nav-btn" onClick={() => navigate("/login")}>
            ¡Conéctate!
          </button>
          <button className="lp-nav-btn" onClick={() => navigate("/register")}>
            Registro
          </button>
        </div>
        <div className="lp-nav-spacer" />
        <button className="lp-nav-contact" onClick={() => navigate("/contacto")}>Contáctanos</button>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-fade-in">
          <h1 className="lp-hero-title">
            Automatiza tus entregas<br />con <span>Carrybot</span>
          </h1>
          <div className="lp-hero-desc">
            <p>
              Carrybot es un sistema de transporte autónomo para almacenes.
              Nuestros robots navegan de forma inteligente por el warehouse,
              recogen paquetes y los entregan en el punto de carga sin
              intervención humana, aumentando la eficiencia y reduciendo errores.
            </p>
          </div>
          <div className="lp-hero-cta">
            <button className="lp-btn-primary" onClick={() => navigate("/login")}>
              ¡Conéctate!
            </button>
            <button className="lp-btn-secondary" onClick={() => navigate("/register")}>
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="lp-fade-in" style={{ animationDelay: ".15s" }}>
          <div className="lp-video-box">
            
            <video src="/videos/demo.mp4" autoPlay muted loop />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="lp-about">
        <div className="lp-about-img-box lp-fade-in">
          <img src="/img/robot.jpg" alt="Carrybot robot" />
        </div>
        <div className="lp-about-content lp-fade-in">
          <h2 className="lp-about-title">
            ¿En qué consiste y qué ofrece <span>Carrybot</span>?
          </h2>
          <div className="lp-about-desc">
            <p>
              Carrybot integra un robot TurtleBot3 con un sistema de navegación
              autónoma basado en ROS2 y Nav2. A través de nuestra interfaz web
              puedes monitorizar el robot en tiempo real, enviarle órdenes de
              entrega, controlar su movimiento y gestionar múltiples robots
              desde cualquier dispositivo conectado a la red.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features">
        <h2 className="lp-features-title lp-fade-in">
          Funcionalidades del sistema
        </h2>
        <div className="lp-features-grid">
          {[
            { icon: "🗺", name: "Navegación autónoma", desc: "El robot planifica rutas óptimas y evita obstáculos en tiempo real usando Nav2 y AMCL." },
            { icon: "📦", name: "Gestión de entregas", desc: "Recoge paquetes de las estanterías y los transporta automáticamente al punto de carga." },
            { icon: "🔄", name: "Patrulla de zonas", desc: "Recorre zonas completas del almacén siguiendo una secuencia de waypoints predefinidos." },
            { icon: "📷", name: "Cámara en vivo", desc: "Visualiza el feed de cámara del robot en tiempo real desde cualquier navegador." },
            { icon: "📡", name: "Telemetría en tiempo real", desc: "Monitoriza la posición, velocidad y estado del robot en el mapa del warehouse." },
            { icon: "🕹", name: "Control manual", desc: "Toma el control del robot manualmente con el joystick integrado en la interfaz web." },
          ].map((f, i) => (
            <div
              key={f.name}
              className="lp-feature-card lp-fade-in"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-name">{f.name}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div>
          <div className="lp-footer-logo">Carry<span>bot</span></div>
          <div className="lp-footer-copy">© Copyright Carrybot</div>
        </div>
        <div className="lp-footer-icons">
          <span title="Twitter">🐦</span>
          <span title="Instagram">📸</span>
          <span title="Facebook">📘</span>
        </div>
      </footer>

    </div>
  );
}