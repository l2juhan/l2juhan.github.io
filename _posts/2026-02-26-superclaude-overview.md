---
title: "SuperClaude — Claude Code 설정 프레임워크 개요 및 설치법"
date: 2026-02-26
categories: [Dev-Tools]
tags: [claude-code, superclaude, ai, dev-tools]
toc: true
toc_sticky: true
---

SuperClaude는 Claude Code를 위한 설정 프레임워크입니다. `.md` 설정 파일만으로 Claude Code를 전문 개발 어시스턴트로 탈바꿈시킵니다.

## SuperClaude 구성

| 항목 | 수량 | 설명 |
|---|---|---|
| 커맨드 | 30개 | `/sc:` 접두사로 개발 라이프사이클 전영역 커버 |
| 에이전트 | 16개 | 역할별 맞춤 작업, 자동 선택 |
| 모드 | 7개 | 상황별 행동 모드 |
| MCP 서버 | 8개 | 외부 도구 통합 |

## 왜 쓸까?

**Claude Code 기본의 한계:**
- 매번 같은 설명 반복해야 함
- 프로젝트 컨텍스트 유실
- 범용적인 답변

**SuperClaude 쓰면:**
- 구조화된 워크플로우 (quality gate + validation)
- 자동 에이전트 선택으로 전문적 결과물
- 토큰 절약 (70% 절약 가능)
- PM Agent가 작업 후 자동 문서화 + 학습

## 설치 방법

### pipx로 설치 (권장)

```bash
# 1. pipx 설치
pip3 install pipx
pipx ensurepath

# 2. SuperClaude 설치
pipx install superclaude

# 3. 명령어 설치
superclaude install

# 4. 확인
superclaude doctor
```

### 업데이트

```bash
pipx upgrade superclaude
superclaude install   # 빼먹으면 커맨드 갱신 안 됨!
```

### MCP 서버 설치 (선택)

```bash
superclaude mcp --list              # 사용 가능한 MCP 서버 목록
superclaude mcp                      # 대화형 설치
superclaude mcp --servers tavily --servers context7  # 특정 서버만
```

## 참고 링크

- [GitHub - SuperClaude Framework](https://github.com/nicekid1/SuperClaude_Framework)
- [PyPI](https://pypi.org/project/superclaude/)
- [공식 문서](https://superclaude.netlify.app/)
