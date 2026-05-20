---
layout: post
title: "Relational Database Design — 함수 종속성과 정규화"
date: 2026-05-20
categories: [Database]
tags: [database, normalization, functional-dependency, bcnf, 3nf, relational-design]
description: "함수 종속성을 기반으로 좋은 관계형 스키마를 설계하는 이론을 정리한다. 1NF, BCNF, 3NF와 무손실 분해, 종속성 보존까지 다룬다."
---

릴레이션 하나에 정보를 몰아넣으면 중복이 생기고, 잘못 쪼개면 정보가 사라진다. 정규화 이론은 이 두 극단 사이에서 "좋은" 스키마가 무엇인지 정의하고, 그 형태로 가는 절차를 제공한다.

## 큰 스키마의 문제

스키마를 결합하면 어떤 일이 벌어지는지 보자. `instructor`와 `department`를 하나로 합쳐 다음과 같이 만들었다고 하자.

```
big_instructor(ID, name, salary, dept_name, building, budget)
```

이 스키마에서 같은 학과에 속한 교수가 여러 명이면 `(dept_name, building, budget)` 조합이 행마다 반복된다.

| ID | name | salary | dept_name | building | budget |
|----|------|--------|-----------|----------|--------|
| 22222 | Einstein | 95000 | Physics | Watson | 70000 |
| 33456 | Gold | 87000 | Physics | Watson | 70000 |
| 45565 | Katz | 75000 | Comp. Sci. | Taylor | 100000 |
| 10101 | Srinivasan | 65000 | Comp. Sci. | Taylor | 100000 |

Physics 학과의 `(Watson, 70000)`이 두 번, Comp. Sci.의 `(Taylor, 100000)`이 두 번 나타난다. 여기서 두 가지 문제가 발생한다.

1. **중복(Redundancy)**: 같은 사실이 여러 번 저장된다.
2. **갱신 이상(Update anomaly)**: Physics 건물이 바뀌면 모든 Physics 행을 일관되게 수정해야 한다. 하나라도 빠뜨리면 데이터가 모순된다.

해법은 직관적이다. 학과 정보를 따로 떼어내 `instructor`와 `department`로 **분해(decompose)** 하면 된다. 문제는 "어떤 기준으로 쪼개야 하는가"이다.

## 손실 분해

아무렇게나 쪼개면 안 된다. 다음 예시를 보자.

```
employee(ID, name, street, city, salary)
```

이를 다음과 같이 분해한다.

```
employee1(ID, name)
employee2(name, street, city, salary)
```

`name`이 키가 아니므로 동명이인이 있으면 문제가 생긴다. 원본에 `(57766, Kim, Main, Perryridge, 75000)`과 `(98776, Kim, North, Hampton, 67000)`이 있었다고 하자. 분해 후 자연 조인(natural join)으로 합치면 다음과 같이 나온다.

| ID | name | street | city | salary |
|----|------|--------|------|--------|
| 57766 | Kim | Main | Perryridge | 75000 |
| 57766 | Kim | North | Hampton | 67000 |
| 98776 | Kim | Main | Perryridge | 75000 |
| 98776 | Kim | North | Hampton | 67000 |

원래 없던 튜플이 생긴다. 즉, 분해 후 조인했을 때 원본을 복원할 수 없다. 이런 분해를 **손실 분해(lossy decomposition)** 라 한다.

## 무손실 조인 분해

분해 $R = R_1 \cup R_2$가 **무손실 조인 분해(lossless-join decomposition)** 라는 것은 다음을 의미한다.

$$r = \Pi_{R_1}(r) \bowtie \Pi_{R_2}(r)$$

즉, 분해한 두 릴레이션을 자연 조인하면 원본이 그대로 복원된다.

판정 조건은 단순하다. 다음 둘 중 하나가 $F^+$에 속하면 무손실이다.

- $R_1 \cap R_2 \rightarrow R_1$
- $R_1 \cap R_2 \rightarrow R_2$

다시 말해 **두 릴레이션의 공통 속성이 어느 한쪽의 슈퍼키가 되면** 무손실이 보장된다.

## First Normal Form

도메인이 더 이상 나눌 수 없는 단위로 구성되면 **atomic** 하다고 한다. 모든 속성의 도메인이 atomic인 릴레이션 스키마를 **1NF(First Normal Form)** 라 부른다.

주의할 점은 atomicity가 도메인 자체의 속성이 아니라 **그 값을 어떻게 사용하는지** 의 문제라는 것이다.

