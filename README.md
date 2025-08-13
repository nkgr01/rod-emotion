# 🤖 Assistant Émotionnel Intelligent

Un assistant émotionnel basé sur l'IA, conçu pour accompagner votre bien-être quotidien avec une interface moderne et des fonctionnalités avancées.

## ✨ Fonctionnalités

### 🧠 Intelligence Améliorée
- **Analyse émotionnelle avancée** : L'IA analyse votre état émotionnel et adapte ses réponses
- **Conseils personnalisés** : Suggestions basées sur la psychologie positive
- **Conversations contextuelles** : L'assistant se souvient du contexte de vos échanges
- **Suggestions de conversation** : Chips prédéfinies pour démarrer facilement

### 🔒 Sécurité Renforcée
- **Validation des entrées** : Protection contre les messages trop longs ou malveillants
- **Rate limiting** : Limitation du nombre de messages pour éviter le spam
- **Configuration sécurisée** : Gestion séparée des clés API
- **Validation côté client** : Vérifications avant envoi des données

### 🎨 Design Moderne
- **Interface responsive** : S'adapte à tous les appareils (mobile, tablette, desktop)
- **Thèmes clair/sombre** : Basculement automatique selon vos préférences
- **Animations fluides** : Transitions et effets visuels modernes
- **Typographie optimisée** : Police Inter pour une meilleure lisibilité

### 📱 Application PWA (Progressive Web App)
- **Installation sur appareil** : Utilisez l'app comme une application native
- **Fonctionnement hors ligne** : Service worker pour le cache
- **Icônes adaptatives** : Icônes optimisées pour tous les formats
- **Manifest complet** : Métadonnées pour une expérience native

### 🚀 Fonctionnalités Avancées
- **Historique des conversations** : Sauvegarde et consultation des échanges passés
- **Export des conversations** : Téléchargement au format texte
- **Reconnaissance vocale** : Parlez à votre assistant
- **Notifications** : Alertes et rappels personnalisables
- **Multi-langues** : Support français, anglais, espagnol
- **Auto-resize** : Zone de texte qui s'adapte au contenu

## 🛠️ Installation

### Prérequis
- Navigateur moderne (Chrome 70+, Firefox 65+, Safari 12+)
- Clé API Google Gemini (gratuite)
- Serveur web (local ou hébergé)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone [URL_DU_REPO]
   cd assistant-emotionnel
   ```

2. **Configurer l'API**
   - Obtenez une clé API gratuite sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Modifiez `config.js` et remplacez `YOUR_API_KEY_HERE` par votre vraie clé

3. **Créer les icônes PWA** (optionnel)
   - Générez des icônes aux formats : 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - Placez-les dans le dossier `icons/`
   - Utilisez des outils comme [PWA Image Generator](https://tools.crawlink.com/tools/pwa-icon-generator/)

4. **Démarrer le serveur**
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js
   npx serve .
   
   # Avec PHP
   php -S localhost:8000
   ```

5. **Accéder à l'application**
   - Ouvrez votre navigateur
   - Allez sur `http://localhost:8000`
   - L'application se chargera automatiquement

## 🔧 Configuration

### Fichier config.js
```javascript
const CONFIG = {
    API_KEY: 'VOTRE_CLE_API_ICI',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
    MAX_MESSAGE_LENGTH: 1000,
    RATE_LIMIT_DELAY: 1000,
    ENABLE_VOICE: true,
    ENABLE_HISTORY: true,
    ENABLE_EXPORT: true,
    ENABLE_SUGGESTIONS: true
};
```

### Variables d'environnement (recommandé pour la production)
```bash
# .env
GEMINI_API_KEY=votre_cle_api
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent
```

## 📱 Installation PWA

### Sur Mobile
1. Ouvrez l'application dans Chrome/Safari
2. Appuyez sur "Ajouter à l'écran d'accueil"
3. L'application s'installera comme une app native

### Sur Desktop
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Confirmez l'installation
3. L'app apparaîtra dans vos applications

## 🎯 Utilisation

