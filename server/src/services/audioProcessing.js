// server/src/services/audioProcessing.js
class AudioProcessingService {
    constructor() {
      this.defaultFrequency = 24000; // 24kHz
    }
  
    processAudioChunk(base64Audio) {
      try {
        // Base64をバッファに変換
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        
        // PCM16フォーマットのチェック
        if (audioBuffer.length % 2 !== 0) {
          throw new Error('Invalid PCM16 audio data');
        }
  
        // Int16Arrayに変換
        const samples = new Int16Array(audioBuffer.buffer);
        
        return {
          samples,
          duration: (samples.length / this.defaultFrequency) * 1000 // ミリ秒
        };
      } catch (error) {
        console.error('Audio processing error:', error);
        throw new Error('音声データの処理に失敗しました');
      }
    }
  
    // 音声アクティビティ検出（VAD）の実装
    detectSpeech(samples, threshold = 0.5) {
      const windowSize = 480; // 20ms at 24kHz
      const windows = Math.floor(samples.length / windowSize);
      
      for (let i = 0; i < windows; i++) {
        const start = i * windowSize;
        const end = start + windowSize;
        const window = samples.slice(start, end);
        
        // エネルギーベースのVAD
        const energy = this.calculateEnergy(window);
        if (energy > threshold) {
          return true;
        }
      }
      
      return false;
    }
  
    calculateEnergy(samples) {
      const sum = samples.reduce((acc, sample) => acc + Math.abs(sample), 0);
      return sum / (samples.length * 32768); // 正規化（16ビットの最大値で割る）
    }
  }
  
  module.exports = { AudioProcessingService };