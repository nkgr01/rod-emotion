# Assistant émotionnel PWA

Démarrage local:

```bash
cp .env.example .env
# Editez .env et ajoutez votre GEMINI_API_KEY
npm install
npm start
```

Déploiement Docker:

```bash
docker build -t assistant-emotionnel .
docker run -p 3000:3000 --env-file .env assistant-emotionnel
```

Fonctionnalités:
- Backend sécurisé (Express + Helmet + Rate limit)
- PWA (manifest + service worker offline)
- Mémoire locale de conversation
- Synthèse vocale (toggle 🔊)
- Reconnaissance vocale
- Indicateur de frappe et design amélioré
```