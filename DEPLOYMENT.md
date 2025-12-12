# BKS Koordynator - Deployment Guide

## 🚀 Deploy Backend na Railway

### Krok 1: Przygotowanie
1. Utwórz konto na [Railway.app](https://railway.app)
2. Zainstaluj Railway CLI (opcjonalnie):
   ```bash
   npm install -g @railway/cli
   ```

### Krok 2: Deployment

#### Opcja A: Przez przeglądarkę (łatwiejsza)
1. Idź do [railway.app/new](https://railway.app/new)
2. Wybierz "Deploy from GitHub repo"
3. Wybierz `POlejek/BKS_KOORDYNATOR`
4. **WAŻNE**: W ustawieniach projektu (Settings):
   - **Root Directory**: ustaw na `backend`
   - **Builder**: Dockerfile (automatycznie wykryje)
5. Railway rozpocznie build

#### Opcja B: Przez CLI
```bash
cd backend
railway login
railway init
railway up
```

### Krok 3: Dodaj MongoDB
1. W Railway dashboard, kliknij "New" → "Database" → "Add MongoDB"
2. Railway utworzy bazę i zmienną `MONGODB_URI`
3. Backend automatycznie użyje tej zmiennej

### Krok 4: Skonfiguruj zmienne środowiskowe
W Railway dashboard → Variables, dodaj:
```
NODE_ENV=production
FRONTEND_URL=https://polejek.github.io
```

### Krok 5: Skopiuj URL backendu
1. W Railway, znajdź wygenerowany URL (np. `your-app.up.railway.app`)
2. Zaktualizuj `frontend/src/services/api.js`:
   ```javascript
   baseURL: 'https://your-app.up.railway.app/api'
   ```

---

## 🎯 Alternatywne opcje hostowania

### Render.com (również darmowy)
1. Utwórz konto na [render.com](https://render.com)
2. New → Web Service
3. Połącz GitHub repo
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add MongoDB przez Render lub MongoDB Atlas

### MongoDB Atlas (darmowa baza danych)
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Utwórz darmowy cluster (M0)
3. Skopiuj connection string
4. Dodaj jako zmienną `MONGODB_URI` w Railway/Render

---

## 📝 Checklist przed deploym:
- [ ] Backend działa lokalnie
- [ ] Utworzono konto Railway/Render
- [ ] Dodano MongoDB (Atlas lub Railway)
- [ ] Zaktualizowano CORS w `server.js`
- [ ] Zaktualizowano `api.js` z URL backendu
- [ ] Push do GitHub
- [ ] Deploy backendu
- [ ] Deploy frontendu (GitHub Pages)
- [ ] Przetestowano aplikację online

---

## 🔧 Troubleshooting

### Backend nie startuje
- Sprawdź logi w Railway/Render dashboard
- Upewnij się że `MONGODB_URI` jest ustawiony
- Sprawdź czy port jest prawidłowy

### Błędy CORS
- Upewnij się że `FRONTEND_URL` zawiera poprawny URL GitHub Pages
- Sprawdź czy backend ma skonfigurowany CORS

### Baza danych nie łączy się
- Sprawdź connection string MongoDB
- W MongoDB Atlas: dodaj IP `0.0.0.0/0` do whitelist
- Sprawdź hasło i username
