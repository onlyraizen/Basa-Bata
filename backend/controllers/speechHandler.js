const speech = require('@google-cloud/speech');

// This automatically finds your google-key.json because of the .env file!
const client = new speech.SpeechClient();

async function processAudio(audioBuffer) {
    // Convert the audio buffer into the base64 format Google requires
    const audio = {
        content: audioBuffer.toString('base64'),
    };

    // Configure for Tagalog/Filipino
    const config = {
        encoding: 'WEBM_OPUS', // Default for Expo AV Android/Web, we can tweak this later
        sampleRateHertz: 48000,
        languageCode: 'fil-PH', // Explicitly set to Tagalog
    };

    const request = {
        audio: audio,
        config: config,
    };

    try {
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
            
        return transcription;
    } catch (error) {
        console.error("Google STT Error:", error);
        throw error;
    }
}

module.exports = { processAudio };