### Première utilisation
1. **Démarrage** : L'assistant vous accueille avec un message personnalisé
2. **Conversation** : Décrivez vos émotions ou posez vos questions
3. **Suggestions** : Utilisez les chips prédéfinies pour commencer
4. **Personnalisation** : Ajustez les paramètres selon vos préférences

### Fonctionnalités principales
- **Chat textuel** : Écrivez vos messages dans la zone de saisie
- **Reconnaissance vocale** : Cliquez sur le bouton microphone pour parler
- **Historique** : Accédez à vos conversations passées via le bouton historique
- **Export** : Téléchargez vos conversations au format texte
- **Thèmes** : Basculez entre thème clair et sombre

### Conseils d'utilisation
- **Soyez spécifique** : Plus vous détaillez vos émotions, mieux l'IA peut vous aider
- **Utilisez les suggestions** : Les chips prédéfinies sont un bon point de départ
- **Consultez l'historique** : Revenez sur vos échanges pour suivre votre progression
- **Personnalisez** : Ajustez les paramètres selon vos préférences

## 🔒 Sécurité et Confidentialité

### Protection des données
- **Stockage local** : Vos conversations restent sur votre appareil
- **Pas de serveur central** : Communication directe avec l'API Google
- **Validation stricte** : Toutes les entrées sont vérifiées avant traitement

### Bonnes pratiques
- **Clé API sécurisée** : Ne partagez jamais votre clé API
- **HTTPS obligatoire** : Utilisez toujours HTTPS en production
- **Mise à jour régulière** : Gardez l'application à jour

## 🚀 Déploiement en Production

### Hébergement recommandé
- **Netlify** : Déploiement gratuit et automatique
- **Vercel** : Performance optimale et CDN global
- **GitHub Pages** : Hébergement gratuit pour projets open source
- **Serveur VPS** : Contrôle total et personnalisation avancée

### Configuration production
1. **Variables d'environnement** : Configurez vos clés API
2. **HTTPS** : Activez le certificat SSL
3. **Cache** : Optimisez le service worker
4. **Monitoring** : Surveillez les performances et erreurs

## 🐛 Dépannage

### Problèmes courants

#### L'API ne répond pas
- Vérifiez votre clé API dans `config.js`
- Assurez-vous que l'URL de l'API est correcte
- Vérifiez votre quota Google AI

#### Reconnaissance vocale ne fonctionne pas
- Utilisez HTTPS (obligatoire pour la reconnaissance vocale)
- Vérifiez les permissions du navigateur
- Testez sur un autre navigateur

#### L'application ne s'installe pas
- Vérifiez que le service worker est enregistré
- Assurez-vous que le manifest.json est accessible
- Testez sur un appareil mobile

#### Thème sombre ne s'applique pas
- Vérifiez que les variables CSS sont bien définies
- Assurez-vous que le JavaScript s'exécute correctement
- Videz le cache du navigateur

### Logs et débogage
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs JavaScript
- Surveillez les requêtes réseau
- Testez les fonctionnalités une par une

## 🤝 Contribution

### Comment contribuer
1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité
3. **Commitez** vos changements
4. **Poussez** vers la branche
5. **Ouvrez** une Pull Request

### Améliorations suggérées
- [ ] Support de plus de langues
- [ ] Intégration avec d'autres APIs IA
- [ ] Mode hors ligne avancé
- [ ] Synchronisation cloud
- [ ] Analytics et métriques
- [ ] Tests automatisés

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Google AI** pour l'API Gemini
- **Font Awesome** pour les icônes
- **Inter** pour la typographie
- **La communauté open source** pour l'inspiration

## 📞 Support

### Contact
- **Issues GitHub** : Signalez les bugs et demandez des fonctionnalités
- **Discussions** : Échangez avec la communauté
- **Wiki** : Documentation détaillée et tutoriels

### Ressources utiles
- [Documentation Google AI](https://ai.google.dev/)
- [Guide PWA](https://web.dev/progressive-web-apps/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Développé avec ❤️ pour améliorer votre bien-être quotidien**

*N'oubliez pas : cet assistant est un outil de support, pas un remplaçant pour un professionnel de santé.*