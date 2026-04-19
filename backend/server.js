require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processAudio } = require('./controllers/speechHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Set up Multer to hold the uploaded audio file in memory
const upload = multer({ storage: multer.memoryStorage() });

// The Basa-Bata Validation Engine Route
app.post('/api/recognize', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded." });
    }

    // Grab the expected word sent from the React Native frontend
    const expectedWord = req.body.expectedWord ? req.body.expectedWord.toLowerCase().trim() : "";

    try {
        console.log("Receiving audio from app... processing with Google STT...");
        const transcript = await processAudio(req.file.buffer);
        
        // Clean up Google's response for a fair comparison
        const transcribedWord = transcript.toLowerCase().trim();
        console.log(`Expected: "${expectedWord}" | Google heard: "${transcribedWord}"`);
        
        // Gamification Logic (Pass/Fail)
        let isCorrect = false;
        if (expectedWord) {
            // Creates a strict word boundary. 'isa' will match "isa", but NOT "lisa" or "misa".
            const regex = new RegExp(`\\b${expectedWord}\\b`, 'i');
            if (regex.test(transcribedWord)) {
                isCorrect = true;
            }
        }

        // Send the complete payload back to trigger the frontend animations
        res.json({ 
            success: true, 
            heard: transcribedWord,
            expected: expectedWord,
            isCorrect: isCorrect,
            message: isCorrect ? "Tama!" : "Subukan muli!"
        });

    } catch (err) {
        console.error("Transcription error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});