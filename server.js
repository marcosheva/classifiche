import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Proxy API BetsAPI (evita CORS in produzione)
app.use('/api-bets', createProxyMiddleware({
  target: 'https://api.b365api.com',
  changeOrigin: true,
  pathRewrite: { '^/api-bets': '' },
}))

// Static build Vue
app.use(express.static(path.join(__dirname, 'dist')))

// SPA: tutte le route non trovate → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`)
})
