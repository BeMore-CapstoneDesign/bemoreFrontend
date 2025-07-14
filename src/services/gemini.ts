import { ChatMessage, EmotionAnalysis } from '../types';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyB68k-BYfhYsQn2P76xZgVPzXfPXrtLkUg';
const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

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
    // 임시로 로그 활성화
    console.log('Gemini API 키 설정됨:', this.apiKey.substring(0, 10) + '...');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // 분당 최대 2회 요청 제한 (할당량 절약)
    if (this.requestCount >= 2 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      await this.delay(waitTime);
      this.requestCount = 0;
    }
    
    // 요청 간 최소 5초 간격 (할당량 절약)
    if (timeSinceLastRequest < 5000) {
      await this.delay(5000 - timeSinceLastRequest);
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

      console.log('Gemini API 호출 중...', { url: GEMINI_API_URL, promptLength: prompt.length });

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Gemini API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API 에러 응답:', errorText);
        
        // 429 에러 (Rate Limit)인 경우 특별 처리
        if (response.status === 429) {
          console.log('Rate limit exceeded, using fallback response');
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
      // API 키 만료 또는 할당량 초과 시 Mock 모드로 전환
      console.log('API 키 테스트 실패, Mock 모드로 전환:', error);
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
      console.log('Gemini API 호출 실패, Mock 응답 사용:', error);
      
      // Rate limit 에러인 경우 더 긴 대기 시간 후 재시도
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        await this.delay(5000);
      }
      
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string, emotionContext?: EmotionAnalysis): string {
    // 사용자 메시지 길이와 내용에 따른 다양한 응답
    const messageLength = userMessage.length;
    const isShortMessage = messageLength < 10;
    const isQuestion = userMessage.includes('?') || userMessage.includes('뭐') || userMessage.includes('무엇');
    
    // 일반적인 응답 풀
    const generalResponses = [
      '네, 말씀해주세요. 어떤 감정을 느끼고 계신지 더 자세히 들려주세요.',
      '그런 감정을 느끼시는 것은 자연스러운 일입니다. 함께 이 감정을 탐색해보겠습니다.',
      'CBT 관점에서 보면, 이런 생각 패턴을 인식하는 것이 첫 번째 단계입니다.',
      '현재 상황을 다른 관점에서 바라보는 방법을 함께 찾아보겠습니다.',
      '스트레스 관리에 도움이 될 수 있는 몇 가지 기법을 제안드릴게요.',
      '감정은 우리에게 중요한 신호를 보내는 메신저입니다. 이 감정이 무엇을 말하려는지 들어보세요.',
      '긍정적 사고로 전환하는 방법을 함께 연습해보겠습니다.',
      '이런 상황에서 마음챙김 기법을 활용해보는 것은 어떨까요?',
      '인지 재구성 기법을 통해 다른 관점을 찾아보겠습니다.',
      '자기 동정과 함께 이 감정을 탐색해보겠습니다.',
      '현재 상황을 더 균형잡힌 관점에서 바라보는 방법을 함께 찾아보겠습니다.',
      '감정 관리에 도움이 될 수 있는 몇 가지 기법을 제안드릴게요.',
      '이런 감정을 느끼시는 것은 당연한 일입니다. 함께 이 감정을 이해해보겠습니다.',
      'CBT 기법을 통해 이 감정을 다루는 방법을 함께 찾아보겠습니다.',
      '현재 상황을 다른 각도에서 바라보는 방법을 함께 탐색해보겠습니다.'
    ];

    // 질문에 대한 응답
    if (isQuestion) {
      const questionResponses = [
        '좋은 질문이네요! CBT 관점에서 보면, 이런 질문을 하는 것 자체가 인지 재구성의 첫 단계입니다.',
        '그 질문에 대해 함께 생각해보겠습니다. 어떤 관점에서 바라보고 계신가요?',
        '흥미로운 질문입니다. 이 질문이 현재 감정 상태와 어떤 관련이 있을까요?',
        '그런 질문을 하시는 이유가 궁금합니다. 더 자세히 들려주세요.',
        'CBT에서는 이런 질문들이 중요한 역할을 합니다. 함께 탐색해보겠습니다.'
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }

    // 짧은 메시지에 대한 응답
    if (isShortMessage) {
      const shortResponses = [
        '네, 더 자세히 들려주세요.',
        '그런 감정을 느끼고 계시는군요. 더 구체적으로 말씀해주세요.',
        '어떤 상황에서 그런 감정을 느끼셨나요?',
        '그 감정에 대해 더 자세히 이야기해주세요.',
        '현재 상황을 더 구체적으로 설명해주시면 도움을 드릴 수 있을 것 같습니다.'
      ];
      return shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }

    // 일반적인 응답
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
}

export const geminiService = new GeminiService(); 