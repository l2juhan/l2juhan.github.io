---
title: "Relational Model & Relational Algebra"
date: 2026-03-23
categories: [Database]
tags: [database, relational-model, relational-algebra, sql]
toc: true
toc_sticky: true
---

관계형 데이터베이스의 핵심 이론인 관계형 모델과 관계 대수를 정리합니다.

## 관계형 데이터베이스의 구조

- **릴레이션(Relation)** = 테이블(Table) — 같은 것, 관점만 다름
- **튜플(Tuple)** = 행(Row) — 값들 사이의 관계를 나타냄
- **속성(Attribute)** = 열(Column)

## 릴레이션의 형식적 정의

- 각 속성에는 **도메인(Domain)**이 존재 — 허용되는 값들의 집합
- 도메인은 반드시 **원자적(Atomic)**이어야 함 — 더 이상 나눌 수 없는 값

```
안되는 예시: phone_numbers = "010-1234-5678, 010-9999-0000"
되는 예시: phone1 = "010-1234-5678", phone2 = "010-9999-0000"
```

- **null**은 모든 도메인의 멤버 (but 연산 시 문제 유발)

## 스키마와 인스턴스

- **스키마(Schema)** = DB의 논리적 설계 (구조/틀)
  - 예: `instructor(ID, name, dept_name, salary)`
- **인스턴스(Instance)** = 특정 시점의 DB 데이터 스냅샷

## 키 (Keys)

- **슈퍼키(Superkey)**: 튜플을 유일하게 식별 가능한 속성 집합. 예: {ID}, {ID, name}
- **후보키(Candidate Key)**: 최소인 슈퍼키. 예: {ID}는 후보키, {ID, name}은 아님
- **기본키(Primary Key)**: 후보키 중 하나를 선택한 것, null 불가
- **외래키(Foreign Key)**: 한 릴레이션의 값이 다른 릴레이션에 반드시 존재해야 하는 제약

## 관계 대수 — 6가지 기본 연산

### Select (σ) — 행 필터링

조건을 만족하는 튜플만 선택합니다.

```
σ_{salary≥85000}(instructor) → 연봉 85000 이상인 교수만
SQL 대응: WHERE salary >= 85000
```

### Project (Π) — 열 필터링

지정한 속성만 추출하고 중복을 제거합니다.

```
Π_{ID, salary}(instructor)
SQL 대응: SELECT DISTINCT ID, salary
```

### 연산 조합 (Composition)

σ와 Π를 조합할 수 있습니다.

```
Π_{ID, salary}(σ_{salary≥85000}(instructor))
→ 연봉 85000 이상인 교수의 ID, salary만 추출
```

> Selectivity 높음(많이 통과) → PROJECT 먼저, Selectivity 낮음(적게 통과) → SELECT 먼저

### Cartesian Product (×) — 카티션 곱

r의 모든 튜플과 s의 모든 튜플을 모든 조합으로 결합합니다. 단독으로는 의미 없는 조합이 많아 보통 σ와 함께 사용합니다.

### Natural Join (⋈) — 자연 조인

공통 속성의 값이 같은 튜플만 결합합니다.

```
R = {A, B, C}, S = {B, D, E} 일때
R ⋈ S = Π_{A,B,C,D,E}(σ_{R.B = S.B}(R × S))
```

교환법칙(commutative), 결합법칙(associative)이 성립합니다.

### Union (∪) — 합집합

두 릴레이션의 모든 튜플을 합칩니다(중복 제거). 속성 수(arity)와 도메인이 같아야 합니다(union compatible).

### Set Difference (–) — 차집합

r에는 있지만 s에는 없는 튜플을 구합니다.

### Rename (ρ) — 이름 변경

같은 릴레이션을 두 번 참조해야 할 때 유용합니다.

```
예: ID 12121보다 연봉이 높은 교수 찾기
→ instructor를 i, j로 rename해서 자기 자신과 비교
```
