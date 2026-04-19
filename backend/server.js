require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 🔥 If running on Render, reconstruct google-key.json from env variable
if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const keyPath = path.join(__dirname, 'google-key.json');
    fs.writeFileSync(keyPath, process.env.GOOGLE_CREDENTIALS_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

const { processAudio } = require('./controllers/speechHandler');
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsClient = new textToSpeech.TextToSpeechClient();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// 🔥 Server-side TTS cache — Google only called once per unique word ever
const ttsCache = new Map();

// --- Speech Recognition ---
app.post('/api/recognize', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded." });

    const expectedWord = req.body.expectedWord
        ? req.body.expectedWord.toLowerCase().trim()
        : "";

    try {
        console.log(`[STT] Processing "${expectedWord}"...`);
        const transcript = await processAudio(req.file.buffer);
        const transcribedWord = transcript.toLowerCase().trim();
        console.log(`[STT] Expected: "${expectedWord}" | Heard: "${transcribedWord}"`);

        let isCorrect = false;
        if (expectedWord && transcribedWord) {
             // 🔥 FIX: Use word boundary regex ONLY (removed .includes() substring check)
             // This ensures "Lisa" won't match "isa", "pusa" won't match "sa", etc.
             const regex = new RegExp(`\\b${expectedWord}\\b`, 'i');
             if (regex.test(transcribedWord)) {
                  isCorrect = true;
            }
        }

        res.json({
            success: true,
            heard: transcribedWord || "(walang narinig)",
            expected: expectedWord,
            isCorrect,
            message: isCorrect ? "Tama!" : "Subukan muli!"
        });
    } catch (err) {
        console.error("[STT ERROR]:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Filipino Text-to-Speech (with cache) ---
// --- Filipino Text-to-Speech (with cache + slow mode) ---
app.post('/api/speak', async (req, res) => {
    const { word, slow } = req.body; // 🔥 NEW: accept slow flag
    if (!word) return res.status(400).json({ error: "No word provided." });

    // 🔥 Cache key includes speed — slow version cached separately
    const cacheKey = `${word.toLowerCase().trim()}${slow ? '_slow' : ''}`;

    if (ttsCache.has(cacheKey)) {
        console.log(`[TTS CACHE HIT] "${cacheKey}"`);
        return res.json({ success: true, audioContent: ttsCache.get(cacheKey) });
    }

    try {
        console.log(`[TTS] Generating "${cacheKey}"...`);
        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: word },
            voice: {
                languageCode: 'fil-PH',
                name: 'fil-PH-Wavenet-A',
                ssmlGender: 'FEMALE',
            },
            audioConfig: {
                audioEncoding: 'MP3',
                // 🔥 NEW: 0.5x speed for slow mode — helps struggling readers hear each phoneme
                speakingRate: slow ? 0.5 : 0.75,
                pitch: 2.0,
            },
        });

        const audioBase64 = response.audioContent.toString('base64');
        ttsCache.set(cacheKey, audioBase64);

        res.json({ success: true, audioContent: audioBase64 });
    } catch (err) {
        console.error("[TTS ERROR]:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Health check endpoint (test your tunnel!)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        ttsCacheSize: ttsCache.size,
        timestamp: new Date().toISOString()
    });
});

// 🔥 Render provides PORT as an environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Basa-Bata server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
});