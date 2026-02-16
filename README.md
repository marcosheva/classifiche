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

## Variabili d’ambiente (Environment)

| Variabile | Obbligatoria | Dove | Descrizione |
|-----------|--------------|------|-------------|
| `VITE_BETSAPI_TOKEN` | Sì (in produzione) | Render → Environment, oppure `.env` in locale | Token API BetsAPI. Senza non funzionano leghe e classifiche. Ottieni il token da [betsapi.com](https://betsapi.com). |
| `PORT` | No | Render la imposta da solo | Porta del server (default 3000 in locale). |

**In locale:** crea un file `.env` nella root del progetto (vedi `.env.example`):

```
VITE_BETSAPI_TOKEN=il_tuo_token_betsapi
```

**Su Render:** dopo aver creato il Web Service vai su **Environment** → **Add Environment Variable** e aggiungi:

- **Key:** `VITE_BETSAPI_TOKEN`  
- **Value:** il tuo token BetsAPI (es. `83845-xxxxx`)

Poi fai **Save Changes** e, se il servizio era già deployato, **Manual Deploy** → **Deploy latest commit** (il token viene usato in fase di build).

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
5. **Environment** → **Add Environment Variable**:
   - **Key:** `VITE_BETSAPI_TOKEN`
   - **Value:** il tuo token BetsAPI (senza non si caricano leghe/classifiche). Vedi sezione *Variabili d’ambiente* sopra.
6. Clicca **Create Web Service**.

Render eseguirà build e avvio; al termine avrai un URL tipo `https://classifiche-campionati-xxx.onrender.com`.

**Nota:** con il piano free il servizio va in sleep dopo inattività; la prima richiesta dopo un po’ può richiedere alcuni secondi.
