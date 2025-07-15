# BeMore 마이그레이션 계획: 프론트엔드 → 백엔드 중심 구조

## 🎯 **마이그레이션 목표**

### **현재 상태 (Phase 0)**
- ✅ Next.js 프론트엔드에서 직접 Gemini API 호출
- ✅ 기본 챗봇 기능 구현
- ✅ PDF 리포트 생성
- ❌ 보안 취약점 (API 키 노출)
- ❌ 확장성 제한

### **목표 상태 (Phase 3)**
- ✅ Flask 백엔드 중심 아키텍처
- ✅ 멀티모달 입력 처리 (음성, 표정, 텍스트)
- ✅ 데이터베이스 연동
- ✅ 보안 강화
- ✅ 확장 가능한 구조

---

## 📋 **단계별 마이그레이션 계획**

### **Phase 1: 하이브리드 구조 (1-2주)**

#### **목표**
- 프론트엔드와 백엔드가 공존하는 구조
- 점진적 마이그레이션으로 안정성 확보

#### **구현 내용**
```typescript
// src/services/api.ts - 하이브리드 API 서비스
class HybridApiService {
  async sendChatMessage(message: string): Promise<ChatMessage> {
    // 1. Flask 백엔드 우선 시도
    try {
      return await this.callFlaskBackend('/chat/send', { message });
    } catch (error) {
      // 2. 실패 시 프론트엔드 Gemini 직접 호출 (Fallback)
      console.warn('백엔드 연결 실패, 프론트엔드 직접 호출');
      return await this.callGeminiDirectly(message);
    }
  }
}
```

#### **환경 변수 설정**
```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key  # Fallback용
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_BACKEND=true  # 백엔드 우선 사용 여부
```

#### **장점**
- 기존 기능 유지하면서 점진적 전환
- 백엔드 장애 시에도 서비스 중단 없음
- 개발/테스트 환경에서 유연성 확보

---

### **Phase 2: 백엔드 중심 구조 (2-3주)**

#### **목표**
- Flask 백엔드가 주요 로직 담당
- 프론트엔드는 UI/UX에 집중

#### **Flask 백엔드 구현**
```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Gemini API 설정
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/api/v1/chat/send', methods=['POST'])
def send_chat():
    data = request.get_json()
    message = data.get('message')
    
    # CBT 전문가 프롬프트
    prompt = f"""
    당신은 BeMore의 전문 AI 상담사입니다. CBT(인지행동치료) 전문가로서 다음과 같은 역할을 수행합니다:
    
    **핵심 역할:**
    - 감정적 공감과 인지적 도전의 균형 유지
    - 사용자의 부정적 사고 패턴을 건강한 관점으로 전환
    - 실용적이고 구체적인 행동 변화 가이드 제공
    
    사용자 메시지: "{message}"
    
    위 원칙에 따라 따뜻하고 전문적인 톤으로 응답해주세요.
    """
    
    try:
        response = model.generate_content(prompt)
        return jsonify({
            'success': True,
            'data': {
                'id': str(uuid.uuid4()),
                'role': 'assistant',
                'content': response.text,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

#### **프론트엔드 수정**
```typescript
// src/services/api.ts - 백엔드 우선 구조
class ApiService {
  async sendChatMessage(message: string): Promise<ChatMessage> {
    // 백엔드 우선 사용
    if (process.env.NEXT_PUBLIC_USE_BACKEND === 'true') {
      try {
        return await this.callFlaskBackend('/chat/send', { message });
      } catch (error) {
        console.error('백엔드 연결 실패:', error);
        throw error;
      }
    }
    
    // 개발 환경에서만 프론트엔드 직접 호출
    return await this.callGeminiDirectly(message);
  }
}
```

#### **장점**
- API 키 보안 강화
- 중앙화된 비즈니스 로직
- 확장 가능한 구조

---

### **Phase 3: 완전한 백엔드 구조 (3-4주)**

#### **목표**
- 멀티모달 입력 처리
- 데이터베이스 연동
- 완전한 보안 구조

#### **Flask 백엔드 확장**
```python
# 멀티모달 감정 분석
@app.route('/api/v1/emotion/analyze', methods=['POST'])
def analyze_emotion():
    data = request.get_json()
    
    # 텍스트 감정 분석
    if 'text' in data:
        text_emotion = analyze_text_emotion(data['text'])
    
    # 음성 감정 분석 (Whisper + VAD)
    if 'audio' in data:
        audio_emotion = analyze_audio_emotion(data['audio'])
    
    # 표정 감정 분석 (MediaPipe)
    if 'image' in data:
        facial_emotion = analyze_facial_emotion(data['image'])
    
    # 통합 VAD 계산
    integrated_vad = calculate_integrated_vad([
        text_emotion, audio_emotion, facial_emotion
    ])
    
    # Gemini API로 CBT 피드백 생성
    cbt_feedback = generate_cbt_feedback(data['text'], integrated_vad)
    
    return jsonify({
        'success': True,
        'data': {
            'emotion': classify_emotion(integrated_vad),
            'confidence': calculate_confidence(integrated_vad),
            'vadScore': integrated_vad,
            'cbtFeedback': cbt_feedback
        }
    })
