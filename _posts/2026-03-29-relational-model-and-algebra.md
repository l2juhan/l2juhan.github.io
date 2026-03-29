---
title: "Relational Model & Relational Algebra — 관계형 모델과 관계 대수"
date: 2026-03-29
categories: [Database]
tags: [database, relational-model, relational-algebra, sql, keys]
description: "관계형 데이터베이스의 구조, 키 개념, 그리고 관계 대수의 6가지 기본 연산을 정리한다."
---

데이터베이스는 결국 테이블의 집합이다. 그 테이블이 어떤 규칙으로 구성되고, 어떤 연산으로 원하는 데이터를 꺼내오는지가 관계형 모델의 핵심이다.

## 관계형 데이터베이스의 구조

관계형 데이터베이스(Relational Database)는 **테이블(table)**의 모음으로 구성된다. 각 테이블은 고유한 이름을 갖고, 이를 **릴레이션(relation)**이라 부른다.

![릴레이션의 구조 — attribute와 tuple](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-1.png)

- **튜플(tuple)**: 테이블의 한 행(row). 값들의 관계를 나타낸다
- **속성(attribute)**: 테이블의 한 열(column)

### 릴레이션의 형식적 정의

속성 A₁, A₂, …, Aₙ이 있고, 각 속성의 **도메인(domain)** D₁, D₂, …, Dₙ이 있을 때:

- **도메인**: 해당 속성에 허용되는 값의 집합
- 모든 도메인은 **원자적(atomic)**이어야 한다 — 더 이상 나눌 수 없는 값
- **null** 값은 모든 도메인에 속하며, 연산 시 복잡한 문제를 유발한다

릴레이션 r은 D₁ × D₂ × … × Dₙ의 부분집합이다. 즉, 릴레이션은 n-튜플 (a₁, a₂, …, aₙ)의 집합이며, 각 aᵢ ∈ Dᵢ이다.

릴레이션은 **집합**이므로 튜플의 순서는 의미가 없다. 동일한 데이터를 다른 순서로 나열해도 같은 릴레이션이다.

## 스키마와 인스턴스

- **스키마(Schema)**: 데이터베이스의 논리적 설계. 변하지 않는 구조
- **인스턴스(Instance)**: 특정 시점의 데이터 스냅샷. 시간에 따라 변한다

스키마는 다음과 같이 표기한다:

```
r(A₁, A₂, …, Aₙ)

예: instructor(ID, name, dept_name, salary)
```

## 데이터베이스 설계

하나의 릴레이션에 모든 정보를 넣으면 문제가 발생한다.

```
univ(instructor_ID, name, dept_name, salary, student_ID, ...)
```

이런 설계의 문제점:
- **정보 반복**: 같은 교수에 학생이 여러 명이면 교수 정보가 중복된다
- **null 값 필요**: 지도교수가 없는 학생은 교수 관련 필드가 null이 된다

이를 해결하는 것이 **정규화(Normalization)** 이론이다.

## 키 (Keys)

릴레이션 R에서 튜플을 유일하게 식별하기 위한 속성 집합이 키다.

### 슈퍼키 (Superkey)

K ⊆ R일 때, K의 값으로 릴레이션 r(R)의 각 튜플을 **유일하게 식별**할 수 있으면 K는 슈퍼키다.

예: instructor에서 `{ID}`와 `{ID, name}` 모두 슈퍼키다.

### 후보키 (Candidate Key)

슈퍼키 중 **최소한의 것**. 어떤 속성을 하나라도 제거하면 더 이상 슈퍼키가 아닌 것이다.

예: `{ID}`는 후보키다. `{ID, name}`은 name을 제거해도 여전히 슈퍼키이므로 후보키가 아니다.

### 기본키 (Primary Key)

후보키 중 **하나를 선택**한 것. 테이블에서 튜플을 식별하는 대표 키다.

### 외래키 (Foreign Key)

다른 테이블의 기본키를 참조하는 속성이다.

