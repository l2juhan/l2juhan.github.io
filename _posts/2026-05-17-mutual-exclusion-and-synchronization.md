---
layout: post
title: "Mutual Exclusion and Synchronization — 상호 배제와 동기화 기법"
date: 2026-05-17
categories: [Operating-System]
tags: [operating-system, synchronization, mutual-exclusion, critical-section, race-condition, peterson, spinlock, semaphore, cas, deadlock, pthread, futex]
description: "임계 구역 문제의 세 가지 조건부터 Peterson 알고리즘, 인터럽트 비활성화, CAS, 스핀락, 세마포어, POSIX API, 리눅스 futex까지 상호 배제와 동기화 기법을 정리한다."
---

여러 스레드가 공유 자원에 동시에 접근하면 실행 순서에 따라 결과가 달라진다. 이 레이스 컨디션(race condition)을 막는 방법은 결국 하나로 귀결된다 — 공유 자원에 접근하는 코드를 **한 번에 하나의 실행 단위만** 통과시키는 것. 그 방법을 단계적으로 다룬다.

## 문제의 출발점

직전 글에서 본 공유 변수 예제를 다시 보자. 전역 변수 `x`를 한 스레드는 1000번 증가시키고 다른 스레드는 1000번 감소시킨다.

```c
/* bad sharing */
int x;

void *thread_increment(void *arg) {
  int i, val;
  for (i = 0; i < ITER; i++) {
    val = x;
    x = val + 1;
  }
  return NULL;
}
/* thread_decrement는 x = val - 1 */
```

`+1`을 1000번, `-1`을 1000번 했으니 `x`는 0이어야 한다. 그런데 실행하면 `BOOM! counter=-84` 같은 값이 나온다. 원인은 `x = val + 1` 한 줄이 **원자적(atomic)이지 않다**는 데 있다. 원자적 연산이란 "전부 수행되거나 전혀 수행되지 않는, 중간에 끼어들 수 없는" 연산을 말한다. `++` 하나는 Load / Add / Store 세 명령어로 컴파일되고, 그 사이에 스케줄러가 다른 스레드를 끼워 넣을 수 있다.

| 순서 | Thread A | Thread B | 메모리 `counter` |
|---|---|---|---|
| (1) | Load `counter` (0) | | 0 |
| (2) | *스케줄링* | Load `counter` (0) | 0 |
| (3) | | Add (0 → 1) | 0 |
| (4) | | Store `counter` (1) | 1 |
| (5) | Add (0 → 1) | | 1 |
| (6) | Store `counter` (1) | | 1 |

A와 B가 한 번씩 증가시켰으니 `counter`는 2여야 하지만 결과는 1이다. 둘 다 같은 시점의 `counter = 0`을 읽었기 때문에 한쪽의 갱신이 사라진다(lost update). 단일 프로세서(UP)에서는 비동기 인터럽트로 인한 선점 스케줄링이, 멀티프로세서(MP)에서는 여러 CPU의 실행 타이밍 중첩이 원인이다. **프로세서가 하나든 여럿이든 레이스 컨디션은 발생한다.**

여기에 더해 현대 아키텍처는 성능을 위해 명령어를 재배치(reorder)하기까지 한다. 이 점은 뒤에서 다시 나온다.

## 용어 정리

해결책을 논하기 전에 용어를 고정한다.

- **임계 자원(critical resource)**: 한 번에 하나의 실행 단위만 접근해야 하는 공유 자원. 프린터, 공유 변수, 버퍼 등. 여러 프로세스가 프린터에 동시에 출력하면 출력이 뒤섞여 깨진다.
- **임계 구역(critical section)**: 임계 자원에 접근하는 코드 블록. 주의할 점은 **읽기/쓰기 시나리오에서도** 레이스 컨디션이 발생한다는 것이다. 모든 스레드가 읽기만 한다면 레이스 컨디션은 없다.
- **상호 배제(mutual exclusion)**: 같은 시각에 임계 구역 안에 하나의 실행 단위만 존재하도록 보장하는 요구사항.
- **레이스 컨디션(race condition)**: 여러 실행 단위가 공유 자원에 동시 접근해 결과가 비결정적(non-deterministic)·재현 불가(non-reproducible)가 되는 상황.
- **동기화(synchronization)**: 공유 자원을 쓰는 실행 단위들을 조율하거나 올바른 실행 순서를 보장하는 메커니즘.

