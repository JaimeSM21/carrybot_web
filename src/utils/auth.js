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
  await wait()

  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()
  const exists = users.some((user) => user.email === normalizedEmail)

  if (exists) {
    throw new Error('Ya existe una cuenta con ese correo.')
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  }

  const nextUsers = [...users, newUser]
  writeJson(USERS_KEY, nextUsers)

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  }

  saveSessionUser(sessionUser)
  return sessionUser
}

export async function loginUser({ email, password }) {
  await wait()

  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()
  const foundUser = users.find((user) => user.email === normalizedEmail)

  if (!foundUser) {
    throw new Error('No existe ninguna cuenta registrada con ese correo.')
  }

  if (foundUser.password !== password) {
    throw new Error('La contraseña no es correcta.')
  }

  const sessionUser = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
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