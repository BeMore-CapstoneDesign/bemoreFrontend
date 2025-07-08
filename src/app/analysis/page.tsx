'use client';

import React, { useState, useRef } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Camera, 
  Mic, 
  FileText, 
  Upload, 
  X,
  BarChart3,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { apiService } from '../../services/api';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, getConfidenceColor } from '../../utils/emotion';

type MediaType = 'image' | 'audio' | 'text';

export default function AnalysisPage() {
  const { addEmotionAnalysis, setLoading, isLoading } = useAppStore();
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaTypes = [
    {
      type: 'image' as MediaType,
      title: '표정 분석',
      description: '사진을 업로드하거나 카메라로 촬영',
      icon: Camera,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'audio' as MediaType,
      title: '음성 분석',
      description: '음성 파일을 업로드하거나 녹음',
      icon: Mic,
      color: 'from-green-500 to-green-600',
    },
    {
      type: 'text' as MediaType,
      title: '텍스트 분석',
      description: '감정을 담은 텍스트를 입력',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedType === 'image') {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
    }
  };

  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = cameraRef.current.videoWidth;
      canvas.height = cameraRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(cameraRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          setFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const file = new File([blob], 'audio-recording.wav', { type: 'audio/wav' });
        setFile(file);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('마이크 접근 실패:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const analysisData: { mediaType: MediaType; file?: File; textContent?: string } = { mediaType: selectedType };
      
      if (selectedType === 'text') {
        analysisData.textContent = textContent;
      } else if (file) {
        analysisData.file = file;
      }
      
      const result = await apiService.analyzeEmotion(analysisData);
      setAnalysisResult(result);
      addEmotionAnalysis(result);
    } catch (error) {
      console.error('분석 실패:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFile(null);
    setTextContent('');
    setAnalysisResult(null);
    setPreviewUrl(null);
    setAudioBlob(null);
    setIsRecording(false);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">감정 분석</h1>
          <p className="text-xl text-gray-600">
            표정, 음성, 텍스트를 통해 당신의 감정을 분석해보세요
          </p>
        </div>

        {!selectedType ? (
          /* 미디어 타입 선택 */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">분석 방법 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mediaTypes.map((media) => (
                <Card
                  key={media.type}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedType(media.type)}
                >
                  <CardContent className="text-center p-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r ${media.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <media.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {media.title}
                    </h3>
                    <p className="text-gray-600">
                      {media.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* 분석 폼 */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {mediaTypes.find(m => m.type === selectedType)?.title}
              </h2>
              <Button variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                새로 시작
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {selectedType === 'image' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        이미지 업로드
                      </Button>
                      <Button variant="outline" onClick={handleCameraCapture}>
                        <Camera className="w-4 h-4 mr-2" />
                        카메라 사용
                      </Button>
                    </div>
                    
                    {previewUrl && (
                      <div className="mt-4">
                        <img src={previewUrl} alt="Preview" className="max-w-md rounded-lg" />
                      </div>
                    )}
                    
                    <video
                      ref={cameraRef}
                      autoPlay
                      playsInline
                      className="hidden max-w-md rounded-lg"
                    />
                    
                    {cameraRef.current?.srcObject && (
                      <Button onClick={handleTakePhoto}>
                        사진 촬영
                      </Button>
                    )}
                  </div>
                )}

                {selectedType === 'audio' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        음성 파일 업로드
                      </Button>
                      <Button 
                        variant={isRecording ? "danger" : "outline"}
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isRecording ? '녹음 중지' : '녹음 시작'}
                      </Button>
                    </div>
                    
                    {audioBlob && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">녹음 완료</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="감정을 담은 텍스트를 입력해주세요..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedType === 'image' ? 'image/*' : selectedType === 'audio' ? 'audio/*' : undefined}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="mt-6">
                  <Button
                    onClick={handleAnalyze}
                    loading={isLoading}
                    disabled={!file && !textContent}
                    size="lg"
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    감정 분석 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">분석 결과</h2>
            
            {/* 감정 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-3xl">{emotionEmojis[analysisResult.emotion as keyof typeof emotionEmojis] || '😐'}</span>
                  <span>감정 분석 결과</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">VAD 점수</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>긍정성 (Valence)</span>
                          <span className={getConfidenceColor(analysisResult.vadScore.valence)}>
                            {Math.round(analysisResult.vadScore.valence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${analysisResult.vadScore.valence * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>각성도 (Arousal)</span>
                          <span className={getConfidenceColor(analysisResult.vadScore.arousal)}>
                            {Math.round(analysisResult.vadScore.arousal * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${analysisResult.vadScore.arousal * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>지배성 (Dominance)</span>
                          <span className={getConfidenceColor(analysisResult.vadScore.dominance)}>
                            {Math.round(analysisResult.vadScore.dominance * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${analysisResult.vadScore.dominance * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">분석 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">주요 감정:</span>
                        <span className="font-medium capitalize">{analysisResult.emotion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">신뢰도:</span>
                        <span className={getConfidenceColor(analysisResult.confidence)}>
                          {Math.round(analysisResult.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">분석 시간:</span>
                        <span>{new Date(analysisResult.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CBT 피드백 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span>CBT 피드백</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-red-500" />
                      인지 왜곡 유형
                    </h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {analysisResult.cbtFeedback.cognitiveDistortion}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                      도전적 질문
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {analysisResult.cbtFeedback.challenge}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-green-500" />
                      대안적 사고
                    </h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                      {analysisResult.cbtFeedback.alternative}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-purple-500" />
                      행동 계획
                    </h4>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg">
                      {analysisResult.cbtFeedback.actionPlan}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
} 