한 줄로 요약하면 이렇다.

> 프로세스/스레드 동기화는 동시성을 최대한 살리면서, 임계 구역 안에서 상호 배제를 제공해 레이스 컨디션을 피하거나 올바른 실행을 보장하는 메커니즘이다.

서로 독립적인 자원은 각각 별도의 임계 구역으로 분리하는 것이 좋다. 그래야 동시성이 최대화된다. 단, 두 데이터 $a$, $b$가 항상 $a = b$를 유지해야 하는 등 **의존 관계**가 있다면 둘을 갱신하는 코드 전체를 하나의 임계 구역으로 묶어야 한다.

## 임계 구역 문제의 세 가지 조건

올바른 상호 배제 해법은 다음 세 조건을 모두 만족해야 한다.

1. **상호 배제(Mutual Exclusion)**: 프로세스 $P_i$가 임계 구역에서 실행 중이면, 다른 어떤 프로세스도 자신의 임계 구역에서 실행될 수 없다.
2. **진행(Progress)**: 임계 구역에 아무도 없고 진입을 원하는 프로세스가 있다면, 다음에 들어갈 프로세스의 선택을 무한히 미룰 수 없다.
3. **한정 대기(Bounded Waiting)**: 한 프로세스가 진입을 요청한 뒤, 다른 프로세스들이 임계 구역에 들어갈 수 있는 횟수에 상한이 있어야 한다. 즉 무한 대기(starvation)가 없어야 한다.

상호 배제만 만족하면 되는 게 아니다. 진행과 한정 대기를 놓치면 데드락이나 기아가 생긴다. 아래 소프트웨어 해법들은 이 세 조건을 기준으로 평가한다.

## 소프트웨어 해법

### 단일 flag — 실패

가장 단순하게는 락 보유 여부를 나타내는 `flag` 하나만 두면 될 것 같다.

```c
while (1) {            /* Enter CS */
  if (flag == 0) {
    flag = 1;
    break;
  }
}
/* CRITICAL SECTION */
flag = 0;              /* Exit CS */
```

문제는 `if (flag == 0)`와 `flag = 1` 사이에서 스케줄링이 일어날 수 있다는 것이다. $P_0$이 `flag == 0`을 확인한 직후 선점되어 $P_1$도 `flag == 0`을 확인하면, 둘 다 임계 구역에 들어간다. **상호 배제 자체가 깨진다.**

### 각자의 flag — 상호 배제는 되지만 진행 실패

각 프로세스에 전용 flag를 준다. 먼저 깃발을 든 쪽만 들어가게 하려는 시도다.

```c
Boolean flag[2] = {FALSE, FALSE};

/* P0 */                    /* P1 */
do {                        do {
  flag[0] = TRUE;             flag[1] = TRUE;
  while (flag[1]) ;           while (flag[0]) ;
  /* CRITICAL SECTION */      /* CRITICAL SECTION */
  flag[0] = FALSE;            flag[1] = FALSE;
  /* REMAINDER */             /* REMAINDER */
} while (TRUE);             } while (TRUE);
```

상호 배제는 만족한다. 그러나 $P_0$이 `flag[0] = TRUE`를 한 직후 선점되고 $P_1$도 `flag[1] = TRUE`를 하면, 둘 다 상대 flag가 `TRUE`라 서로의 `while`에서 영원히 대기한다. 아무도 임계 구역에 들어가지 못하니 **진행 조건이 깨진다**(데드락).

### Peterson 알고리즘

전역 `turn` 변수를 추가해 동점(tie)을 깬다. `turn`은 0 또는 1만 가질 수 있다.

