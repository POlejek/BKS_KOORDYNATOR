# BKS Koordynator - System Zarządzania Klubem Sportowym

System do kompleksowego zarządzania klubem sportowym dla koordynatorów i trenerów.

## Funkcjonalności

### 1. Zarządzanie Drużynami
- Tworzenie i edycja drużyn
- Przypisywanie trenerów
- Określanie roczników

### 2. Zarządzanie Zawodnikami
- Rejestracja zawodników (imię, nazwisko, data urodzenia)
- Okres ważności badań lekarskich
- Upload dokumentów (PDF/JPG):
  - Badania lekarskie
  - Deklaracja Gry Amatora
  - Inne dokumenty
- Filtrowanie zawodników po drużynach
- Wizualna kontrola ważności badań

### 3. Lista Obecności
- Kalendarzowy widok obecności
- Zaznaczanie dni treningowych
- Statusy obecności:
  - Obecny
  - Nieobecny
  - Usprawiedliwiony
  - Spóźniony
- Filtrowanie po miesiącach i drużynach
- Szybkie wprowadzanie obecności dla całej drużyny

### 4. Plan Szkoleniowy
- Wybór dominującej fazy gry (5 opcji)
- DNA Techniki (wybór 1-6 elementów)
- Cele Motoryczne (wielokrotny wybór)
- Cele Mentalne (wielokrotny wybór)
- Struktura Treningu (własny opis trenera)
- Opis Celów + wybrane zasady
- Automatyczne wczytywanie założeń na podstawie numeru treningu w tygodniu (1-4)

### 5. Ustawienia Klubu (Panel Administratora)
- Zarządzanie DNA Techniki
- Zarządzanie Celami Motorycznymi
- Zarządzanie Celami Mentalnymi
- Definiowanie założeń dla każdego z 4 treningów w tygodniu

## Technologie

### Backend
- **Node.js** + **Express** - serwer REST API
- **MongoDB** + **Mongoose** - baza danych
- **Multer** + **GridFS** - upload i trwałe przechowywanie plików w MongoDB
- **JWT** + **bcryptjs** - autoryzacja i role użytkowników
- **helmet** + **express-rate-limit** - utwardzenie bezpieczeństwa
- **express-validator** - walidacja danych wejściowych
- **CORS** (allowlista) - kontrolowany cross-origin
- **Jest** + **supertest** - testy API
- **dotenv** - zarządzanie zmiennymi środowiskowymi

### Frontend
- **React 18** - biblioteka UI
- **Vite** - bundler i dev server
- **Material-UI (MUI)** - komponenty UI
- **React Router** - routing
- **Axios** - komunikacja z API
- **date-fns** - operacje na datach

## Instalacja

### Wymagania
- Node.js (v18 lub wyższy)
- MongoDB (lokalnie lub MongoDB Atlas)

### Backend

```bash
cd backend
npm install
```

Skonfiguruj plik `.env` (wzór w `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bks_koordynator
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dlugi-losowy-sekret
JWT_TTL=8h
```

Uruchom serwer:
```bash
npm run dev    # tryb development z nodemon
npm start      # tryb production
npm test       # testy (Jest + supertest)
npm run lint   # ESLint
```

Utwórz pierwszego administratora (jednorazowo):
```bash
ADMIN_EMAIL=admin@klub.pl ADMIN_PASSWORD=TwojeHaslo123 npm run seed:admin
```

### Frontend

```bash
cd frontend
npm install
```

Uruchom aplikację:
```bash
npm run dev    # tryb development
npm run build  # build produkcyjny
```

## Logowanie i role

Aplikacja wymaga zalogowania. Dostępne role:

- **admin** – pełny dostęp, w tym zarządzanie użytkownikami i ustawieniami klubu
- **koordynator** – pełny CRUD danych (drużyny, zawodnicy, ustawienia)
- **trener** – odczyt oraz edycja obecności, planów i kontroli meczowych

Nowych użytkowników tworzy administrator (endpoint `POST /api/auth/register`).

## Bezpieczeństwo i przechowywanie plików

- Wszystkie trasy `/api/*` (poza logowaniem) wymagają tokenu JWT (nagłówek `Authorization: Bearer`).
- Dokumenty zawodników są przechowywane w **GridFS (MongoDB)**, dzięki czemu nie giną przy
  redeployu na środowiskach o efemerycznym dysku (np. Railway).
- Włączone: `helmet`, limit zapytań (`express-rate-limit`), allowlista CORS (`FRONTEND_URL`),
  walidacja wejścia (`express-validator`).

## Testy i jakość

```bash
# Backend
cd backend && npm test && npm run lint

# Frontend
cd frontend && npm test && npm run lint
```

CI (GitHub Actions, `.github/workflows/ci.yml`) uruchamia lint + testy dla obu części oraz build frontu.

## Użytkowanie

1. **Konfiguracja klubu** - Przejdź do Ustawień i zdefiniuj:
   - DNA Techniki
   - Cele Motoryczne
   - Cele Mentalne
   - Założenia dla 4 treningów w tygodniu

2. **Dodaj drużyny** - Utwórz drużyny z przypisanymi trenerami

3. **Dodaj zawodników** - Zarejestruj zawodników z dokumentami i przypisz do drużyn

4. **Prowadź obecności** - Wybierz drużynę, miesiąc i zaznaczaj obecności na treningach

5. **Twórz plany szkoleniowe** - Dla każdego treningu wypełnij plan z fazami gry i celami

## Autor

© 2024 BKS Koordynator
