# Deploy

Il frontend Gedosan è una SPA statica. Viene buildato in un'immagine Docker e servito
da nginx. L'autenticazione admin avviene sul backend
(`POST /api/auth/login`), che è un servizio separato.

## File

| File | Ruolo |
|---|---|
| `Dockerfile` | build multi-stage: Node 22 compila (`npm ci` + `npm run build`), poi `nginx:alpine` serve `dist/Gedosan/browser` |
| `nginx.conf` | fallback SPA su `index.html`, gzip, cache lunga sugli asset con hash, header di sicurezza |
| `docker-compose.yml` | servizio `gedosan`, `restart: unless-stopped` |
| `.dockerignore` | esclude `node_modules`, `dist`, doc, ecc. dal contesto di build |
| `.github/workflows/deploy.yml` | ad ogni push su `main` (o avvio manuale) gira sul runner self-hosted: checkout + `docker compose up -d --build` |

## Prerequisiti sul server

1. Docker + plugin `docker compose`.
2. GitHub Actions **self-hosted runner** registrato per il repo e attivo come servizio.
3. Un reverse proxy (es. Nginx Proxy Manager) che mappa il dominio pubblico.

## Flusso

Push su `main` → il runner sul server esegue il workflow → ricostruisce l'immagine dal
codice del repo e riavvia il container. Nessun registry, nessun trasferimento file manuale.

Deploy manuale: **Actions → Deploy → Run workflow**, oppure sul server:

```bash
docker compose up -d --build
```