```c
Boolean flag[2] = {FALSE, FALSE};
int turn;

/* P0 */                              /* P1 */
do {                                  do {
  flag[0] = TRUE;                       flag[1] = TRUE;
  turn = 1;                             turn = 0;
  while (flag[1] && turn == 1) ;        while (flag[0] && turn == 0) ;
  /* CRITICAL SECTION */                /* CRITICAL SECTION */
  flag[0] = FALSE;                      flag[1] = FALSE;
  /* REMAINDER */                       /* REMAINDER */
} while (TRUE);                       } while (TRUE);
```

`flag[0]`과 `flag[1]`은 둘 다 `TRUE`가 될 수 있지만 `turn`은 0 아니면 1 하나뿐이다. 두 프로세스가 동시에 진입을 시도해도 `turn`이 한쪽으로 정해지므로, 양보한 쪽만 대기하고 다른 쪽은 들어간다. **상호 배제와 진행을 모두 보장**하며 상호 봉쇄(mutual blocking)도 막는다. 순수 소프트웨어만으로 임계 구역 문제를 푼 고전적 해법이다.

### Peterson의 한계 — 명령어 재배치

여기서 문제가 생긴다. Peterson 알고리즘은 `flag` 설정과 `turn` 설정, 그리고 상대 변수 읽기의 **순서**에 의존한다. 그런데 현대 하드웨어는 완화된 일관성 모델(relaxed consistency model) 아래에서 메모리 명령어를 적극적으로 재배치한다. 의존 관계가 없어 보이는 `flag[0] = TRUE`와 `turn = 1`의 순서가 뒤바뀌면 알고리즘이 깨진다.

결론은 분명하다. **순수 소프트웨어 해법은 현대 하드웨어에서 그대로는 동작하지 않는다.** 락을 안전하게 구현하려면 하드웨어 지원이 필요하다.

## 인터럽트 비활성화

가장 오래된 해법 중 하나다. 인터리빙의 주된 원인이 인터럽트라면, 임계 구역 동안 인터럽트를 꺼버리면 된다.

```c
void entercritical() { DisableInterrupts(); }
void exitcritical()  { EnableInterrupts();  }
```

장점은 단순함이다. 단일 프로세서에서 **짧은** 임계 구역에는 스핀이나 컨텍스트 스위칭 없이 쓸 수 있다. 리눅스의 `local_irq_save` / `local_irq_restore`가 이 방식이다.

단점은 두 가지다. 첫째, **멀티프로세서에서는 무용지물**이다. 한 프로세서의 인터럽트를 꺼도 다른 프로세서들은 계속 실행되므로 상호 배제가 보장되지 않는다. 둘째, 임계 구역이 길면 중요한 인터럽트가 지연되어 시스템 성능이 떨어진다.

구현상 주의점이 하나 있다. **중첩된 임계 구역**에서는 인터럽트 상태를 저장하고 복원해야 한다. `functionA`가 인터럽트를 끄고 `functionB`를 호출했는데, `functionB`가 끝나면서 무조건 `intr_enable()`을 호출하면 `functionA`가 아직 임계 구역인데 인터럽트가 켜진다.

```c
/* 잘못된 방식: 무조건 enable */         /* 올바른 방식: 이전 상태 저장/복원 */
void functionB(void) {                  void functionB(void) {
  intr_disable();                         enum intr_level old_level;
  /* Critical Section */                  old_level = intr_disable();
  intr_enable();   /* ← 위험 */           /* Critical Section */
}                                         intr_set_level(old_level);
                                        }
```

## 하드웨어 지원: Compare-And-Swap

인터럽트 비활성화가 MP에서 안 되니, 시스템 설계자들은 락을 위한 하드웨어 명령어를 만들었다. 대표가 **Compare-And-Swap(CAS)**이다.

CAS는 메모리 위치의 값을 주어진 기댓값과 비교해, **같을 때만** 새 값으로 바꾼다. 이 비교-교체 전체가 하나의 원자적 명령어로 수행된다. 의사 코드로 보면 다음과 같다.

```c
int CompareAndSwap(int *addr, int expected, int new) {
  int old = *addr;
  if (old == expected) *addr = new;   /* 이 전체가 원자적 */
  return old;
}
```

