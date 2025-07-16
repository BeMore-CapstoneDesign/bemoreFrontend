# BeMore 백엔드 추가 요청사항

## 📋 **현재 상황 요약**

### ✅ **완료된 작업**
- 프론트엔드 API 서비스 완전 업데이트
- 파일 유효성 검사 로직 추가
- 분석 페이지 파일 업로드 개선
- 테스트 파일 가이드 작성

### ⚠️ **백엔드 수정 필요사항**
1. 파일 업로드 엔드포인트 500 에러 수정
2. 헬스 체크 엔드포인트 추가

## 🎯 **프론트엔드 개선사항**

### 1. 파일 유효성 검사 추가
```typescript
// 이미지 파일 검증
- 지원 형식: JPG, JPEG, PNG, GIF
- 최대 크기: 5MB
- 클라이언트 측 사전 검증

// 오디오 파일 검증  
- 지원 형식: WAV, MP3, M4A, OGG
- 최대 크기: 10MB
- 클라이언트 측 사전 검증
```

### 2. 타임아웃 설정 추가
```typescript
// 이미지 분석: 30초
// 음성 분석: 60초 (더 오래 걸림)
```

### 3. 사용자 친화적 오류 메시지
- 파일 형식 오류 시 명확한 안내
- 파일 크기 초과 시 제한 안내
- 업로드 진행률 표시 (향후 추가 예정)

## 🧪 **테스트 시나리오**

### 정상 파일 테스트
```bash
# 이미지 분석
curl -X POST http://localhost:3000/api/emotion/analyze/facial \
  -F "image=@실제이미지파일.jpg"

# 음성 분석
curl -X POST http://localhost:3000/api/emotion/analyze/voice \
  -F "audio=@실제오디오파일.wav"
```

### 오류 케이스 테스트
```bash
# 잘못된 형식
curl -X POST http://localhost:3000/api/emotion/analyze/facial \
  -F "image=@잘못된파일.txt"

# 대용량 파일
curl -X POST http://localhost:3000/api/emotion/analyze/voice \
  -F "audio=@대용량파일.wav"

# 빈 파일
curl -X POST http://localhost:3000/api/emotion/analyze/facial
```

## 📊 **예상 응답 형식**

### 성공 응답
```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.6,
      "arousal": 0.4,
      "dominance": 0.5
    },
    "confidence": 0.8,
    "primaryEmotion": "happy",
    "secondaryEmotions": ["excited", "content"],
    "analysis": {
      "facialFeatures": {},
      "voiceCharacteristics": {}
    },
    "recommendations": ["긍정적인 감정을 유지하세요"],
    "riskLevel": "low"
  },
  "message": "분석이 완료되었습니다."
}
```

### 오류 응답
```json
{
  "success": false,
  "error": "지원하지 않는 파일 형식입니다.",
  "statusCode": 400,
  "details": {
    "allowedFormats": ["jpg", "jpeg", "png", "gif"],
    "maxSize": "5MB"
  }
}
```

## 🔧 **추가 요청사항**

### 1. 헬스 체크 엔드포인트
```typescript
// GET /api/health
{
  "status": "ok",
  "timestamp": "2025-07-16T04:30:00.000Z",
  "service": "BeMore Backend",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected",
  "gemini": "available"
}
```

### 2. 파일 업로드 진행률 (향후)
```typescript
// WebSocket 또는 Server-Sent Events로 진행률 전송
{
  "type": "upload_progress",
  "progress": 75,
  "message": "파일 분석 중..."
}
```

### 3. 배치 처리 지원 (향후)
```typescript
// 여러 파일 동시 업로드
POST /api/emotion/analyze/batch
{
  "files": [file1, file2, file3],
  "sessionId": "session-123"
}
```

## 📞 **문의사항**

1. **파일 업로드 디렉토리 권한**: `./uploads/` 디렉토리 권한 설정 확인
2. **임시 파일 정리**: 업로드된 파일의 자동 정리 정책
3. **CDN 연동**: 대용량 파일 처리를 위한 CDN 연동 계획
4. **보안**: 파일 업로드 보안 정책 (바이러스 검사 등)

## 🎯 **우선순위**

1. **높음**: 파일 업로드 500 에러 수정
2. **높음**: 헬스 체크 엔드포인트 추가
3. **중간**: 오류 응답 형식 표준화
4. **낮음**: 진행률 표시 및 배치 처리

## 📅 **일정**

- **오늘**: 백엔드 수정 완료
- **내일**: 프론트엔드-백엔드 통합 테스트
- **이번 주**: 전체 기능 테스트 및 최적화

**프론트엔드 팀 드림** 