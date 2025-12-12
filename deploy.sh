#!/bin/bash

echo "🚀 BKS Koordynator - Quick Deploy Script"
echo ""

# Sprawdź czy jesteśmy w głównym katalogu
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Uruchom skrypt z głównego katalogu projektu!"
    exit 1
fi

echo "📦 Instalowanie zależności backendu..."
cd backend
npm install
cd ..

echo "📦 Instalowanie zależności frontendu..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Instalacja zakończona!"
echo ""
echo "📝 Następne kroki:"
echo ""
echo "1. Deploy Backend na Railway:"
echo "   - Idź do https://railway.app/new"
echo "   - Wybierz 'Deploy from GitHub repo'"
echo "   - Wybierz POlejek/BKS_KOORDYNATOR"
echo "   - Dodaj MongoDB database"
echo "   - Skopiuj wygenerowany URL"
echo ""
echo "2. Zaktualizuj URL backendu:"
echo "   - Edytuj: frontend/src/services/api.js"
echo "   - Zamień 'your-app.up.railway.app' na swój URL"
echo ""
echo "3. Commit i push:"
echo "   git add ."
echo "   git commit -m 'Configure deployment'"
echo "   git push origin main"
echo ""
echo "4. Frontend automatycznie wdroży się na GitHub Pages"
echo ""
echo "📖 Pełna dokumentacja: DEPLOYMENT.md"
