# 블로그 개선 계획

## 완료된 작업

### Phase 1 — 블로그 디자인 리뉴얼
- [x] VS Code Dark+ 테마 적용 (레이아웃, Activity Bar, Sidebar, Tabs, Breadcrumb, Status Bar)
- [x] Codicon 아이콘 CDN 연동
- [x] 반응형 디자인 (모바일 대응)

### Phase 2 — About 페이지 & GitHub README
- [x] 기술 스택 업데이트 (TypeScript, React Native, FastAPI, AWS, Cloudflare 등)
- [x] AWS 뱃지 커스텀 SVG base64 아이콘 적용
- [x] 프로젝트 카드 (진행중/진행완료) + 레포 링크
- [x] 자격증, 학습 현황, 연락처 정리
- [x] GitHub README (`l2juhan/l2juhan`) 동기화

---

## Phase 2.5 — 블로그 포스팅 Skills 생성

### 목표
Notion에서 정리한 내용을 블로그 포스트로 변환하는 Claude Skill을 카테고리별로 생성한다.

### 작업 흐름 (Skill이 수행할 워크플로우)
```
Notion 원본 → Skill 실행 → 블로그 스타일 변환 → 이미지 다운로드/저장 → _posts/ 파일 생성
```

### 현재 카테고리 & 포스트 현황
| 카테고리 | subcategory | 포스트 수 | 예시 |
|---|---|---|---|
| Frontend | ReactNative | 15 | expo 환경변수, react-navigation, 커스텀 캘린더 등 |
| Cloud | — | 7 | AWS 리전/AZ, VPC, IAM, 비용 최적화 등 |
| Dev-Tools | — | 4 | SuperClaude 시리즈 |
| Operating-System | — | 1 | 메모리 계층 & 캐시 |
| Database | — | 1 | 관계형 모델 & 관계 대수 |
| Linux | — | 1 | 리눅스마스터 2급 기출 |

### Front Matter 규격
```yaml
---
title: "제목"
date: YYYY-MM-DD
categories: [카테고리]       # Cloud, Frontend, Dev-Tools, Operating-System, Database, Linux
subcategory: 서브카테고리     # (선택) ReactNative 등
tags: [tag1, tag2, tag3]
toc: true
toc_sticky: true
---
```

### Skill 목록 (카테고리별)

#### 1. `post-frontend` — Frontend 포스트 작성
- **입력**: Notion 원본 텍스트 (React Native / Expo / React 관련)
- **처리**:
  - front matter 자동 생성 (categories: [Frontend], subcategory 판단)
  - 코드 블록 언어 태그 정리 (typescript, tsx, bash 등)
  - Notion 이미지 URL → 로컬 다운로드 → `/assets/images/posts/` 저장 → 상대경로 변환
  - 블로그 문체로 도입부/마무리 재구성
  - 파일명: `YYYY-MM-DD-slug.md` 형식으로 `_posts/` 에 저장

#### 2. `post-cloud` — Cloud/AWS 포스트 작성
- **입력**: Notion 원본 텍스트 (AWS SAA, 클라우드 서비스 관련)
- **처리**:
  - front matter 자동 생성 (categories: [Cloud])
  - AWS 서비스명 일관성 처리 (EC2, S3, Lambda 등)
  - 아키텍처 다이어그램 이미지 처리
  - 시험 관련 팁/주의사항 강조 포맷팅

#### 3. `post-cs` — CS 과목 포스트 작성
- **입력**: Notion 원본 텍스트 (OS, DB, 네트워크, 컴퓨터 구조 등)
- **처리**:
  - front matter 자동 생성 (categories 자동 판단: Operating-System, Database, Linux 등)
  - 수식/공식 → KaTeX/MathJax 변환 (필요 시)
  - 표/다이어그램 정리
  - 학술 용어 한/영 병기 유지

#### 4. `post-devtools` — Dev-Tools 포스트 작성
- **입력**: Notion 원본 텍스트 (개발 도구, 설정, 워크플로우 관련)
- **처리**:
  - front matter 자동 생성 (categories: [Dev-Tools])
  - CLI 명령어/설정 파일 코드 블록 정리
  - 설치/설정 순서 스텝 번호 매기기

