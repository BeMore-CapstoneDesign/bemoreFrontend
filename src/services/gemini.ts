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
    // 로그 제거
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkRateLimit(): Promise<void> {
    // 개발/테스트 환경에서는 Rate Limit 강제 대기 비활성화
    return;
    // 아래 코드는 실제 서비스에서만 사용
    // const now = Date.now();
    // const timeSinceLastRequest = now - this.lastRequestTime;
    // if (this.requestCount >= 2 && timeSinceLastRequest < 60000) {
    //   const waitTime = 60000 - timeSinceLastRequest;
    //   await this.delay(waitTime);
    //   this.requestCount = 0;
    // }
    // if (timeSinceLastRequest < 5000) {
    //   await this.delay(5000 - timeSinceLastRequest);
    // }
    // this.lastRequestTime = Date.now();
    // this.requestCount++;
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

      // 로그 제거

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // 로그 제거

      if (!response.ok) {
        const errorText = await response.text();
        // 로그 제거
        
        // 429 에러 (Rate Limit)인 경우 특별 처리
        if (response.status === 429) {
          // 로그 제거
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
      // 로그 제거
      return false;
    }
  }

  async generateChatResponse(
    userMessage: string, 
    emotionContext?: EmotionAnalysis,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    let prompt = `당신은 BeMore의 전문 AI 상담사입니다. CBT(인지행동치료) 전문가로서 다음과 같은 역할을 수행합니다:

**핵심 역할:**
- 감정적 공감과 인지적 도전의 균형 유지
- 사용자의 부정적 사고 패턴을 건강한 관점으로 전환
- 실용적이고 구체적인 행동 변화 가이드 제공

**응답 원칙:**
1. **공감적 접근**: 사용자의 감정을 먼저 인정하고 공감
2. **인지 재구성**: 부정적 사고를 객관적이고 균형잡힌 관점으로 전환
3. **구체적 행동**: 즉시 실천 가능한 구체적인 행동 제안
4. **단계적 접근**: 한 번에 하나씩, 작은 변화부터 시작
5. **자기효능감 강화**: 사용자의 내적 자원과 강점 강조

**응답 스타일:**
- 따뜻하고 전문적인 톤
- 2-3문장으로 간결하고 명확하게
- 질문을 통한 자기성찰 유도
- 한국어로 자연스럽게

사용자 메시지: "${userMessage}"`;

    // 대화 히스토리 추가 (최근 3개 메시지)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      prompt += `\n\n**최근 대화 맥락:**`;
      recentMessages.forEach(msg => {
        prompt += `\n${msg.role === 'user' ? '사용자' : '상담사'}: ${msg.content}`;
      });
      prompt += `\n\n위 대화 맥락을 고려하여 연속성 있는 응답을 제공해주세요.`;
    }

    // 감정 컨텍스트가 있는 경우
    if (emotionContext) {
      const approach = this.getEmotionSpecificApproach(emotionContext.emotion);

      prompt += `

**감정 분석 결과:**
- 주요 감정: ${emotionContext.emotion} (신뢰도: ${(emotionContext.confidence * 100).toFixed(1)}%)
- VAD 점수: Valence=${emotionContext.vadScore.valence}, Arousal=${emotionContext.vadScore.arousal}, Dominance=${emotionContext.vadScore.dominance}

**CBT 분석:**
- 인지 왜곡: ${emotionContext.cbtFeedback.cognitiveDistortion}
- 도전적 질문: ${emotionContext.cbtFeedback.challenge}
- 대안적 사고: ${emotionContext.cbtFeedback.alternative}

**맞춤형 접근법:**
- 집중 영역: ${approach.focus}
- 권장 기법: ${approach.technique}
- 목표: ${approach.goal}

위 정보를 바탕으로 ${emotionContext.emotion} 감정에 특화된 맞춤형 응답을 제공해주세요.`;
    }

    try {
      return await this.callGeminiAPI(prompt);
    } catch (error) {
      // 로그 제거
      // Rate limit 에러인 경우 더 긴 대기 시간 후 재시도
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        await this.delay(5000);
      }
      
      return this.getFallbackResponse(userMessage);
    }
  }

  // 대화 분석 리포트 생성을 위한 전용 메서드
  async generateConversationAnalysis(conversationText: string): Promise<string> {
    const prompt = `당신은 BeMore의 CBT 전문가입니다. 다음 대화를 분석하여 전문적인 인사이트를 제공해주세요.

**분석할 대화 내용:**
${conversationText}

**분석 요청사항:**
1. **주요 감정 패턴** (3-4개): 사용자가 표현한 주요 감정과 그 패턴
2. **인지 왜곡 패턴** (2-3개): 부정적 사고 패턴이나 인지 왜곡
3. **구체적인 권장사항** (3-4개): 실천 가능한 행동 변화 제안
4. **추천 CBT 기법** (2-3개): 효과적인 CBT 치료 기법

**응답 형식:**
다음 JSON 형태로 정확히 응답해주세요. 한국어로 작성하되, JSON 키는 영어로 유지해주세요.

{
  "keyInsights": [
    "감정 표현이 활발하고 솔직했습니다",
    "스트레스 상황에 대한 대처 방식이 개선되었습니다",
    "자기비판적 사고 패턴이 관찰됩니다"
  ],
  "recommendations": [
    "정기적인 마음챙김 연습을 권장합니다",
    "일상에서 작은 감사 표현을 해보세요",
    "스트레스 관리 기법을 일상에 적용해보세요"
  ],
  "cbtTechniques": [
    "인지 재구성 기법",
    "사고 기록 작성",
    "행동 활성화 기법"
  ]
}

위 형식에 맞춰 분석 결과를 제공해주세요.`;

    try {
      return await this.callGeminiAPI(prompt);
    } catch (error) {
      // 에러 시 기본 분석 결과 반환
      return `{
  "keyInsights": [
    "감정 표현이 활발했습니다",
    "스트레스 상황에 대한 대처가 필요합니다",
    "자기성찰 능력이 뛰어납니다"
  ],
  "recommendations": [
    "정기적인 마음챙김 연습을 권장합니다",
    "일상에서 작은 감사 표현을 해보세요",
    "스트레스 관리 기법을 일상에 적용해보세요"
  ],
  "cbtTechniques": [
    "인지 재구성",
    "사고 기록",
    "행동 활성화"
  ]
}`;
    }
  }

  // 감정별 맞춤형 접근법 반환
  private getEmotionSpecificApproach(emotion: string) {
    const emotionApproaches = {
      'angry': {
        focus: '분노 관리와 인지 재구성',
        technique: '시간 두기 기법, 관점 전환, 분노의 근본 원인 탐색',
        goal: '건강한 분노 표현과 갈등 해결 방법 제시'
      },
      'sad': {
        focus: '우울감 완화와 자기 동정',
        technique: '활동 스케줄링, 긍정적 활동 찾기, 사회적 연결 유지',
        goal: '우울감에서 벗어나는 작은 단계들 제안'
      },
      'anxious': {
        focus: '불안 관리와 마음챙김',
        technique: '호흡 기법, 현재에 집중, 불안의 근거 검토',
        goal: '불안을 관리하는 실용적 방법 제공'
      },
      'happy': {
        focus: '긍정적 감정 활용과 유지',
        technique: '감사 연습, 긍정적 경험 확장, 회복력 강화',
        goal: '긍정적 감정을 더 오래 유지하는 방법 제시'
      },
      'neutral': {
        focus: '감정 인식과 자기 성찰',
        technique: '감정 라벨링, 현재 상태 점검, 목표 설정',
        goal: '감정 상태를 더 잘 이해하고 관리하는 방법 안내'
      }
    };

    return emotionApproaches[emotion as keyof typeof emotionApproaches] || emotionApproaches.neutral;
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