예를 들어 학번이 `CS0012`, `EE1127` 처럼 학과 코드 + 일련번호로 구성되어 있다고 하자. 학번 문자열을 통째로 ID로만 쓴다면 atomic이다. 하지만 앞 두 글자를 잘라내서 학과를 판별하는 데 사용한다면, 그 도메인은 더 이상 atomic이 아니다. 이런 설계는 정보를 데이터베이스가 아닌 응용 프로그램에 인코딩하는 셈이 되어 좋지 않다.

이후 논의는 모든 릴레이션이 1NF임을 가정한다.

## Functional Dependency

**함수 종속성(Functional Dependency, FD)** 은 릴레이션의 합법적인 인스턴스(legal instance)가 만족해야 할 제약 조건이다.

릴레이션 스키마 $R$에 대해 $\alpha \subseteq R$, $\beta \subseteq R$ 일 때, 다음이 성립하면 FD $\alpha \rightarrow \beta$ 가 $R$에서 **holds** 한다고 한다.

$$t_1[\alpha] = t_2[\alpha] \implies t_1[\beta] = t_2[\beta]$$

쉽게 말해, $\alpha$ 값이 같은 두 튜플은 반드시 $\beta$ 값도 같아야 한다. FD는 **현재 인스턴스의 우연한 성질이 아니라, 모든 합법적 인스턴스가 따라야 하는 규칙**이다.

예를 들어 다음 인스턴스가 있다고 하자.

| A | B |
|---|---|
| 1 | 4 |
| 1 | 5 |
| 3 | 7 |

$A = 1$인 행이 $B = 4$와 $B = 5$를 가지므로 $A \rightarrow B$ 는 성립하지 않는다. 반면 $B$ 값이 같은 행이 없으므로 이 인스턴스만 보면 $B \rightarrow A$ 는 성립한다. 단, "성립할 수도 있다"는 것과 "스키마의 제약으로 부과되어 있다"는 것은 다르다.

### Superkey와 Candidate Key의 일반화

- $K$가 $R$의 **superkey**라는 것은 $K \rightarrow R$ 과 동치이다.
- $K$가 **candidate key**라는 것은 $K \rightarrow R$이면서, $K$의 어떤 진부분집합 $\alpha \subset K$ 도 $\alpha \rightarrow R$ 을 만족하지 않는다는 뜻이다.

FD는 키만으로는 표현할 수 없는 제약을 표현할 수 있게 해준다. `big_instructor(ID, name, salary, dept_name, building, budget)`에서 다음 FD를 기대할 수 있다.

- `dept_name → building` (학과가 정해지면 건물이 정해짐)
- `ID → building` (교수가 정해지면 소속 학과를 통해 건물도 정해짐)

반면 `dept_name → salary`는 성립하지 않는다. 같은 학과 교수의 급여가 모두 같을 이유는 없다.

### Trivial FD

$\beta \subseteq \alpha$ 이면 FD $\alpha \rightarrow \beta$ 는 모든 인스턴스에서 자동으로 성립한다. 이런 FD를 **trivial**이라 한다. 결론이 이미 전제에 포함되어 있어서 정보를 주지 않는 사소한 경우이다.

## FD의 Closure

주어진 FD 집합 $F$에서 논리적으로 유도되는 모든 FD의 집합을 $F$의 **closure**라 하고 $F^+$로 표기한다.

예를 들어 $F = \{A \rightarrow B, B \rightarrow C\}$ 이면 transitivity에 의해 $A \rightarrow C$ 도 성립하고, 이는 $F^+$에 포함된다.

### Armstrong's Axioms

$F^+$를 계산하는 데 다음 세 규칙이 **sound**(올바른 FD만 생성)하고 **complete**(성립하는 모든 FD를 생성)하다.

1. **Reflexivity**: $\beta \subseteq \alpha$ 이면 $\alpha \rightarrow \beta$
2. **Augmentation**: $\alpha \rightarrow \beta$ 이면 $\gamma\alpha \rightarrow \gamma\beta$
3. **Transitivity**: $\alpha \rightarrow \beta$ 이고 $\beta \rightarrow \gamma$ 이면 $\alpha \rightarrow \gamma$

추가로 다음 규칙들은 위 세 가지로부터 유도된다.

- **Union**: $\alpha \rightarrow \beta$ 이고 $\alpha \rightarrow \gamma$ 이면 $\alpha \rightarrow \beta\gamma$
- **Decomposition**: $\alpha \rightarrow \beta\gamma$ 이면 $\alpha \rightarrow \beta$ 이고 $\alpha \rightarrow \gamma$
- **Pseudotransitivity**: $\alpha \rightarrow \beta$ 이고 $\gamma\beta \rightarrow \delta$ 이면 $\alpha\gamma \rightarrow \delta$

