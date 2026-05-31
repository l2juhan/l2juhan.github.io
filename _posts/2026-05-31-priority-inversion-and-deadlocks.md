---
layout: post
title: "Priority Inversion and Deadlocks — 우선순위 역전과 교착상태"
date: 2026-05-31
categories: [Operating-System]
tags: [operating-system, priority-inversion, priority-inheritance, priority-ceiling, deadlock, resource-allocation-graph, dining-philosophers, deadlock-prevention, deadlock-avoidance, bankers-algorithm]
description: "우선순위 역전과 그 해법(우선순위 상속·우선순위 천장)부터 교착상태의 네 가지 조건, 자원 할당 그래프, 식사하는 철학자 문제, 그리고 예방·회피·은행원 알고리즘까지 정리한다."
---

여러 프로세스가 자원을 공유하면 두 가지 골치 아픈 현상이 생긴다. 하나는 높은 우선순위 작업이 엉뚱하게 낮은 우선순위 작업에 밀리는 **우선순위 역전(priority inversion)**, 다른 하나는 서로가 가진 자원을 기다리다 영원히 멈추는 **교착상태(deadlock)**다. 둘 다 자원 잠금에서 비롯되지만 다루는 방식은 다르다.

## 우선순위 역전

우선순위 역전(priority inversion)은 우선순위 기반 선점 스케줄링(priority-based preemptive scheduling)에서 발생하는 문제다. 특히 실시간(real-time) 스케줄링에서 치명적이다.

상황은 단순하다. 낮은 우선순위 작업이 어떤 자원을 잠근(lock) 상태에서, 높은 우선순위 작업이 같은 자원을 잠그려 시도한다. 낮은 우선순위 작업이 곧바로 끝나고 자원을 풀어주면 실시간 제약은 깨지지 않는다. 문제는 그렇지 않을 때다.

### Unbounded Priority Inversion

진짜 위험한 것은 **무한 우선순위 역전(unbounded priority inversion)**이다. 역전이 지속되는 시간이 공유 자원을 처리하는 데 필요한 시간뿐 아니라, **자원과 무관한 다른 작업들의 예측 불가능한 동작**에까지 좌우되는 경우를 말한다.

![Unbounded priority inversion 타이밍 다이어그램](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-1.png)

우선순위가 $T_1 > T_2 > T_3$인 세 작업이 있다고 하자.

- $t_1$: 가장 낮은 $T_3$가 세마포어 $s$를 잠그고 임계 구역에 진입한다.
- $t_2$: 가장 높은 $T_1$이 $T_3$를 선점하고 실행을 시작한다.
- $t_3$: $T_1$이 $s$를 잠그려 하지만 이미 $T_3$가 쥐고 있어 블록된다. 다시 $T_3$가 실행을 재개한다.
- 그런데 여기서 중간 우선순위인 $T_2$가 깨어나면, $T_2$는 $s$를 필요로 하지 않으면서도 $T_3$를 선점해버린다.

결과적으로 가장 높은 $T_1$은 자신과 아무 상관 없는 $T_2$가 끝날 때까지 기다려야 한다. 역전 시간이 $T_2$ 같은 무관한 작업에 의해 늘어나는 것, 이것이 "unbounded"의 의미다.

가장 유명한 사례가 **화성 탐사선 Mars Pathfinder(1997)**다. 탐사 로버가 데이터를 수집·전송하던 중 시스템 전체 리셋이 반복되며 데이터를 잃었고, 원인은 결국 우선순위 역전으로 밝혀졌다. 소프트웨어에는 우선순위 순으로 (1) 전체 시스템 상태 점검, (2) 이미지 데이터 처리, (3) 장비 상태 테스트 세 작업이 있었는데, (3)이 쥔 자원을 (1)이 기다리는 사이 (2)가 끼어들어 역전이 길어진 것이다.

### Priority Inheritance

**우선순위 상속(priority inheritance)**은 이 문제의 대표적 해법이다. 핵심은 한 줄로 요약된다 — 낮은 우선순위 작업이 자신과 자원을 공유하며 대기 중인 **높은 우선순위 작업의 우선순위를 물려받는다**.

![Priority inheritance 타이밍 다이어그램](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-2.png)

우선순위 변경은 높은 우선순위 작업이 자원에서 블록되는 순간 즉시 일어나고, 낮은 우선순위 작업이 자원을 풀면 원래 우선순위로 되돌아간다. 앞의 시나리오에 적용하면 이렇게 바뀐다.

