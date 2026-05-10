const USERS_KEY = 'carrybot_users'
const SESSION_KEY = 'carrybot_session'

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

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

export function getUsers() {
  return readJson(USERS_KEY, [])
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

export async function registerUser({ name, email, password }) {
  const response = await fetch("http://localhost:8000/usuarios/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "No se pudo completar el registro.")
  }

  const sessionUser = {
    id: null,
    name: name.trim(),
    email: email.trim().toLowerCase(),
  }

  saveSessionUser(sessionUser)
  return sessionUser
}

export async function loginUser({ email, password }) {
  const response = await fetch("http://localhost:8000/usuarios/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "No se pudo iniciar sesión.")
  }

  const sessionUser = {
    id: data.id,
    name: data.nombre,
    email: data.email,
    tipo: data.tipo,
  }

  saveSessionUser(sessionUser)
  return sessionUser
}

export function seedDemoUser() {
  const users = getUsers()
  const exists = users.some((user) => user.email === 'demo@carrybot.com')

  if (exists) return

  const demoUser = {
    id: 'demo-carrybot-user',
    name: 'Usuario Demo',
    email: 'demo@carrybot.com',
    password: 'Carrybot123',
    createdAt: new Date().toISOString(),
  }

  writeJson(USERS_KEY, [...users, demoUser])
}