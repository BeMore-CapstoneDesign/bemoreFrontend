# BeMore 백엔드 환경 변수 설정 상태

## ✅ 수정 완료된 항목

### 1. 중복 제거
- 중복된 `GEMINI_API_KEY` 라인 제거
- 파일 구조 정리

### 2. 보안 강화
- `JWT_SECRET`을 기본값에서 실제 값으로 변경
- `bemore-jwt-secret-key-2024`로 설정

### 3. 현재 설정 상태
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bemore"

# Gemini API
GEMINI_API_KEY="AIzaSyDGVKTfBli9qhZZp-meGJacOFjqeuQcCl4"

# JWT
JWT_SECRET="bemore-jwt-secret-key-2024"

# Server
PORT=3000

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DEST="./uploads"
```

## ⚠️ 해결해야 할 문제

### 1. PostgreSQL 데이터베이스 연결
**현재 상태**: PostgreSQL이 설치되지 않았거나 실행되지 않음

**해결 방법**:
```bash
# 방법 1: Homebrew로 PostgreSQL 설치 및 실행
brew install postgresql
brew services start postgresql

# 방법 2: Docker로 PostgreSQL 실행 (권장)
docker run --name bemore-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bemore \
  -p 5432:5432 \
  -d postgres

# 방법 3: DATABASE_URL을 SQLite로 변경 (개발용)
DATABASE_URL="file:./dev.db"
```

### 2. 데이터베이스 URL 수정
**현재**: `postgresql://username:password@localhost:5432/bemore`
**권장**: 실제 데이터베이스 정보로 수정

```env
# PostgreSQL 사용 시
DATABASE_URL="postgresql://postgres:password@localhost:5432/bemore"

# SQLite 사용 시 (개발용)
DATABASE_URL="file:./dev.db"
```

## 🚀 백엔드 서버 실행 단계

### 1단계: 데이터베이스 설정
```bash
# PostgreSQL 설치 (선택사항)
brew install postgresql
brew services start postgresql

# 또는 Docker 사용
docker run --name bemore-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bemore \
  -p 5432:5432 \
  -d postgres
```

### 2단계: 환경 변수 수정
```bash
# .env 파일에서 DATABASE_URL 수정
DATABASE_URL="postgresql://postgres:password@localhost:5432/bemore"
```

### 3단계: 데이터베이스 마이그레이션
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# 또는 데이터베이스 초기화
npx prisma db push
```

### 4단계: 백엔드 서버 실행
```bash
npm run start:dev
```

## 📋 체크리스트

- [ ] PostgreSQL 설치 및 실행
- [ ] DATABASE_URL 수정
- [ ] Prisma 마이그레이션 실행
- [ ] 백엔드 서버 실행
- [ ] API 엔드포인트 테스트

## 🔧 빠른 해결 방법 (개발용)

SQLite를 사용하여 빠르게 시작하려면:

```env
# .env 파일에서 DATABASE_URL만 수정
DATABASE_URL="file:./dev.db"
```

그 후:
```bash
npx prisma db push
npm run start:dev
```

## 🚨 주의사항

1. **프로덕션 환경**: 반드시 강력한 JWT_SECRET 사용
2. **데이터베이스**: 프로덕션에서는 PostgreSQL 권장
3. **API 키**: Gemini API 키는 안전하게 관리
4. **파일 업로드**: UPLOAD_DEST 디렉토리 생성 필요

## 📞 문제 해결

문제가 발생하면 다음 정보를 확인하세요:
- 백엔드 서버 로그
- 데이터베이스 연결 상태
- 환경 변수 설정
- 포트 사용 상태 (`lsof -i :3000`) 