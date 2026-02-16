<script setup>
const props = defineProps({
  leagueName: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  loading: Boolean,
  error: { type: String, default: null },
  tableView: { type: String, default: 'overall' },
})
defineEmits(['retry', 'update:tableView'])

function played(row) {
  const w = parseInt(row.win, 10) || 0
  const d = parseInt(row.draw, 10) || 0
  const l = parseInt(row.loss, 10) || 0
  return w + d + l
}

// Stemmi squadre BetsAPI: https://assets.b365api.com/images/team/{s|m|b}/{image_id}.png
function teamLogoUrl(imageId, size = 's') {
  if (!imageId) return null
  return `https://assets.b365api.com/images/team/${size}/${imageId}.png`
}
</script>

<template>
  <div class="classifica">
    <h2 class="league-name">{{ leagueName }}</h2>

    <div v-if="!loading && !error && rows.length" class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: tableView === 'overall' }"
        @click="$emit('update:tableView', 'overall')"
      >
        Generale
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: tableView === 'home' }"
        @click="$emit('update:tableView', 'home')"
      >
        Casa
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: tableView === 'away' }"
        @click="$emit('update:tableView', 'away')"
      >
        Trasferta
      </button>
    </div>

    <div v-if="loading" class="state loading">Caricamento classifica…</div>
    <div v-else-if="error" class="state error">
      <p>{{ error }}</p>
      <button type="button" class="btn-retry" @click="$emit('retry')">Riprova</button>
    </div>
    <div v-else-if="rows.length" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="pos">#</th>
            <th class="squadra">Squadra</th>
            <th class="num">G</th>
            <th class="num">V</th>
            <th class="num">N</th>
            <th class="num">P</th>
            <th class="num">GF</th>
            <th class="num">GS</th>
            <th class="num">DR</th>
            <th class="num">Pt</th>
            <th class="note">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in rows"
            :key="row.team?.id || i"
            :class="{ 'top-row': i < 3 }"
          >
            <td class="pos">{{ row.pos }}</td>
            <td class="squadra">
              <span class="team-cell">
                <img
                  v-if="row.team?.image_id"
                  :src="teamLogoUrl(row.team.image_id)"
                  :alt="row.team.name"
                  class="team-logo"
                  loading="lazy"
                  @error="($event.target).style.display = 'none'"
                />
                <span class="team-logo-placeholder" v-else></span>
                <span class="team-name">{{ row.team?.name || '–' }}</span>
              </span>
            </td>
            <td class="num">{{ played(row) }}</td>
            <td class="num">{{ row.win ?? '–' }}</td>
            <td class="num">{{ row.draw ?? '–' }}</td>
            <td class="num">{{ row.loss ?? '–' }}</td>
            <td class="num">{{ row.goalsfor ?? '–' }}</td>
            <td class="num">{{ row.goalsagainst ?? '–' }}</td>
            <td class="num">{{ row.goalDiffTotal != null ? (row.goalDiffTotal > 0 ? '+' + row.goalDiffTotal : row.goalDiffTotal) : '–' }}</td>
            <td class="num points">{{ row.points ?? '–' }}</td>
            <td class="note">{{ row.promotion?.shortname || row.promotion?.name || '–' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="state empty">Nessun dato classifica per questa lega.</div>
  </div>
</template>

<style scoped>
.classifica {
  max-width: 960px;
}
.league-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text);
}
.tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.tab {
  background: var(--surface);
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.tab:hover {
  color: var(--text);
  background: var(--surface-hover);
  border-color: var(--accent);
}
.tab.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.35);
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.table th,
.table td {
  padding: 0.6rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.table th {
  font-weight: 600;
  color: var(--accent);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--surface-hover);
}
.table .pos { text-align: center; width: 2.5rem; }
.table .num { text-align: center; min-width: 2.25rem; }
.table .points { font-weight: 700; color: var(--accent); }
.table .squadra { min-width: 200px; }
.team-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.team-logo,
.team-logo-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
  background: var(--surface-hover);
}
.team-logo-placeholder {
  background: var(--border);
}
.team-name {
  font-weight: 500;
}
.table .note { min-width: 70px; font-size: 0.8rem; color: var(--text-muted); }
.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover {
  background: var(--surface-hover);
}
.table tbody tr.top-row {
  font-weight: 600;
  background: var(--gold-soft);
}
.table tbody tr.top-row:nth-child(1) {
  background: linear-gradient(90deg, var(--gold-soft) 0%, transparent 100%);
}
.table tbody tr.top-row .points {
  color: var(--gold);
}
.state {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.state.error p {
  margin-bottom: 0.75rem;
}
.btn-retry {
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background 0.2s, transform 0.1s;
}
.btn-retry:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}
</style>