- $t_4$: $T_1$이 $s$에서 블록되는 순간, $s$를 쥔 $T_3$가 **$T_1$의 우선순위를 즉시 임시로 물려받는다**. $T_3$가 임계 구역 실행을 재개한다.
- $t_5$: $T_2$가 실행 준비를 마치지만, 이제 $T_3$가 더 높은 우선순위를 가지므로 $T_2$는 $T_3$를 선점하지 못한다.
- $t_6$: $T_3$가 임계 구역을 빠져나와 세마포어를 풀면, 그 우선순위는 원래의 기본 레벨로 강등된다.

즉 무관한 $T_2$가 끼어들 틈이 사라진다. 다만 우선순위를 상황에 따라 올렸다 내렸다 해야 하므로 **동적 갱신(dynamic update)** 비용이 발생한다는 단점이 있다.

### Priority Ceiling

**우선순위 천장(priority ceiling)**은 상속의 동적 갱신 문제를 다른 방식으로 푼다. 미리 정해둔 천장(predetermined ceiling) 값으로 역전을 막는다.

- 각 자원마다 우선순위를 하나 부여한다.
- 그 우선순위는 해당 자원을 쓰는 작업 중 **가장 높은 우선순위보다 한 단계 위**로 설정한다.
- 스케줄러는 자원에 접근하는 작업에게 이 우선순위를 동적으로 부여하고, 작업이 자원 사용을 끝내면 원래대로 되돌린다.

우선순위가 정적으로 지정되므로 동적 조정 방식보다 **단순하고 예측 가능하다**. 단, 천장 값을 너무 높게 잡으면 불필요하게 다른 작업을 막아 비효율이 생길 수 있다.

## 교착상태

**교착상태(deadlock)**는 두 개 이상의 프로세스가 서로 상대가 쥔 자원을 기다리며 영원히 진행하지 못하는 상태다. 좀 더 정확히는, 집합 안의 각 프로세스가 **같은 집합 안의 다른 블록된 프로세스만이 일으킬 수 있는 이벤트**를 기다리며 모두 멈춘 상태를 말한다. 어느 누구도 그 이벤트를 발생시킬 수 없으므로 영원히 풀리지 않는다.

전형적인 예시를 보자. 시스템에 테이프 드라이브가 2개 있고, 프로세스 $P$와 $Q$가 각각 하나씩 쥔 채 상대의 것을 추가로 필요로 한다. 세마포어 `A`, `B`는 모두 1로 초기화된다.

```
P                  Q
semWait(A);        semWait(B);
semWait(B);        semWait(A);
```

$P$가 `A`를 얻고 $Q$가 `B`를 얻은 직후 스케줄링이 바뀌면, $P$는 `B`를, $Q$는 `A`를 기다린다. 둘 다 상대가 풀어주기를 기다리지만 아무도 풀지 않는다. 서로 자원을 쥐고(hold) 기다리는(wait) 전형적인 hold-and-wait 상황이다.

### Joint Progress Diagram

두 프로세스가 두 자원을 두고 경쟁하는 모습을 **합동 진행 다이어그램(joint progress diagram)**으로 그리면 교착상태가 어디서 불가피해지는지 한눈에 보인다.

![Joint progress diagram - 교착상태 예시](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-3.png)

가로축은 $P$의 진행, 세로축은 $Q$의 진행이다. 실행 경로가 회색으로 칠해진 **치명적 영역(fatal region)**에 들어가면 그 순간 교착상태가 확정된다. 이 영역은 $P$와 $Q$가 동시에 같은 자원을 원하는 구간이 겹치는 곳이다.

반대로 $P$가 두 자원을 **동시에 필요로 하지 않도록** 코드를 짜면(자원 A를 쓰고 반납한 뒤 B를 얻는 식), 치명적 영역 자체가 사라져 교착상태가 발생할 수 없다. 자원 사용 구간이 겹치지 않게 만드는 것이 핵심이다.

### 교착상태의 직관 — 교통 정체

모든 교착상태는 두 개 이상의 프로세스가 자원을 두고 **충돌하는 요구**를 가질 때 생긴다. 사거리 교통 정체로 비유하면 직관적이다.

![Traffic deadlock 일러스트](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-4.png)

