const OpenAI = require('openai');

class AudioTranscriptionService {
    constructor() {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  
    async transcribeAudio(audioBuffer) {
      try {
        const transcription = await this.openai.audio.transcriptions.create({
          file: audioBuffer,
          model: 'whisper-1',
          language: 'ja'
        });
  
        return transcription.text;
      } catch (error) {
        console.error('Audio transcription error:', error);
        throw new Error('音声の文字起こしに失敗しました');
      }
    }
  }

module.exports = { AudioTranscriptionService };
