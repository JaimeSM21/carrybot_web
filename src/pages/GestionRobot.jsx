import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ─── Colores Carrybot (igual que la imagen de referencia) ───────────────────
const C = {
  navy:    "#1a2d5a",
  yellow:  "#f5c518",
  white:   "#ffffff",
  gray:    "#f4f5f7",
  border:  "#dde1ea",
  text:    "#1a2d5a",
  muted:   "#6b7a99",
  success: "#22c55e",
  danger:  "#ef4444",
  cardBg:  "#ffffff",
};

// ─── Roslib helpers (carga dinámica para no depender de npm) ─────────────────
function useRoslib() {
  const [loaded, setLoaded] = useState(!!window.ROSLIB);
  useEffect(() => {
    if (window.ROSLIB) return setLoaded(true);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js";
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, []);
  return loaded;
}

// ─── Estilos globales ────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

  .cb-navbar {
    background: ${C.navy};
    display: flex; align-items: center; gap: 12px;
    padding: 0 28px; height: 64px;
    box-shadow: 0 2px 12px rgba(26,45,90,.18);
  }
  .cb-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: ${C.white}; letter-spacing: -0.5px; }
  .cb-logo-text span { color: ${C.yellow}; }
  .cb-nav-links { display: flex; gap: 4px; margin-left: 20px; }
  .cb-nav-btn {
    background: transparent; border: none; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600;
    color: ${C.white}; padding: 8px 16px; border-radius: 6px;
    text-transform: uppercase; letter-spacing: .5px; transition: background .15s;
  }
  .cb-nav-btn:hover { background: rgba(255,255,255,.12); }
  .cb-nav-btn.active { background: ${C.yellow}; color: ${C.navy}; }
  .cb-nav-spacer { flex: 1; }
  .cb-nav-session {
    background: transparent; border: 1.5px solid rgba(255,255,255,.4);
    border-radius: 6px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600;
    color: ${C.white}; padding: 7px 18px; letter-spacing: .4px;
    text-transform: uppercase; transition: all .15s;
  }
  .cb-nav-session:hover { background: rgba(255,255,255,.1); border-color: ${C.white}; }

  .cb-back {
    display: inline-flex; align-items: center; gap: 6px;
    margin: 16px 28px; color: ${C.navy}; font-size: 14px; font-weight: 600;
    background: ${C.white}; border: 1.5px solid ${C.border};
    border-radius: 6px; padding: 7px 14px; cursor: pointer;
    text-transform: uppercase; letter-spacing: .4px; transition: all .15s;
  }
  .cb-back:hover { background: ${C.navy}; color: ${C.white}; }

  .cb-layout {
    display: grid;
    grid-template-columns: 280px 1fr 200px;
    grid-template-rows: auto auto;
    gap: 16px;
    padding: 0 28px 28px;
    align-items: start;
  }

  .cb-card {
    background: ${C.cardBg}; border: 1.5px solid ${C.border};
    border-radius: 10px; overflow: hidden;
  }
  .cb-card-header {
    background: ${C.navy}; color: ${C.white};
    font-family: 'Barlow', sans-serif; font-weight: 600; font-size: 15px;
    padding: 12px 16px; display: flex; align-items: center; gap: 8px;
  }
  .cb-card-body { padding: 16px; }

  /* Panel izquierdo: opciones de manejo */
  .cb-control-btn {
    width: 100%; display: flex; align-items: center; gap: 10px;
    background: ${C.gray}; border: 1.5px solid ${C.border};
    border-radius: 8px; padding: 11px 14px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600;
    color: ${C.text}; margin-bottom: 8px; transition: all .15s;
    text-align: left;
  }
  .cb-control-btn:last-child { margin-bottom: 0; }
  .cb-control-btn:hover { background: ${C.navy}; color: ${C.white}; border-color: ${C.navy}; }
  .cb-control-btn:hover .cb-icon { filter: brightness(10); }
  .cb-control-btn.active { background: ${C.yellow}; color: ${C.navy}; border-color: ${C.yellow}; }

  /* Cámara */
  .cb-camera-box {
    position: relative; width: 50%; aspect-ratio: 16/9;
    background: #0d1117; border-radius: 8px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .cb-camera-img { width: 100%; height: 100%; object-fit: cover; 
  display: flex; align-items: center; justify-content: center;}
  .cb-camera-overlay {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,.5) 100%);
    
    pointer-events: none;
  }
  .cb-camera-label {
    position: absolute; bottom: 10px; left: 12px;
    background: rgba(26,45,90,.7); color: ${C.white};
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .cb-camera-status {
    position: absolute; top: 10px; right: 10px;
    width: 10px; height: 10px; border-radius: 50%;
    background: ${C.success}; box-shadow: 0 0 6px ${C.success};
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
  .cb-no-camera {
    color: #4a5568; font-size: 13px; text-align: center; padding: 20px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }

  /* Joystick de dirección */
  .cb-dpad {
    display: grid; grid-template-columns: repeat(3, 44px);
    grid-template-rows: repeat(3, 44px); gap: 4px;
    margin: 0 auto; width: fit-content;
  }
  .cb-dpad-btn {
    width: 44px; height: 44px; border-radius: 8px;
    background: ${C.gray}; border: 1.5px solid ${C.border};
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: ${C.navy}; transition: all .1s; user-select: none;
  }
  .cb-dpad-btn:hover { background: ${C.navy}; color: ${C.white}; }
  .cb-dpad-btn:active { transform: scale(.92); }
  .cb-dpad-btn.center { background: ${C.danger}; border-color: ${C.danger}; color: ${C.white}; font-size: 12px; font-weight: 700; }
  .cb-dpad-btn.center:hover { background: #c93333; }
  .cb-dpad-btn.empty { background: transparent; border: none; cursor: default; }

  /* Mapa */
  .cb-map-box {
    width: 100%; aspect-ratio: 1;
    background: #e8ecf0; border-radius: 8px; overflow: hidden;
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .cb-map-img { width: 100%; height: 100%; object-fit: cover; }
  .cb-map-dot {
    position: absolute; width: 12px; height: 12px; border-radius: 50%;
    background: ${C.yellow}; border: 2px solid ${C.navy};
    transform: translate(-50%, -50%);
    box-shadow: 0 0 8px rgba(245,197,24,.6);
    transition: all .3s;
  }
  .cb-map-label {
    position: absolute; bottom: 6px; left: 6px;
    background: rgba(26,45,90,.75); color: ${C.white};
    font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px;
    text-transform: uppercase; letter-spacing: .5px;
  }

  /* Telemetría */
  .cb-telem {
    display: flex; flex-direction: column; gap: 10px;
  }
  .cb-telem-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid ${C.border};
  }
  .cb-telem-row:last-child { border-bottom: none; padding-bottom: 0; }
  .cb-telem-label { color: ${C.muted}; font-weight: 500; }
  .cb-telem-val { color: ${C.text}; font-weight: 700; font-variant-numeric: tabular-nums; }

  /* Conexión rosbridge */
  .cb-conn-row {
    display: flex; gap: 8px; margin-bottom: 12px; align-items: center;
  }
  .cb-conn-input {
    flex: 1; border: 1.5px solid ${C.border}; border-radius: 6px;
    padding: 7px 10px; font-family: 'Barlow', sans-serif; font-size: 13px;
    color: ${C.text}; outline: none;
  }
  .cb-conn-input:focus { border-color: ${C.navy}; }
  .cb-conn-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    background: ${C.danger};
  }
  .cb-conn-dot.on { background: ${C.success}; box-shadow: 0 0 6px ${C.success}; animation: pulse 2s infinite; }
  .cb-btn {
    padding: 8px 14px; border-radius: 6px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600;
    border: none; transition: all .15s; text-transform: uppercase; letter-spacing: .3px;
  }
  .cb-btn-primary { background: ${C.navy}; color: ${C.white}; }
  .cb-btn-primary:hover { background: #243b75; }
  .cb-btn-danger { background: ${C.danger}; color: ${C.white}; }
  .cb-btn-danger:hover { background: #c93333; }
  .cb-btn-yellow { background: ${C.yellow}; color: ${C.navy}; }
  .cb-btn-yellow:hover { background: #e0b310; }

  /* Anuncios */
  .cb-announcement {
    background: #fffbeb; border: 1.5px solid #f5c518;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: ${C.text}; margin-top: 8px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  /* Footer */
  .cb-footer {
    background: ${C.navy}; color: rgba(255,255,255,.7);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px; font-size: 13px; margin-top: 8px;
  }
  .cb-footer-logo { font-family: 'Barlow Condensed',sans-serif; font-weight: 700; font-size: 18px; color: ${C.white}; }
  .cb-footer-logo span { color: ${C.yellow}; }
  .cb-footer-icons { display: flex; gap: 14px; font-size: 18px; }
`;

// ─── Componente principal ────────────────────────────────────────────────────
export default function GestionRobot({ user, onLogout }) {
  const navigate = useNavigate();
  const roslibLoaded = useRoslib();

  const [address, setAddress] = useState("ws://127.0.0.1:9090/");
  const [connected, setConnected] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState(null);
  const [activePanel, setActivePanel] = useState("teleop");
  const [mapDot, setMapDot] = useState({ left: "50%", top: "50%" });

  const rosRef = useRef(null);
  const cmdVelRef = useRef(null);
  const odomRef = useRef(null);
  const announcRef = useRef(null);

  // ── Inyectar estilos ──────────────────────────────────────────────────────
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // ── Conectar / desconectar ────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!roslibLoaded || !window.ROSLIB) return;
    const ros = new window.ROSLIB.Ros({ url: address });
    ros.on("connection", () => {
      setConnected(true);

      // Topic /cmd_vel
      cmdVelRef.current = new window.ROSLIB.Topic({
        ros, name: "/cmd_vel", messageType: "geometry_msgs/msg/Twist",
      });

      // Suscripción a /odom
      odomRef.current = new window.ROSLIB.Topic({
        ros, name: "/odom", messageType: "nav_msgs/msg/Odometry",
      });
      odomRef.current.subscribe((msg) => {
        const x = msg.pose.pose.position.x;
        const y = msg.pose.pose.position.y;
        setPosition({ x, y });
        // Mover punto en el mini-mapa (normalizado aprox -5..15 → 0..100%)
        const px = Math.min(100, Math.max(0, ((x + 5) / 20) * 100));
        const py = Math.min(100, Math.max(0, (1 - (y + 5) / 20) * 100));
        setMapDot({ left: `${px}%`, top: `${py}%` });
      });

      // Suscripción a anuncios de entrega
      announcRef.current = new window.ROSLIB.Topic({
        ros, name: "/delivery/announcement", messageType: "std_msgs/msg/String",
      });
      announcRef.current.subscribe((msg) => {
        setAnnouncement(msg.data);
        setTimeout(() => setAnnouncement(null), 8000);
      });
    });
    ros.on("error", () => setConnected(false));
    ros.on("close", () => setConnected(false));
    rosRef.current = ros;
  }, [roslibLoaded, address]);

  const disconnect = useCallback(() => {
    if (rosRef.current) {
      rosRef.current.close();
      rosRef.current = null;
      cmdVelRef.current = null;
    }
    setConnected(false);
  }, []);


  const publishCommand = useCallback((topicName, value) => {
    if (!rosRef.current) {
        console.warn('No hay conexion ROS activa');
        return;
    }
    const topic = new window.ROSLIB.Topic({
        ros: rosRef.current,
        name: topicName,
        messageType: 'std_msgs/msg/String',
    });
    topic.publish(new window.ROSLIB.Message({ data: value }));
    console.log(`Publicado en ${topicName}: ${value}`);
  }, []);

  // ── Publicar velocidad ────────────────────────────────────────────────────
  const publishVel = useCallback((lx, az) => {
    if (!cmdVelRef.current) return;
    cmdVelRef.current.publish(new window.ROSLIB.Message({
      linear: { x: lx, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: az },
    }));
  }, []);

  const stop = useCallback(() => publishVel(0, 0), [publishVel]);

  // ── Renderizado ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* NAVBAR */}
      <nav className="cb-navbar">
        <div style={{ fontSize: 32, marginRight: 4 }}>🤖</div>
        <span className="cb-logo-text">Carry<span>bot</span></span>
        <div className="cb-nav-links">
          <button className="cb-nav-btn active">Inicio</button>
          <button className="cb-nav-btn">¡Conéctate!</button>
          <button className="cb-nav-btn">Registro</button>
        </div>
        <div className="cb-nav-spacer" />
        <button
          className="cb-nav-session"
          onClick={() => {
            onLogout?.();
            navigate("/login", { replace: true });
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      {/* VOLVER */}
      <button className="cb-back" onClick={() => navigate("/login")}>
        ‹ Volver
      </button>

      {/* LAYOUT PRINCIPAL */}
      <div className="cb-layout">

        {/* ── COLUMNA IZQUIERDA: Opciones de manejo ── */}
        <div>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 12 }}>
            Sesión activa: {user?.name || user?.email || "Operador"}
          </div>
          
          <div className="cb-card">
            <div className="cb-card-header">⚙ Opciones de manejo del robot</div>
            <div className="cb-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <button
                className={`cb-control-btn${activePanel === "teleop" ? " active" : ""}`}
                onClick={() => setActivePanel("teleop")}
              >
                 Control manual
              </button>
              <button
                className={`cb-control-btn${activePanel === "nav" ? " active" : ""}`}
                onClick={() => setActivePanel("nav")}
              >
                 Navegación autónoma
              </button>
              <button
                className={`cb-control-btn${activePanel === "patrol" ? " active" : ""}`}
                onClick={() => setActivePanel("patrol")}
              >
                Patrulla de zona
              </button>
              <button
                className={`cb-control-btn${activePanel === "delivery" ? " active" : ""}`}
                onClick={() => setActivePanel("delivery")}
              >
                 Gestión de entregas
              </button>
              <button
                className={`cb-control-btn${activePanel === "status" ? " active" : ""}`}
                onClick={() => setActivePanel("status")}
              >
                 Estado del robot
              </button>
            </div>
          </div>

          {/* Conexión rosbridge */}
          <div className="cb-card" style={{ marginTop: 12 }}>
            <div className="cb-card-header"> Conexión ROS</div>
            <div className="cb-card-body">
              <div className="cb-conn-row">
                <div className={`cb-conn-dot${connected ? " on" : ""}`} />
                <input
                  className="cb-conn-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ws://127.0.0.1:9090/"
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!connected ? (
                  <button className="cb-btn cb-btn-primary" onClick={connect} style={{ flex: 1 }}>
                    Conectar
                  </button>
                ) : (
                  <button className="cb-btn cb-btn-danger" onClick={disconnect} style={{ flex: 1 }}>
                    Desconectar
                  </button>
                )}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: connected ? C.success : C.danger, fontWeight: 600 }}>
                {connected ? "● Conectado" : "● Sin conexión"}
              </div>
            </div>
          </div>

          {/* Telemetría */}
          <div className="cb-card" style={{ marginTop: 12 }}>
            <div className="cb-card-header">Telemetría</div>
            <div className="cb-card-body">
              <div className="cb-telem">
                <div className="cb-telem-row">
                  <span className="cb-telem-label">Pos X</span>
                  <span className="cb-telem-val">{position.x.toFixed(2)} m</span>
                </div>
                <div className="cb-telem-row">
                  <span className="cb-telem-label">Pos Y</span>
                  <span className="cb-telem-val">{position.y.toFixed(2)} m</span>
                </div>
                <div className="cb-telem-row">
                  <span className="cb-telem-label">Estado</span>
                  <span className="cb-telem-val" style={{ color: connected ? C.success : C.muted }}>
                    {connected ? "Operativo" : "Desconectado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMNA CENTRAL: Cámara ── */}
        <div>
          <div className="cb-card">
            <div className="cb-card-header"> Cámara en vivo</div>
            <div className="cb-card-body">
              <div className="cb-camera-box">
                {connected ? (
                  <>
                    {/* En producción: sustituir src por el stream real del robot */}
                    <img
                      className="cb-camera-img"
                      src="https://picsum.photos/seed/robot/800/450"
                      alt="Camera feed"
                    />
                    <div className="cb-camera-overlay" />
                    <div className="cb-camera-label">CAM — Robot 01</div>
                    <div className="cb-camera-status" />
                  </>
                ) : (
                  <div className="cb-no-camera">
                    <div style={{ fontSize: 40 }}>📵</div>
                    <div>Sin señal de cámara</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Conecta el robot para ver el feed</div>
                  </div>
                )}
              </div>

              {/* Anuncio de entrega */}
              {announcement && (
                <div className="cb-announcement">
                  <span style={{ fontSize: 18 }}>📦</span>
                  <span>{announcement}</span>
                </div>
              )}
            </div>
          </div>

          {/* Panel dinámico según selección */}
          {activePanel === "teleop" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Control manual — Teleop</div>
              <div className="cb-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <p style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>
                  {connected ? "Robot conectado. Usa los controles para moverlo." : "Conéctate primero para controlar el robot."}
                </p>
                <div className="cb-dpad">
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(0.2, 0)} title="Adelante">▲</button>
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(0, 0.5)} title="Girar izquierda">◄</button>
                  <button className="cb-dpad-btn center" onClick={stop} title="Parar">STOP</button>
                  <button className="cb-dpad-btn" onClick={() => publishVel(0, -0.5)} title="Girar derecha">►</button>
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(-0.2, 0)} title="Atrás">▼</button>
                  <div className="cb-dpad-btn empty" />
                </div>
                <p style={{ fontSize: 11, color: C.muted }}>Vel. lineal: 0.2 m/s · Vel. angular: 0.5 rad/s</p>
              </div>
            </div>
          )}

          {activePanel === "nav" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Navegación autónoma</div>
              <div className="cb-card-body">
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                  Envía el robot a un destino predefinido del warehouse.
                </p>
                {["Estanteria1", "Estanteria2", "PuntoDeCarga"].map((dest) => (
                  <button
                    key={dest}
                    className="cb-control-btn"
                    style={{ marginBottom: 8 }}
                    disabled={!connected}
                    onClick={() => publishCommand('/web/nav_goal', dest)}
                  >
                     {dest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "patrol" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Patrulla de zona</div>
              <div className="cb-card-body">
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  El robot recorrerá todos los waypoints de la zona en orden.
                </p>
                {["Zona1", "Zona2"].map((zone) => (
                  <button
                    key={zone}
                    className="cb-control-btn"
                    style={{ marginBottom: 8 }}
                    disabled={!connected}
                    onClick={() => publishCommand('/web/patrol_goal', zone)}
                  >
                     {zone}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "delivery" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Gestión de entregas</div>
              <div className="cb-card-body">
                {/* ── Ruta fija: todos los pedidos ── */}
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  Ruta automática
                </p>
                <button
                  className="cb-control-btn active"
                  style={{ marginBottom: 16, borderColor: "#f5c518", background: "#f5c518", color: "#1a2d5a" }}
                  disabled={!connected}
                  onClick={() => publishCommand('/web/ruta_fija', 'start')}
                >
                   Iniciar ruta fija (todos los pedidos)
                </button>
              </div>
            </div>
          )}

          {activePanel === "status" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Estado del robot</div>
              <div className="cb-card-body">
                <div className="cb-telem">
                  {[
                    ["Modelo", "TurtleBot3 Burger"],
                    ["Batería", connected ? "87%" : "—"],
                    ["Velocidad lineal", connected ? "0.00 m/s" : "—"],
                    ["Velocidad angular", connected ? "0.00 rad/s" : "—"],
                    ["Nav2", connected ? "Activo" : "Inactivo"],
                    ["AMCL", connected ? "Localizado" : "—"],
                  ].map(([label, val]) => (
                    <div className="cb-telem-row" key={label}>
                      <span className="cb-telem-label">{label}</span>
                      <span className="cb-telem-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMNA DERECHA: Mapa ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="cb-card">
            <div className="cb-card-header"> Mapa</div>
            <div className="cb-card-body">
              <div className="cb-map-box">
                <img
                  className="cb-map-img"
                  src="https://picsum.photos/seed/warehousemap/200/200"
                  alt="Mapa del warehouse"
                  style={{ filter: "grayscale(60%) contrast(1.1)" }}
                />
                {connected && (
                  <div
                    className="cb-map-dot"
                    style={{ left: mapDot.left, top: mapDot.top }}
                    title={`x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`}
                  />
                )}
                <div className="cb-map-label">Warehouse</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: C.muted, textAlign: "center" }}>
                {connected ? (
                  <>🟡 Robot en ({position.x.toFixed(1)}, {position.y.toFixed(1)})</>
                ) : (
                  "Sin localización"
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Botón STOP — siempre visible cuando está conectado */}
        {connected && (
          <div style={{ marginTop: 12 }}>
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
              onClick={() => publishCommand('/web/cancel', 'stop')}
            >
              STOP — Cancelar acción
            </button>
          </div>
        )}
      </div>

      

      {/* FOOTER */}
      <footer className="cb-footer">
        <div>
          <span className="cb-footer-logo">Carry<span>bot</span></span>
          <span style={{ marginLeft: 8 }}>© Copyright Carrybot</span>
        </div>
        <div className="cb-footer-icons">
          <span title="Twitter">🐦</span>
          <span title="Instagram">📸</span>
          <span title="Facebook">📘</span>
        </div>
      </footer>
    </div>
  );
}