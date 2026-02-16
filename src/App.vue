<script setup>
import { ref, computed, onMounted } from 'vue'
import LegheList from './components/LegheList.vue'
import ClassificaTable from './components/ClassificaTable.vue'
import { getLeagues, getLeagueTable } from './api/betsapi.js'

const THEME_KEY = 'classifiche-theme'
const isDark = ref(true)

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY)
  isDark.value = saved !== 'light'
  applyTheme(isDark.value)
})

const leghe = ref([])
const legheLoading = ref(false)
const legheError = ref(null)
const leghePager = ref(null)
const selectedLeague = ref(null)
const classifica = ref(null)
const classificaTitle = ref('')
const classificaLoading = ref(false)
const classificaError = ref(null)
const tableView = ref('overall') // 'overall' | 'home' | 'away'
const tableDataRaw = ref(null) // results[0] per cambiare vista senza ri-chiamare API

const sportId = ref(1)
const sportOptions = [
  { value: 1, label: 'Calcio' },
  { value: 2, label: 'Tennis' },
  { value: 3, label: 'Basket' },
  { value: 4, label: 'Hockey' },
  { value: 5, label: 'Volley' },
]

const countryCode = ref('')
const countryOptions = [
  { value: '', label: 'Tutti i paesi' },
  { value: 'it', label: 'Italia' },
  { value: 'es', label: 'Spagna' },
  { value: 'gb', label: 'Inghilterra' },
  { value: 'de', label: 'Germania' },
  { value: 'fr', label: 'Francia' },
  { value: 'nl', label: 'Olanda' },
  { value: 'pt', label: 'Portogallo' },
  { value: 'be', label: 'Belgio' },
  { value: 'tr', label: 'Turchia' },
  { value: 'br', label: 'Brasile' },
  { value: 'ar', label: 'Argentina' },
  { value: 'us', label: 'USA' },
  { value: 'mx', label: 'Messico' },
  { value: 'ch', label: 'Svizzera' },
  { value: 'at', label: 'Austria' },
  { value: 'gr', label: 'Grecia' },
  { value: 'ru', label: 'Russia' },
  { value: 'ua', label: 'Ucraina' },
  { value: 'pl', label: 'Polonia' },
  { value: 'sc', label: 'Scozia' },
]

// Normalizza un item dalla risposta /v3/league (id, name, cc, has_leaguetable in numero o stringa)
function normalizeLeague(item) {
  if (!item) return null
  const league = item.league || item
  const hasTable = league.has_leaguetable ?? item.has_leaguetable
  return {
    id: item.id ?? league.id,
    name: item.name ?? league.name ?? 'Senza nome',
    cc: item.cc ?? league.cc ?? null,
    has_leaguetable: hasTable === 1 || hasTable === '1' ? 1 : 0,
  }
}

function hasLeaguetable(leg) {
  return leg.has_leaguetable === 1 || leg.has_leaguetable === '1'
}

async function loadLeghe(opts = null) {
  const isAppend = opts != null
  legheError.value = null
  if (!isAppend) {
    legheLoading.value = true
    leghe.value = []
    selectedLeague.value = null
    classifica.value = null
  }
  try {
    const data = await getLeagues(sportId.value, countryCode.value || null, opts?.maxId, opts?.page)
    const raw = data.results || []
    const normalized = raw.map(normalizeLeague).filter(Boolean)
    const withTable = normalized.filter(hasLeaguetable)
    const list = withTable.length ? withTable : normalized
    leghe.value = isAppend ? [...leghe.value, ...list] : list
    leghePager.value = data.pager || null
  } catch (e) {
    legheError.value = e.message || 'Errore nel caricamento leghe'
  } finally {
    legheLoading.value = false
  }
}

async function selectLeague(league) {
  selectedLeague.value = league
  classificaError.value = null
  classifica.value = null
  classificaLoading.value = true
  try {
    const data = await getLeagueTable(league.id)
    tableDataRaw.value = data.results?.[0] ?? null
    applyTableView()
  } catch (e) {
    classificaError.value = e.message || 'Errore nel caricamento classifica'
  } finally {
    classificaLoading.value = false
  }
}

function applyTableView() {
  const first = tableDataRaw.value
  const viewKey = tableView.value
  const tables = first?.[viewKey]?.tables
  const firstTable = Array.isArray(tables) && tables.length ? tables[0] : null
  const rows = firstTable?.rows ?? []
  classifica.value = rows
  classificaTitle.value = firstTable?.name || first?.season?.name || selectedLeague.value?.name || ''
}

function setTableView(view) {
  tableView.value = view
  applyTableView()
}

loadLeghe()
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <div>
          <h1>Classifiche Campionati</h1>
          <p class="subtitle">Dati da BetsAPI</p>
        </div>
        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDark ? 'Passa a tema chiaro' : 'Passa a tema scuro'"
          @click="toggleTheme"
        >
          <span class="theme-icon" aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
          <span class="theme-label">{{ isDark ? 'Chiaro' : 'Scuro' }}</span>
        </button>
      </div>
      <div class="filters">
        <div class="sport-select">
          <label for="sport">Sport</label>
          <select id="sport" v-model.number="sportId" @change="loadLeghe()">
            <option v-for="s in sportOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
        <div class="country-select">
          <label for="country">Paese</label>
          <select id="country" v-model="countryCode" @change="loadLeghe()">
            <option v-for="c in countryOptions" :key="c.value || 'all'" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>
      </div>
    </header>

    <main class="main">
      <aside class="sidebar">
        <LegheList
          :leghe="leghe"
          :loading="legheLoading"
          :error="legheError"
          :pager="leghePager"
          :selected-id="selectedLeague?.id"
          @select="selectLeague"
          @retry="() => loadLeghe()"
          @load-more="loadLeghe($event)"
        />
      </aside>
      <section class="content">
        <ClassificaTable
          v-if="selectedLeague"
          :league-name="classificaTitle || selectedLeague.name"
          :rows="classifica"
          :loading="classificaLoading"
          :error="classificaError"
          :table-view="tableView"
          @update:tableView="setTableView"
          @retry="() => selectLeague(selectedLeague)"
        />
        <div v-else class="placeholder">
          <p>Seleziona un campionato dalla lista per vedere la classifica.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%);
  border-bottom: 2px solid var(--accent);
  box-shadow: 0 4px 20px var(--accent-soft);
}
.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.theme-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-hover);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background 0.2s, border-color 0.2s;
}
.theme-toggle:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.theme-icon {
  font-size: 1.1rem;
  line-height: 1;
}
.theme-label {
  font-weight: 500;
}
.header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  background: linear-gradient(90deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}
.sport-select,
.country-select {
  flex: 0 0 auto;
}
.sport-select label,
.country-select label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.sport-select select,
.country-select select {
  background: var(--surface-hover);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  min-width: 160px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.sport-select select:focus,
.country-select select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.country-select select {
  min-width: 180px;
}
.main {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
  min-height: 0;
}
.sidebar {
  border-right: 1px solid var(--border);
  overflow: auto;
  background: var(--surface);
}
.content {
  overflow: auto;
  padding: 1.5rem 2rem;
  background: var(--bg);
}
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  color: var(--text-muted);
}
@media (max-width: 720px) {
  .main {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
</style>
