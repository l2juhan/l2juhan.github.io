---
title: "SuperClaude Flag 분류 + 7가지 행동 모드 + Deep Research"
date: 2026-02-26
categories: [Dev-Tools]
tags: [claude-code, superclaude, flags, mcp, deep-research]
toc: true
toc_sticky: true
---

SuperClaude의 플래그 시스템, 7가지 행동 모드, MCP 서버 통합, Deep Research 기능을 정리합니다.

## 사고 및 분석 플래그

| 플래그 | 설명 | 토큰 |
|---|---|---|
| `--think` | 멀티파일 분석 | ~4K |
| `--think-hard` | 깊은 아키텍처 분석 | ~10K |
| `--ultrathink` | 최대 깊이 분석 | ~32K |
| `--validate` | 검증 및 안전성 확인 | |
| `--preview` | 변경사항 미리보기 | |
| `--plan` | 실행 계획 미리보기 | |

## 안전 모드 플래그

| 플래그 | 설명 |
|---|---|
| `--safe-mode` | 안전한 변경만 적용 |
| `--dry-run` | 실행 시뮬레이션만 |
| `--backup` | 백업 생성 후 진행 |

## MCP 통합 플래그

| 플래그 | MCP 서버 | 역할 |
|---|---|---|
| `--c7` | Context7 | 공식 문서 조회 |
| `--seq` | Sequential-Thinking | 복합 단계 분석 |
| `--magic` | Magic | UI 컴포넌트 생성 |
| `--play` | Playwright | 브라우저 자동화 |

## 성능 최적화 플래그

| 플래그 | 효과 |
|---|---|
| `--uc` | Ultra Compression (70% 토큰 절약) |
| `--no-mcp` | MCP 비활성화, 빠른 실행 |

## 7가지 행동 모드

| 모드 | 설명 | 언제 |
|---|---|---|
| **Brainstorming** | 아이디어 발산 | 프로젝트 초기 |
| **Business Panel** | 전문가 관점 전략 분석 | 비즈니스 의사결정 |
| **Deep Research** | 자율 웹 리서치 | 기술 조사 |
| **Orchestration** | 여러 도구 조율 | 복잡한 멀티 도구 작업 |
| **Token-Efficiency** | 30~50% 절약 | 대용량 프로젝트 |
| **Task Management** | 체계적 작업 관리 | 여러 작업 동시 관리 |
| **Introspection** | 메타 인지 분석 | SuperClaude 디버깅 |

## 8개 MCP 서버

| MCP 서버 | 역할 |
|---|---|
| **Tavily** | 웹 검색 (Deep Research 핵심) |
| **Context7** | 공식 문서 조회 |
| **Sequential-Thinking** | 다단계 추론 |
| **Serena** | 세션 지속성, 메모리 |
| **Playwright** | 브라우저 자동화 |
| **Magic** | UI 컴포넌트 생성 |
| **Morphllm-Fast-Apply** | 컨텍스트 인지 코드 수정 |
| **Chrome DevTools** | 성능 분석 |

MCP 없이도 완전히 동작하지만, 있으면 **2~3배 빠르고 30~50% 토큰 절약**됩니다.

## Deep Research

### 깊이 레벨

| 깊이 | 소스 수 | 훉 수 | 소요 시간 |
|---|---|---|---|
| Quick | 5-10 | 1 | ~2분 |
| Standard | 10-20 | 3 | ~5분 |
| Deep | 20-40 | 4 | ~8분 |
| Exhaustive | 40+ | 5 | ~10분 |

### 멀티훉 추론 패턴

- **엔티티 확장**: 논문 → 저자 → 저작물
- **개념 심화**: 주제 → 세부사항 → 예시
- **인과 체인**: 결과 → 원인 → 예방
