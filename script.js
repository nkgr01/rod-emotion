
const API_KEY = 'AIzaSyBGr1htdW29Ut34WsZJECCQfmlp8ZM8U-I';


const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Récupère la div où seront affichés les messages
const chatMessages = document.getElementById('chat-messages');

// Récupère la zone de saisie de l'utilisateur
const userInput = document.getElementById('user-input');

// Récupère le bouton pour envoyer un message
const sendButton = document.getElementById('send-button');

// Fonction asynchrone qui envoie la requête à l'API
async function generateResponse(prompt) {

    // Instruction système 
    const systemInstruction = `Tu es un assistant émotionnel (un psychologue) bienveillant qui aborde également les comportements et les ressentis des individus.
    - Si l'utilisateur exprime des propos ou pose des questions qui ne relèvent pas de ton rôle, 
    informe-le que tu es là pour l'assister émotionnellement, puis pose une question pour engager la conversation.

Ton rôle :

- Répondre aux questions de l'utilisateur et lui poser des questions ouvertes pour comprendre son état émotionnel.

- Analyser les réponses ou questions avec empathie et pose moins de questions pour l'encourager à poursuivre la conversation.

- Fournir des conseils basés sur la psychologie positive.

- Maintenir un ton chaleureux et encourageant.

- donne lui des conseils celon ce qu'il dira si necessaire.

-ajoute des emojis celon ce qu'il envoie comme reponse ou question(joie, tristesse...).

- Ne pas trop parler si ce n'est pas nécessaire.`;


    // l'instruction système avec la question de l'utilisateur
    const fullPrompt = systemInstruction + "\n\nQuestion de l'utilisateur: " + prompt;
    
    // Appel à l'API avec fetch. Méthode POST et envoie les données en JSON
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ // Le corps de la requête
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt //  l on veux dire a ia


                        }
                    ]
                }
            ]
        })
    });

    // Si l'API échoue, on affiche une erreur
    if (!response.ok) {
        throw new Error('API invalide');
    }

    // On récupère les données JSON et extrait la réponse générée
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Fonction pour nettoyer le markdown des réponses (ex: supprimer les ** ou ###)
function cleanMarkdown(text) {
    return text
        .replace(/#{1,6}\s?/g, '')   // Supprime les titres markdown (##, ###, etc.)
        .replace(/\*\*/g, '')        // Supprime le gras en markdown (**texte**)
        .replace(/\n{3,}/g, '\n\n')  // Réduit les lignes vides excessives
        .trim();                     // Supprime les espaces en début/fin
}

// Fonction pour afficher un message dans le chat (utilisateur ou bot)
function addMessage(message, isUser) {
    const messageElement = document.createElement('div');           // Crée un <div> pour le message
    messageElement.classList.add('message');                        // Ajoute la classe commune

    messageElement.classList.add(isUser ? 'user-message' : 'bot-message'); // Ajoute une classe différente selon le type

    const profileImage = document.createElement('img');             
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user.jfif' : 'bot.jpg';            
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');           // Contenu du message
    messageContent.classList.add('message-content');
    messageContent.textContent = message;

    messageElement.appendChild(profileImage);                       
    messageElement.appendChild(messageContent);                     

    chatMessages.appendChild(messageElement);               // Ajoute le message dans le chat
    chatMessages.scrollTop = chatMessages.scrollHeight;    // Scroll en bas du chat automatiquement
}

// Fonction qui gère l’envoi du message de l’utilisateur
async function handleUserInput() {
    const userMessage = userInput.value.trim();       // Récupère et nettoie le texte

    if (userMessage) {
        addMessage(userMessage, true);                              
        userInput.value = '';            // Vide la zone de saisie
        sendButton.disabled = true;      // Désactive le bouton
        userInput.disabled = true;

        try {
            const botMessage = await generateResponse(userMessage); // Génère la réponse IA
            addMessage(cleanMarkdown(botMessage), false);           // Affiche la réponse nettoyée
        } catch (error) {
            console.error('Error:', error);
            addMessage('désolé il y a une erreur. veuillez recommencer.', false); // Message d’erreur
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();                                      // Redonne le focus à la zone texte
        }
    }
}

// Événement déclenché quand on clique sur le bouton d'envoi
sendButton.addEventListener('click', handleUserInput);

// Événement déclenché quand on appuie sur "Entrée" dans le champ de saisie
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Empêche les retours à la ligne (sauf si Shift)
        e.preventDefault();
        handleUserInput(); // Lance la fonction d’envoi
    }
});


// Intégration de la reconnaissance vocale
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
        userInput.value = transcript; // Affiche le texte reconnu dans la zone de saisie
        handleUserInput();
    });

    recognition.addEventListener('error', (event) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
    });
} else {
    // Si la reconnaissance vocale n'est pas supportée, désactiver le bouton correspondant
    const voiceButton = document.getElementById('start-voice');
    if (voiceButton) {
        voiceButton.disabled = true;
        voiceButton.textContent = "Reconnaissance vocale non supportée";
    }
}
