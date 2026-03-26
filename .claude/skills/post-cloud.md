---
name: post-cloud
description: Notion의 Cloud/AWS 학습 노트를 블로그 포스트로 변환하여 발행합니다. Notion 페이지 제목이나 ID를 입력받아 블로그 스타일로 재구성합니다.
user_invocable: true
---

# post-cloud — AWS/Cloud 블로그 포스트 작성 Skill

## 개요
Notion의 Cloud/AWS 학습 노트를 Jekyll 블로그 포스트로 변환합니다.
인기 AWS 기술 블로그 스타일을 참고하여, SEO 최적화된 고품질 포스트를 생성합니다.

## 입력
사용자가 Notion 페이지 제목이나 ID를 지정하면, Notion API로 내용을 가져와서 블로그 스타일로 변환합니다.

## 워크플로우

### 1단계: Notion 페이지 내용 가져오기
- `scripts/fetch-notion-page.js` 스크립트를 사용하여 Notion 페이지의 블록을 Markdown으로 변환
- 이미지 블록이 있으면 `assets/images/posts/{slug}/`에 다운로드

### 2단계: Front Matter 생성
```yaml
---
title: "AWS CLF — [서비스명/주제] 개념 정리"
date: YYYY-MM-DD (오늘 날짜)
categories: [Cloud]
subcategory: AWS-CLF 또는 AWS-SAA
tags: [aws, 서비스명-영문, clf/saa, cloud, 한글키워드]
toc: true
toc_sticky: true
---
```
- 태그에 영문 공식 서비스명 + 한글 동의어를 함께 사용 (SEO 최적화)
- 제목 앞부분에 핵심 키워드 배치

### 3단계: 블로그 스타일 변환 (핵심)

#### 글 구조 (인기 AWS 블로그 패턴)
```markdown
[1-2문장 도입: 이 서비스가 무엇이고, 이 글에서 다루는 내용 요약]

## [서비스명]이란?
[공식 정의 인용(blockquote) → 쉬운 재정의 → 비유/유추]

## 주요 특징
[불릿 포인트 3-5개, 핵심 키워드 볼드 처리]

## 핵심 개념
### [하위 개념 1]
### [하위 개념 2]
[비교표 포함]

## 서비스 비교 / 분류
[Markdown 표로 정리]

## 정리
[핵심 포인트 요약 3-5줄]
```

#### 서비스 설명 5단계 패턴
1. **공식 정의 인용**: `> Amazon EC2는 ~하는 서비스입니다.`
2. **쉬운 재정의**: "쉽게 말하면, ~라고 생각하면 됩니다."
3. **비유/유추**: 일상 대상에 대응 ("S3는 구글 드라이브 같은 파일 저장 서비스")
4. **특징 나열**: 불릿 포인트 3-5개
5. **비교표**: 관련 서비스/옵션 비교 Markdown 표

#### 문체 규칙
- **경어체**: "~합니다/~입니다" 기본
- **전환 표현**: "쉽게 말하면", "간단히 정리하면", "한마디로"
- **시험 포인트 강조**: `> **시험 TIP**: ...` blockquote
- **이모지**: 사용하지 않음 (코드 주석 내 ✅/❌ 정도만 허용)
- **AWS 서비스명**: 항상 공식 명칭 사용 (Amazon S3, AWS Lambda, Amazon EC2)

#### 시각적 요소
- **표**: 서비스 비교, 옵션 비교, 요금 비교에 적극 활용
- **코드 블록**: CLI 명령어는 ```bash, JSON은 ```json, 정책은 ```json
- **볼드**: 핵심 용어, 서비스명 첫 등장 시
- **인용 블록**: 공식 정의, 시험 팁에 사용

### 4단계: Liquid 충돌 방지
- `{{ }}` 또는 `{% %}` 패턴이 코드 안에 있으면 `{% raw %}...{% endraw %}`로 래핑

### 5단계: 파일 저장
- 파일명: `_posts/YYYY-MM-DD-{slug}.md`
- 이미지: `assets/images/posts/{slug}/`

### 6단계: 검증
- front matter YAML 유효성
- 이미지 경로 존재 확인
- Liquid 태그 충돌 없는지 확인

## Notion API 설정
- 환경변수: `.env` 파일의 `NOTION_API_KEY`
- Notion SDK: `@notionhq/client` v5
- 스크립트: `scripts/fetch-notion-page.js`

## 카테고리 매핑
| Notion 소스 | subcategory | 태그 접두사 |
|---|---|---|
| AWS Cloud Practitioner Certification | AWS-CLF | clf |
| AWS Certified Solutions Architect | AWS-SAA | saa |

## SEO 최적화 체크리스트
- [ ] 제목 앞부분에 핵심 키워드 (AWS + 서비스명)
- [ ] 첫 문단에 핵심 키워드 자연스럽게 포함
- [ ] H2/H3에 검색 가능한 질문형 표현 ("[서비스명]이란?")
- [ ] 태그에 영문 + 한글 키워드 병기
- [ ] 비교표 포함 (Google featured snippet 노출 유리)
- [ ] 이미지 alt 텍스트에 설명적 문구
