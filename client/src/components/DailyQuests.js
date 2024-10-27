// src/components/DailyQuests.js
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Shield, Mic, MicOff, Loader } from 'lucide-react';
import websocketService from '../services/websocket';
import voiceService from '../services/voice';

const DailyQuests = ({ quests }) => {
  const [completedQuests, setCompletedQuests] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const initializeWebSocket = async () => {
      try {
        await websocketService.connect();
        
        if (isSubscribed) {
          websocketService.subscribe('quest_validation_result', (payload) => {
            const { questId, isValid, message } = payload;
            handleValidationResult(questId, isValid, message);
          });
        }
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    initializeWebSocket();

    return () => {
      isSubscribed = false;
      websocketService.disconnect();
    };
  }, []);

  const handleValidationResult = (questId, isValid, message) => {
    setIsProcessing(false);
    
    if (isValid) {
      setCompletedQuests(prev => [...prev, questId]);
      const quest = quests.find(q => q.id === questId);
      quest?.onComplete?.(true);
    }
    
    alert(message);
  };

  const startQuestCompletion = async (quest) => {
    setSelectedQuest(quest);
    const started = await voiceService.startRecording();
    setIsRecording(started);
  };

  const handleComplete = async (quest) => {
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      const audioData = await voiceService.stopRecording();
      if (!audioData) {
        throw new Error('No audio data recorded');
      }

      // 音声データとクエスト情報をサーバーに送信
      websocketService.send('validate_quest', {
        questId: quest.id,
        questType: quest.type,
        audioData: audioData
      });
      
    } catch (error) {
      console.error('Quest completion error:', error);
      setIsProcessing(false);
      alert('音声の処理中にエラーが発生しました。もう一度お試しください。');
    }
    
    setSelectedQuest(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">本日の緊急クエスト</h2>
        </div>
        
        <div className="space-y-2">
          {quests.map((quest) => (
            <div key={quest.id} className="p-4 bg-gray-50 rounded">
              <h3 className="font-bold">{quest.name}</h3>
              <p className="text-sm text-gray-600">{quest.description}</p>
              
              {completedQuests.includes(quest.id) ? (
                <div className="mt-2 px-4 py-2 bg-green-500 text-white rounded text-center">
                  クエスト完了済み
                </div>
              ) : selectedQuest?.id === quest.id ? (
                <div className="mt-2 space-y-2">
                  <div className="flex justify-center items-center space-x-2">
                    {isProcessing ? (
                      <Loader className="animate-spin text-blue-500" />
                    ) : isRecording ? (
                      <Mic className="animate-pulse text-red-500" />
                    ) : (
                      <MicOff />
                    )}
                    <span className="text-sm text-gray-600">
                      {isProcessing ? '回答を検証中...' : 
                       isRecording ? '音声入力中...' : 
                       '音声入力待機中'}
                    </span>
                  </div>
                  <button
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    onClick={() => handleComplete(quest)}
                    disabled={isProcessing}
                  >
                    回答を確定
                  </button>
                </div>
              ) : (
                <button
                  className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => startQuestCompletion(quest)}
                >
                  クエストに挑戦
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DailyQuests;
