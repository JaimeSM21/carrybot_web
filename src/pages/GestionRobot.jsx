import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { draw_occupancy_grid } from '../js/draw_occupancy_grid.js';
import Navbar from '../components/Navbar'; // Importación del nuevo menú

// ─── Colores Carrybot ────────────────────────────────────────────────────────
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

// ─── Roslib helpers ───────────────────────────────────────────────────────────
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

// ─── Estilos globales (Limpios de Navbar y Footer) ──────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #f0f2f7; }

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
  .cb-control-btn.active { background: ${C.yellow}; color: ${C.navy}; border-color: ${C.yellow}; }

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

  .cb-detection-badge {
    position: absolute; top: 10px; left: 10px;
    display: flex; flex-direction: column; gap: 4px;
    pointer-events: none; z-index: 10;
  }
  .cb-det-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .4px;
    text-transform: uppercase; backdrop-filter: blur(4px);
  }
  .cb-det-pill.box  { background: rgba(34,197,94,.85);  color: #fff; }
  .cb-det-pill.qr   { background: rgba(59,130,246,.85); color: #fff; }
  .cb-det-pill.none { background: rgba(0,0,0,.45);      color: rgba(255,255,255,.7); }
  .cb-det-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

  .cb-cam-toggle {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(26,45,90,.75); color: ${C.white};
    border: 1.5px solid rgba(255,255,255,.3); border-radius: 6px;
    padding: 4px 10px; font-size: 11px; font-weight: 700;
    cursor: pointer; letter-spacing: .4px; text-transform: uppercase;
    transition: all .15s; z-index: 10;
  }
  .cb-cam-toggle:hover { background: ${C.navy}; border-color: ${C.yellow}; color: ${C.yellow}; }
  .cb-cam-toggle.active { background: ${C.yellow}; color: ${C.navy}; border-color: ${C.yellow}; }

  .cb-vision-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;
  }
  .cb-vision-stat {
    background: ${C.gray}; border: 1.5px solid ${C.border};
    border-radius: 8px; padding: 12px; text-align: center;
  }
  .cb-vision-stat-val {
    font-size: 28px; font-weight: 700; color: ${C.navy};
    font-family: 'Barlow Condensed', sans-serif;
  }
  .cb-vision-stat-val.green { color: ${C.success}; }
  .cb-vision-stat-val.blue  { color: #3b82f6; }
  .cb-vision-stat-label { font-size: 11px; color: ${C.muted}; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

  .cb-qr-result {
    background: #eff6ff; border: 1.5px solid #3b82f6;
    border-radius: 8px; padding: 12px; margin-top: 8px;
  }
  .cb-qr-result-title { font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 8px; }
  .cb-qr-field { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #dbeafe; }
  .cb-qr-field:last-child { border-bottom: none; }
  .cb-qr-field-label { color: ${C.muted}; font-weight: 500; }
  .cb-qr-field-val { color: ${C.text}; font-weight: 700; }
  .cb-qr-raw {
    background: #0d1117; border-radius: 6px; padding: 8px 10px;
    font-size: 11px; color: #7ee787; font-family: monospace;
    word-break: break-all; margin-top: 8px;
  }

  .cb-no-detection {
    text-align: center; padding: 24px 16px; color: ${C.muted};
    font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 8px;
  }

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

  .cb-telem { display: flex; flex-direction: column; gap: 10px; }
  .cb-telem-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid ${C.border};
  }
  .cb-telem-row:last-child { border-bottom: none; padding-bottom: 0; }
  .cb-telem-label { color: ${C.muted}; font-weight: 500; }
  .cb-telem-val { color: ${C.text}; font-weight: 700; font-variant-numeric: tabular-nums; }

  .cb-conn-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
  .cb-conn-input {
    flex: 1; border: 1.5px solid ${C.border}; border-radius: 6px;
    padding: 7px 10px; font-family: 'Barlow', sans-serif; font-size: 13px;
    color: ${C.text}; outline: none;
  }
  .cb-conn-input:focus { border-color: ${C.navy}; }
  .cb-conn-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: ${C.danger}; }
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

  .cb-announcement {
    background: #fffbeb; border: 1.5px solid #f5c518;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: ${C.text}; margin-top: 8px;
    display: flex; align-items: flex-start; gap: 8px;
  }
`;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GestionRobot({ user, onLogout }) {
  const navigate    = useNavigate();
  const roslibLoaded = useRoslib();
  const ROBOT_ID = 1;
  const [address,      setAddress]      = useState("ws://127.0.0.1:9090/");
  const [connected,    setConnected]    = useState(false);
  const [position,     setPosition]     = useState({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState(null);
  const [activePanel,  setActivePanel]  = useState("teleop");
  const [mapDot,       setMapDot]       = useState({ left: "50%", top: "50%" });
  const [vistaActiva,  setVistaActiva]  = useState("camara");

  const [detection,      setDetection]      = useState(null);
  const [showProcessed,  setShowProcessed]  = useState(false);

  const rosRef       = useRef(null);
  const cmdVelRef    = useRef(null);
  const odomRef      = useRef(null);
  const announcRef   = useRef(null);
  const mapCanvasRef = useRef(null);
  const positionRef  = useRef({ x: 0, y: 0 });
  const [robotDB,      setRobotDB]      = useState(null);
  const [tareaActual,  setTareaActual]  = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

    useEffect(() => {
      fetch(`http://localhost:8000/robots/${ROBOT_ID}`)
        .then(res => res.json())
        .then(data => setRobotDB(data))
        .catch(() => console.warn('[CarryBot] No se pudo cargar el robot de la BD'));
    }, []);

    useEffect(() => {
      if (!connected) return;

      const interval = setInterval(() => {
        fetch(`http://localhost:8000/robots/${ROBOT_ID}/pos_x/pos_y/pos_z`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x: positionRef.current.x,
            y: positionRef.current.y,
            z: 0.0,
          }),
        }).catch(() => {});
      }, 5000);

      return () => clearInterval(interval);
    }, [connected]);

  const connect = useCallback(() => {
    if (!roslibLoaded || !window.ROSLIB) return;
    const ros = new window.ROSLIB.Ros({ url: address });

    ros.on("connection", () => {
      setConnected(true);

      cmdVelRef.current = new window.ROSLIB.Topic({
        ros, name: "/cmd_vel", messageType: "geometry_msgs/msg/Twist",
      });

      odomRef.current = new window.ROSLIB.Topic({
        ros, name: "/odom", messageType: "nav_msgs/msg/Odometry",
      });
      odomRef.current.subscribe((msg) => {
        const x = msg.pose.pose.position.x;
        const y = msg.pose.pose.position.y;
        setPosition({ x, y });
        positionRef.current = { x, y };
        const px = Math.min(100, Math.max(0, ((x + 5) / 20) * 100));
        const py = Math.min(100, Math.max(0, (1 - (y + 5) / 20) * 100));
        setMapDot({ left: `${px}%`, top: `${py}%` });
      });

      const mapTopic = new window.ROSLIB.Topic({
        ros,
        name: '/map',
        messageType: 'nav_msgs/msg/OccupancyGrid',
      });
      mapTopic.subscribe((message) => {
        if (mapCanvasRef.current) {
          const res     = message.info.resolution;
          const originX = message.info.origin.position.x;
          const originY = message.info.origin.position.y;
          const robotPixelX = (positionRef.current.x - originX) / res - message.info.width  / 2;
          const robotPixelY = (positionRef.current.y - originY) / res - message.info.height / 2;
          draw_occupancy_grid(
            mapCanvasRef.current,
            message,
            { x: robotPixelX, y: robotPixelY }
          );
        }
      });

      announcRef.current = new window.ROSLIB.Topic({
        ros, name: "/delivery/announcement", messageType: "std_msgs/msg/String",
      });
      announcRef.current.subscribe((msg) => {
        setAnnouncement(msg.data);
        setTimeout(() => setAnnouncement(null), 8000);
      });

      const detectionTopic = new window.ROSLIB.Topic({
        ros,
        name: '/package/detection',
        messageType: 'std_msgs/msg/String',
      });
      detectionTopic.subscribe((msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          setDetection(parsed);
          const DESTINOS_COORDS = {
            Estanteria1:  { x: 6.917, y: 2.282 },
            Estanteria2:  { x: 8.808, y: 2.295 },
            PuntoDeCarga: { x: 4.663, y: 1.682 },
          };

          if (parsed.qr_detected && parsed.qr_parsed?.dest && !tareaActual) {
            const dest = parsed.qr_parsed.dest;
            const coords = DESTINOS_COORDS[dest];
            if (coords) {
              fetch('http://localhost:8000/tareas/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id_robot:         ROBOT_ID,
                  destino_nombre:  dest,
                  destino_x:        coords.x,
                  destino_y:        coords.y,
                  qr_data:          parsed.qr_data,
                }),
              })
                .then(res => res.json())
                .then(data => setTareaActual(data.id))
                .catch(() => {});
            }
          }
        } catch {
          console.warn('[CarryBot] Error parseando /package/detection:', msg.data);
        }
      });
    });

    ros.on("error", () => setConnected(false));
    ros.on("close", () => {
      setConnected(false);
      setDetection(null);
    });
    rosRef.current = ros;
  }, [roslibLoaded, address]);

  const disconnect = useCallback(() => {
    if (rosRef.current) {
      rosRef.current.close();
      rosRef.current  = null;
      cmdVelRef.current = null;
    }
    setConnected(false);
    setDetection(null);
  }, []);

  const publishCommand = useCallback((topicName, value) => {
    if (!rosRef.current) { console.warn('No hay conexión ROS activa'); return; }
    const topic = new window.ROSLIB.Topic({
      ros: rosRef.current, name: topicName, messageType: 'std_msgs/msg/String',
    });
    topic.publish(new window.ROSLIB.Message({ data: value }));
    console.log(`Publicado en ${topicName}: ${value}`);
  }, []);

  const publishVel = useCallback((lx, az) => {
    if (!cmdVelRef.current) return;
    cmdVelRef.current.publish(new window.ROSLIB.Message({
      linear: { x: lx, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: az },
    }));
  }, []);

  const stop = useCallback(() => publishVel(0, 0), [publishVel]);

  const cameraUrl = showProcessed
    ? "http://localhost:8080/stream?topic=/camera/processed"
    : "http://localhost:8080/stream?topic=/camera/image_raw";

  return (
    <div>
      {/* MENÚ TRABAJADOR UNIFICADO */}
      <Navbar variant="trabajador" onLogout={onLogout} />

      <button className="cb-back" onClick={() => navigate(-1)}>
        ‹ Volver
      </button>

      <div className="cb-layout">

        {/* ── COLUMNA IZQUIERDA ── */}
        <div>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 12 }}>
            Sesión activa: {user?.nombre || user?.email || "Operador"}
          </div>

          <div className="cb-card">
            <div className="cb-card-header">⚙ Opciones de manejo del robot</div>
            <div className="cb-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["teleop",    " Control manual"],
                ["nav",       " Navegación autónoma"],
                ["patrol",    "Patrulla de zona"],
                ["delivery",  " Gestión de entregas"],
                ["vision",    "🔍 Visión IA"],
                ["status",    " Estado del robot"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`cb-control-btn${activePanel === key ? " active" : ""}`}
                  onClick={() => setActivePanel(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

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

        {/* ── COLUMNA CENTRAL ── */}
        <div>
          <div className="cb-card">
            <div className="cb-card-header">📷 Cámara / Mapa</div>
            <div className="cb-card-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button
                  className={`cb-btn ${vistaActiva === 'camara' ? 'cb-btn-primary' : ''}`}
                  style={{ flex: 1, padding: '7px 0', fontSize: 13 }}
                  onClick={() => setVistaActiva('camara')}
                >
                  📷 Cámara
                </button>
                <button
                  className={`cb-btn ${vistaActiva === 'mapa' ? 'cb-btn-primary' : ''}`}
                  style={{ flex: 1, padding: '7px 0', fontSize: 13 }}
                  onClick={() => setVistaActiva('mapa')}
                >
                  🗺 Mapa
                </button>
              </div>

              <div style={{
                position: 'relative', width: '100%', aspectRatio: '16/9',
                background: '#0d1117', borderRadius: 8, overflow: 'hidden',
              }}>
                <div style={{ display: vistaActiva === 'camara' ? 'block' : 'none', width: '100%', height: '100%' }}>
                  {connected ? (
                    <>
                      <img
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        src={cameraUrl}
                        alt="Camera feed"
                      />
                      <div className="cb-camera-overlay" />
                      <div className="cb-camera-label">
                        {showProcessed ? 'CAM — Visión IA activa' : 'CAM — Robot 01'}
                      </div>
                      <div className="cb-camera-status" />

                      <div className="cb-detection-badge">
                        {detection ? (
                          <>
                            <span className={`cb-det-pill ${detection.box_detected ? 'box' : 'none'}`}>
                              <span className="cb-det-dot" />
                              {detection.box_detected
                                ? `${detection.boxes.length} caja${detection.boxes.length > 1 ? 's' : ''}`
                                : 'Sin cajas'}
                            </span>
                            <span className={`cb-det-pill ${detection.qr_detected ? 'qr' : 'none'}`}>
                              <span className="cb-det-dot" />
                              {detection.qr_detected ? 'QR leído' : 'Sin QR'}
                            </span>
                          </>
                        ) : (
                          <span className="cb-det-pill none">
                            🔍 Iniciando visión…
                          </span>
                        )}
                      </div>

                      <button
                        className={`cb-cam-toggle${showProcessed ? ' active' : ''}`}
                        onClick={() => setShowProcessed(v => !v)}
                        title={showProcessed ? 'Ver cámara original' : 'Ver cámara con detecciones'}
                      >
                        {showProcessed ? '🔍 IA ON' : '🔍 IA OFF'}
                      </button>
                    </>
                  ) : (
                    <div className="cb-no-camera">
                      <div style={{ fontSize: 40 }}>📵</div>
                      <div>Sin señal de cámara</div>
                    </div>
                  )}
                </div>

                <div style={{ display: vistaActiva === 'mapa' ? 'block' : 'none', width: '100%', height: '100%' }}>
                  <canvas
                    ref={mapCanvasRef}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated', display: 'block' }}
                  />
                  {!connected && (
                    <div className="cb-no-camera">
                      <div style={{ fontSize: 40 }}>🗺</div>
                      <div>Sin datos de mapa</div>
                    </div>
                  )}
                </div>
              </div>

              {announcement && (
                <div className="cb-announcement">
                  <span style={{ fontSize: 18 }}>📦</span>
                  <span>{announcement}</span>
                </div>
              )}
            </div>
          </div>

          {activePanel === "teleop" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Control manual — Teleop</div>
              <div className="cb-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <p style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>
                  {connected ? "Robot conectado. Usa los controles para moverlo." : "Conéctate primero para controlar el robot."}
                </p>
                <div className="cb-dpad">
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(0.2, 0)}   title="Adelante">▲</button>
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(0, 0.5)}   title="Girar izquierda">◄</button>
                  <button className="cb-dpad-btn center" onClick={stop}                title="Parar">STOP</button>
                  <button className="cb-dpad-btn" onClick={() => publishVel(0, -0.5)}  title="Girar derecha">►</button>
                  <div className="cb-dpad-btn empty" />
                  <button className="cb-dpad-btn" onClick={() => publishVel(-0.2, 0)}  title="Atrás">▼</button>
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
                  <button key={dest} className="cb-control-btn" style={{ marginBottom: 8 }}
                    disabled={!connected} onClick={() => publishCommand('/web/nav_goal', dest)}>
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
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                  El robot recorrerá todos los waypoints de la zona en orden.
                </p>
                {["Zona1", "Zona2"].map((zone) => (
                  <button key={zone} className="cb-control-btn" style={{ marginBottom: 8 }}
                    disabled={!connected} onClick={() => publishCommand('/web/patrol_goal', zone)}>
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
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Ruta automática</p>
                <button
                  className="cb-control-btn active"
                  style={{ marginBottom: 16, borderColor: C.yellow, background: C.yellow, color: C.navy }}
                  disabled={!connected}
                  onClick={() => publishCommand('/web/ruta_fija', 'start')}
                >
                   Iniciar ruta fija (todos los pedidos)
                </button>
              </div>
            </div>
          )}

          {activePanel === "vision" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header">🔍 Visión IA — Detección de paquetes</div>
              <div className="cb-card-body">

                {!connected ? (
                  <div className="cb-no-detection">
                    <div style={{ fontSize: 36 }}>🔌</div>
                    <div>Conéctate a ROS para activar la detección.</div>
                    <div style={{ fontSize: 11 }}>
                      Asegúrate de que <code>package_detector</code> está corriendo.
                    </div>
                  </div>
                ) : !detection ? (
                  <div className="cb-no-detection">
                    <div style={{ fontSize: 36, animation: 'pulse 1.5s infinite' }}>👁</div>
                    <div>Esperando datos del nodo de visión…</div>
                    <div style={{ fontSize: 11 }}>
                      Ejecuta: <code>ros2 run carrybot_web_bridge package_detector</code>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="cb-vision-grid">
                      <div className="cb-vision-stat">
                        <div className={`cb-vision-stat-val${detection.box_detected ? ' green' : ''}`}>
                          {detection.boxes?.length ?? 0}
                        </div>
                        <div className="cb-vision-stat-label">Cajas detectadas</div>
                      </div>
                      <div className="cb-vision-stat">
                        <div className={`cb-vision-stat-val${detection.qr_detected ? ' blue' : ''}`}>
                          {detection.qr_detected ? '✓' : '—'}
                        </div>
                        <div className="cb-vision-stat-label">Código QR</div>
                      </div>
                    </div>

                    {detection.qr_detected && (
                      <div className="cb-qr-result">
                        <div className="cb-qr-result-title">📦 Datos del paquete (QR)</div>

                        {detection.qr_parsed ? (
                          Object.entries(detection.qr_parsed).map(([k, v]) => (
                            <div className="cb-qr-field" key={k}>
                              <span className="cb-qr-field-label">{k}</span>
                              <span className="cb-qr-field-val">{String(v)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="cb-qr-field">
                            <span className="cb-qr-field-label">Contenido</span>
                            <span className="cb-qr-field-val">{detection.qr_data}</span>
                          </div>
                        )}

                        <div className="cb-qr-raw">{detection.qr_data}</div>
                      </div>
                    )}

                    {!detection.box_detected && !detection.qr_detected && (
                      <div className="cb-no-detection" style={{ padding: '16px 0 0' }}>
                        <div style={{ fontSize: 28 }}>🔍</div>
                        <div>No se detecta ningún paquete en la imagen actual.</div>
                      </div>
                    )}

                    {detection.qr_parsed?.dest && connected && (
                      <button
                        className="cb-control-btn active"
                        style={{ marginTop: 12, background: C.yellow, color: C.navy, borderColor: C.yellow }}
                        onClick={() => {
                                publishCommand('/web/nav_goal', detection.qr_parsed.dest);
                                if (tareaActual) {
                                  fetch(`http://localhost:8000/tareas/${tareaActual}/estado?estado=en_curso`, {
                                    method: 'PUT',
                                  }).catch(() => {});
                                  fetch(`http://localhost:8000/robots/${ROBOT_ID}/estado?estado=en_tarea`, {
                                    method: 'PUT',
                                  }).catch(() => {});
                                }
                              }}
                      >
                        🚀 Ir a {detection.qr_parsed.dest}
                      </button>
                    )}

                    <div style={{
                      marginTop: 10, padding: '8px 10px',
                      background: '#f0f9ff', border: '1.5px solid #bae6fd',
                      borderRadius: 6, fontSize: 11, color: '#0369a1',
                    }}>
                      💡 Activa <strong>"🔍 IA ON"</strong> en la cámara para ver los
                      bounding boxes dibujados en tiempo real.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activePanel === "status" && (
            <div className="cb-card" style={{ marginTop: 12 }}>
              <div className="cb-card-header"> Estado del robot</div>
              <div className="cb-card-body">
                <div className="cb-telem">
                  {[
                    ["Modelo",            "TurtleBot3 Burger"],
                    ["Batería",           connected ? "87%" : "—"],
                    ["Velocidad lineal",  connected ? "0.00 m/s" : "—"],
                    ["Velocidad angular", connected ? "0.00 rad/s" : "—"],
                    ["Nav2",              connected ? "Activo" : "Inactivo"],
                    ["AMCL",              connected ? "Localizado" : "—"],
                    ["Visión IA",         connected && detection ? "Activa" : "—"],
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

        {connected && (
          <div style={{ marginTop: 12 }}>
            <button
              style={{
                width: '100%', padding: '12px',
                background: '#ef4444', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
              onClick={() => {
                          publishCommand('/web/cancel', 'stop');
                          if (tareaActual) {
                            fetch(`http://localhost:8000/tareas/${tareaActual}/estado?estado=cancelada`, {
                              method: 'PUT',
                            }).catch(() => {});
                            setTareaActual(null);
                            fetch(`http://localhost:8000/robots/${ROBOT_ID}/estado?estado=activo`, {
                              method: 'PUT',
                            }).catch(() => {});
                          }
                        }}
            >
              STOP — Cancelar acción
            </button>
          </div>
        )}
      </div>

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
