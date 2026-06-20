const BASE =
  import.meta.env.PROD
    ? 'https://barstock-api-9erp.onrender.com/api'
    : '/api'

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  getDashboard: () => req('/dashboard'),

  getInventory: (p = {}) =>
    req('/inventory?' + new URLSearchParams(p)),

  addInventory: (d) =>
    req('/inventory', {
      method: 'POST',
      body: d,
    }),

  updateInventory: (id, d) =>
    req(`/inventory/${id}`, {
      method: 'PUT',
      body: d,
    }),

  deleteInventory: (id) =>
    req(`/inventory/${id}`, {
      method: 'DELETE',
    }),

  getCatalog: (p = {}) =>
    req('/catalog?' + new URLSearchParams(p)),

  getMovements: (p = {}) =>
    req('/movements?' + new URLSearchParams(p)),

  addMovement: (d) =>
    req('/movements', {
      method: 'POST',
      body: d,
    }),

  getSettings: () =>
    req('/settings'),

  updateSettings: (d) =>
    req('/settings', {
      method: 'PUT',
      body: d,
    }),
}

export const fmt = (n) =>
  Number(n).toLocaleString('en-IN')

export const fmtDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  )

export const fmtDateShort = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  )