사거리를 네 사분면 a, b, c, d로 나누고 차 네 대가 각각 인접한 두 사분면을 필요로 한다고 하자. 네 대가 동시에 교차로에 진입하면, 1번 차는 b를, 2번 차는 c를, 3번 차는 d를, 4번 차는 a를 기다리며 원형으로 물린다. 이것이 **순환 대기(circular wait)**다. 일반적으로 교착상태는 빼앗으면 프로세스가 실패하는 **비선점(non-preemptable) 자원**에서 발생한다.

### 자원의 두 종류

교착상태를 이해하려면 자원의 종류부터 구분해야 한다.

| 종류 | 설명 | 예시 |
|---|---|---|
| 재사용 가능(reusable) | 한 번에 한 프로세스만 안전하게 쓰고, 사용해도 소모되지 않음. Request → Lock → Use → Unlock 순으로 다시 쓰임 | 프로세서, 메모리, 장치, 테이프 드라이브, 파일, DB, 세마포어 |
| 소비 가능(consumable) | 생성(produce)되고 소비(consume)되어 사라짐 | 인터럽트, 시그널, 메시지, I/O 버퍼의 정보 |

재사용 가능 자원의 교착은 각 프로세스가 하나를 쥔 채 다른 하나를 요청할 때 생긴다. 소비 가능 자원에서도 마찬가지로, 두 프로세스가 서로 상대가 보낼 메시지를 `Receive`로 먼저 기다리면 누구도 `Send`에 도달하지 못해 교착에 빠진다.

### Resource Allocation Graph

**자원 할당 그래프(resource allocation graph)**는 자원이 프로세스에 어떻게 할당됐는지를 그래프로 표현해 교착 여부를 판단하는 도구다. 정점 $V$와 간선 $E$로 구성된다.

- 정점 $V$: 프로세스 집합 $P = \{P_1, ..., P_n\}$과 자원 타입 집합 $R = \{R_1, ..., R_m\}$
- 간선 $E$: 요청 간선(request edge) $P_i \rightarrow R_j$와 할당 간선(assignment edge) $R_j \rightarrow P_i$

![Resource Allocation Graph 예시](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-5.png)

판정 규칙은 다음과 같다.

- 그래프에 **사이클이 없으면** → 교착상태 없음
- 그래프에 **사이클이 있으면**:
  - 자원 타입마다 인스턴스가 **하나뿐**이면 → 교착상태
  - 자원 타입마다 인스턴스가 **여러 개**면 → 교착상태일 수도, 아닐 수도 있음

즉 사이클은 교착의 필요조건이지만, 인스턴스가 여러 개일 때는 충분조건이 아니다.

## 식사하는 철학자 문제

**식사하는 철학자 문제(dining philosophers problem)**는 Dijkstra가 제시한 고전적인 교착·기아 예제다. 철학자 5명과 포크 5개가 원탁에 둘러앉아 있고, 각 철학자는 식사하려면 **양옆 포크 2개**가 필요하다. 두 철학자가 같은 포크를 동시에 쓸 수는 없다.

![식사하는 철학자 배치](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-6.png)

각 철학자의 기본 동작은 `think → getforks → eat → putforks` 루프다. 자연스럽게 짜면 이렇게 된다.

```c
semaphore fork[5] = {1};

void philosopher(int i) {
  while (true) {
    think();
    wait(fork[i]);             // 왼쪽 포크
    wait(fork[(i+1) mod 5]);   // 오른쪽 포크
    eat();
    signal(fork[(i+1) mod 5]);
    signal(fork[i]);
  }
}
```

문제는 **모든 철학자가 동시에 왼쪽 포크를 집는** 경우다. 그러면 전원이 오른쪽 포크를 기다리며 순환 대기에 빠져 교착상태가 된다. 해법은 세 가지가 있다.

### 1번 해법 — 동시 착석 인원 제한

식탁에 최대 4명만 앉도록 `room`이라는 세마포어(초깃값 4)를 둔다. 5명 중 한 명이라도 식탁에 못 들어가면, 적어도 한 철학자는 양옆 포크를 모두 집을 수 있어 순환이 깨진다.

```c
semaphore fork[5] = {1};
semaphore room = {4};   // 동시에 최대 4명

void philosopher(int i) {
  while (true) {
    think();
    wait(room);
    wait(fork[i]);
    wait(fork[(i+1) mod 5]);
    eat();
    signal(fork[(i+1) mod 5]);
    signal(fork[i]);
    signal(room);
  }
}
```

