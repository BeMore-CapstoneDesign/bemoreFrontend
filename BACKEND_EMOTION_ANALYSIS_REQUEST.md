# BeMore 감정 분석 API 개선 요청

## 🚨 **긴급 수정 필요사항**

### **현재 문제점**
백엔드 감정 분석 API가 항상 동일한 기본값만 반환하고 있습니다:

```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.5,    // 항상 50%
      "arousal": 0.5,    // 항상 50%
      "dominance": 0.5   // 항상 50%
    },
    "confidence": 0.5,   // 항상 50%
    "primaryEmotion": "calm",  // 항상 "calm"
    "secondaryEmotions": [],
    "analysis": {},
    "recommendations": [],
    "riskLevel": "low"
  }
}
```

## 🎯 **요청사항**

### 1. **실제 감정 분석 로직 구현**

#### **텍스트 기반 감정 분석**
```python
# 예시: 텍스트에서 감정 키워드 및 문맥 분석
def analyze_text_emotion(text: str) -> dict:
    # 긍정적 키워드: 기쁨, 좋아, 행복, 설레, 신나, 성공, 자신감
    # 부정적 키워드: 힘들어, 스트레스, 화나, 우울, 걱정, 불안
    # 강도 키워드: 정말, 너무, 완전히, 조금, 약간
    
    # VAD 점수 계산
    valence = calculate_valence(text)  # 0.0-1.0
    arousal = calculate_arousal(text)  # 0.0-1.0  
    dominance = calculate_dominance(text)  # 0.0-1.0
    
    # 주요 감정 분류
    primary_emotion = classify_emotion(valence, arousal, dominance)
    
    return {
        "valence": valence,
        "arousal": arousal, 
        "dominance": dominance,
        "primaryEmotion": primary_emotion,
        "confidence": calculate_confidence(text)
    }
```

#### **감정 분류 로직**
```python
def classify_emotion(valence: float, arousal: float, dominance: float) -> str:
    # 기쁨: 높은 긍정성 + 높은 각성도
    if valence > 0.7 and arousal > 0.6:
        return "happy"
    
    # 슬픔: 낮은 긍정성 + 낮은 각성도
    elif valence < 0.4 and arousal < 0.4:
        return "sad"
    
    # 분노: 낮은 긍정성 + 높은 각성도
    elif valence < 0.4 and arousal > 0.7:
        return "angry"
    
    # 놀람: 중간 긍정성 + 높은 각성도
    elif 0.3 < valence < 0.6 and arousal > 0.7:
        return "surprised"
    
    # 중립: 중간 긍정성 + 낮은 각성도
    else:
        return "neutral"
```

### 2. **테스트 케이스별 예상 결과**

#### **기쁨 테스트**
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=오늘 정말 기분이 좋아요. 새로운 일을 시작하게 되어서 설레고 있어요."
```

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.85,    // 높은 긍정성
      "arousal": 0.75,    // 높은 각성도
      "dominance": 0.65   // 중간 지배성
    },
    "confidence": 0.88,
    "primaryEmotion": "happy",
    "secondaryEmotions": ["excited", "confident"],
    "analysis": {
      "positiveKeywords": ["기분이 좋아요", "설레고 있어요"],
      "intensity": "high"
    },
    "recommendations": ["긍정적인 감정을 유지하세요"],
    "riskLevel": "low"
  }
}
```

#### **슬픔 테스트**
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=요즘 스트레스가 많아서 힘들어요. 아무것도 하고 싶지 않아요."
```

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.25,    // 낮은 긍정성
      "arousal": 0.35,    // 낮은 각성도
      "dominance": 0.30   // 낮은 지배성
    },
    "confidence": 0.82,
    "primaryEmotion": "sad",
    "secondaryEmotions": ["depressed", "tired"],
    "analysis": {
      "negativeKeywords": ["스트레스", "힘들어요", "하고 싶지 않아요"],
      "intensity": "medium"
    },
    "recommendations": ["충분한 휴식을 취하세요"],
    "riskLevel": "medium"
  }
}
```

