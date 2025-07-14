import { ChatMessage, EmotionAnalysis } from '../types';

const GEMINI_API_KEY = 'AIzaSyB68k-BYfhYsQn2P76xZgVPzXfPXrtLkUg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

class GeminiService {
  private apiKey: string;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    // 개발 환경에서만 로그 표시 (서버 사이드에서만)
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Gemini API 키 설정됨:', this.apiKey.substring(0, 10) + '...');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // 분당 최대 10회 요청 제한
    if (this.requestCount >= 10 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      await this.delay(waitTime);
      this.requestCount = 0;
    }
    
    // 요청 간 최소 1초 간격
    if (timeSinceLastRequest < 1000) {
      await this.delay(1000 - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      // Rate limit 체크
      await this.checkRateLimit();
      
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      };

      // API 호출 로그 제거

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // 응답 상태 로그 제거

      if (!response.ok) {
        const errorText = await response.text();
        // 에러 응답 로그 제거
        
        // 429 에러 (Rate Limit)인 경우 특별 처리
        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      // 응답 데이터 로그 제거
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini API');
      }
    } catch (error) {
      // 에러 로그 제거
      throw error;
    }
  }

  async testAPIKey(): Promise<boolean> {
    try {
      const testPrompt = 'Hello, this is a test message.';
      const response = await this.callGeminiAPI(testPrompt);
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateChatResponse(
    userMessage: string, 
    emotionContext?: EmotionAnalysis
  ): Promise<string> {
    let prompt = `당신은 BeMore의 AI 상담사입니다. CBT(인지행동치료) 기반으로 사용자와 대화합니다.

다음 원칙을 따라 응답해주세요:
1. 공감적이고 따뜻한 톤으로 응답
2. CBT 기법을 활용한 인지 재구성 도움
3. 구체적이고 실용적인 조언 제공
4. 한국어로 자연스럽게 응답
5. 응답은 2-3문장으로 간결하게

사용자 메시지: "${userMessage}"`;

    if (emotionContext) {
      prompt += `

현재 감정 상태:
- 주요 감정: ${emotionContext.emotion}
- 신뢰도: ${(emotionContext.confidence * 100).toFixed(1)}%
- VAD 점수: Valence=${emotionContext.vadScore.valence}, Arousal=${emotionContext.vadScore.arousal}, Dominance=${emotionContext.vadScore.dominance}

CBT 피드백:
- 인지 왜곡: ${emotionContext.cbtFeedback.cognitiveDistortion}
- 도전적 질문: ${emotionContext.cbtFeedback.challenge}
- 대안적 사고: ${emotionContext.cbtFeedback.alternative}

이 정보를 바탕으로 더 맞춤형 응답을 제공해주세요.`;
    }

    try {
      return await this.callGeminiAPI(prompt);
    } catch (error) {
      // Rate limit 에러인 경우 더 긴 대기 시간 후 재시도
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        await this.delay(5000);
      }
      
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string, emotionContext?: EmotionAnalysis): string {
    // 감정 키워드에 따른 맞춤형 응답
    const emotionKeywords = {
      '화': ['분노', '화가', '짜증', '열받', '빡쳐'],
      '슬픔': ['슬프', '우울', '우울해', '슬퍼', '눈물'],
      '불안': ['불안', '걱정', '스트레스', '긴장', '초조'],
      '기쁨': ['기쁘', '행복', '즐거', '신나', '좋아'],
      '중립': ['그냥', '보통', '평범', '괜찮', '그래']
    };

    // 사용자 메시지에서 감정 키워드 찾기
    let detectedEmotion = '중립';
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => userMessage.includes(keyword))) {
        detectedEmotion = emotion;
        break;
      }
    }

    // 감정별 맞춤형 응답
    const emotionResponses = {
      '화': [
        '화가 나는 상황을 겪으셨군요. 그런 감정을 느끼는 것은 자연스러운 일입니다.',
        '분노는 우리에게 중요한 신호를 보내는 감정입니다. 이 감정이 무엇을 말하려는지 들어보세요.',
        'CBT 관점에서 보면, 분노를 인식하고 관리하는 것이 중요합니다.',
        '현재 상황을 다른 관점에서 바라보는 방법을 함께 찾아보겠습니다.'
      ],
      '슬픔': [
        '슬픈 감정을 느끼고 계시는군요. 그런 감정을 표현하는 것은 용기 있는 일입니다.',
        '우울한 감정은 일시적일 수 있습니다. 시간이 지나면 나아질 것입니다.',
        '이 감정이 영구적일 것 같다고 생각하시나요? 다른 관점에서 바라볼 수 있을까요?',
        '자기 동정과 인지 재구성 기법을 함께 연습해보겠습니다.'
      ],
      '불안': [
        '불안한 감정을 느끼고 계시는군요. 그런 감정은 우리에게 중요한 신호입니다.',
        '스트레스 관리에 도움이 될 수 있는 몇 가지 기법을 제안드릴게요.',
        '마음챙김 기법을 활용해보는 것은 어떨까요?',
        '현재 상황을 더 균형잡힌 관점에서 바라보는 방법을 함께 찾아보겠습니다.'
      ],
      '기쁨': [
        '기쁜 감정을 느끼고 계시는군요! 그런 긍정적인 감정을 잘 활용하고 계시네요.',
        '행복한 감정을 유지하는 방법을 함께 탐색해보겠습니다.',
        '이 긍정적인 감정을 어떻게 더 잘 활용할 수 있을까요?',
        '감사 연습과 긍정적 사고를 계속 유지해보세요.'
      ],
      '중립': [
        '네, 말씀해주세요. 어떤 감정을 느끼고 계신지 더 자세히 들려주세요.',
        '그런 감정을 느끼시는 것은 자연스러운 일입니다. 함께 이 감정을 탐색해보겠습니다.',
        'CBT 관점에서 보면, 이런 생각 패턴을 인식하는 것이 첫 번째 단계입니다.',
        '현재 상황을 다른 관점에서 바라보는 방법을 함께 찾아보겠습니다.'
      ]
    };

    const responses = emotionResponses[detectedEmotion as keyof typeof emotionResponses];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const geminiService = new GeminiService(); 