### 2번 해법 — Hold and Wait 제거

포크를 한 개씩 따로 집지 않고, **두 포크를 한 번에** 집도록 만든다. `once` 세마포어(초깃값 1)로 포크 집는 구간 전체를 한 번에 통과시키면, 한 포크만 쥔 채 다른 포크를 기다리는 hold-and-wait 상황 자체가 사라진다. 이것은 뒤에 나올 "필요한 자원을 한 번에 요청"하는 예방 기법과 같은 원리다.

### 3번 해법 — 자원 순서 정하기

포크에 번호를 매기고, **항상 낮은 번호 포크를 먼저 집도록** 강제한다. 철학자 4명은 (왼쪽 → 오른쪽) 순으로 집되, 마지막 철학자만 (오른쪽 → 왼쪽) 순으로 집게 하면 순환이 끊어진다.

```c
void philosopher(int i) {
  while (true) {
    if (i < 4) {                    // 0~3번: 왼쪽 먼저
      pickup(i);
      pickup(i + 1);
    } else {                        // 4번: 오른쪽 먼저
      pickup((i + 1) % NUM);
      pickup(i);
    }
    eat();
    putdown(i + 1);
    putdown(i);
  }
}
```

이는 뒤에 나올 **자원 순서화(resource ordering)** 기법을 그대로 적용한 것이다. 모두가 같은 순서로 자원을 요청하면 순환 대기가 성립할 수 없다.

## 교착상태의 네 가지 조건

교착상태가 성립하려면 다음 네 조건이 **모두** 만족되어야 한다. 앞의 세 조건은 필요조건이고, 네 번째까지 더해지면 필요충분조건이 된다.

| 조건 | 설명 |
|---|---|
| 상호 배제(mutual exclusion) | 한 번에 한 프로세스만 자원을 사용할 수 있다 |
| 비선점(no preemption) | 자원은 그것을 쥔 프로세스가 작업을 마치고 **자발적으로** 풀어야만 해제된다 |
| 점유와 대기(hold and wait) | 최소 하나의 자원을 쥔 프로세스가 다른 프로세스가 쥔 추가 자원을 기다린다 |
| 순환 대기(circular wait) | $P_0 \rightarrow P_1 \rightarrow \cdots \rightarrow P_n \rightarrow P_0$ 형태로, 각 프로세스가 다음 프로세스가 쥔 자원을 기다리는 순환 고리가 존재한다 |

교착상태를 다루는 모든 기법은 결국 이 네 조건 중 하나를 깨는 것으로 귀결된다.

## 교착상태 처리 기법

교착상태에 대처하는 방법은 크게 네 가지다.

| 접근 | 자원 할당 정책 | 핵심 | 단점 |
|---|---|---|---|
| 예방(prevention) | 보수적, 자원을 적게 커밋 | 네 조건 중 하나를 원천 차단 | 낮은 장치 이용률, 동시성 저하 |
| 회피(avoidance) | 예방과 탐지의 중간 | 안전한 경로를 찾도록 요청을 동적 승인/거부 | 미래 자원 요구를 OS가 알아야 함 |
| 탐지(detection) | 자유로움, 가능한 한 요청 허용 | 주기적으로 교착을 검사하고 복구 | 복구 시 선점 손실 발생 |
| 무시(ignore) | — | 교착이 드물면 그냥 둔다 | 발생 시 대책 없음 |

마지막 "무시"는 농담이 아니다. 예방·회피·탐지 모두 비용이 크기 때문에, 교착이 충분히 드물다면 그 오버헤드를 감수할 가치가 없을 수도 있다. (실제로 많은 범용 OS가 이 전략을 택한다.)

### Deadlock Prevention

**교착 예방(deadlock prevention)**은 네 조건 중 하나를 정책적으로 제거한다.

- **점유와 대기**: 프로세스가 **필요한 모든 자원을 한 번에 요청**하고, 전부 받을 수 있을 때까지 블록시킨다. 단, 일부 자원을 오래 안 쓰면서 점유하게 되어 비효율적이다.
- **순환 대기**: **자원 순서화(resource ordering)**. 자원 타입에 선형 순서를 정의하고, 모든 프로세스가 **번호가 증가하는 순서**로만 자원을 요청하게 한다. 식사하는 철학자 3번 해법이 바로 이것이다. 다만 점진적인(incremental) 자원 요청이 어려워진다.

### Deadlock Avoidance

