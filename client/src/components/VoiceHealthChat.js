'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Mic, MicOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import websocketService from '../services/websocket'
import voiceService from '../services/voice'

export default function VoiceHealthChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [healthLevel, setHealthLevel] = useState(1)
  const [healthAdvice, setHealthAdvice] = useState('')
  const [error, setError] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await websocketService.connect()
        
        websocketService.subscribe('health_assessment', (payload) => {
          const { level, advice } = payload
          setHealthLevel(level)
          setHealthAdvice(advice)
          setIsProcessing(false)
        })
      } catch (error) {
        console.error('WebSocket connection failed:', error)
        setError('WebSocket接続に失敗しました。ページを再読み込みしてください。')
      }
    }

    initializeWebSocket()
    return () => websocketService.disconnect()
  }, [])

  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= 120) {
            handleConversationEnd()
            return 0
          }
          return prevTime + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const startConversation = async () => {
    setError(null)
    try {
      const started = await voiceService.startRecording()
      setIsRecording(started)
    } catch (error) {
      console.error('Failed to start recording:', error)
      setError('録音の開始に失敗しました。マイクの権限を確認してください。')
    }
  }

  const handleConversationEnd = async () => {
    setIsRecording(false)
    setIsProcessing(true)
    
    try {
      const audioData = await voiceService.stopRecording()
      if (!audioData) {
        throw new Error('No audio data recorded')
      }

      websocketService.send('analyze_health', {
        audioData: audioData
      })
      
    } catch (error) {
      console.error('Conversation analysis error:', error)
      setIsProcessing(false)
      setError('会話の分析中にエラーが発生しました。もう一度お試しください。')
    }
  }

  const getHealthLevelColor = (level) => {
    switch (level) {
      case 3: return 'text-green-500'
      case 2: return 'text-yellow-500'
      default: return 'text-red-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Health Assistant</h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>健康状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Shield className={`w-16 h-16 ${getHealthLevelColor(healthLevel)}`} />
              <div>
                <p className="text-2xl font-bold">レベル {healthLevel}</p>
                <Progress value={healthLevel * 33.33} className="w-32 mt-2" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">アドバイス:</h3>
              <p className="text-gray-600">{healthAdvice || '会話を開始してアドバイスを受け取ってください。'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>音声会話</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-2 h-32">
                {isProcessing ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-2" />
                    <p>会話を分析中...</p>
                  </div>
                ) : isRecording ? (
                  <div className="text-center">
                    <Mic className="w-12 h-12 animate-pulse text-red-500 mx-auto mb-2" />
                    <p>音声会話中... ({recordingTime}秒)</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>ボタンを押して会話開始</p>
                  </div>
                )}
              </div>
              
              <Button
                className="w-full"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? handleConversationEnd : startConversation}
                disabled={isProcessing}
              >
                {isRecording ? '会話を終了' : '会話を開始'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}