---
title: "SuperClaude 16개 에이전트 시스템"
date: 2026-02-26
categories: [Dev-Tools]
tags: [claude-code, superclaude, agents, ai]
toc: true
toc_sticky: true
---

SuperClaude v4의 16개 에이전트 시스템을 정리합니다.

## v3 → v4 변경점

| 항목 | v3 | v4.2 |
|---|---|---|
| 이름 | 페르소나 (Persona) | **에이전트 (Agent)** |
| 개수 | 11개 | **16개** |
| 조합 | 1개만 활성화 | **여러 개 동시 조합** |
| PM | 없음 | **PM Agent (메타 레이어, 자동 학습)** |
| Deep Research | 없음 | **DR Agent (자율 웹 리서치)** |

## 16개 에이전트 목록

| # | 에이전트 | 전문 분야 | 자동 활성화 조건 |
|---|---|---|---|
| 1 | **backend-architect** | 서버, API, DB | API, 서버 코드 |
| 2 | **frontend-architect** | UI/UX, 프론트엔드 | .tsx, .jsx 파일 |
| 3 | **security-engineer** | 보안, OWASP | 인증, JWT |
| 4 | **performance-engineer** | 성능 최적화 | 느린 코드, 메모리 릭 |
| 5 | **root-cause-analyst** | 근본 원인 분석 | 에러, 버그, 장애 |
| 6 | **quality-engineer** | 테스트, 품질 보증 | 테스트 관련 |
| 7 | **refactoring-expert** | 코드 구조 개선 | 리팩토링 |
| 8 | **python-expert** | Python 전문가 | .py 파일 |
| 9 | **system-architect** | 대규모 시스템, 확장성 | 시스템 설계 |
| 10 | **devops-architect** | CI/CD, 배포, 인프라 | Docker, 파이프라인 |
| 11 | **learning-guide** | 학습, 멘토링 | 설명, 학습 요청 |
| 12 | **technical-writer** | 문서화 | 문서 작성 |
| 13 | **pm-agent** | **메타 레이어.** 자동 문서화 + 학습 | 작업 완료 후 자동 |
| 14 | **deep-research** | 자율 웹 리서치 | `/sc:research` |
| 15 | **business-analyst** | 비즈니스 분석 | `/sc:business-panel` |
| 16 | **orchestrator** | 멀티 에이전트 조율 | `/sc:spawn` |

## 자동 조합 예시

같은 `/sc:implement`라도 뭘 구현하느냐에 따라 다른 에이전트가 붙습니다.

```bash
/sc:implement "JWT authentication with rate limiting"
# → security-engineer + backend-architect + quality-engineer

/sc:design "accessible React dashboard with documentation"
# → frontend-architect + learning-guide + technical-writer
```

## PM Agent

다른 에이전트와 다르게 **메타 레이어**로 동작합니다.

1. 사용자 요청 → 자동으로 전문 에이전트 선택
2. 전문 에이전트가 작업 실행
3. **PM Agent가 자동으로** → 작업 내용 문서화, 패턴 기록, 실수 분석
4. 지식 베이스에 학습 내용 누적

쓸수록 프로젝트 맥락을 더 잘 이해하게 되는 구조입니다.
