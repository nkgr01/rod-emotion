const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const dotenv = require('dotenv');
const { fetch } = require('undici');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ENABLE_LOGGING = String(process.env.ENABLE_LOGGING || 'false').toLowerCase() === 'true';

if (!GEMINI_API_KEY) {
    console.warn('[WARN] GEMINI_API_KEY is not set. /api/chat will return 500 until configured.');
}

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const publicDir = path.join(__dirname);
app.use(express.static(publicDir, {
    index: 'index.html',
    extensions: ['html'],
    maxAge: '1h',
    etag: true,
}));

function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function extractJsonObject(text) {
    if (typeof text !== 'string') return null;
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) return null;
    const candidate = text.slice(first, last + 1);
    try {
        return JSON.parse(candidate);
    } catch (e) {
        return null;
    }
}

function buildPrompt(messages) {
    const persona = [
        'Tu es un assistant émotionnel bienveillant (psychologue) qui aide à explorer les émotions,',
        'les comportements et les ressentis. Pose quelques questions ouvertes, offre des conseils',
        'basés sur la psychologie positive, reste bref si possible et ajoute des emojis appropriés.',
        'Si on te demande des choses hors de ton rôle, réoriente poliment vers le soutien émotionnel.',
    ].join(' ');

    const emotionSchema = 'Réponds STRICTEMENT en JSON: {"text":"...","emotion":"joie|tristesse|colere|peur|surprise|neutre"}. Sans code block, sans texte hors JSON.';

    const history = messages
        .slice(-12)
        .map(m => `${m.role === 'assistant' ? 'Assistant' : 'Utilisateur'}: ${sanitizeText(m.text)}`)
        .join('\n');

    return `${persona}\n\nHistorique récent:\n${history}\n\n${emotionSchema}`;
}

async function callGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + encodeURIComponent(GEMINI_API_KEY);
    const body = {
        contents: [
            {
                parts: [ { text: prompt } ]
            }
        ]
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const t = await response.text();
        throw new Error(`Gemini error ${response.status}: ${t}`);
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
}

async function appendLog(entry) {
    if (!ENABLE_LOGGING) return;
    try {
        const dataDir = path.join(__dirname, 'data');
        await fs.promises.mkdir(dataDir, { recursive: true });
        const file = path.join(dataDir, 'conversations.jsonl');
        await fs.promises.appendFile(file, JSON.stringify(entry) + '\n', 'utf8');
    } catch (e) {
        console.warn('[WARN] Failed to write log', e);
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const body = req.body || {};
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const safeMessages = messages
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
            .slice(-14)
            .map(m => ({ role: m.role, text: sanitizeText(m.text).slice(0, 2000) }));

        if (safeMessages.length === 0) {
            return res.status(400).json({ error: 'Invalid messages' });
        }

        const prompt = buildPrompt(safeMessages);
        const raw = await callGemini(prompt);
        const parsed = extractJsonObject(raw);

        let text = '';
        let emotion = 'neutre';
        if (parsed && typeof parsed.text === 'string') {
            text = sanitizeText(parsed.text);
            if (typeof parsed.emotion === 'string') {
                const allowed = ['joie','tristesse','colere','peur','surprise','neutre'];
                if (allowed.includes(parsed.emotion)) emotion = parsed.emotion;
            }
        } else {
            text = sanitizeText(raw) || 'Je suis là pour t’écouter. Dis-moi ce que tu ressens en ce moment. 😊';
        }

        await appendLog({
            ts: new Date().toISOString(),
            ua: req.headers['user-agent'] || '',
            ip: req.ip,
            in: safeMessages,
            out: { text, emotion }
        });

        res.json({ text, emotion });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Service indisponible' });
    }
});

app.listen(PORT, () => {
    console.log(`[INFO] Server running on http://localhost:${PORT}`);
});