#### **분노 테스트**
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=화가 나서 참을 수가 없어요. 이런 상황이 계속되면 어떻게 해야 할지 모르겠어요."
```

**예상 결과:**
```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.15,    // 매우 낮은 긍정성
      "arousal": 0.85,    // 매우 높은 각성도
      "dominance": 0.25   // 낮은 지배성
    },
    "confidence": 0.90,
    "primaryEmotion": "angry",
    "secondaryEmotions": ["frustrated", "helpless"],
    "analysis": {
      "negativeKeywords": ["화가 나서", "참을 수가 없어요", "모르겠어요"],
      "intensity": "high"
    },
    "recommendations": ["깊은 호흡을 하고 상황을 다시 생각해보세요"],
    "riskLevel": "high"
  }
}
```

### 3. **구현 우선순위**

#### **Phase 1: 기본 텍스트 분석 (1-2일)**
- [ ] 감정 키워드 사전 구축
- [ ] VAD 점수 계산 로직
- [ ] 감정 분류 알고리즘
- [ ] 신뢰도 계산

#### **Phase 2: 고급 분석 (2-3일)**
- [ ] 문맥 분석 (문장 구조, 어조)
- [ ] 감정 강도 분석
- [ ] 복합 감정 감지
- [ ] 위험 신호 감지

#### **Phase 3: 멀티모달 통합 (3-5일)**
- [ ] 음성 분석 통합
- [ ] 표정 분석 통합
- [ ] 가중치 기반 통합 분석
- [ ] 실시간 분석 최적화

### 4. **기술적 요구사항**

#### **성능 요구사항**
- 응답 시간: < 3초
- 동시 요청 처리: 100+ requests/second
- 메모리 사용량: < 512MB

#### **정확도 요구사항**
- 감정 분류 정확도: > 80%
- VAD 점수 오차: < 0.1
- 신뢰도 계산: 실제 분석 품질 반영

#### **확장성 요구사항**
- 새로운 감정 카테고리 추가 가능
- 다국어 지원 준비
- API 버전 관리

### 5. **테스트 방법**

#### **자동화 테스트**
```python
def test_emotion_analysis():
    test_cases = [
        {
            "input": "오늘 정말 기분이 좋아요",
            "expected": {"emotion": "happy", "valence": 0.8, "arousal": 0.7}
        },
        {
            "input": "화가 나서 참을 수가 없어요", 
            "expected": {"emotion": "angry", "valence": 0.2, "arousal": 0.9}
        }
        # ... 더 많은 테스트 케이스
    ]
    
    for test_case in test_cases:
        result = analyze_emotion(test_case["input"])
        assert result["primaryEmotion"] == test_case["expected"]["emotion"]
        assert abs(result["valence"] - test_case["expected"]["valence"]) < 0.1
```

#### **수동 테스트**
```bash
# 다양한 감정 테스트
curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=기쁨 테스트"

curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=슬픔 테스트"

curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -F "text=분노 테스트"
```

## 📞 **문의사항**

1. **현재 백엔드 감정 분석 로직 상태**: 어떤 단계까지 구현되어 있나요?
2. **사용 중인 AI 모델**: 어떤 감정 분석 모델을 사용하고 계신가요?
3. **개발 일정**: 언제까지 완료 가능한가요?
4. **테스트 데이터**: 감정 분석을 위한 테스트 데이터셋이 있나요?

## 🎯 **목표**

**단기 목표 (1주)**: 기본적인 텍스트 감정 분석이 정상 작동
**중기 목표 (2주)**: 다양한 감정 상태 정확히 분류
**장기 목표 (1개월)**: 멀티모달 통합 분석 완성

---

**연락처**: 프론트엔드 개발팀  
**우선순위**: 🔴 **높음** (사용자 경험에 직접적 영향)  
**예상 완료일**: 2025년 1월 23일 