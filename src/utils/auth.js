const SESSION_KEY = 'carrybot_session'

// ── Sesión ───────────────────────────────────────────────────────────────────

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getSessionUser() {
  return readJson(SESSION_KEY, null)
}

export function saveSessionUser(user) {
  writeJson(SESSION_KEY, user)
}

export function logoutSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ── Token JWT ────────────────────────────────────────────────────────────────

/**
 * Devuelve el token JWT guardado en la sesión, o null si no hay sesión.
 */
export function getToken() {
  const session = getSessionUser()
  return session?.token ?? null
}

/**
 * Devuelve los headers necesarios para llamadas autenticadas a la API.
 * Uso: fetch(url, { headers: authHeaders() })
 */
export function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Login / Registro ─────────────────────────────────────────────────────────

export async function loginUser({ email, password }) {
  const response = await fetch('http://localhost:8000/usuarios/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo iniciar sesión.')
  }

  // Guardamos el token junto con los datos del usuario
  const sessionUser = {
    token: data.token,
    id: data.id,
    name: data.nombre,
    email: data.email,
    tipo: data.tipo,
  }

  saveSessionUser(sessionUser)
  return sessionUser
}

export async function registerUser({ name, email, password }) {
  const response = await fetch('http://localhost:8000/usuarios/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo completar el registro.')
  }

  // Tras el registro redirigimos al login (el registro no genera token)
  return { id: data.id, name: name.trim(), email: email.trim().toLowerCase() }
}

// Mantener seedDemoUser vacío para no romper importaciones existentes
export function seedDemoUser() {}
