const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function processAudio(audioBuffer) {
    const audio = { content: audioBuffer.toString('base64') };

    // 🔥 FIX: MP3 encoding actually works for M4A on Google STT
    // This is the "universal" audio encoding that handles most container types
    const config = {
        encoding: 'MP3',
        sampleRateHertz: 44100,
        languageCode: 'fil-PH',
        alternativeLanguageCodes: ['tl-PH', 'en-PH'],
        speechContexts: [{
            phrases: [
                'aso', 'pusa', 'ibon',
                'pula', 'asul', 'dilaw',
                'isa', 'dalawa', 'tatlo',
                'mata', 'ilong', 'bibig',
            ],
            boost: 10,
        }],
        enableAutomaticPunctuation: false,
    };

    try {
        const [response] = await client.recognize({ audio, config });

        if (!response.results || response.results.length === 0) {
            console.log("[STT] No results — audio may be silent or too short.");
            return "";
        }

        const transcript = response.results
            .map(r => r.alternatives[0].transcript)
            .join(' ');

        console.log(`[STT] Confidence: ${response.results[0]?.alternatives[0]?.confidence?.toFixed(2) || 'N/A'}`);
        return transcript;
    } catch (error) {
        console.error("[STT ERROR] Full error:", error);
        console.error("[STT ERROR] Message:", error.message);
        if (error.details) console.error("[STT ERROR] Details:", error.details);
        throw error;
    }
}

module.exports = { processAudio };