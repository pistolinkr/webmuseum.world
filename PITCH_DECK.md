# 🖼 **WebMuseum Pitch Deck (한국어 버전)**

## **00. 표지**

```
# WebMuseum

### 예술이 경험이 되는 공간
A new way to experience art online

#### 나만의 전시를 만들고, 관객을 소유하세요.
Build your museum for Artwork, Music, Design, Science, Engineering...
```

---

## **01. 문제점 (Problem)**

```
• 기존 포트폴리오 플랫폼(Behance, Artstation)은 작품 나열 수준에 머무름

• 아티스트가 팬과 관계를 형성하거나 스토리를 전달하기 어려움

• 창작물이 아닌 '경험'을 제공하는 온라인 전시 플랫폼이 부재

• 크리에이터 이코노미는 폭발적 성장 중이지만, 예술 분야는 소외됨

• 온라인 전시는 단순 이미지 갤러리 수준, 실제 미술관 경험과 거리가 멀음
```

---

## **02. 기회 (Opportunity)**

```
Creator Economy 시장 규모: $104B (2022) → $200B+ (2025 예상)
아직 경쟁 사이트가 많지 않음. Artstation.com 정도.

예술 + 경험 + 구독 모델 → 고성장 섹터

(M)Z세대·북미 창작자 → 경험 중심 플랫폼 우선 소비 경향

온라인 전시 시장: COVID-19 이후 급성장, 하지만 기술적 한계로 몰입도 낮음
```

---

## **03. 해결책 (Solution)**

```
WebMuseum — 몰입형 온라인 전시 플랫폼

✅ 현재 구현 완료:
• 3가지 전시 뷰 모드 (Story / Gallery / 3D Space)
• 작품 업로드 및 전시장 생성 시스템
• 아티스트 프로필 및 팔로우 시스템
• 전시장 탐색 및 발견 기능
• 소셜 로그인 (Google, GitHub, Microsoft, Apple)
• Passkey 인증 (비밀번호 없는 로그인)

🚧 개발 중:
• 구독/결제 시스템
• 작품 판매 기능
• 통계 대시보드
• 댓글 및 좋아요 기능
• 사운드/오디오 추가 기능

🎯 향후 계획:
• 3D/VR 전시장 엔진 고도화
• AI 기반 전시 추천 시스템
• 커뮤니티 기능 강화
```

---

## **04. 타겟 사용자 (Target Users)**

```
🎯 초기 주 타겟:

• 미술 / 디자인 전공 대학생
• 프리랜서 그래픽 아티스트, 일러스트레이터
• 설치·전시 예술가
• 디지털 아트 크리에이터
• 사진작가 및 시각 예술가

🌎 출시 지역:

• 북미 (미국 / 캐나다) 우선
• 글로벌 확장 (한국, 유럽)

👥 관객 타겟:

• 예술 애호가 및 컬렉터
• 디자인/예술 전공 학생
• 온라인 전시 관람 문화에 관심 있는 사용자
```

---

## **05. 제품 — MVP 핵심 기능**

### ✅ **현재 구현 완료된 기능**

```
1. 전시 제작 시스템
   • 작품 이미지 업로드 (최대 10MB)
   • 작품 메타데이터 입력 (제목, 아티스트, 설명, 연도, 매체 등)
   • 전시장 생성 및 관리
   • 전시장 썸네일 및 설명 추가

2. 3가지 전시 뷰 모드
   • Story View: GSAP 기반 스크롤 내러티브 전시
   • Gallery View: PhotoSwipe 기반 고품질 갤러리 (줌/팬 기능)
   • Space View: Three.js 기반 3D 가상 전시 공간

3. 사용자 인증 시스템
   • 소셜 로그인 (Google, GitHub, Microsoft, Apple)
   • 이메일 인증 (Magic Link, 인증 코드)
   • Passkey 인증 (WebAuthn)
   • 사용자 프로필 관리

4. 탐색 및 발견
   • 전시장 탐색 페이지 (/discover, /explore)
   • 아티스트 프로필 페이지
   • Featured Exhibitions / Featured Artists
   • 장르/태그 기반 필터링

5. 전시장 관리
   • 작품 추가/수정/삭제
   • 전시장 편집
   • 공개/비공개 설정
   • 공유 링크 자동 생성
```

### 🚧 **개발 예정 기능**

```
• 구독 시스템 (관객 프리미엄 / 아티스트 Pro)
• 작품 판매 및 수수료 시스템
• 통계 대시보드 (조회수, 좋아요, 수익)
• 댓글 및 좋아요 기능
• 사운드/오디오 추가 기능
• 작품 순서 Drag & Drop 재배치
• 전시장 커스텀 테마 선택
```

---

## **06. 로드맵**

