<script setup>
import { ref, computed } from 'vue'

const STORAGE_KEY = 'classifiche-favorite-leagues'

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(f => {
      if (typeof f === 'string') return { id: f, name: 'Lega', cc: null }
      if (f && (f.id != null)) return { id: f.id, name: f.name || 'Lega', cc: f.cc ?? null }
      return null
    }).filter(Boolean)
  } catch {
    return []
  }
}

const props = defineProps({
  leghe: { type: Array, default: () => [] },
  loading: Boolean,
  error: { type: String, default: null },
  pager: { type: Object, default: null },
  selectedId: { type: [String, Number], default: null },
})
const emit = defineEmits(['select', 'retry', 'load-more'])

const searchQuery = ref('')
const favoriteLeagues = ref(loadFavorites())

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteLeagues.value))
}

function toggleFavorite(leg, e) {
  e.stopPropagation()
  const id = String(leg.id)
  const idx = favoriteLeagues.value.findIndex(f => String(f.id) === id)
  if (idx === -1) {
    favoriteLeagues.value = [...favoriteLeagues.value, { id: leg.id, name: leg.name, cc: leg.cc ?? null }]
  } else {
    favoriteLeagues.value = favoriteLeagues.value.filter(f => String(f.id) !== id)
  }
  saveFavorites()
}

function removeFavorite(fav, e) {
  e.stopPropagation()
  favoriteLeagues.value = favoriteLeagues.value.filter(f => String(f.id) !== String(fav.id))
  saveFavorites()
}

function isFavorite(leagueId) {
  return favoriteLeagues.value.some(f => String(f.id) === String(leagueId))
}

const currentListIds = computed(() => new Set(favoriteLeagues.value.map(f => String(f.id))))

const filteredLeghe = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = !q
    ? props.leghe
    : props.leghe.filter(leg => {
        const name = (leg.name || '').toLowerCase()
        const cc = (leg.cc || '').toLowerCase()
        return name.includes(q) || cc.includes(q)
      })
  return list.filter(leg => !currentListIds.value.has(String(leg.id)))
})

const hasMore = computed(() => {
  const p = props.pager
  if (!p) return false
  if (p.min_id != null && p.min_id > 0) return true
  if (p.page != null && p.per_page != null && p.total != null) {
    return p.page * p.per_page < p.total
  }
  return false
})

function loadMore() {
  const p = props.pager
  if (!p) return
  if (p.min_id != null && p.min_id > 0) {
    emit('load-more', { maxId: p.min_id })
    return
  }
  if (p.page != null && p.per_page != null && p.total != null && p.page * p.per_page < p.total) {
    emit('load-more', { page: p.page + 1 })
  }
}
</script>

<template>
  <div class="leghe-list">
    <h2 class="title">Campionati</h2>
    <div v-if="!loading && !error && leghe.length" class="search-wrap">
      <input
        v-model.trim="searchQuery"
        type="search"
        class="search-input"
        placeholder="Cerca lega..."
        autocomplete="off"
      />
    </div>
    <div v-if="loading" class="state loading">Caricamento leghe…</div>
    <div v-else-if="error" class="state error">
      <p>{{ error }}</p>
      <button type="button" class="btn-retry" @click="$emit('retry')">Riprova</button>
    </div>
    <template v-else-if="leghe.length || favoriteLeagues.length">
      <!-- Sezione preferiti in alto (tutte le nazioni) -->
      <template v-if="favoriteLeagues.length">
        <div class="section-label preferiti-label">Preferiti</div>
        <ul class="list list-favorites">
          <li
            v-for="fav in favoriteLeagues"
            :key="'fav-' + fav.id"
            class="item item-favorite"
            :class="{ active: selectedId === fav.id }"
            @click="$emit('select', fav)"
          >
            <button
              type="button"
              class="btn-fav on"
              aria-label="Rimuovi dai preferiti"
              @click.stop="removeFavorite(fav, $event)"
            >
              <span class="star">★</span>
            </button>
            <span class="name">{{ fav.name }}</span>
            <span v-if="fav.cc" class="cc">{{ fav.cc }}</span>
          </li>
        </ul>
      </template>

      <!-- Altri campionati (lista corrente, senza duplicati) -->
      <template v-if="leghe.length">
        <div class="section-label" v-if="favoriteLeagues.length">Altri campionati</div>
        <ul class="list">
          <li
            v-for="leg in filteredLeghe"
            :key="leg.id"
            class="item"
            :class="{ active: selectedId === leg.id }"
            @click="$emit('select', leg)"
          >
            <button
              type="button"
              class="btn-fav"
              aria-label="Aggiungi ai preferiti"
              @click.stop="toggleFavorite(leg, $event)"
            >
              <span class="star">☆</span>
            </button>
            <span class="name">{{ leg.name }}</span>
            <span v-if="leg.cc" class="cc">{{ leg.cc }}</span>
          </li>
        </ul>
      </template>
      <div v-if="leghe.length && filteredLeghe.length === 0 && searchQuery" class="state empty-search">
        Nessuna lega trovata per "{{ searchQuery }}".
      </div>
      <div v-else-if="leghe.length && hasMore && !searchQuery" class="load-more">
        <button
          type="button"
          class="btn-load-more"
          :disabled="loading"
          @click="loadMore"
        >
          {{ loading ? 'Caricamento…' : 'Carica altre leghe' }}
        </button>
      </div>
    </template>
    <div v-else class="state empty">Nessuna lega con classifica disponibile.</div>
  </div>
</template>

<style scoped>
.leghe-list {
  padding: 1rem 0;
}
.title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1.25rem;
  margin-bottom: 0.75rem;
}
.search-wrap {
  padding: 0 1.25rem 0.75rem;
}
.search-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input::placeholder {
  color: var(--text-muted);
}
.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.6rem 1.25rem 0.35rem;
  margin-top: 0.25rem;
}
.section-label:first-of-type {
  margin-top: 0;
}
.section-label.preferiti-label {
  color: var(--gold);
}
.list {
  list-style: none;
}
.list-favorites {
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.25rem;
  margin-bottom: 0.25rem;
}
.item {
  padding: 0.5rem 1.25rem 0.5rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  transition: background 0.15s;
}
.item:hover {
  background: var(--surface-hover);
}
.item.active {
  background: var(--accent-soft);
  border-left: 4px solid var(--accent);
  padding-left: calc(0.5rem - 4px);
}
.item.active .name {
  color: var(--text);
  font-weight: 600;
}
.item.favorite .name {
  font-weight: 500;
}
.btn-fav {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, transform 0.1s;
}
.btn-fav:hover {
  color: var(--gold);
  background: var(--gold-soft);
}
.btn-fav.on {
  color: var(--gold);
}
.btn-fav .star {
  font-size: 1.1rem;
  line-height: 1;
}
.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
}
.cc {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  flex-shrink: 0;
}
.load-more {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border);
}
.btn-load-more {
  width: 100%;
  background: var(--surface-hover);
  color: var(--accent);
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  transition: background 0.2s, color 0.2s;
}
.btn-load-more:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent-hover);
}
.btn-load-more:disabled {
  opacity: 0.7;
  cursor: wait;
}
.state {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.state.error p {
  margin-bottom: 0.75rem;
}
.state.empty-search {
  padding: 1rem 1.25rem;
  font-size: 0.85rem;
}
.btn-retry {
  background: var(--accent);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  transition: background 0.2s, transform 0.1s;
}
.btn-retry:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}
</style>
