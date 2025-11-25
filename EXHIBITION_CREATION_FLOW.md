# WebMuseum 전시장 제작 흐름

## Step 1 — 작품 업로드

- **이미지 업로드**: 작품 이미지 파일 선택 및 업로드 (최대 10MB)
- **메타데이터 입력**:
  - 제목 (필수)
  - 아티스트명 (필수)
  - 캡션
  - 설명
  - 제작 연도
  - 매체 (Medium)
  - 크기 (Dimensions)
  - 장르 (Genre)
  - 태그 (Tags)
- **위치**: `/exhibition/[id]/manage` 페이지의 ArtworkManager 컴포넌트

## Step 2 — 순서 배치 (Drag & Drop)

- 작품 목록에서 드래그 앤 드롭으로 순서 조정
- 전시장의 스토리 뷰에서 작품이 표시되는 순서 결정
- 현재는 작품 생성 시간(createdAt) 순서로 정렬됨
- 향후 Drag & Drop 기능 구현 예정

## Step 3 — 스토리 / 텍스트 / 사운드 추가

- **스토리 텍스트**: 각 작품에 대한 캡션(Caption)과 설명(Description) 추가
- **전시장 스토리**: 전시장의 Statement(큐레이터 설명) 추가 가능
- **사운드**: 향후 오디오 파일 업로드 기능 추가 예정
- **위치**: ArtworkForm에서 작품별 텍스트, ExhibitionForm에서 전시장 설명

## Step 4 — 테마 선택 (무료 / 프리미엄)

- **시스템 테마**: Light / Dark / System (시스템 설정 따름)
- **전시장 테마**: 향후 전시장별 커스텀 테마 기능 추가 예정
- **위치**: SettingsPanel에서 사용자 테마 설정

## Step 5 — Publish & 공유 링크 자동 생성

- **공개 설정**: ExhibitionForm에서 "Make this exhibition public" 체크박스로 공개/비공개 설정
- **공유 링크 자동 생성**: 전시장 생성 시 고유 ID가 부여되며, 다음 URL 형식으로 자동 생성
  - 스토리 뷰: `/exhibition/[id]/story`
  - 갤러리 뷰: `/exhibition/[id]/gallery`
  - 3D 스페이스 뷰: `/exhibition/[id]/space`
- **관리 페이지**: `/exhibition/[id]/manage`에서 작품 추가 및 관리

---

## 추가 기능

### 3가지 뷰 모드
- **Narrative Scroll Exhibition (Story)**: 스크롤 기반 내러티브 전시
- **Artwork Gallery View (Gallery)**: 고품질 갤러리 뷰 (줌 기능 포함)
- **3D Exhibition Space (Space)**: 3D 가상 전시 공간

### 전시장 정보
- 제목, 설명, 큐레이터명
- 전시 기간 (시작일/종료일)
- 썸네일 이미지
- 장르 및 태그