### Closure 계산 예시

$R = (A, B, C, G, H, I)$, $F = \{A \rightarrow B, A \rightarrow C, CG \rightarrow H, CG \rightarrow I, B \rightarrow H\}$ 일 때 $F^+$에 속하는 몇 가지 FD를 유도해보자.

- $A \rightarrow H$: $A \rightarrow B$ 와 $B \rightarrow H$ 에 transitivity 적용
- $AG \rightarrow I$: $A \rightarrow C$ 에 $G$를 augment해 $AG \rightarrow CG$, 그 다음 $CG \rightarrow I$ 와 transitivity
- $CG \rightarrow HI$: $CG \rightarrow H$ 와 $CG \rightarrow I$ 에 union

## Attribute Closure

속성 집합 $\alpha$의 **closure** $\alpha^+$는 $F$ 하에서 $\alpha$로부터 함수적으로 결정되는 모든 속성의 집합이다. 알고리즘은 다음과 같다.

```
result := α
while (result에 변화가 있으면):
    for each β → γ in F:
        if β ⊆ result:
            result := result ∪ γ
```

위와 같은 $R$, $F$에 대해 $(AG)^+$를 구해보자.

1. `result = AG`
2. `result = ABCG` ($A \rightarrow B$, $A \rightarrow C$ 적용)
3. `result = ABCGH` ($CG \rightarrow H$ 적용, $CG \subseteq ABCG$)
4. `result = ABCGHI` ($CG \rightarrow I$ 적용)

모든 속성이 포함되었으므로 $AG$는 $R$의 superkey이다. $A$ 단독, $G$ 단독으로는 $R$ 전체에 도달하지 못하므로 $AG$는 candidate key이다.

### Attribute Closure의 용도

- **Superkey 판정**: $\alpha^+$ 가 $R$의 모든 속성을 포함하는지 본다.
- **FD 판정**: $\alpha \rightarrow \beta$ 가 $F^+$에 속하는지 확인하려면 $\beta \subseteq \alpha^+$ 인지만 보면 된다.
- **$F^+$ 계산**: 모든 $\gamma \subseteq R$에 대해 $\gamma^+$를 구하고, $\gamma^+$의 모든 부분집합 $S$에 대해 $\gamma \rightarrow S$ 를 출력한다.

## Boyce-Codd Normal Form (BCNF)

릴레이션 $R$이 FD 집합 $F$에 대해 **BCNF**라는 것은, $F^+$에 속하는 모든 비자명(non-trivial) FD $\alpha \rightarrow \beta$ ($\alpha, \beta \subseteq R$)에 대해 다음 중 하나가 성립한다는 뜻이다.

1. $\alpha \rightarrow \beta$ 가 trivial이다 ($\beta \subseteq \alpha$).
2. $\alpha$ 가 $R$의 superkey이다.

핵심은 **모든 non-trivial FD의 좌변이 superkey여야 한다**는 점이다.

예를 들어 `big_instructor(ID, name, salary, dept_name, building, budget)`은 BCNF가 아니다. `dept_name → building, budget`이 성립하지만 `dept_name`은 superkey가 아니기 때문이다.

### BCNF로 분해하기

스키마 $R$과 BCNF를 위반하는 non-trivial FD $\alpha \rightarrow \beta$ ($\alpha$가 superkey가 아닐 때)가 있다면, $R$을 다음 둘로 분해한다.

- $\alpha \cup \beta$
- $R - (\beta - \alpha)$

`big_instructor`의 경우 $\alpha = \text{dept\_name}$, $\beta = \{\text{building}, \text{budget}\}$ 이므로 다음과 같이 분해된다.

- `(dept_name, building, budget)` ← department
- `(ID, name, salary, dept_name)` ← instructor

두 릴레이션의 교집합이 `dept_name`이고, 이는 `(dept_name, building, budget)`의 superkey이므로 무손실 조인 분해이다.

## Dependency Preservation

FD를 포함한 제약 조건은 여러 릴레이션에 걸쳐 검사할 경우 비용이 비싸다. 분해 후 **각 개별 릴레이션 내부에서만 FD를 검사해도 원본 $F^+$ 전체를 검증할 수 있다면**, 그 분해는 **종속성 보존(dependency preserving)** 이라 한다.