```

#### **데이터베이스 연동**
```python
# models.py
from sqlalchemy import create_engine, Column, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class UserSession(Base):
    __tablename__ = 'user_sessions'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    emotion_history = Column(JSON)
    chat_history = Column(JSON)

class EmotionAnalysis(Base):
    __tablename__ = 'emotion_analyses'
    
    id = Column(String, primary_key=True)
    session_id = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    emotion = Column(String, nullable=False)
    vad_score = Column(JSON)
    cbt_feedback = Column(JSON)
```

#### **프론트엔드 최종 수정**
```typescript
// src/services/api.ts - 완전한 백엔드 구조
class ApiService {
  constructor() {
    // 백엔드 우선 사용 강제
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_FLASK_API_URL,
      timeout: 30000,
    });
  }
  
  async sendChatMessage(message: string): Promise<ChatMessage> {
    const response = await this.api.post('/chat/send', { message });
    return response.data.data;
  }
  
  async analyzeEmotion(data: EmotionAnalysisData): Promise<EmotionAnalysis> {
    const formData = new FormData();
    // 멀티모달 데이터 전송
    const response = await this.api.post('/emotion/analyze', formData);
    return response.data.data;
  }
}
```

---

## 🔄 **마이그레이션 체크리스트**

### **Phase 1 체크리스트**
- [ ] Flask 백엔드 기본 구조 생성
- [ ] 하이브리드 API 서비스 구현
- [ ] 환경 변수 설정
- [ ] 기본 채팅 API 엔드포인트 구현
- [ ] Fallback 로직 테스트

### **Phase 2 체크리스트**
- [ ] Flask 백엔드 완전 구현
- [ ] 프론트엔드 API 서비스 수정
- [ ] 에러 처리 및 로깅 추가
- [ ] 보안 설정 (CORS, 인증 등)
- [ ] 성능 테스트

### **Phase 3 체크리스트**
- [ ] 멀티모달 입력 처리 구현
- [ ] 데이터베이스 스키마 설계
- [ ] 사용자 인증 시스템
- [ ] 세션 관리
- [ ] PDF 리포트 백엔드 생성
- [ ] 모니터링 및 로깅

---

## 🚀 **즉시 시작할 수 있는 작업**

### **1. Flask 백엔드 기본 구조 생성**
```bash
# 백엔드 디렉토리 생성
mkdir backend
cd backend

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 필요한 패키지 설치
pip install flask flask-cors google-generativeai python-dotenv
```

### **2. 기본 Flask 앱 생성**
```python
# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini API 설정
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/api/v1/chat/send', methods=['POST'])
def send_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    prompt = f"""
    당신은 BeMore의 전문 AI 상담사입니다. CBT(인지행동치료) 전문가로서 다음과 같은 역할을 수행합니다:
    
    **핵심 역할:**
    - 감정적 공감과 인지적 도전의 균형 유지
    - 사용자의 부정적 사고 패턴을 건강한 관점으로 전환
    - 실용적이고 구체적인 행동 변화 가이드 제공
    
    사용자 메시지: "{message}"
    
    위 원칙에 따라 따뜻하고 전문적인 톤으로 응답해주세요.
    """
    
    try:
        response = model.generate_content(prompt)
        return jsonify({
            'success': True,
            'data': {
                'id': str(uuid.uuid4()),
                'role': 'assistant',
                'content': response.text,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### **3. 환경 변수 설정**
```bash
# backend/.env
GEMINI_API_KEY=your_gemini_api_key
FLASK_SECRET_KEY=your_secret_key
```

### **4. 프론트엔드 환경 변수 업데이트**
```bash
# .env.local
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_BACKEND=true
```

---

## 📊 **성공 지표**

### **기술적 지표**
- [ ] API 키가 프론트엔드에 노출되지 않음
- [ ] 백엔드 응답 시간 < 3초
- [ ] 에러율 < 1%
- [ ] 99.9% 가동률

### **비즈니스 지표**
- [ ] 사용자 경험 개선
- [ ] 개발 속도 향상
- [ ] 유지보수 비용 감소
- [ ] 보안 강화

---

## 🎯 **결론**

**현재 프론트엔드에서 직접 Gemini API 호출하는 방식은 초기 개발에는 적합하지만, 장기적으로는 문제가 됩니다.**

**권장사항:**
1. **즉시 Phase 1 시작** - 하이브리드 구조로 안전한 전환
2. **2주 내 Phase 2 완료** - 백엔드 중심 구조 구축
3. **1개월 내 Phase 3 완료** - 완전한 멀티모달 시스템

이렇게 하면 **보안, 확장성, 유지보수성**을 모두 확보할 수 있습니다! 🚀 