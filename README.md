# Classifiche Campionati

Sito Vue che mostra le classifiche dei campionati usando i dati di [BetsAPI](https://betsapi.com).

## Avvio in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173).

## Build e anteprima

```bash
npm run build
npm run start
```

Poi apri [http://localhost:3000](http://localhost:3000). In produzione il server Express serve i file statici e fa da proxy per l’API BetsAPI (evita CORS).

## Token BetsAPI

Il token è in `src/api/betsapi.js` o in variabile d’ambiente `VITE_BETSAPI_TOKEN` (file `.env` in locale). Su Render imposta **Environment** → `VITE_BETSAPI_TOKEN` = il tuo token (usato in fase di build).

---

## Pubblicare su GitHub e Render

### 1. Inviare il progetto su GitHub

Se non hai ancora un repository:

1. Crea un nuovo repository su [GitHub](https://github.com/new) (es. `classifiche-campionati`), **senza** README né .gitignore.
2. Nella cartella del progetto apri il terminale e esegui:

```bash
git init
git add .
git commit -m "Initial commit: classifiche campionati Vue + BetsAPI"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/classifiche-campionati.git
git push -u origin main
```

Sostituisci `TUO-USERNAME` e `classifiche-campionati` con il tuo utente e il nome del repo.

### 2. Deploy su Render

1. Vai su [render.com](https://render.com) e accedi (anche con GitHub).
2. **New** → **Web Service**.
3. Collega il repository GitHub (autorizza Render se serve) e seleziona il repo del progetto.
4. Imposta:
   - **Name:** `classifiche-campionati` (o come preferisci)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free (se disponibile)
5. (Opzionale) **Environment** → aggiungi:
   - `VITE_BETSAPI_TOKEN` = il tuo token BetsAPI (per il build)
6. Clicca **Create Web Service**.

Render eseguirà build e avvio; al termine avrai un URL tipo `https://classifiche-campionati-xxx.onrender.com`.

**Nota:** con il piano free il servizio va in sleep dopo inattività; la prima richiesta dopo un po’ può richiedere alcuni secondi.