각 $R_i$에 속하는 속성만 포함하는 $F^+$의 FD 집합을 $F_i$라 할 때, 다음이 성립하면 종속성 보존이다.

$$(F_1 \cup F_2 \cup \dots \cup F_n)^+ = F^+$$

종속성이 보존되지 않으면, 갱신 시 FD 위반을 검사하기 위해 릴레이션을 조인해야 하는데 이는 매우 비싸다.

### BCNF와 종속성 보존의 충돌

BCNF 분해가 항상 종속성을 보존하는 것은 아니다. 다음 예를 보자.

$R = (J, K, L)$, $F = \{JK \rightarrow L, L \rightarrow K\}$

Candidate key는 $JK$와 $JL$이다. $L \rightarrow K$ 에서 $L$이 superkey가 아니므로 BCNF가 아니다. BCNF로 분해하려면 $L \rightarrow K$ 를 기준으로 다음과 같이 쪼개야 한다.

- $(L, K)$
- $(J, L)$

이러면 $JK \rightarrow L$ 을 검사하려면 두 릴레이션을 조인해야 한다. 즉, BCNF는 만족하지만 종속성 보존은 깨진다.

## Third Normal Form (3NF)

**3NF**는 BCNF의 조건을 살짝 완화하여 종속성 보존이 항상 가능하도록 만든 정규형이다.

릴레이션 $R$이 3NF라는 것은 $F^+$의 모든 FD $\alpha \rightarrow \beta$ 에 대해 다음 중 **하나라도** 성립한다는 뜻이다.

1. $\alpha \rightarrow \beta$ 가 trivial이다.
2. $\alpha$ 가 $R$의 superkey이다.
3. $\beta - \alpha$ 의 각 속성 $A$가 $R$의 어떤 candidate key에 포함된다.

세 번째 조건이 BCNF에서 새로 추가된 완화 조건이다. (각 속성이 서로 다른 candidate key에 속해도 무방하다.)

BCNF이면 자동으로 3NF이다. 첫 두 조건 중 하나가 항상 성립하기 때문이다.

### BCNF vs 3NF 예시

```
advisor(s_ID, i_ID, dept_name)
```

여기에 다음 FD가 있다고 하자.

- $f_1: s\_ID, dept\_name \rightarrow i\_ID$
- $f_2: i\_ID \rightarrow dept\_name$

`advisor`의 candidate key는 $(s\_ID, dept\_name)$ 과 $(s\_ID, i\_ID)$ 이다.

$f_2$ 의 좌변 $i\_ID$는 superkey가 아니므로 BCNF는 아니다. 하지만 우변 $dept\_name$은 candidate key $(s\_ID, dept\_name)$ 의 일부이므로 3NF는 만족한다.

이를 BCNF로 분해하면 다음과 같다.

- `(s_ID, i_ID)`
- `(i_ID, dept_name)`

분해 결과 $f_1$ ($s\_ID, dept\_name \rightarrow i\_ID$) 을 검사하려면 두 릴레이션을 조인해야 한다. 즉, 종속성 보존이 깨진다. 3NF로 두면 분해가 필요 없으므로 종속성 보존 문제가 없다.

## BCNF와 3NF 비교

| | 3NF | BCNF |
|---|-----|------|
| 무손실 조인 분해 | 항상 가능 | 항상 가능 |
| 종속성 보존 분해 | 항상 가능 | 불가능할 수 있음 |
| 중복 제거 | 일부 남을 수 있음 | 더 엄격하게 제거 |

즉, BCNF는 중복 제거에 더 강하지만 종속성 보존을 포기해야 할 때가 있고, 3NF는 그 반대다.

## 설계 목표

관계형 데이터베이스 설계의 이상적인 목표는 다음 세 가지를 모두 만족하는 분해이다.

1. **BCNF**
2. **무손실 조인(Lossless join)**
3. **종속성 보존(Dependency preservation)**

세 가지를 모두 달성할 수 없다면 다음 중 하나를 받아들여야 한다.

- 종속성 보존을 포기한다 (BCNF 유지).
- 약간의 중복을 받아들인다 (3NF로 후퇴).

참고로 SQL은 superkey 외의 FD를 직접 지정하는 기능을 제공하지 않는다. assertion으로 표현할 수는 있지만 검사 비용이 비싸 실제 DBMS에서는 거의 지원하지 않는다. 따라서 좌변이 키가 아닌 FD를 효율적으로 검사하기 어렵고, 이 점이 종속성 보존이 실무에서 중요한 이유이다.
