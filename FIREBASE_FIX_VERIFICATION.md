# Firebase 권한 오류 해결 검증 가이드

## 수정 완료된 내용

### 1. Firestore 보안 규칙 수정 (`firestore.rules`)
- ✅ Create 시 `id` 필드 체크 제거 (Firebase가 자동 생성)
- ✅ `createdAt`/`updatedAt` 필드가 클라이언트에서 전송되지 않도록 체크 추가
- ✅ 빈 배열(`artworks`, `artistIds`) 허용
- ✅ Update 시 `createdAt` 변경 방지

### 2. Firestore 함수 수정 (`lib/firestore.ts`)
- ✅ `removeUndefinedValues` 헬퍼 함수 추가 (빈 배열, 빈 문자열, false 값 유지)
- ✅ `createExhibition`에서 `undefined` 값 제거 후 저장
- ✅ `updateExhibition`에서 `undefined` 값 제거 후 업데이트
- ✅ 에러 로깅 개선

### 3. ExhibitionForm 수정 (`components/exhibition/ExhibitionForm.tsx`)
- ✅ 빈 필드는 객체에 포함하지 않음
- ✅ 에러 처리 개선 (권한 오류 구분)

## 검증 절차

### 1. Firestore 규칙 배포
```bash
firebase deploy --only firestore:rules
```

### 2. 애플리케이션 재시작
- 개발 서버 재시작: `npm run dev`
- 브라우저 캐시 클리어 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 3. 테스트 시나리오

#### 테스트 1: 기본 전시 생성
1. 로그인 상태 확인
2. "Create New Exhibition" 클릭
3. 필수 필드만 입력:
   - Title: "Test Exhibition"
   - Description: "Test description"
4. "Create Exhibition" 클릭
5. ✅ **예상 결과**: 전시 생성 성공, 전시 페이지로 이동

#### 테스트 2: 모든 필드 포함 전시 생성
1. 로그인 상태 확인
2. "Create New Exhibition" 클릭
3. 모든 필드 입력:
   - Title: "Complete Exhibition"
   - Description: "Full description"
   - Statement: "Curatorial statement"
   - Curator: "John Doe"
   - Date: "2024"
   - Thumbnail 이미지 업로드
   - Genre: "Renaissance, Modern"
   - Tags: "painting, sculpture"
4. "Create Exhibition" 클릭
5. ✅ **예상 결과**: 전시 생성 성공

#### 테스트 3: 빈 선택 필드 전시 생성
1. 로그인 상태 확인
2. "Create New Exhibition" 클릭
3. 필수 필드만 입력, 선택 필드는 비워둠:
   - Title: "Minimal Exhibition"
   - Description: "Minimal description"
   - Statement: (비워둠)
   - Curator: (비워둠)
4. "Create Exhibition" 클릭
5. ✅ **예상 결과**: 전시 생성 성공 (undefined 오류 없음)

#### 테스트 4: 권한 오류 확인
1. 로그아웃 상태
2. 전시 생성 시도
3. ✅ **예상 결과**: "You must be logged in" 오류 메시지

### 4. 콘솔 확인 사항

브라우저 개발자 도구 콘솔에서 다음을 확인:

✅ **성공 시**:
```
Creating exhibition with data: { title: "...", description: "...", ... }
✅ Exhibition created successfully: <exhibition-id>
```

❌ **실패 시** (이제 발생하지 않아야 함):
```
❌ Error creating exhibition: FirebaseError: Missing or insufficient permissions
❌ Error creating exhibition: FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined
```

## 문제 해결

### 여전히 권한 오류가 발생하는 경우:

1. **Firebase 인증 상태 확인**
   ```javascript
   // 브라우저 콘솔에서 실행
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   console.log('Current user:', auth.currentUser);
   ```

2. **Firestore 규칙 배포 확인**
   ```bash
   firebase firestore:rules:get
   ```

3. **규칙 시뮬레이터 테스트**
   - Firebase Console → Firestore Database → Rules → Rules Playground
   - Operation: Create
   - Location: `exhibitions/{exhibitionId}`
   - Authenticated: true
   - User ID: 현재 사용자 UID
   - Data: 전시 데이터

### 여전히 undefined 오류가 발생하는 경우:

1. **데이터 확인**
   ```javascript
   // ExhibitionForm.tsx의 handleSubmit에서
   console.log('Exhibition data before cleaning:', exhibitionData);
   console.log('Exhibition data after cleaning:', removeUndefined(exhibitionDataRaw));
   ```

2. **removeUndefinedValues 함수 확인**
   - `lib/firestore.ts`의 함수가 제대로 정의되어 있는지 확인
   - 빈 배열이 제거되지 않는지 확인

## 최종 확인 체크리스트

- [ ] Firestore 규칙 배포 완료
- [ ] 애플리케이션 재시작 완료
- [ ] 로그인 상태 확인
- [ ] 기본 전시 생성 테스트 통과
- [ ] 모든 필드 포함 전시 생성 테스트 통과
- [ ] 빈 선택 필드 전시 생성 테스트 통과
- [ ] 콘솔에 에러 없음 확인
- [ ] Firebase Console에서 전시 문서 확인

## 추가 개선 사항

필요시 다음을 추가로 개선할 수 있습니다:

1. **에러 메시지 사용자 친화적 개선**
2. **로딩 상태 UI 개선**
3. **전시 생성 성공 알림 추가**
4. **Firestore 규칙 더 세밀한 검증 추가**

