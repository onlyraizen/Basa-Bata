require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processAudio } = require('./controllers/speechHandler');

// FIX: Add Google TTS
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsClient = new textToSpeech.TextToSpeechClient();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- EXISTING: Speech Recognition Route ---
app.post('/api/recognize', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded." });
    }

    const expectedWord = req.body.expectedWord
        ? req.body.expectedWord.toLowerCase().trim()
        : "";

    try {
        console.log("Processing audio with Google STT...");
        const transcript = await processAudio(req.file.buffer);
        const transcribedWord = transcript.toLowerCase().trim();
        console.log(`Expected: "${expectedWord}" | Google heard: "${transcribedWord}"`);

        let isCorrect = false;
        if (expectedWord && transcribedWord) {
            const regex = new RegExp(`\\b${expectedWord}\\b`, 'i');
            // FIX: Also check if transcription CONTAINS the word
            // (Google sometimes adds filler words)
            if (regex.test(transcribedWord) || transcribedWord.includes(expectedWord)) {
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
        console.error("Transcription error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- NEW: Filipino Text-to-Speech Route ---
app.post('/api/speak', express.json(), async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "No word provided." });

    try {
        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: word },
            voice: {
                // FIX: This uses Google's actual Filipino neural voice
                languageCode: 'fil-PH',
                name: 'fil-PH-Wavenet-A', // Female Filipino voice
                ssmlGender: 'FEMALE',
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.75, // Slower for children
                pitch: 2.0,        // Slightly higher/friendlier
            },
        });

        // Send audio bytes as base64 so the app can play it
        res.json({
            success: true,
            audioContent: response.audioContent.toString('base64'),
        });
    } catch (err) {
        console.error("TTS Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Basa-Bata server running on port ${PORT}`);
});