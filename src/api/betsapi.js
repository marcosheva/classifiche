// Sempre proxy /api-bets: in dev (Vite), in prod (server Express su Render)
const BASE = '/api-bets/v3'
const TOKEN = import.meta.env.VITE_BETSAPI_TOKEN || '83845-ErtX9R6xbi7Qke'

async function request(path, params = {}) {
  const search = new URLSearchParams()
  search.set('token', TOKEN)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, String(v))
  })
  const url = `${BASE}${path}?${search.toString()}`
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_detail || data.error || 'Errore API')
  if (data.success === 0) throw new Error(data.error_detail || data.error || 'Errore API')
  return data
}

/**
 * Elenco leghe per sport (sport_id: 1 = calcio).
 * Risposta: { success, pager: { page, per_page, total }, results: [{ id, name, cc, has_leaguetable }] }
 * @param {number} sportId - default 1 (calcio)
 * @param {string} [cc] - country code opzionale
 * @param {number|string} [maxId] - paginazione con max_id (pager.min_id)
 * @param {number} [page] - paginazione con page (pager.page, pager.per_page, pager.total)
 */
export async function getLeagues(sportId = 1, cc, maxId, page) {
  const params = { sport_id: sportId }
  if (cc) params.cc = cc
  if (maxId != null && maxId !== '') params.max_id = maxId
  if (page != null && page > 0) params.page = page
  return request('/league', params)
}

/**
 * Classifica di una lega
 * @param {string} leagueId - ID lega (da has_leaguetable nelle leghe)
 */
export async function getLeagueTable(leagueId) {
  return request('/league/table', { league_id: leagueId })
}