```
✅ Phase 0 (완료) — MVP 핵심 기능 개발
   • 3가지 전시 뷰 모드 구현
   • 작품 업로드 및 전시장 생성
   • 사용자 인증 시스템
   • 기본 탐색 기능

🚧 Phase 1 (진행 중) — 커뮤니티 기능
   • 댓글 및 좋아요 시스템
   • 팔로우 및 알림 기능
   • 북마크 기능
   • 작품 순서 재배치 (Drag & Drop)

📅 Phase 2 (2-4개월) — 수익화 기능
   • 구독 시스템 (Stripe 연동)
   • 작품 판매 기능
   • 통계 대시보드
   • 정산 시스템

📅 Phase 3 (4-6개월) — 고도화
   • AI 기반 추천 알고리즘
   • 커뮤니티 기능 강화
   • 모바일 앱 (React Native)
   • 사운드/오디오 지원

📅 Phase 4 (6개월 이후) — 확장
   • 3D/VR 전시장 엔진 고도화
   • AR 전시 기능
   • 전시 공모전 플랫폼
   • 스폰서십 및 이벤트 기능
```

---

## **07. 비즈니스 모델**

```
💰 수익 모델:

1. 구독 서비스
   • 관객 프리미엄 구독 — $4.99/월
     - 무제한 프리미엄 전시 관람
     - 광고 제거
     - 우선 지원
   
   • 아티스트 Pro 구독 — $8~12/월
     - 무제한 전시장 생성
     - 통계 대시보드
     - 커스텀 도메인
     - 우선 노출
   
   • 아티스트 Studio 플랜 — $25~29/월
     - Pro 기능 + 작품 판매
     - 수익 분석 고급 기능
     - 전시장 커스텀 테마
     - API 접근

2. 거래 수수료
   • 작품 판매 수수료 — 10~15%
   • 전시 티켓 판매 수수료 — 5~10%

3. 프리미엄 기능
   • 전시장 커스텀 테마 (일회성 구매)
   • 추가 스토리지 용량
   • 우선 노출 (프로모션)

4. B2B 서비스
   • 미술관/갤러리 전시 플랫폼 라이선스
   • 기업 전시 이벤트 호스팅
   • 교육 기관 라이선스
```

---

## **08. 시장 진입 전략 (Go-To-Market)**

```
📱 마케팅 채널:

1. 소셜 미디어
   • Instagram / TikTok 비주얼 중심 캠페인
   • 전시장 미리보기 영상 제작
   • 아티스트 인터뷰 콘텐츠

2. 커뮤니티 마케팅
   • Reddit 커뮤니티 활용
     - r/ArtSchool
     - r/Design
     - r/DigitalArt
     - r/ContemporaryArt
   • Discord 서버 운영
   • 아티스트 커뮤니티 파트너십

3. 직접 초대
   • Behance / Artstation 아티스트 직접 DM
   • 미술 대학 학생회 협력
   • 갤러리 큐레이터 네트워킹

4. 이벤트 마케팅
   • Exhibition Launch Challenge 개최
   • 주간 Featured Artist 선정
   • 협업 전시 프로젝트

5. 콘텐츠 마케팅
   • 블로그: "온라인 전시 제작 가이드"
   • YouTube: 전시 제작 튜토리얼
   • 뉴스레터: 주간 아티스트 스포트라이트
```

### **KPI(Key Performance Indicator) 목표**

```
📊 6개월 목표:

• 아티스트 1,000명 가입
• 전시장 500개 생성
• 월간 활성 사용자 (MAU) 5,000명
• SNS 팔로워 10,000명
• 이메일 대기자 3,000명 확보
• 평균 전시장 조회수 100회/전시

📊 12개월 목표:

• 아티스트 5,000명 가입
• 전시장 3,000개 생성
• 월간 활성 사용자 (MAU) 25,000명
• 유료 구독자 500명
• 월간 수익 $10,000
```

---

## **09. 경쟁 분석 (Competitive Landscape)**

| 플랫폼 | 중심 기능 | 한계점 | WebMuseum 차별점 |
| --- | --- | --- | --- |
| **Behance.net** | 포트폴리오 | 수익화 불가 / 전시 경험 부재 / 작품 나열 중심 | 스토리 기반 몰입형 전시 / 3가지 뷰 모드 / 수익화 지원 |
| **Artstation** | 3D·콘셉트 아트 | 작품 나열 중심 / 인터랙션 부족 / 커뮤니티 약함 | 인터랙티브 전시 + 팬 경험 / 3D 가상 공간 / 커뮤니티 중심 |
| **Patreon** | 후원·구독 | 예술적 경험 제공 없음 / 단순 후원 플랫폼 | 예술 + 감상 + 커뮤니티 융합 / 전시 경험 제공 |
| **Artsy** | 아트 마켓플레이스 | 고가 작품 중심 / 일반 아티스트 접근 어려움 | 모든 아티스트 접근 가능 / 무료 시작 / 단계적 수익화 |
| **Behance Pro** | 포트폴리오 강화 | Pro 가입만으로 노출 증가 보장 없음 / 여전히 나열 중심 | 유료 가입자는 노출 강화 + 전시 경험 차별화 |