| 용어 | 설명 |
|---|---|
| **참조 릴레이션(Referencing)** | 외래키를 가진 테이블 |
| **피참조 릴레이션(Referenced)** | 기본키가 참조되는 테이블 |

키의 관계를 정리하면:

```
슈퍼키 ⊇ 후보키 ⊇ 기본키 (1개 선택)
```

## 스키마 다이어그램

대학 데이터베이스의 전체 구조를 스키마 다이어그램으로 나타내면 다음과 같다.

![University Database 스키마 다이어그램](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-2.png)

화살표는 외래키 관계를 나타낸다. 참조하는 릴레이션(Referencing)에서 피참조 릴레이션(Referenced)으로 향한다.

## 관계형 질의 언어

데이터베이스에서 데이터를 질의하는 "순수" 이론 언어에는 세 가지가 있다.

| 언어 | 방식 | 특징 |
|---|---|---|
| **관계 대수(Relational Algebra)** | 절차적(procedural) | **어떻게** 구할지 명시 |
| **튜플 관계 해석(Tuple Relational Calculus)** | 선언적(declarative) | **무엇을** 원하는지 명시 |
| **도메인 관계 해석(Domain Relational Calculus)** | 선언적(declarative) | 무엇을 원하는지 명시 |

SQL은 선언적 언어지만, 내부적으로는 관계 대수를 기반으로 동작한다. 관계 대수는 SQL의 이론적 토대다.

## 관계 대수 (Relational Algebra)

관계 대수는 6가지 기본 연산으로 구성된다. 각 연산은 릴레이션을 입력받아 **새로운 릴레이션을 출력**한다.

| 연산 | 기호 | 역할 |
|---|---|---|
| Select | σ (시그마) | 조건에 맞는 **튜플** 선택 |
| Project | Π (파이) | 원하는 **속성** 선택 |
| Union | ∪ | 두 릴레이션의 합집합 |
| Set Difference | – | 두 릴레이션의 차집합 |
| Cartesian Product | × | 두 릴레이션의 곱 |
| Rename | ρ (로) | 릴레이션에 별명 부여 |

### Select (σ) — 튜플 선택

조건을 만족하는 행만 골라낸다. SQL의 `WHERE`에 해당한다.

![Select 연산 예시 — salary >= 85000인 instructor](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-3.png)

```
σ_salary>=85000 (instructor)
```

조건에는 `=`, `≠`, `>`, `<`, `≥`, `≤`를 사용할 수 있고, `and(∧)`, `or(∨)`, `not(¬)`으로 결합할 수 있다.

### Project (Π) — 속성 선택

원하는 열만 골라낸다. SQL의 `SELECT` 절에 해당한다.

```
Π_ID,salary (instructor)
```

릴레이션은 **집합**이므로 Project 결과에서 중복 튜플은 자동으로 제거된다.

### Select + Project 복합 연산

salary가 85,000 이상인 교수의 ID와 salary만 추출하려면:

![Select와 Project의 조합 실행 순서](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-4.png)

```
Π_ID,salary (σ_salary>=85000 (instructor))
```

실행 순서가 중요하다. **Select를 먼저** 적용하여 튜플을 걸러낸 후, **Project로 속성을 선택**한다. 순서를 바꾸면 결과 릴레이션의 스키마가 달라질 수 있다.

### Cartesian Product (×) — 카테시안 곱

두 릴레이션의 모든 튜플 조합을 만든다.

![Cartesian Product 연산 결과](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-5.png)

r에 2개 튜플, s에 3개 튜플이 있으면, r × s는 **2 × 3 = 6개** 튜플이 된다. 결과 스키마는 두 릴레이션의 속성을 모두 포함한다.

단독으로는 의미 없는 조합이 대부분이다. 유의미한 결과를 얻으려면 Select와 함께 사용해야 한다.

### Natural Join (⋈) — 자연 조인

두 릴레이션에서 **공통 속성의 값이 같은 튜플만** 결합하고, 공통 속성의 중복 열은 제거한다. 가장 자주 사용되는 조인 연산이다.

![Natural Join 예시 — instructor ⋈ department](/assets/images/posts/relational-model-and-algebra/relational-model-and-algebra-6.png)

