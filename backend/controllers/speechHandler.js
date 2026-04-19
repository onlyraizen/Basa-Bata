const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function processAudio(audioBuffer) {
    const audio = {
        content: audioBuffer.toString('base64'),
    };

    // FIX: Use ENCODING_UNSPECIFIED so Google auto-detects
    // the format. This handles both M4A (iOS) and WEBM (Android).
    const config = {
        
        // FIX: Remove sampleRateHertz when using UNSPECIFIED —
        // Google reads it from the file header automatically.
        languageCode: 'fil-PH',
        alternativeLanguageCodes: ['tl-PH'],
        // FIX: Add these for better short-word recognition
        model: 'latest_short',
        useEnhanced: true,
    };

    const request = { audio, config };

    try {
        const [response] = await client.recognize(request);

        if (!response.results || response.results.length === 0) {
            console.log("Google STT returned no results (silence or unclear audio).");
            return "";
        }

        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        return transcription;
    } catch (error) {
        console.error("Google STT Error:", error.message);
        throw error;
    }
}

module.exports = { processAudio };