### **핵심 차별화 포인트**

```
1. 3가지 전시 뷰 모드
   • Story: 스크롤 기반 내러티브
   • Gallery: 고품질 줌 갤러리
   • Space: 3D 가상 전시 공간

2. 전시 경험 중심
   • 단순 포트폴리오가 아닌 "전시" 개념
   • 작품 간 스토리텔링 지원
   • 몰입형 경험 제공

3. 아티스트 친화적
   • 무료로 시작 가능
   • 쉬운 전시 제작 도구
   • 단계적 수익화 경로

4. 기술적 우위
   • Next.js 14 + React 18 (최신 기술 스택)
   • GSAP 애니메이션
   • Three.js 3D 렌더링
   • Firebase 실시간 동기화
```

---

## **10. 기술 스택 (Tech Stack)**

```
🎨 Frontend
• Next.js 14 (App Router)
• React 18
• TypeScript
• Tailwind CSS
• GSAP + ScrollTrigger (애니메이션)
• PhotoSwipe (갤러리)
• Three.js + React Three Fiber (3D)
• Framer Motion (UI 애니메이션)

🔥 Backend & Infrastructure
• Firebase
   - Firestore (데이터베이스)
   - Authentication (인증)
   - Storage (미디어 저장)
   - Functions (서버리스)
• Cloudflare R2 / AWS S3 (대용량 미디어)
• Vercel (호스팅)

🔐 인증
• 소셜 로그인 (Google, GitHub, Microsoft, Apple)
• 이메일 인증 (Magic Link, 인증 코드)
• WebAuthn Passkey (비밀번호 없는 로그인)

📦 주요 라이브러리
• botid (봇 방지)
• clsx, tailwind-merge (스타일링 유틸)
```

---

## **11. 비전 (Vision)**

```
🌍 벽이 없는 글로벌 미술관

• 지리적, 물리적 제약 없는 예술 경험
• 전 세계 아티스트와 관객을 연결
• 모든 사람이 접근 가능한 예술 공간

🎨 창작자가 중심이 되는 예술 생태계

• 아티스트가 직접 전시를 기획하고 소유
• 수익화를 통한 지속 가능한 창작 활동 지원
• 팬과의 직접적인 관계 형성

💫 관객과 작품이 진짜 연결되는 공간

• 단순 감상이 아닌 몰입형 경험
• 작품에 대한 스토리와 맥락 제공
• 커뮤니티를 통한 깊이 있는 소통
```

---

## **12. 행동 요청 (Call to Action)**

```
🚀 예술 전시의 미래를 함께 만들어주세요

• 투자 문의: [이메일]
• 파트너십 제안: [이메일]
• 창작자 참여: webmuseum.world/discover
• 베타 테스터 신청: [링크]

📧 연락처
• 이메일: [이메일 주소]
• 웹사이트: webmuseum.world
• GitHub: [GitHub 링크]
```

---

---

# 🧩 **MVP UX 흐름 (Wireframe)**

## **🔷 1) 랜딩 페이지**

```
✅ 현재 구현:
• WebMuseum 로고
• Hero: "A new way to experience art online"
• CTA: "Explore exhibitions" 버튼
• Featured Artist 섹션
• Featured Exhibitions 섹션
• 서비스 특징 (3가지 뷰 모드)
• Landing Footer

🚧 추가 예정:
• "전시장 만들기" CTA 버튼
• 이메일 대기 등록 폼
• 사용자 후기/테스티모니얼
• 가격 플랜 소개
```

---

## **🔷 2) 전시 제작 흐름**

```
✅ Step 1 — 작품 업로드
   • 이미지 파일 선택 (최대 10MB)
   • 제목, 아티스트명 입력
   • 캡션, 설명, 연도, 매체 등 메타데이터 입력
   • 위치: /exhibition/[id]/manage

🚧 Step 2 — 순서 배치 (Drag & Drop)
   • 작품 목록에서 드래그 앤 드롭으로 순서 조정
   • 현재는 생성 시간 순서로 정렬
   • 향후 구현 예정

✅ Step 3 — 스토리 / 텍스트 추가
   • 각 작품에 캡션(Caption)과 설명(Description) 추가
   • 전시장 Statement(큐레이터 설명) 추가
   • 위치: ArtworkForm, ExhibitionForm

🚧 Step 4 — 테마 선택 (무료 / 프리미엄)
   • 시스템 테마: Light / Dark / System
   • 전시장별 커스텀 테마 (향후 구현)

✅ Step 5 — Publish & 공유 링크 자동 생성
   • "Make this exhibition public" 체크박스
   • 공유 링크 자동 생성:
     - /exhibition/[id]/story
     - /exhibition/[id]/gallery
     - /exhibition/[id]/space
```

