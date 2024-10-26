export class VoiceService {
    constructor() {
      this.mediaRecorder = null;
      this.audioChunks = [];
    }
  
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
  
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
  
        this.mediaRecorder.start();
        return true;
      } catch (error) {
        console.error('Error starting voice recording:', error);
        return false;
      }
    }
  
    stopRecording() {
      return new Promise((resolve) => {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioChunks = [];
            
            // 音声データをBase64に変換
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result.split(',')[1];
              resolve(base64Audio);
            };
            reader.readAsDataURL(audioBlob);
            
            // メディアストリームのトラックを停止
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
          };
          
          this.mediaRecorder.stop();
        } else {
          resolve(null);
        }
      });
    }
  }
  
  export default new VoiceService();