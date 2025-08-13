
// Configuration et initialisation
class AssistantEmotionnel {
    constructor() {
        this.conversationHistory = [];
        this.currentTheme = 'light';
        this.isTyping = false;
        this.lastMessageTime = 0;
        this.rateLimitDelay = 1000; // 1 seconde entre les messages
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.setupPWA();
        this.setWelcomeTime();
        this.loadConversationHistory();
    }

    setupEventListeners() {
        // Boutons principaux
        this.sendButton = document.getElementById('send-button');
        this.userInput = document.getElementById('user-input');
        this.chatMessages = document.getElementById('chat-messages');
        
        // Boutons de navigation
        this.themeToggle = document.getElementById('theme-toggle');
        this.settingsBtn = document.getElementById('settings-btn');
        this.historyBtn = document.getElementById('history-btn');
        
        // Boutons d'action
        this.clearChatBtn = document.getElementById('clear-chat');
        this.exportChatBtn = document.getElementById('export-chat');
        this.startVoiceBtn = document.getElementById('start-voice');
        
        // Boutons de la sidebar
        this.closeSidebarBtn = document.getElementById('close-sidebar');
        
        // Boutons du modal
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.themeSelect = document.getElementById('theme-select');
        this.languageSelect = document.getElementById('language-select');
        this.notificationsToggle = document.getElementById('notifications-toggle');
        
        // Boutons PWA
        this.pwaInstallBtn = document.getElementById('pwa-install-btn');
        this.pwaDismissBtn = document.getElementById('pwa-dismiss-btn');
        
        // Suggestions
        this.suggestionChips = document.querySelectorAll('.suggestion-chip');
        
        // Événements
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.userInput.addEventListener('input', () => this.updateCharCount());
        
        // Navigation
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.historyBtn.addEventListener('click', () => this.showHistory());
        this.closeSidebarBtn.addEventListener('click', () => this.hideSidebar());
        
        // Actions du chat
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.exportChatBtn.addEventListener('click', () => this.exportChat());
        
        // Modal
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        this.notificationsToggle.addEventListener('change', (e) => this.toggleNotifications(e.target.checked));
        
        // PWA
        this.pwaInstallBtn.addEventListener('click', () => this.installPWA());
        this.pwaDismissBtn.addEventListener('click', () => this.dismissPWAPrompt());
        
        // Suggestions
        this.suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => this.useSuggestion(chip.dataset.suggestion));
        });
        
        // Reconnaissance vocale
        this.setupVoiceRecognition();
        
        // Auto-resize du textarea
        this.setupTextareaAutoResize();
    }

    setupTextareaAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    updateCharCount() {
        const count = this.userInput.value.length;
        document.getElementById('char-count').textContent = count;
        
        if (count > 800) {
            document.getElementById('char-count').style.color = 'var(--accent-warning)';
        } else if (count > 900) {
            document.getElementById('char-count').style.color = 'var(--accent-danger)';
        } else {
            document.getElementById('char-count').style.color = 'var(--text-muted)';
        }
    }

    setWelcomeTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('welcome-time').textContent = timeString;
    }

    async handleUserInput() {
        const userMessage = this.userInput.value.trim();
        
        if (!userMessage) return;
        
        // Vérification du rate limiting
        const now = Date.now();
        if (now - this.lastMessageTime < this.rateLimitDelay) {
            this.showNotification('Veuillez attendre un peu avant d\'envoyer un autre message.', 'warning');
            return;
        }
        
        // Validation de la longueur
        if (userMessage.length > CONFIG.MAX_MESSAGE_LENGTH) {
            this.showNotification('Message trop long. Maximum 1000 caractères.', 'error');
            return;
        }
        
        this.lastMessageTime = now;
        
        // Ajout du message utilisateur
        this.addMessage(userMessage, true);
        this.userInput.value = '';
        this.updateCharCount();
        
        // Désactivation des boutons
        this.setInputState(false);
        
        // Affichage de l'indicateur de frappe
        this.showTypingIndicator();
        
        try {
            // Génération de la réponse IA
            const botMessage = await this.generateResponse(userMessage);
            this.addMessage(botMessage, false);
            
            // Sauvegarde de la conversation
            this.saveConversation(userMessage, botMessage);
            
        } catch (error) {
            console.error('Erreur:', error);
            this.addMessage('Désolé, une erreur s\'est produite. Veuillez réessayer.', false);
        } finally {
            this.setInputState(true);
            this.hideTypingIndicator();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleUserInput();
        }
    }

    setInputState(enabled) {
        this.sendButton.disabled = !enabled;
        this.userInput.disabled = !enabled;
        this.startVoiceBtn.disabled = !enabled;
        
        if (enabled) {
            this.userInput.focus();
        }
    }

    showTypingIndicator() {
        document.getElementById('typing-indicator').classList.add('show');
    }

    hideTypingIndicator() {
        document.getElementById('typing-indicator').classList.remove('show');
    }

    async generateResponse(prompt) {
        // Vérification de la configuration
        if (!validateConfig()) {
            throw new Error('Configuration API invalide');
        }

        const systemInstruction = this.getEnhancedSystemInstruction();
        const fullPrompt = systemInstruction + "\n\nQuestion de l'utilisateur: " + prompt;
        
        const response = await fetch(`${CONFIG.API_URL}?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        return this.cleanMarkdown(data.candidates[0].content.parts[0].text);
    }

    getEnhancedSystemInstruction() {
        return `Tu es un assistant émotionnel intelligent et bienveillant, spécialisé dans l'accompagnement psychologique et le bien-être.

TON RÔLE :
- Analyser l'état émotionnel de l'utilisateur avec empathie
- Fournir des conseils pratiques basés sur la psychologie positive
- Poser des questions ouvertes pour approfondir la compréhension
- Adapter ton discours selon l'émotion exprimée
- Maintenir un ton chaleureux et encourageant

DIRECTIVES :
- Réponds de manière concise mais complète
- Utilise des emojis appropriés selon le contexte émotionnel
- Propose des exercices pratiques si pertinent
- Reste dans ton rôle d'assistant émotionnel
- Si l'utilisateur sort du cadre, redirige gentiment vers le bien-être

FORMAT :
- Réponse structurée et claire
- Emojis contextuels
- Conseils concrets et applicables
- Questions d'approfondissement si nécessaire`;
    }

    cleanMarkdown(text) {
        return text
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    addMessage(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        
        const avatarImg = document.createElement('img');
        avatarImg.src = isUser ? 'user.jfif' : 'bot.jpg';
        avatarImg.alt = isUser ? 'Utilisateur' : 'Assistant IA';
        avatarImg.classList.add('avatar-img');
        avatar.appendChild(avatarImg);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');
        
        const author = document.createElement('span');
        author.classList.add('message-author');
        author.textContent = isUser ? 'Vous' : 'Assistant IA';
        
        const time = document.createElement('span');
        time.classList.add('message-time');
        time.textContent = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageHeader.appendChild(author);
        messageHeader.appendChild(time);
        
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.textContent = message;
        
        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageText);
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Animation d'entrée
        messageElement.classList.add('fade-in');
    }

    useSuggestion(suggestion) {
        this.userInput.value = suggestion;
        this.updateCharCount();
        this.userInput.focus();
    }

    // Gestion des thèmes
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveSettings();
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Mise à jour de l'icône
        const icon = this.themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            this.themeToggle.title = 'Passer au thème clair';
        } else {
            icon.className = 'fas fa-moon';
            this.themeToggle.title = 'Passer au thème sombre';
        }
        
        // Mise à jour du select
        if (this.themeSelect) {
            this.themeSelect.value = this.currentTheme;
        }
    }

    // Gestion des paramètres
    showSettings() {
        document.getElementById('settings-modal').classList.add('show');
        this.loadSettings();
    }

    hideSettings() {
        document.getElementById('settings-modal').classList.remove('show');
    }

    changeLanguage(language) {
        // Implémentation du changement de langue
        this.showNotification(`Langue changée vers ${language}`, 'success');
        this.saveSettings();
    }

    toggleNotifications(enabled) {
        if (enabled) {
            this.requestNotificationPermission();
        }
        this.saveSettings();
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showNotification('Notifications activées !', 'success');
            }
        }
    }

    // Gestion de l'historique
    showHistory() {
        const sidebar = document.getElementById('sidebar');
        const sidebarTitle = document.getElementById('sidebar-title');
        const sidebarContent = document.querySelector('.sidebar-content');
        
        sidebarTitle.textContent = 'Historique des conversations';
        sidebarContent.innerHTML = this.generateHistoryHTML();
        
        sidebar.classList.add('show');
    }

    generateHistoryHTML() {
        if (this.conversationHistory.length === 0) {
            return '<p class="text-muted">Aucune conversation sauvegardée</p>';
        }
        
        return `
            <div class="history-list">
                ${this.conversationHistory.map((conv, index) => `
                    <div class="history-item" onclick="assistant.loadConversation(${index})">
                        <div class="history-preview">${conv.userMessage.substring(0, 50)}...</div>
                        <div class="history-time">${new Date(conv.timestamp).toLocaleDateString('fr-FR')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    hideSidebar() {
        document.getElementById('sidebar').classList.remove('show');
    }

    // Gestion des conversations
    saveConversation(userMessage, botMessage) {
        const conversation = {
            userMessage,
            botMessage,
            timestamp: Date.now()
        };
        
        this.conversationHistory.unshift(conversation);
        
        // Limiter à 50 conversations
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(0, 50);
        }
        
        localStorage.setItem('conversationHistory', JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('conversationHistory');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }

    clearChat() {
        if (confirm('Êtes-vous sûr de vouloir effacer toute la conversation ?')) {
            // Garder seulement le message de bienvenue
            const welcomeMessage = this.chatMessages.querySelector('.bot-message');
            this.chatMessages.innerHTML = '';
            this.chatMessages.appendChild(welcomeMessage);
            
            // Effacer l'historique
            this.conversationHistory = [];
            localStorage.removeItem('conversationHistory');
            
            this.showNotification('Conversation effacée', 'success');
        }
    }

    exportChat() {
        const messages = Array.from(this.chatMessages.querySelectorAll('.message')).map(msg => {
            const isUser = msg.classList.contains('user-message');
            const text = msg.querySelector('.message-text').textContent;
            const time = msg.querySelector('.message-time').textContent;
            return `${isUser ? 'Vous' : 'Assistant IA'} (${time}): ${text}`;
        });
        
        const content = messages.join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Conversation exportée !', 'success');
    }

    // Gestion PWA
    setupPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showPWAPrompt();
        });
        
        window.addEventListener('appinstalled', () => {
            this.hidePWAPrompt();
            this.showNotification('Application installée avec succès !', 'success');
        });
    }

    showPWAPrompt() {
        const prompt = document.getElementById('pwa-install-prompt');
        prompt.classList.add('show');
    }

    hidePWAPrompt() {
        const prompt = document.getElementById('pwa-install-prompt');
        prompt.classList.remove('show');
    }

    async installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.hidePWAPrompt();
            }
            window.deferredPrompt = null;
        }
    }

    dismissPWAPrompt() {
        this.hidePWAPrompt();
        localStorage.setItem('pwaPromptDismissed', Date.now());
    }

    // Reconnaissance vocale
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'fr-FR';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.startVoiceBtn.addEventListener('click', () => this.startVoiceRecognition());
            
            this.recognition.addEventListener('result', (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.updateCharCount();
                this.handleUserInput();
            });
            
            this.recognition.addEventListener('error', (event) => {
                console.error("Erreur de reconnaissance vocale:", event.error);
                this.showNotification('Erreur de reconnaissance vocale', 'error');
            });
        } else {
            this.startVoiceBtn.disabled = true;
            this.startVoiceBtn.title = 'Reconnaissance vocale non supportée';
        }
    }

    startVoiceRecognition() {
        if (this.recognition) {
            this.recognition.start();
            this.startVoiceBtn.innerHTML = '<i class="fas fa-stop"></i><span>Arrêter</span>';
            this.startVoiceBtn.classList.add('recording');
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Sauvegarde des paramètres
    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            language: this.languageSelect?.value || 'fr',
            notifications: this.notificationsToggle?.checked || false
        };
        
        localStorage.setItem('assistantSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('assistantSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentTheme = settings.theme || 'light';
            this.applyTheme();
            
            if (this.languageSelect) {
                this.languageSelect.value = settings.language || 'fr';
            }
            
            if (this.notificationsToggle) {
                this.notificationsToggle.checked = settings.notifications || false;
            }
        }
    }
}

// Styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-info {
        background-color: var(--accent-primary);
    }
    
    .notification-success {
        background-color: var(--accent-success);
    }
    
    .notification-warning {
        background-color: var(--accent-warning);
        color: #000;
    }
    
    .notification-error {
        background-color: var(--accent-danger);
    }
    
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .history-item {
        padding: 15px;
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .history-item:hover {
        background-color: var(--bg-secondary);
        border-color: var(--accent-primary);
    }
    
    .history-preview {
        font-weight: 500;
        margin-bottom: 5px;
    }
    
    .history-time {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .text-muted {
        color: var(--text-muted);
    }
    
    .recording {
        background-color: var(--accent-danger) !important;
        color: white !important;
    }
`;

document.head.appendChild(notificationStyles);

// Initialisation de l'application
let assistant;

document.addEventListener('DOMContentLoaded', () => {
    assistant = new AssistantEmotionnel();
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    if (assistant) {
        assistant.showNotification('Une erreur inattendue s\'est produite', 'error');
    }
});

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && assistant) {
        // Recharger les paramètres quand la page redevient visible
        assistant.loadSettings();
    }
});