---

## **🔷 3) 전시 관람 인터페이스**

```
✅ Story View (현재 구현)
   • 풀스크린 스크롤 내러티브
   • GSAP 기반 페이드인 애니메이션
   • 작품 이미지 + 제목 + 설명
   • "View Details" 링크

✅ Gallery View (현재 구현)
   • 그리드 레이아웃
   • PhotoSwipe 기반 줌/팬 기능
   • 작품 상세 정보 표시
   • 키보드/터치 네비게이션

✅ Space View (현재 구현)
   • Three.js 기반 3D 공간
   • 벽에 작품 프레임 배치
   • OrbitControls로 탐색
   • 작품 클릭 시 상세 페이지 이동

🚧 추가 예정
   • 배경 음악 / 사운드
   • 챕터 네비게이션
   • 좋아요 / 댓글 / 팔로우 버튼
   • 공유 기능
```

---

## **🔷 4) 아티스트 대시보드**

```
✅ 현재 구현
   • 사용자 계정 페이지 (/account)
   • 프로필 편집 기능
   • 내 전시장 목록
   • 설정 패널 (알림, 프라이버시, 테마)

🚧 개발 예정
   • 조회수 / 좋아요 / 수익 / 구독자 통계
   • 전시장별 상세 분석
   • 정산 및 수익 관리
   • 팔로워 메시지 관리
   • 작품 판매 관리
```

---

## **🔷 5) 유저 시점 (Audience View)**

```
✅ 현재 구현
   • 추천 / 신규 / 인기 전시 피드 (/discover, /explore)
   • 아티스트 프로필 페이지 (/artist/[id])
   • 전시장 상세 페이지 (/exhibition/[id])
   • 사용자 프로필 페이지 (/user/[id])

🚧 추가 예정
   • 아티스트 구독 기능
   • 후원하기 버튼
   • 팔로우 / 공유 기능
   • 북마크 기능
   • 댓글 시스템
```

---

## **🔷 6) 인증 플로우**

```
✅ 현재 구현
   • 소셜 로그인 (Google, GitHub, Microsoft, Apple)
   • 이메일 인증 (Magic Link, 인증 코드)
   • Passkey 인증 (WebAuthn)
   • 회원가입 / 로그인 페이지
   • 프로필 생성 및 편집

✅ 보안 기능
   • Firebase Authentication
   • 이메일 인증 코드 검증
   • Passkey 등록 및 인증
   • 세션 관리
```

---

## **📝 디자이너를 위한 추가 정보**

### **디자인 시스템**

```
🎨 색상
• 다크/라이트 테마 지원
• CSS 변수 기반 테마 시스템
• 부드러운 모서리 (Smooth Corner)

📐 레이아웃
• 반응형 디자인 (모바일 우선)
• 최대 너비 제한 (컨텐츠 가독성)
• 일관된 간격 시스템

✨ 애니메이션
• GSAP 기반 스크롤 애니메이션
• Framer Motion UI 애니메이션
• 부드러운 페이지 전환

🖼️ 이미지 처리
• 최대 10MB 업로드 제한
• 자동 최적화 (향후 구현)
• Lazy loading
• 고품질 줌 지원 (PhotoSwipe)
```

### **주요 컴포넌트**

```
• LandingHero: 메인 히어로 섹션
• LandingFeatures: 기능 소개
• FeaturedExhibitions: 추천 전시장
• FeaturedArtists: 추천 아티스트
• ExhibitionForm: 전시장 생성/편집 폼
• ArtworkForm: 작품 업로드 폼
• StoryView: 스토리 뷰 컴포넌트
• GalleryView: 갤러리 뷰 컴포넌트
• SpaceView: 3D 스페이스 뷰 컴포넌트
• ModeSwitcher: 뷰 모드 전환 버튼
```

### **현재 UI 상태**

```
✅ 완성된 페이지
• 랜딩 페이지 (/)
• 전시장 페이지 (/exhibition/[id]/*)
• 탐색 페이지 (/discover, /explore)
• 아티스트 페이지 (/artist/[id])
• 사용자 계정 페이지 (/account)
• 인증 페이지 (/auth/login, /auth/signup)

🚧 개선 필요
• 모바일 반응형 최적화
• 접근성 개선 (ARIA 라벨 등)
• 로딩 상태 UI
• 에러 처리 UI
• 빈 상태 (Empty State) 디자인
```

---

**문서 작성일**: 2024년
**프로젝트 버전**: MVP (v0.1.0)
**상태**: 개발 진행 중




