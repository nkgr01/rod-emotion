
const API_ENDPOINT = '/api/chat';
const STORAGE_KEY = 'chat_history_v1';
const TTS_KEY = 'tts_enabled';
const MAX_HISTORY = 10;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const toggleTTSButton = document.getElementById('toggle-tts');
const clearChatButton = document.getElementById('clear-chat');

let ttsEnabled = localStorage.getItem(TTS_KEY) === '1';

function saveHistory(history) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) return arr;
    } catch {}
    return [];
}

function formatTime(ts) {
    try {
        const d = ts ? new Date(ts) : new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

function showTyping(show) {
    if (!typingIndicator) return;
    typingIndicator.classList.toggle('hidden', !show);
    typingIndicator.setAttribute('aria-hidden', show ? 'false' : 'true');
}

function cleanMarkdown(text) {
    return (text || '')
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function addMessage({ text, isUser, emotion, timestamp }) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    if (!isUser && emotion) {
        messageElement.classList.add(emotion);
    }

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user.jfif' : 'bot.jpg';
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = text;

    const meta = document.createElement('small');
    meta.classList.add('message-meta');
    meta.textContent = formatTime(timestamp);

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
    messageElement.appendChild(meta);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function speak(text) {
    try {
        if (!ttsEnabled) return;
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const fr = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
        if (fr) utterance.voice = fr;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } catch {}
}

async function requestBotResponse(history) {
    const payload = {
        messages: history.slice(-MAX_HISTORY).map(m => ({ role: m.isUser ? 'user' : 'assistant', text: m.text }))
    };
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin'
    });
    if (!response.ok) throw new Error('API error');
    return response.json();
}

async function handleUserInput() {
    const userMessage = (userInput.value || '').trim();
    if (!userMessage) return;

    const history = loadHistory();
    const userEntry = { text: userMessage, isUser: true, timestamp: Date.now() };
    addMessage(userEntry);
    history.push(userEntry);
    saveHistory(history);

    userInput.value = '';
    sendButton.disabled = true;
    userInput.disabled = true;
    showTyping(true);

    try {
        const data = await requestBotResponse(history);
        const text = cleanMarkdown(data.text || '');
        const emotion = data.emotion || 'neutre';
        const botEntry = { text, isUser: false, emotion, timestamp: Date.now() };
        addMessage(botEntry);
        const updated = loadHistory();
        updated.push(botEntry);
        saveHistory(updated);
        speak(text);
    } catch (error) {
        console.error(error);
        addMessage({ text: 'Désolé, une erreur est survenue. Réessaie dans un instant.', isUser: false, timestamp: Date.now() });
    } finally {
        showTyping(false);
        sendButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener('click', handleUserInput);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 128) + 'px';
});

// Toggle TTS
if (toggleTTSButton) {
    toggleTTSButton.setAttribute('aria-pressed', ttsEnabled ? 'true' : 'false');
    toggleTTSButton.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        localStorage.setItem(TTS_KEY, ttsEnabled ? '1' : '0');
        toggleTTSButton.setAttribute('aria-pressed', ttsEnabled ? 'true' : 'false');
    });
}

// Clear chat
if (clearChatButton) {
    clearChatButton.addEventListener('click', () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        chatMessages.innerHTML = '';
    });
}

// Load history on startup
(function bootstrap() {
    const history = loadHistory();
    history.forEach(entry => addMessage(entry));
})();

// Voice Recognition (keep existing feature)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const voiceButton = document.getElementById('start-voice');
    if (voiceButton) {
        voiceButton.addEventListener('click', () => {
            recognition.start();
        });
    }

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleUserInput();
    });

    recognition.addEventListener('error', (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
    });
} else {
    const voiceButton = document.getElementById('start-voice');
    if (voiceButton) {
        voiceButton.disabled = true;
        voiceButton.textContent = 'Reconnaissance vocale non supportée';
    }
}