**교착 회피(deadlock avoidance)**는 세 필요조건은 허용하되, 자원 요청을 승인했을 때 **교착으로 이어질 가능성이 있는지** 매번 동적으로 판단한다. 시스템이 항상 **안전 상태(safe state)**에 머물도록 보장하는 것이 목표다.

- **안전 상태(safe state)**: 모든 스레드에 자원을 할당하면서도 교착을 피할 수 있는 상태. 즉 교착 없이 모든 프로세스를 끝까지 실행할 수 있는 자원 할당 순서가 **적어도 하나** 존재한다.
- **불안전 상태(unsafe state)**: 안전하지 않은 상태. 단, 불안전 상태가 곧 교착은 아니다. 불안전 상태는 교착으로 갈 수도 있다는 의미일 뿐이다.

회피의 한 형태인 **자원 할당 그래프 알고리즘**은 미래 요청을 나타내는 **요구 간선(claim edge)** $T_i \rightarrow R_j$를 그래프에 추가한다. 요청을 승인하는 것은 요구 간선을 할당 간선으로 바꿔도 **사이클이 생기지 않을 때만** 가능하다. 단, 이 알고리즘은 자원 타입마다 인스턴스가 여러 개인 경우에는 적용할 수 없다.

### Banker's Algorithm

자원 인스턴스가 여러 개인 경우의 회피 기법이 **은행원 알고리즘(banker's algorithm)**이다. Dijkstra가 은행의 대출 비유에서 이름을 따왔다. 새 스레드는 진입 시 각 자원 타입의 **최대 요구량**을 선언하고, 요청이 들어오면 시스템은 그 할당이 안전 상태를 유지하는지 검사한다. 안전하면 할당하고, 아니면 다른 스레드가 자원을 풀 때까지 대기시킨다.

상태는 다음 행렬·벡터로 표현된다.

- **Resource $R$**: 시스템 내 각 자원의 총량
- **Available $V$**: 현재 어디에도 할당되지 않은 자원량
- **Claim $C$**: $C_{ij}$ = 프로세스 $i$가 자원 $j$에 대해 요구하는 최대량
- **Allocation $A$**: $A_{ij}$ = 프로세스 $i$에 현재 할당된 자원 $j$의 양

어떤 프로세스 $i$를 끝까지 실행시킬 수 있으려면, 그 프로세스가 앞으로 더 필요로 하는 양($C_{ij} - A_{ij}$)이 가용량 이하여야 한다.

$$C_{ij} - A_{ij} \leq V_j \quad \text{for all } j$$

이 조건을 만족하는 프로세스를 찾아 실행을 끝낸 뒤, 그 프로세스가 쥔 자원을 회수한다.

$$V_j = V_j + A_{ij}$$

이를 반복해 **모든 프로세스를 끝낼 수 있으면 안전 상태**다.

![은행원 알고리즘 - 안전 상태 결정 과정](/assets/images/posts/priority-inversion-and-deadlocks/priority-inversion-and-deadlocks-7.png)

위 그림은 안전 상태를 판정하는 과정이다. 초기 상태에서 $C - A$가 가용 벡터 $V$ 이하인 프로세스($P_2$)를 먼저 실행해 끝내고, 그 자원을 회수해 $V$를 키운다. 늘어난 $V$로 다음 프로세스($P_1$)를 실행하는 식으로 모든 프로세스를 순서대로 완료할 수 있으면 그 상태는 안전하다. 안전 상태에서 불안전 상태로 넘어가게 하는 요청은 거부한다.

은행원 알고리즘의 안전성 검사 로직은 대략 이런 형태다.

```c
boolean safe(state S) {
  int currentavail[m];
  process rest[<number of processes>];
  currentavail = available;
  rest = {all processes};
  possible = true;
  while (possible) {
    // claim[k,*] - alloc[k,*] <= currentavail 인 프로세스 Pk 탐색
    if (found) {              // Pk 실행을 시뮬레이션
      currentavail = currentavail + alloc[k,*];
      rest = rest - {Pk};
    } else {
      possible = false;
    }
  }
  return (rest == null);      // 모두 비웠으면 안전
}
```

핵심은 "지금 끝낼 수 있는 프로세스를 하나씩 시뮬레이션으로 완료시켜, 결국 전부 비울 수 있는가"를 검사하는 것이다. 하나라도 진행시킬 수 없는 순간이 오면 불안전 상태로 판정한다.
