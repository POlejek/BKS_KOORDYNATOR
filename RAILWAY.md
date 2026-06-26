# Wdrożenie na Railway (Trial / Free) + GitHub Pages

Backend (Node) i MongoDB hostujemy na Railway, frontend na GitHub Pages (darmowy).

> **Railway Trial:** jednorazowo $5 kredytu na 30 dni, limity jak Hobby (1 GB RAM,
> współdzielony vCPU, do 5 usług/projekt), pozwala uruchamiać bazy. Po wygaśnięciu plan
> Free daje tylko ~$1/mies. — dlatego **bazę warto trzymać na MongoDB Atlas (darmowy M0)**,
> żeby dane przetrwały po wyczerpaniu kredytu.

## 1. Baza danych — MongoDB Atlas (zalecane)

1. Załóż darmowy klaster **M0** na <https://www.mongodb.com/atlas>.
2. Utwórz użytkownika bazy (login + hasło).
3. **Network Access** → dodaj `0.0.0.0/0` (dostęp z Railway).
4. Skopiuj connection string: `mongodb+srv://<user>:<haslo>@.../bks_koordynator`.

> Uwaga: dokumenty zawodników (GridFS) liczą się do limitu 512 MB klastra M0.

*Alternatywa:* w projekcie Railway **+ New → Database → Add MongoDB** i ustaw `MONGODB_URI`
jako referencję do zmiennej połączenia (np. `${{MongoDB.MONGO_URL}}`). Działa, ale baza znika
razem z kredytem Trial.

## 2. Backend na Railway

1. **New Project → Deploy from GitHub repo** → `BKS_KOORDYNATOR`.
2. Settings usługi → **Root Directory = `backend`** (backend jest w podkatalogu).
   Start Command: `npm start` (Node wykryje się sam).
3. **Variables:**
   ```
   MONGODB_URI  = <connection string z Atlas>
   JWT_SECRET   = <długi losowy ciąg, np. `openssl rand -hex 32`>
   FRONTEND_URL = https://<twoj-login>.github.io
   NODE_ENV     = production
   ```
   `PORT` Railway ustawia automatycznie (kod używa `process.env.PORT`).
4. Po deployu: **Settings → Networking → Generate Domain**. Zapisz URL,
   np. `https://bks-backend-production.up.railway.app`.

## 3. Pierwszy administrator (jednorazowo)

```bash
npm i -g @railway/cli
railway login
railway link        # wybierz projekt i usługę backendu
ADMIN_EMAIL=admin@klub.pl ADMIN_PASSWORD=TwojeMocneHaslo \
  railway run npm run seed:admin
```

`railway run` wstrzykuje zmienne usługi, więc skrypt trafi do właściwej bazy.

## 4. Frontend (GitHub Pages)

1. W repo: **Settings → Secrets and variables → Actions → Variables** → dodaj:
   ```
   VITE_API_URL = https://<twój-backend>.up.railway.app/api
   ```
   Workflow `.github/workflows/deploy.yml` użyje jej przy buildzie.
2. Po scaleniu do `main` workflow zbuduje i opublikuje frontend; backend zaktualizuje się
   na Railway (jeśli włączony auto-deploy z `main`).

## 5. Weryfikacja po wdrożeniu

- Otwórz frontend (GitHub Pages) → powinien przekierować na ekran logowania.
- Zaloguj się kontem admina z kroku 3.
- Z konta admina dodaj kolejnych użytkowników (`POST /api/auth/register`).
- Dodaj zawodnika z dokumentem → po redeployu backendu plik nadal dostępny (GridFS).

## Koszt

Backend + baza w trybie ciągłym to orientacyjnie kilka–kilkanaście $/mies. po wyczerpaniu
Trial. Na stałe: plan Hobby ($5/mies. + zużycie) lub baza na Atlas + ewentualne usypianie backendu.
