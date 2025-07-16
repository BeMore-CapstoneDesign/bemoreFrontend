# BeMore API 테스트 파일 가이드

## 📁 **테스트 파일 구조**
```
test-files/
├── images/
│   ├── test-image.jpg      # 테스트용 이미지 (1MB 미만)
│   ├── test-image.png      # 테스트용 PNG 이미지
│   └── large-image.jpg     # 대용량 이미지 (5MB 근처)
├── audio/
│   ├── test-audio.wav      # 테스트용 WAV 오디오 (1MB 미만)
│   ├── test-audio.mp3      # 테스트용 MP3 오디오
│   └── large-audio.wav     # 대용량 오디오 (10MB 근처)
└── README.md
```

## 🎯 **지원 파일 형식**

### 이미지 파일
- **형식**: JPG, JPEG, PNG, GIF
- **최대 크기**: 5MB
- **권장 크기**: 1MB 미만 (테스트용)

### 오디오 파일
- **형식**: WAV, MP3, M4A, OGG
- **최대 크기**: 10MB
- **권장 크기**: 1MB 미만 (테스트용)

## 🧪 **API 테스트 명령어**

### 이미지 분석 테스트
```bash
# 정상 이미지 테스트
curl -X POST http://localhost:3000/api/emotion/analyze/facial \
  -F "image=@test-files/images/test-image.jpg"

# 대용량 이미지 테스트
curl -X POST http://localhost:3000/api/emotion/analyze/facial \
  -F "image=@test-files/images/large-image.jpg"
```

### 오디오 분석 테스트
```bash
# 정상 오디오 테스트
curl -X POST http://localhost:3000/api/emotion/analyze/voice \
  -F "audio=@test-files/audio/test-audio.wav"

# 대용량 오디오 테스트
curl -X POST http://localhost:3000/api/emotion/analyze/voice \
  -F "audio=@test-files/audio/large-audio.wav"
```

## 📝 **테스트 시나리오**

1. **정상 파일 테스트**: 지원 형식, 적정 크기
2. **대용량 파일 테스트**: 최대 크기 근처
3. **잘못된 형식 테스트**: 지원하지 않는 파일 형식
4. **빈 파일 테스트**: 파일이 없는 경우
5. **네트워크 오류 테스트**: 업로드 중단

## 🔍 **예상 응답**

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
    "analysis": {}
  },
  "message": "분석이 완료되었습니다."
}
```

### 오류 응답
```json
{
  "success": false,
  "error": "지원하지 않는 파일 형식입니다.",
  "statusCode": 400
}
``` 