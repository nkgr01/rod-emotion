#!/bin/bash

# Script de démarrage pour l'Assistant Émotionnel
# Usage: ./start.sh [port]

echo "🤖 Démarrage de l'Assistant Émotionnel Intelligent..."
echo "=================================================="

# Port par défaut
PORT=${1:-8000}

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Vérifier si Python est installé
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si le fichier config.js existe
if [ ! -f "config.js" ]; then
    echo "❌ Fichier config.js manquant. Veuillez le créer d'abord."
    echo "💡 Copiez config.js.example et configurez votre clé API."
    exit 1
fi

# Vérifier si la clé API est configurée
if grep -q "YOUR_API_KEY_HERE" config.js; then
    echo "⚠️  Attention: Votre clé API n'est pas configurée."
    echo "   Veuillez modifier config.js avec votre vraie clé API."
    echo "   Obtenez une clé gratuite sur: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Démarrage annulé."
        exit 1
    fi
fi

# Vérifier si les icônes PWA existent
if [ ! -d "icons" ] || [ -z "$(ls -A icons 2>/dev/null)" ]; then
    echo "⚠️  Dossier icons manquant ou vide. Les fonctionnalités PWA peuvent ne pas fonctionner correctement."
    echo "   Créez des icônes aux formats requis (16x16 à 512x512) dans le dossier icons/"
fi

echo "✅ Prérequis vérifiés."
echo ""

# Démarrer le serveur
echo "🚀 Démarrage du serveur sur le port $PORT..."
echo "📱 Ouvrez votre navigateur sur: http://localhost:$PORT"
echo "🔄 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Démarrer le serveur Python
$PYTHON_CMD -m http.server $PORT

echo ""
echo "👋 Serveur arrêté. Au revoir !"