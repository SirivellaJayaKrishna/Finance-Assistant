const BASE = 'http://localhost:8000'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(e.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  health:          ()      => req('/health'),
  getSummary:      ()      => req('/summary'),
  getStats:        ()      => req('/stats'),
  getTransactions: (n=30)  => req(`/transactions?limit=${n}`),
  getAlerts:       (n=20)  => req(`/alerts?limit=${n}`),
  getBudgets:      ()      => req('/budgets'),
  setBudget: (category, monthly_limit) =>
    req('/budgets', { method:'POST', body: JSON.stringify({ category, monthly_limit }) }),
  processSMS: (sms) =>
    req('/process-sms', { method:'POST', body: JSON.stringify({ sms }) }),
}