위 예시에서 instructor와 department는 `dept_name`이 공통 속성이다. `dept_name` 값이 같은 튜플끼리 결합되고, `dept_name` 열은 하나만 남는다.

Natural Join은 내부적으로 다음과 같다:

```
r ⋈ s = Π_R∪S (σ_r.B=s.B (r × s))
```

즉, Cartesian Product를 한 후 공통 속성이 같은 것만 Select하고, 중복 열을 Project로 제거한 것이다.

**Natural Join의 성질:**
- **결합 법칙(Associative)**: (r ⋈ s) ⋈ t = r ⋈ (s ⋈ t)
- **교환 법칙(Commutative)**: r ⋈ s = s ⋈ r

공통 속성이 2개 이상인 경우, 모든 공통 속성의 값이 일치해야 결합된다.

### Theta Join (⋈θ) — 세타 조인

조건을 직접 지정하는 조인이다. Natural Join과 달리 공통 속성에 의존하지 않고, 임의의 조건을 사용할 수 있다.

```
r ⋈_θ s = σ_θ (r × s)
```

예: instructor와 teaches를 `teaches.course_id = course.course_id` 조건으로 조인하는 경우, 의도하지 않은 속성이 공통으로 묶이는 Natural Join의 문제를 피할 수 있다.

### Union (∪) — 합집합

두 릴레이션의 모든 튜플을 합친다. 중복은 제거된다.

```
r ∪ s
```

**제약 조건**: 두 릴레이션의 **스키마가 반드시 같아야** 한다. 즉, 속성의 수와 도메인이 일치해야 한다.

| r | | s | | r ∪ s | |
|---|---|---|---|---|---|
| A | B | A | B | A | B |
| α | 1 | α | 2 | α | 1 |
| α | 2 | β | 3 | α | 2 |
| β | 1 | | | β | 1 |
| | | | | β | 3 |

### Set Difference (–) — 차집합

r에는 있지만 s에는 없는 튜플만 남긴다.

```
r – s
```

Union과 마찬가지로 스키마가 같아야 한다.

| r | | s | | r – s | |
|---|---|---|---|---|---|
| A | B | A | B | A | B |
| α | 1 | α | 2 | α | 1 |
| α | 2 | β | 3 | β | 1 |
| β | 1 | | | | |

### Rename (ρ) — 이름 변경

릴레이션이나 속성에 **별명(alias)**을 부여한다. 같은 릴레이션을 두 번 참조해야 할 때 필수적이다.

```
ρ_x (E)         — 식 E의 결과를 x라는 이름으로
ρ_x(A₁,A₂,…,Aₙ) (E)  — 속성 이름까지 변경
```

**예제**: ID가 12121인 교수보다 급여가 높은 교수의 ID를 구하라.

같은 instructor 테이블을 두 번 참조해야 하므로 Rename이 필요하다:

```
Π_i.ID (σ_i.salary > j.salary (ρ_i(instructor) × σ_j.ID=12121 (ρ_j(instructor))))
```

instructor를 i와 j로 각각 이름을 바꾸고, j에서 ID=12121인 튜플을 뽑은 뒤, i의 salary가 j의 salary보다 큰 경우를 찾는 것이다.

## 정리

| 개념 | 핵심 |
|---|---|
| 릴레이션 | 튜플(행)과 속성(열)으로 구성된 집합 |
| 키 계층 | 슈퍼키 ⊇ 후보키 ⊇ 기본키, 외래키는 다른 테이블의 PK 참조 |
| Select (σ) | 조건에 맞는 행 선택 (WHERE) |
| Project (Π) | 원하는 열 선택 (SELECT) |
| Natural Join (⋈) | 공통 속성 기준 결합, 중복 열 제거 |
| Cartesian Product (×) | 모든 조합 생성, 단독 사용은 비실용적 |
| Union / Difference | 합집합·차집합, 스키마 동일 필수 |
| Rename (ρ) | 같은 테이블을 여러 번 참조할 때 필수 |
