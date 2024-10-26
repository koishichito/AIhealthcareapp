// src/utils/audioUtils.js

export class AudioUtils {
    constructor() {
      this.audioContext = null;
      this.stream = null;
      this.recorder = null;
      this.audioData = new Int16Array(0);
    }
  
    async startRecording() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const audioData = new Int16Array(inputData.length);
          
          // Convert Float32Array to Int16Array
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            audioData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          
          // Append to existing audio data
          const newAudioData = new Int16Array(this.audioData.length + audioData.length);
          newAudioData.set(this.audioData);
          newAudioData.set(audioData, this.audioData.length);
          this.audioData = newAudioData;
        };
  
        source.connect(processor);
        processor.connect(this.audioContext.destination);
        
        this.recorder = { source, processor };
      } catch (error) {
        console.error('Error starting recording:', error);
        throw error;
      }
    }
  
    stopRecording() {
      if (this.recorder) {
        this.recorder.source.disconnect();
        this.recorder.processor.disconnect();
        this.stream.getTracks().forEach(track => track.stop());
        
        const recordedData = this.audioData;
        this.audioData = new Int16Array(0);
        
        return recordedData;
      }
      return null;
    }
  }
  
  export default new AudioUtils();