### 공통 처리 로직 (모든 Skill 공유)
1. **Notion 이미지 해결**
   - Notion 임시 URL (`secure.notion-static.com`) → `assets/images/posts/{slug}/` 로 다운로드
   - Markdown 이미지 문법으로 변환: `![alt](/assets/images/posts/{slug}/image-name.png)`
   - Notion API 토큰이 필요한 경우 환경변수 `NOTION_TOKEN`에서 읽기
2. **블로그 문체 변환**
   - Notion 불릿 나열 → 설명형 문단 + 코드 예시 구조로 재구성
   - 도입부: 이 글에서 다루는 내용 1~2줄 요약
   - 마무리: 핵심 정리 또는 다음 글 예고
3. **파일 생성**
   - 파일명: `_posts/YYYY-MM-DD-{slug}.md`
   - 이미지 폴더: `assets/images/posts/{slug}/`
4. **Liquid 문법 충돌 방지**
   - Jekyll Liquid 태그(`{{ }}`, `{% %}`)가 코드 블록 안에 있으면 `{% raw %}...{% endraw %}` 래핑

---

## Phase 2.6 — 기존 포스트 이미지 복구

### 문제
Notion에서 마이그레이션된 32개 포스트에 이미지가 하나도 없음.
Notion의 이미지 URL은 임시 서명 URL이라 시간이 지나면 만료됨.

### 해결 방안
1. Notion API로 각 페이지의 이미지 블록 재조회
2. 서명된 URL에서 이미지 다운로드 → `assets/images/posts/{slug}/`에 저장
3. 포스트 본문에 이미지 삽입 위치 결정 (Notion 원본 블록 순서 기반)
4. 마크다운 이미지 문법으로 삽입

### 필요 사항
- Notion Integration Token (환경변수: `NOTION_TOKEN`)
- Notion 데이터베이스 ID 또는 페이지 ID 목록

---

## Phase 3 — Google AdSense 연동

### 목표
블로그에 Google AdSense를 연동하여 광고 수익화 기반을 마련한다.

### 작업 순서

#### 3-1. AdSense 가입 & 사이트 등록
- [ ] Google AdSense 계정 생성/로그인
- [ ] 사이트 URL (`https://l2juhan.github.io`) 등록
- [ ] AdSense 제공 메타 태그를 `_includes/vscode/head.html`에 삽입
- [ ] 소유권 인증 완료

#### 3-2. ads.txt 설정
- [ ] 루트에 `ads.txt` 파일 생성 (AdSense에서 제공하는 내용 복사)
- [ ] GitHub Pages 배포 확인

#### 3-3. 광고 코드 삽입
- [ ] 자동 광고 (Auto ads) 활성화 — 가장 간단한 방식
- [ ] 또는 수동 광고 단위 생성:
  - 포스트 상단 (제목 아래)
  - 포스트 하단 (마무리 뒤)
  - 사이드바 (선택)
- [ ] `_layouts/post.html`에 광고 코드 삽입
- [ ] VS Code 테마와 어울리는 광고 스타일링

#### 3-4. SEO & 검색 노출 최적화
- [ ] `sitemap.xml` 생성 확인 (jekyll-sitemap 플러그인 이미 설치됨)
- [ ] Google Search Console 등록 & sitemap 제출
- [ ] `robots.txt` 생성
- [ ] 각 포스트 meta description 확인
- [ ] Open Graph 태그 추가 (`_includes/vscode/head.html`)

#### 3-5. 승인 & 모니터링
- [ ] AdSense 승인 대기 (보통 1~14일)
- [ ] 승인 후 광고 노출 확인
- [ ] 수익 대시보드 모니터링

### 주의사항
- GitHub Pages는 정적 사이트이므로 서버사이드 광고 삽입은 불가 → 클라이언트 사이드 JS만 사용
- AdSense 정책: 충분한 콘텐츠(최소 10~15개 고품질 포스트) 필요 — 현재 32개 포스트로 충족
- 개인정보처리방침 페이지 필요할 수 있음

---

## 우선순위 & 진행 순서

```
Phase 2.5 (Skills 생성) → Phase 2.6 (이미지 복구) → Phase 3 (AdSense)
```

Phase 2.5의 Skills가 완성되면 이후 포스팅은 Notion → Skill 실행 한 번으로 완료 가능.
Phase 2.6은 Notion API 토큰이 필요하므로 토큰 준비 후 진행.
Phase 3은 콘텐츠가 충분히 갖춰진 후 진행하는 것이 AdSense 승인에 유리.
