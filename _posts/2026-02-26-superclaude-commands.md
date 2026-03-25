---
title: "SuperClaude 30개 커맨드 정리 + 커맨드 vs 에이전트"
date: 2026-02-26
categories: [Dev-Tools]
tags: [claude-code, superclaude, commands, agents]
toc: true
toc_sticky: true
---

SuperClaude의 커맨드와 에이전트의 차이, 그리고 30개 커맨드 전체를 정리합니다.

## 커맨드 vs 에이전트

| | 커맨드 (30개) | 에이전트 (16개) |
|---|---|---|
| 역할 | **작업 종류** 지정 | **전문가 역할** 부여 |
| 예시 | `/sc:implement`, `/sc:test` | `frontend-architect`, `security-engineer` |
| 호출 | 사용자가 직접 입력 | 대부분 **자동 선택** |
| 비유 | "뭘 해라" (동사) | "누가 해라" (주어) |

### 동작 흐름

```
사용자: /sc:implement "JWT 인증 기능"
  ↓
[커맨드] /sc:implement → "구현하라"
  ↓
[에이전트 자동 선택] "JWT", "인증" 키워드 감지
  → security-engineer + backend-architect + quality-engineer
  ↓
[작업 완료 후] pm-agent 자동 → 문서화 + 학습
```

## 기획/설계 (4개)

| 커맨드 | 설명 |
|---|---|
| `/sc:brainstorm` | 구조화된 브레인스토밍 |
| `/sc:design` | 시스템 아키텍처, DB, API 설계 |
| `/sc:estimate` | 작업 시간/비용/복잡도 추정 |
| `/sc:spec-panel` | 전문가 패널 스펙 분석 |

## 개발 (5개)

| 커맨드 | 설명 |
|---|---|
| `/sc:implement` | **핵심.** 기능 구현, 컴포넌트 개발 |
| `/sc:build` | 프로젝트 빌드, 컴파일, 패키징 |
| `/sc:improve` | 기존 코드 개선, 리팩토링 |
| `/sc:cleanup` | 데드 코드 제거, import 정리 |
| `/sc:explain` | 코드 설명, 개념 해설 |

## 테스트/품질 (4개)

| 커맨드 | 설명 |
|---|---|
| `/sc:test` | 테스트 코드 자동 생성 + 커버리지 분석 |
| `/sc:analyze` | 코드 분석, 아키텍처 검토, 품질 진단 |
| `/sc:troubleshoot` | 디버깅, 에러 분석, 문제 해결 |
| `/sc:reflect` | 작업 회고 |

## 프로젝트 관리 (3개)

| 커맨드 | 설명 |
|---|---|
| `/sc:pm` | **가장 상세 (593줄).** 작업 문서화 + 실수 분석 + 지식베이스 |
| `/sc:task` | 작업 추적, 우선순위 관리 |
| `/sc:workflow` | PRD 기반 워크플로우 자동 생성 |

## 리서치 (2개)

| 커맨드 | 설명 |
|---|---|
| `/sc:research` | **v4 신규.** 자율 웹 리서치, Tavily MCP 연동 |
| `/sc:business-panel` | 비즈니스 전문가 패널 분석 |

## 유틸리티 (9개)

`/sc:agent`, `/sc:index-repo`, `/sc:index`, `/sc:recommend`, `/sc:select-tool`, `/sc:spawn`, `/sc:load`, `/sc:save`, `/sc:git`, `/sc:document`, `/sc:help`