이걸로 락을 만들면 단일 flag 해법의 "확인과 설정 사이 선점" 문제가 사라진다. 확인과 설정이 한 명령어로 묶이기 때문이다.

```c
void lock(lock_t *lock) {
  while (CompareAndSwap(&lock->flag, 0, 1) == 1)
    ;   /* spin-wait (do nothing) */
}
```

## 스핀락

위 `lock`이 락을 얻을 때까지 `while`을 돌며 CPU 사이클을 태우는 모습 때문에 이런 락을 **스핀락(spin lock)**이라 부른다. 가장 단순한 락이며, 바쁜 대기(busy waiting)를 한다.

세 가지 기준으로 평가하면:

| 기준 | 스핀락 | 설명 |
|---|---|---|
| 상호 배제 | O | 한 번에 하나만 임계 구역 진입 |
| 공정성 | X | 대기 순서 보장 없음 → 기아 가능. Fetch-And-Add 기반 티켓 락으로 개선 가능 |
| 성능 | X | 바쁜 대기로 CPU 낭비 |

UP와 MP에서 성질이 다르다. **UP에서는 사용하면 안 된다.** 락을 쥔 스레드가 선점되면, 그 스레드가 다시 스케줄될 때까지 다른 스레드들은 무의미하게 계속 스핀만 한다. **MP에서는** 락을 쥔 스레드가 다른 프로세서에서 계속 실행될 수 있으므로 이 문제가 크게 완화된다. 그래서 스핀락은 보유 시간이 짧은 MP 상황에 적합하다.

## 세마포어

스핀락은 자원 하나에 대한 상호 배제만 다룬다. **세마포어(semaphore)**는 더 일반화된 동기화 도구다. 상호 배제뿐 아니라 자원이 여러 개일 때의 관리, 그리고 생산자-소비자·독자-작가 같은 복잡한 동기화 문제까지 푼다. Dijkstra가 1965년에 고안했다.

세마포어 $S$는 정수 값을 가진 객체다. 그 값은 **사용 가능한 자원의 개수**를 뜻한다. 값을 바꾸는 연산은 두 개다.

- `semWait()` — 원래 이름 $P()$ (proberen). 값을 감소시킨다.
- `semSignal()` — 원래 이름 $V()$ (verhogen). 값을 증가시킨다.

```c
Semaphore S;   // 1로 초기화
P(S);
  /* Critical Section */
V(S);
```

핵심은 **바쁜 대기를 하지 않는다**는 점이다. 세마포어는 자신을 기다리는 프로세스들의 큐를 가진다. 값이 음수가 되면 요청한 프로세스를 큐에 넣고 블록 상태로 전이시킨다. `semSignal`은 값을 올리고, 대기 중인 프로세스가 있으면 깨운다. 정형화하면 다음과 같다.

```c
struct semaphore { int count; queueType queue; };

void semWait(semaphore s) {
  s.count--;
  if (s.count < 0) {
    /* 요청한 프로세스를 s.queue에 연결 */
    /* 요청한 프로세스를 블록 상태로 전이 */
  }
}
void semSignal(semaphore s) {
  s.count++;
  if (s.count <= 0) {
    /* s.queue에서 프로세스 하나를 꺼내 */
    /* 준비(ready) 상태로 전이 */
  }
}
```

세마포어는 값 범위에 따라 둘로 나뉜다.

- **이진 세마포어(binary semaphore)**: 값이 0과 1만 가진다. 락으로 쓰며, **뮤텍스(mutex)**라고도 부른다.
- **계수 세마포어(counting semaphore)**: 값의 범위에 제한이 없다. 동일 자원이 여러 개일 때 그 개수를 센다. 일반 세마포어라고도 한다.

스핀락과의 차이를 정리하면:

| 항목 | 세마포어 | 스핀락 |
|---|---|---|
| 자원 관리 | 상호 배제 + 자원 여러 개 관리 | 자원 하나, 상호 배제만 |
| 대기 방식 | 블록-깨움(block-wakeup) | 바쁜 대기(busy-waiting) |
| 적합 상황 | 락 보유 시간이 길고 경합이 심할 때 | 락 보유 시간이 짧을 때 |

