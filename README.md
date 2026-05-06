# 🤖 CarryBot Web — Interfaz de Control para Robot Autónomo de Almacén

> Interfaz web para monitorización y control de robots TurtleBot3 en entornos de almacén, desarrollada con **React 19 + Vite**. Forma parte del proyecto **GTI 2026**.

---

## 📋 Índice

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Usuario de prueba](#usuario-de-prueba)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Base de datos](#base-de-datos)
- [Conexión con ROS2](#conexión-con-ros2)
- [Ramas y versiones](#ramas-y-versiones)

---

## Descripción

**CarryBot Web** es el panel de control web del sistema de transporte autónomo Carrybot. Permite a operarios y administradores supervisar robots TurtleBot3 en tiempo real, enviarles órdenes de entrega, controlar su movimiento manualmente y gestionar tanto la flota de robots como los usuarios de la plataforma, todo desde cualquier navegador conectado a la red.

El robot integra **ROS2** y el stack de navegación **Nav2** para planificación de rutas y evasión de obstáculos. La interfaz web se comunica con él a través de **roslib.js** (cargado dinámicamente desde CDN para evitar dependencias de npm).

---

## Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| 🗺️ Navegación autónoma | El robot planifica rutas óptimas con Nav2 + AMCL y evita obstáculos en tiempo real |
| 📦 Gestión de entregas | Recoge paquetes de las estanterías y los transporta al punto de carga sin intervención humana |
| 🔄 Patrulla de zonas | Recorre zonas completas del almacén siguiendo waypoints predefinidos |
| 📷 Cámara en vivo | Visualiza el feed de la cámara del robot desde cualquier navegador |
| 📡 Telemetría en tiempo real | Monitoriza posición, velocidad y estado del robot en el mapa del warehouse |
| 🕹️ Control manual | Joystick integrado en la interfaz web para tomar el control directo del robot |
| 👥 Gestión de usuarios | Panel de administración para crear, editar y eliminar cuentas de usuario |
| 📝 Formulario de incidencias | Página de contacto para reportar incidencias sin necesidad de estar autenticado |

---

## Tecnologías

- **[React 19](https://react.dev/)** — Librería de interfaz de usuario
- **[Vite 8](https://vite.dev/)** — Bundler y servidor de desarrollo
- **[React Router DOM v7](https://reactrouter.com/)** — Enrutado del lado del cliente (SPA)
- **[roslib.js](https://github.com/RobotWebTools/roslibjs)** — Comunicación con ROS2 a través de WebSocket (cargado dinámicamente desde CDN)
- **Barlow / Barlow Condensed** — Tipografía corporativa (Google Fonts)
- **LocalStorage** — Persistencia de sesión y usuarios en el cliente (fase de prototipo)

---

## Estructura del proyecto

```
carrybot_web/
├── bbdd/
│   └── Robotika.sql          # Esquema MySQL de la base de datos
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── img/
│   │   └── robot.jpg
│   └── videos/
│       └── demo.mp4          # Vídeo de demostración del hero
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # HOC para rutas protegidas por autenticación
│   ├── pages/
│   │   ├── LandingPage.jsx       # Página de inicio pública
│   │   ├── Login.jsx             # Formulario de inicio de sesión
│   │   ├── Register.jsx          # Formulario de registro
│   │   ├── RobotList.jsx         # Listado y gestión de la flota de robots
│   │   ├── GestionRobot.jsx      # Panel de control individual de un robot
│   │   ├── UserManagement.jsx    # Administración de usuarios (admin)
│   │   └── FormularioIncidencias.jsx  # Formulario de contacto/incidencias
│   ├── utils/
│   │   └── auth.js               # Lógica de autenticación (localStorage)
│   ├── App.jsx                   # Enrutador principal
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## Instalación y puesta en marcha

### Requisitos previos

- **Node.js** ≥ 18
- **npm** ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/JaimeSM21/carrybot_web.git
cd carrybot_web

# 2. Cambiar a la rama de esta versión
git checkout release03

# 3. Instalar dependencias
npm install

# 4. Arrancar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilación para producción en `/dist` |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## Usuario de prueba

Al arrancar la aplicación se crea automáticamente un usuario demo con el que puedes explorar todas las funciones sin necesidad de registrarte:

| Campo | Valor |
|---|---|
| **Email** | `demo@carrybot.com` |
| **Contraseña** | `Carrybot123` |

> ⚠️ En esta versión la autenticación se gestiona en el **localStorage** del navegador, por lo que los datos son locales a cada sesión. No existe comunicación con un servidor de backend todavía.

---

## Rutas de la aplicación

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Landing Page | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de cuenta | Público |
| `/home` | Listado de robots | 🔒 Autenticado |
| `/robot/:id` | Panel de control del robot | 🔒 Autenticado |
| `/admin/users` | Gestión de usuarios | 🔒 Autenticado |
| `/contacto` | Formulario de incidencias | Público |

Las rutas protegidas redirigen a `/login` si no hay sesión activa. Si ya hay sesión, `/login` y `/register` redirigen a `/home`.

---

## Base de datos

El fichero `bbdd/Robotika.sql` contiene el esquema **MySQL** del sistema completo. Las tablas principales son:

- **`usuarios`** — Cuentas de la plataforma con roles `trabajador` / `administrador`
- **`robots`** — Flota de robots (código, modelo, estado, batería, posición, última conexión)
- **`trabajador_robot`** — Relación N:M entre trabajadores y robots asignados
- **`sectores`** — Zonas del almacén con sus coordenadas
- **`estanterias`** — Estanterías por sector con capacidad y nivel
- **`paquetes`** — Paquetes con estado `almacenado` / `en_transito` / `entregado`
- **`tareas`** — Órdenes de transporte asignadas a los robots

> La versión actual (`release03`) de la web no conecta todavía con esta base de datos. La integración backend está prevista en versiones posteriores.

---

## Conexión con ROS2

La página de gestión individual (`/robot/:id`) utiliza **roslib.js** para establecer una conexión WebSocket con el nodo `rosbridge_server` del robot. La librería se carga dinámicamente desde CDN al montar el componente, sin necesidad de instalarla como dependencia npm.

Para que la interfaz pueda comunicarse con el robot, el robot debe tener activo:

```bash
# En el robot (ROS2 Humble / Iron)
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

La URL de conexión por defecto es `ws://<IP_DEL_ROBOT>:9090`.

---

© CarryBot — Proyecto GTI 2026
