# CarryBot Web — Interfaz de Gestión de Robots de Almacén

> Parte web del sistema **CarryBot**: panel de control, API REST y base de datos para la gestión de robots autónomos de almacén. La comunicación en tiempo real con el hardware se realiza a través del stack ROS 2 (repositorio separado).

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos](#base-de-datos)
- [API REST](#api-rest)
- [Frontend](#frontend)
- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Variables de entorno y configuración](#variables-de-entorno-y-configuración)
- [Roles y permisos](#roles-y-permisos)
- [Integración con ROS 2](#integración-con-ros-2)

---

## Descripción general

**CarryBot Web** es la capa de gestión del proyecto CarryBot: una aplicación full-stack que permite supervisar y operar robots de transporte autónomos en un almacén. Desde el navegador, los operadores pueden visualizar el mapa del entorno en tiempo real, controlar el movimiento del robot, consultar el inventario de paquetes, registrar incidencias y revisar el historial de alertas.

La parte web se conecta a los robots a través de **rosbridge** (WebSocket), consumiendo y publicando topics de ROS 2 sin necesidad de instalar ROS en el cliente.

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│                      Navegador (React)                   │
│  Login · RobotList · GestionRobot · Inventario · etc.   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (REST / JWT)
┌──────────────────────▼──────────────────────────────────┐
│               API FastAPI  (puerto 8000)                 │
│  /usuarios · /robots · /tareas · /paquetes              │
│  /alertas  · /incidencias · /inventario                 │
└──────────────────────┬──────────────────────────────────┘
                       │ mysql-connector-python
┌──────────────────────▼──────────────────────────────────┐
│              MySQL — base de datos "robotika"            │
└─────────────────────────────────────────────────────────┘

              ┌──────────────────────────────┐
              │   rosbridge (WebSocket 9090) │  ← stack ROS 2
              │   web_video_server    (8080) │    (repo separado)
              └──────────────────────────────┘
```

El navegador se comunica con rosbridge directamente mediante la biblioteca **roslibjs** para:

- Suscribirse a `/map` (nav_msgs/OccupancyGrid) → mapa de ocupación.
- Suscribirse a `/odom` → posición del robot.
- Publicar en `/cmd_vel` → control de movimiento.
- Suscribirse a `/camera/detections` → detección de paquetes por cámara.
- Recibir anuncios de `/announce` → notificaciones del robot.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router DOM 7, Vite 8 |
| API | FastAPI, Pydantic, python-jose (JWT), bcrypt |
| Base de datos | MySQL (mysql-connector-python) |
| Comunicación ROS | roslibjs (CDN), web_video_server |
| Empaquetado | Node.js + npm |

---

## Estructura del proyecto

```
carrybot_web/
├── api/                        # Backend FastAPI
│   ├── main.py                 # Punto de entrada, CORS, registro de routers
│   ├── auth.py                 # JWT: generación y validación de tokens
│   ├── database.py             # Conexión MySQL, helpers execute_query / fetch_query
│   └── routers/
│       ├── usuarios.py         # Registro, login, gestión de usuarios
│       ├── robots.py           # Estado, posición y listado de robots
│       ├── tareas.py           # Creación y seguimiento de tareas
│       ├── paquetes.py         # Detección de paquetes por cámara
│       ├── alertas.py          # Alertas por robot y por trabajador
│       ├── incidencias.py      # Formulario de incidencias
│       └── inventario.py       # Consulta y alta de paquetes en almacén
├── bbdd/
│   └── Robotika.sql            # Script DDL completo de la base de datos
├── src/                        # Frontend React
│   ├── main.jsx                # Punto de entrada de React
│   ├── App.jsx                 # Rutas protegidas y gestión de sesión
│   ├── utils/
│   │   └── auth.js             # Helpers de sesión y cabeceras JWT
│   ├── components/
│   │   ├── Navbar.jsx          # Barra de navegación
│   │   └── ProtectedRoute.jsx  # HOC de rutas con control de rol
│   ├── js/
│   │   └── draw_occupancy_grid.js  # Renderizado del mapa en canvas
│   └── pages/
│       ├── LandingPage.jsx     # Página de inicio pública
│       ├── Login.jsx           # Formulario de inicio de sesión
│       ├── Register.jsx        # Registro de nuevo usuario
│       ├── RobotList.jsx       # Lista de robots asignados al trabajador
│       ├── GestionRobot.jsx    # Panel de control en tiempo real (ROS)
│       ├── Inventario.jsx      # Gestión del inventario de paquetes
│       ├── RegistroAlertas.jsx # Historial de alertas
│       ├── FormularioIncidencias.jsx  # Crear incidencia
│       ├── RegistroIncidencias.jsx    # Listado de incidencias (admin)
│       └── UserManagement.jsx  # Gestión de usuarios (admin)
├── index.html
├── vite.config.js
└── package.json
```

---

## Base de datos

El esquema completo se encuentra en `bbdd/Robotika.sql`. Las tablas principales son:

| Tabla | Descripción |
|---|---|
| `usuarios` | Trabajadores y administradores con autenticación bcrypt |
| `robots` | Flota de robots con estado, batería y posición (JSON) |
| `trabajador_robot` | Relación N:M entre usuarios y robots asignados |
| `sectores` | Zonas del almacén con coordenadas |
| `estanterias` | Ubicaciones físicas dentro de cada sector |
| `paquetes` | Inventario de paquetes con código de barras y estantería |
| `tareas` | Órdenes de transporte con origen, destino y estado |
| `alertas` | Notificaciones generadas por el robot (cargar, batería baja, error) |
| `incidencias` | Tickets abiertos por trabajadores hacia administradores |

La tabla `tareas` incluye una columna generada `robot_en_curso` y una restricción `UNIQUE` que impide asignar dos tareas simultáneas al mismo robot.

---

## API REST

La API arranca en `http://localhost:8000`. Todos los endpoints protegidos requieren la cabecera:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /usuarios/login` y tiene una validez de **8 horas**.

### Endpoints principales

#### Usuarios — `/usuarios`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/usuarios/registro` | Público | Registro de nuevo trabajador |
| POST | `/usuarios/login` | Público | Autenticación y obtención de token JWT |
| GET | `/usuarios/` | Admin | Listado de trabajadores con robots asignados |
| PUT | `/usuarios/{id}` | Admin | Actualización de datos y flota asignada |
| DELETE | `/usuarios/{id}` | Admin | Baja de usuario |
| GET | `/usuarios/asignados/{id}` | Auth | Robots asignados a un trabajador |

#### Robots — `/robots`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/robots/` | Auth | Listado completo de robots |
| GET | `/robots/{id}` | Auth | Detalle de un robot |
| PUT | `/robots/{id}/posicion` | Auth | Actualizar posición `{x, y, z}` |
| PUT | `/robots/{id}/estado` | Auth | Cambiar estado (`activo`, `inactivo`, `en_tarea`, `error`) |

#### Tareas — `/tareas`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/tareas/` | Auth | Crear tarea (destino + coordenadas + datos QR) |
| PUT | `/tareas/{id}/estado` | Auth | Actualizar estado de tarea |
| GET | `/tareas/robot/{id}` | Auth | Últimas 10 tareas de un robot |

#### Paquetes — `/paquetes`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/paquetes/detectado` | Público | Notifica detección de paquete por cámara; crea alerta automáticamente |

#### Alertas — `/alertas`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/alertas/` | Admin | Todas las alertas |
| GET | `/alertas/usuario/{id}` | Auth | Alertas del trabajador |
| PUT | `/alertas/{id}/estado` | Auth | Cambiar estado (`Pendiente`, `Atendida`, `Resuelta`) |

#### Incidencias — `/incidencias`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/incidencias/` | Admin | Listado completo |
| POST | `/incidencias/` | Auth | Abrir incidencia |
| PUT | `/incidencias/{id}/estado` | Admin | Cambiar estado |
| GET | `/incidencias/robots-asignados/{id}` | Auth | Robots disponibles para la incidencia |

#### Inventario — `/inventario`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/inventario/` | Auth | Inventario completo con estantería y sector |
| POST | `/inventario/add` | Auth | Añadir paquete al inventario |

---

## Frontend

La SPA React implementa las siguientes rutas:

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `LandingPage` | Público |
| `/login` | `Login` | Público |
| `/register` | `Register` | Público |
| `/home` | `RobotList` | Auth |
| `/robot/:id` | `GestionRobot` | Auth |
| `/inventario` | `Inventario` | Auth |
| `/alertas` | `RegistroAlertas` | Auth |
| `/contacto` | `FormularioIncidencias` | Auth |
| `/admin/users` | `UserManagement` | Admin |
| `/registro-incidencias` | `RegistroIncidencias` | Admin |

### Panel de gestión del robot (`GestionRobot`)

Es la página central de la aplicación. Conecta con rosbridge (WebSocket) e integra:

- **Mapa de ocupación** renderizado en un `<canvas>` mediante `draw_occupancy_grid.js`.  
  Los datos llegan del topic `/map` (nav_msgs/OccupancyGrid).
- **Posición en tiempo real** suscrita a `/odom`.
- **Control de movimiento** publicando en `/cmd_vel`.
- **Cámara en vivo** a través de `web_video_server` (`http://localhost:8080/stream?topic=/camera/...`).
- **Detección automática de paquetes**: al recibir un mensaje en `/camera/detections`, llama al endpoint `POST /paquetes/detectado` que registra la alerta en base de datos.
- **Creación de tareas** cuando se escanea un QR con destino de estantería.

---

## Requisitos previos

- **Node.js** ≥ 18 y **npm**
- **Python** 3.10+
- **MySQL** 8.0+ (o MariaDB compatible)
- **ROS 2** con rosbridge y web_video_server activos (ver repositorio ROS 2)

---

## Instalación y puesta en marcha

### 1. Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE robotika;"
mysql -u root -p robotika < bbdd/Robotika.sql
```

### 2. Backend (FastAPI)

```bash
cd carrybot_web

# Crear entorno virtual e instalar dependencias
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install fastapi uvicorn mysql-connector-python python-jose bcrypt

# Arrancar la API
uvicorn api.main:app --reload --port 8000
```

La documentación interactiva queda disponible en `http://localhost:8000/docs`.

### 3. Frontend (React + Vite)

```bash
cd carrybot_web
npm install
npm run dev
```

La aplicación se sirve en `http://localhost:5173`.

### 4. Stack ROS 2

Asegúrate de que los nodos de rosbridge y web_video_server estén corriendo antes de abrir el panel de gestión del robot. Consulta el repositorio ROS 2 para los detalles de lanzamiento.

---

## Variables de entorno y configuración

Actualmente la configuración se define directamente en el código fuente. Para producción se recomienda externalizarla mediante variables de entorno.

| Fichero | Variable | Valor por defecto | Descripción |
|---|---|---|---|
| `api/database.py` | `DB_CONFIG` | `localhost / root / "" / robotika` | Conexión MySQL |
| `api/auth.py` | `SECRET_KEY` | `carrybot-secret-key-cambiar-en-produccion` | Clave de firma JWT |
| `api/auth.py` | `TOKEN_EXPIRE_HOURS` | `8` | Duración del token |
| `api/main.py` | `allow_origins` | `http://localhost:5173` | Origen CORS permitido |
| `GestionRobot.jsx` | `address` | `ws://127.0.0.1:9090/` | URL de rosbridge |

> ⚠️ **Importante:** cambia `SECRET_KEY` antes de desplegar en producción. Puedes generar una nueva con:  
> `python -c "import secrets; print(secrets.token_hex(32))"`

---

## Roles y permisos

El sistema distingue dos tipos de usuario gestionados mediante JWT:

**Trabajador**
- Ver y controlar robots asignados a su cuenta.
- Consultar y añadir paquetes al inventario.
- Ver sus propias alertas y cambiar su estado.
- Crear incidencias en su propio nombre.

**Administrador**
- Acceso completo a todos los recursos anteriores.
- Gestionar usuarios (crear, editar, eliminar, asignar robots).
- Ver todas las alertas e incidencias del sistema.
- Cambiar el estado de cualquier incidencia.

---

## Integración con ROS 2

Esta parte web es independiente del stack ROS 2 pero depende de él en tiempo de ejecución para el panel de control del robot. La comunicación se realiza mediante:

| Servicio | Puerto | Propósito |
|---|---|---|
| rosbridge WebSocket | 9090 | topics ROS 2 ↔ navegador (roslibjs) |
| web_video_server HTTP | 8080 | streaming de cámara en tiempo real |

Los topics ROS 2 consumidos/publicados desde la web son:

| Topic | Tipo | Dirección | Uso |
|---|---|---|---|
| `/map` | `nav_msgs/OccupancyGrid` | Suscripción | Mapa de ocupación |
| `/odom` | `nav_msgs/Odometry` | Suscripción | Posición del robot |
| `/cmd_vel` | `geometry_msgs/Twist` | Publicación | Control de movimiento |
| `/camera/detections` | `std_msgs/String` | Suscripción | Detecciones de la cámara |
| `/announce` | `std_msgs/String` | Suscripción | Anuncios del robot |
| `/camera/raw` | stream HTTP | Suscripción | Imagen de cámara sin procesar |
| `/camera/processed` | stream HTTP | Suscripción | Imagen con detecciones superpuestas |

Para la configuración y puesta en marcha de los nodos ROS 2, consulta el repositorio correspondiente.