### 세마포어 오용 — 데드락

세마포어를 잘못 쓰면 데드락에 빠진다. 둘 이상의 프로세스가 서로 상대가 가진 것을 기다리며 아무도 진행하지 못하는 상황이다. $A$, $B$ 두 세마포어를 1로 초기화하고 다음처럼 쓰면:

```c
/* P0 */              /* P1 */
semWait(A);           semWait(B);
semWait(B);  /* sleep */  semWait(A);  /* sleep */
  :                       :
semSignal(A);         semSignal(B);
semSignal(B);         semSignal(A);
```

$P_0$이 $A$를 잡고 $P_1$이 $B$를 잡은 상태에서, $P_0$은 $B$를, $P_1$은 $A$를 기다린다. 둘 다 영원히 잠든다. 락 획득 순서를 일관되게 맞추는 것이 데드락 회피의 기본이다.

## POSIX API

Pthreads는 임계 구역 상호 배제를 위한 뮤텍스 함수를 제공한다.

```c
#include <pthread.h>

int pthread_mutex_init(pthread_mutex_t *mutex, pthread_mutexattr_t *attr);
int pthread_mutex_destroy(pthread_mutex_t *mutex);
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
int pthread_mutex_trylock(pthread_mutex_t *mutex);   /* 실패 시 즉시 반환 */
```

맨 앞의 `bad sharing` 예제를 뮤텍스로 고치면 임계 구역이 보호된다.

```c
pthread_mutex_t m;

void *thread_increment(void *arg) {
  int i, val;
  for (i = 0; i < ITER; i++) {
    pthread_mutex_lock(&m);
    val = x;
    x = val + 1;
    pthread_mutex_unlock(&m);
  }
  pthread_exit(NULL);
}
/* main: pthread_mutex_init(&m, NULL); ... pthread_mutex_destroy(&m); */
```

POSIX 세마포어는 별도 헤더를 쓴다.

```c
#include <semaphore.h>

int sem_init(sem_t *s, int pshared, unsigned int val);  /* s = val */
int sem_wait(sem_t *s);   /* P(s) */
int sem_post(sem_t *s);   /* V(s) */
```

`sem_init(&s, 0, 1)`로 1 초기화한 뒤 임계 구역을 `sem_wait` / `sem_post`로 감싸면 뮤텍스와 동일하게 동작한다.

## 리눅스: Two-Phase Lock

리눅스는 **futex(fast user-space mutex)**라는 동기화 메커니즘을 쓴다. 락을 효율적으로 관리하기 위한 것으로, **two-phase lock** 또는 적응형 뮤텍스(adaptive mutex)라 불린다.

- **1단계**: 일정 시간 동안 스핀하며 락 획득을 시도한다. 락이 곧 풀릴 것 같으면 컨텍스트 스위칭 비용 없이 바로 얻을 수 있다.
- **2단계**: 그 시간 안에 못 얻으면 호출자를 재워(sleep) 두고, 나중에 락이 풀릴 때 깨운다.

스핀락의 "짧은 대기에 강함"과 세마포어의 "긴 대기에 CPU 낭비 없음"을 시간 경계로 나눠 합친 구조다. 스핀락과 블록 기반 락의 절충안인 셈이다.

## 정리

상호 배제 기법은 결국 "확인과 설정을 어떻게 원자적으로 묶느냐"의 역사다. 소프트웨어만으로 시도한 Peterson은 명령어 재배치에 무너졌고, 인터럽트 비활성화는 MP에서 막혔다. CAS 같은 하드웨어 원자 명령어가 등장하면서 스핀락이 가능해졌고, 바쁜 대기를 없애기 위해 큐 기반 세마포어가 나왔으며, 둘의 장점을 시간으로 가른 것이 futex의 two-phase lock이다. 어떤 락을 쓸지는 **락 보유 시간과 경합 정도**로 결정한다 — 짧으면 스핀, 길면 블록.
