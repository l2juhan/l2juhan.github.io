---
layout: post
title: "TCP Sliding Window — 흐름 제어와 오류 제어"
date: 2026-05-28
categories: [Computer-Network]
tags: [tcp, sliding-window, arq, flow-control, error-control, rwnd, cwnd, nagle, rto, rtt, karn]
description: "ARQ 기본 방식부터 TCP의 바이트 기반 슬라이딩 윈도우, 흐름 제어, Silly Window Syndrome, 오류 제어와 RTO 계산까지 정리한다."
---

신뢰적인 데이터 전달을 위해 TCP는 자체적인 ARQ(Automatic Repeat reQuest)를 갖춰야 한다. 하부 데이터 링크 계층(예: IEEE 802.11)이 자체 ARQ를 가지더라도 인터넷 전체 구간의 신뢰성은 보장되지 않기 때문이다. TCP는 **바이트 기반 슬라이딩 윈도우(byte-oriented sliding window)**로 흐름 제어와 오류 제어를 통합 처리한다.

## ARQ 기본 방식

### Stop-and-Wait ARQ

송신자가 세그먼트 하나를 보내고 그에 대한 ACK/NAK이 올 때까지 대기하는 방식이다. 검증된 구현으로 **alternating bit protocol(ABP)**가 있다.

![Stop-and-Wait ARQ 타임라인](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-1.jpeg)

구조는 단순하지만 ACK를 기다리는 동안 채널이 유휴 상태가 된다. 프레임 전송 시간 대비 ACK 도착 시간이 길면 효율이 크게 떨어진다.

![Stop-and-Wait 채널 유휴 시간](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-2.png)

### Go-back-N ARQ

ACK 없이 최대 $N$개의 패킷을 연속 전송한다(파이프라인 방식). NAK이 수신되면 해당 패킷부터 그 이후 전송된 모든 패킷을 재전송한다.

$N$은 RTT(Round-Trip Time) 동안의 in-flight 패킷 수이며, **대역폭-지연 곱(Bandwidth-Delay Product, BDP)**과 직접 연관된다.

$$N \approx \text{Bandwidth} \times \text{RTT}$$

![Go-back-N ARQ 타임라인](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-3.png)

### Selective-Repeat ARQ

윈도우 $N$개 패킷을 전송하되, ACK가 오면 윈도우를 이동시키고 다음 패킷을 보낸다. "번호가 매겨진" NAK이 오면 해당 패킷만 선택적으로 재전송한다.

![Selective-Repeat ARQ 타임라인](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-4.jpeg)

가장 효율적이지만 구현이 복잡하고 모든 세그먼트마다 시퀀스 번호가 필요하다.

### 기존 ARQ 이론을 TCP에 적용할 때의 한계

위 모델들은 다음을 가정한다.

1. **오류만 발생한다고 가정** — 패킷 손실, 지연 도착, 중복, 폐기는 고려하지 않는다
2. **TCP는 NAK을 사용하지 않는다** — ACK만 사용한다
3. **ACK/NAK도 오류 없이 도착한다고 가정** — 실제로는 ACK도 손실/오류 발생 가능

실제 인터넷에서 패킷은 **damaged, delayed (out-of-order), duplicated, discarded(lost)** 될 수 있다. TCP는 이를 모두 처리해야 한다.

---

## TCP Sliding Window

### Segment-oriented Sliding Window (참고)

세그먼트 단위로 윈도우를 정의하면, 윈도우는 **송신자가 보냈지만 아직 완전히 ACK 받지 못한 세그먼트들의 집합**이다.

![Segment-oriented sliding window](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-5.png)

TCP는 이 방식을 쓰지 않는다. TCP의 시퀀스 번호는 페이로드의 **바이트 오프셋(byte offset)**이기 때문이다.

### Byte-oriented Sender-side Sliding Window

송신측 버퍼는 4개 카테고리로 나뉜다.

![TCP Sender-side sliding window 4 categories](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-6.png)

- **Category #1**: 이미 전송하고 ACK까지 받은 바이트 (버퍼에서 제거 가능)
- **Category #2**: 전송했지만 ACK를 못 받은 바이트 — **in-flight outstanding bytes**
- **Category #3**: 아직 보내지 않았지만 보낼 수 있는 바이트 — **Usable Window**
- **Category #4**: 아직 보낼 수 없는 바이트 (윈도우 바깥)

여기서 **Send Window**는 카테고리 #2 + #3이고, 그 크기가 송신 윈도우의 크기다.

핵심 변수는 셋이다.

- **Send Unacknowledged** ($S_f$, SND.UNA): 전송했지만 ACK 못 받은 첫 번째 바이트의 시퀀스 번호
- **Send Next** ($S_n$, SND.NXT): 다음에 전송할 바이트의 시퀀스 번호
- **Send Window** (SND.WND): 송신 윈도우 크기 = $\min(\text{rwnd}, \text{cwnd})$

![SND.UNA / SND.NXT / SND.WND](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-7.png)

윈도우 양 끝 가장자리의 동작은 다음과 같다.

- **Closing** (왼쪽 가장자리 이동): 첫 번째 outstanding 바이트가 $n$보다 작고 ACK $n$이 도착하면 왼쪽 가장자리가 $n$으로 이동한다 — 윈도우는 이동하지만 크기는 변하지 않는다
- **Opening** (오른쪽 가장자리 우측 이동): 송신 윈도우 크기가 커진다
- **Shrinking** (오른쪽 가장자리 좌측 이동): 송신 윈도우 크기가 줄어든다. TCP는 흐름 제어로 `rwnd`를 바꾸고, 혼잡 제어로 `cwnd`를 바꾸며 결과적으로 $\min(\text{rwnd}, \text{cwnd})$가 변할 수 있다

### Byte-oriented Receiver-side Sliding Window

수신측은 두 가지 변수를 관리한다.

- **Receive Next** ($R_n$, RCV.NXT): 다음에 받기를 기대하는 바이트의 시퀀스 번호
- **Receive Window** ($rwnd$, RCV.WND): 송신자에게 "광고(advertise)"하는 수신 윈도우 크기

![Receiver-side sliding window](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-8.png)

수신 윈도우의 동작:

- **Opening**: 수신 프로세스가 더 많은 바이트를 읽어가면 `rwnd`가 커진다
- **Closing**: 새 세그먼트가 도착하여 $R_n$이 전진하면 윈도우가 닫힌다
- $R_n$이 프로세스의 소비 속도보다 빨리 전진하면 `rwnd`는 **shrinks**
- 두 속도가 같으면 `rwnd`는 **stays open**

---

## TCP Flow Control

### 동기

수신 앱이 수신 버퍼에서 천천히 데이터를 읽으면 어떻게 될까. 송신자는 계속 데이터를 보내는데(push 방식), 수신 버퍼가 가득 차면 들어오는 세그먼트는 폐기될 수밖에 없다.

![TCP Flow Control 동기](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-9.png)

흐름 제어는 **producer-consumer 사이의 속도 매칭 서비스**다. TCP는 속도(rate) 대신 윈도우 크기로 이를 구현한다.

핵심은 다음과 같다.

- TCP 수신자는 TCP 헤더의 **`rwnd` 필드**에 자유 버퍼 공간을 광고한다
- `RcvBuffer` 크기는 소켓 옵션으로 설정(기본 4096 bytes)되며, OS가 자동 조정하기도 한다
- 송신자는 unACKed("in-flight") 데이터를 광고받은 `rwnd` 이하로 제한한다
- 송신 윈도우 크기 = $\min(\text{rwnd}, \text{cwnd})$

### 예시

연결 설립 시 양쪽이 `rwnd`를 광고하고, 이후 데이터 전송에 따라 윈도우가 닫히고 열린다.

![TCP Flow Control Example](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-10.png)

수신 버퍼에 데이터가 쌓이면 `rwnd`가 줄어들고, 앱이 데이터를 읽어가면 다시 늘어나는 흐름이다.

---

## Variable Window Size 관련 이슈

### Silly Window Syndrome (SWS)

윈도우 크기가 동적으로 변하는 과정에서 발생하는 성능 문제다. 'silly'는 작은 단위 생산/소비로 인한 큰 처리/전송 오버헤드를 의미한다.

**수신측 SWS 시나리오:**

수신 버퍼가 꽉 찬 상태에서 앱이 1바이트씩 천천히 읽으면, 1바이트 공간이 생길 때마다 `rwnd=1`을 광고하게 된다. 송신측은 1바이트만 보낼 수 있고, 결국 40바이트 헤더에 1바이트 데이터라는 비효율적인 세그먼트가 반복된다.

![Silly Window Syndrome 수신측](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-11.png)

### Nagle's Algorithm (송신측 SWS 회피)

송신 앱이 1바이트씩 천천히 쓰면 41바이트 세그먼트가 다량 in-flight 상태가 된다. **John Nagle**의 해결책([RFC 896]):

1. 첫 번째 데이터는 1바이트라도 즉시 전송
2. 이후엔 데이터를 출력 버퍼에 누적하면서 **ACK 수신** 또는 **MSS만큼 데이터 누적** 중 하나가 충족될 때까지 대기
3. 충족되면 세그먼트 전송, 2단계 반복

![Nagle's algorithm](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-12.png)

### Receiver-Side SWS 회피

Nagle이 켜져 있어도 수신측 SWS는 여전히 발생한다. 수신 TCP의 읽기 동작이 작은 `rwnd`를 광고하는 ACK를 유발하기 때문이다. 해결책은 두 가지다.

**Clark's solution** ([RFC 813]): 데이터 도착 시 ACK는 즉시 보내되, 수신 버퍼의 절반이 비거나 MSS 크기 세그먼트를 수용할 공간이 생길 때까지 `rwnd=0`을 광고한다.

**Delayed ACK**: 세그먼트 도착 시 즉시 ACK를 보내지 않고, 수신 버퍼에 적당한 공간이 생길 때까지 기다린다. 단, 송신측이 손실로 오인해 불필요하게 재전송할 수 있다는 부작용이 있다. [RFC 1122] 및 [RFC 9293]은 다음을 요구한다.

- ACK 지연은 **0.5초 미만**이어야 한다 (MUST)
- 최소 **두 번째 full-sized 세그먼트마다** 또는 **2 × RMSS의 새 데이터마다** ACK를 생성해야 한다 (SHOULD)

---

## TCP Error Control

TCP의 오류 제어는 세 가지 도구로 이루어진다.

- **Checksum**: 오류 탐지
- **Acknowledgment**: 보낸 데이터가 받았는지 확인
- **Timeout**: 손실 추정 후 재전송

### ACK 생성 규칙

[RFC 5681] 기반의 수신측 ACK 생성 규칙(Kurose-Ross 정리)은 다음과 같다.

| Event | TCP Receiver Action |
|---|---|
| **순서대로 도착**, 기대 seq#, 이전 데이터 모두 ACK 완료 | **Delayed ACK**. 다음 세그먼트까지 최대 500ms 대기, 없으면 ACK 전송 |
| **순서대로 도착**, 기대 seq#, 한 세그먼트가 ACK 대기 중 | **즉시** 누적(cumulative) ACK 전송 |
| **순서 어긋난 도착**, 기대보다 큰 seq# (gap 감지) | **즉시 duplicate ACK** 전송, 다음 기대 바이트의 seq# 통지 |
| **gap을 부분/전부 채우는 세그먼트** 도착 | gap의 낮은 끝에서 시작하면 즉시 ACK 전송 |

교과서의 6가지 규칙으로 정리하면:

1. 데이터를 보낼 때는 ACK 피기백(piggyback) — 트래픽 감소
2. 순서대로 받았고 직전 세그먼트가 ACK 완료된 경우, ACK 지연 (Kurose-Ross 1번)
3. 순서대로 받았으나 직전이 unACK 상태면 즉시 ACK — 한 번에 unACK 두 개를 넘기지 않는다 (Kurose-Ross 2번)
4. 순서 어긋난 큰 seq# 도착 시 즉시 ACK — **빠른 재전송(fast retransmission)**을 유도 (Kurose-Ross 3번)
5. 누락된 세그먼트가 도착하면 새 기대 seq#를 즉시 알림 (Kurose-Ross 4번)
6. 중복 세그먼트는 폐기하되 즉시 누적 ACK 전송 — 이전 ACK 손실 가능성에 대응

### 오류 제어 시나리오

**Scenario 1: 정상 동작**

![Normal Operation](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-13.png)

규칙 1로 ACK가 피기백되고, ACK 지연 타이머가 만료되면 규칙 2로 ACK 전송, 두 번째 세그먼트가 도착하면 규칙 3으로 즉시 누적 ACK 전송.

**Scenario 2: 세그먼트 손실**

![Lost Segment](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-14.png)

`701-800`이 손실되고 `801-900`이 먼저 도착하면 gap이 발생한다. 수신측은 규칙 4에 따라 `Ack: 701`을 즉시 보내며(duplicate ACK), 이는 fast retransmission을 유도하는 신호가 된다. 누락이 채워지면 규칙 5로 새 ACK 전송.

**Scenario 3: Fast Retransmission**

타임아웃을 기다리지 않고 빠르게 재전송하기 위해, 오늘날 대부분의 구현은 **3개의 duplicate ACK** 수신 시 즉시 누락 세그먼트를 재전송한다.

![Fast Retransmission](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-15.png)

동일한 ACK가 4번(원본 + 3 duplicate) 도착하면 timeout 전이라도 즉시 재전송한다. duplicate ACK는 후속 세그먼트들이 수신측에 도달했다는 뜻이므로 네트워크 상태가 양호함을 시사한다.

**Scenario 5: 손실 ACK가 재전송으로 보정**

![Lost ACK corrected](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-16.png)

ACK가 손실되어 타임아웃 발생 → 재전송 → 수신측은 규칙 6에 따라 중복 세그먼트를 폐기하면서도 누적 ACK를 다시 보낸다.

---

## Retransmission Timeout (RTO) 설정

RTO를 얼마로 잡아야 패킷 손실로 판단하고 재전송할지 결정할 수 있다. TCP 표준 [RFC 9293]은 [RFC 6298] 알고리즘을 MUST로 요구한다.

이상적으로는 forward trip time + receiver processing + backward trip time + sender processing의 합을 알면 되지만, 실제로는 어느 것도 정확히 알 수 없다. 측정 가능한 값들도 시간에 따라 변한다. 따라서 **통계적 추정**이 필요하다.

### Naive RTT Estimation

가장 단순한 추정은 표본 평균이다.

$$\overline{RTT} = \frac{RTT_1 + RTT_2 + \cdots + RTT_n}{n}$$

하지만 측정 시점이 다르다는 점을 고려해야 한다. 가중 평균이 더 합리적이다.

$$\overline{WRTT} = \frac{w_1 RTT_1 + w_2 RTT_2 + \cdots + w_n RTT_n}{w_1 + w_2 + \cdots + w_n}$$

문제는 단순한 알고리즘이 필요하다는 점이다.

### TCP의 RTO 계산 알고리즘

**SmoothedRTT** 추정은 **Exponential Weighted Moving Average (EWMA)**로 계산한다. 과거 표본의 영향이 지수적으로 빠르게 감소한다.

$$\text{SmoothedRTT} = (1 - \alpha) \cdot \text{SmoothedRTT} + \alpha \cdot \text{MeasuredRTT}$$

- 일반적으로 $\alpha = 0.125$
- 첫 측정: $\text{SmoothedRTT} = \text{MeasuredRTT}$

**RTT Variation**도 EWMA로 추정한다. `MeasuredRTT`와 `SmoothedRTT`의 편차에 대한 EWMA다.

$$\text{RTTVAR} = (1 - \beta) \cdot \text{RTTVAR} + \beta \cdot |\text{MeasuredRTT} - \text{SmoothedRTT}|$$

- 일반적으로 $\beta = 0.25$
- 첫 측정: $\text{RTTVAR} = \text{MeasuredRTT}/2$

**RTO**는 SmoothedRTT에 "안전 마진(safety margin)"을 더한다.

$$\text{RTO} = \text{SmoothedRTT} + \max(G, K \cdot \text{RTTVAR})$$

- 일반적으로 $K = 4$
- 초기 RTO: 1초 ([RFC 6298]) 또는 3초 ([RFC 2988])

![RTT 측정과 SmoothedRTT 비교](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-17.png)

`MeasuredRTT`(파란 점)는 크게 변동하지만 `SmoothedRTT`(분홍 사각형)는 안정적으로 평활화된다.

### 계산 예시

SYN 전송 시점에는 측정값이 없으므로 RTO를 6초로 둔다. SYN+ACK가 1.5초 후 도착하면:

$$\begin{aligned}
RTT_M &= 1.5 \\
RTT_S &= 1.5 \\
RTT_D &= 1.5 / 2 = 0.75 \\
RTO &= 1.5 + 4 \times 0.75 = 4.5
\end{aligned}$$

이후 데이터 ACK가 2.5초 후 도착하면:

$$\begin{aligned}
RTT_M &= 2.5 \\
RTT_S &= \tfrac{7}{8}(1.5) + \tfrac{1}{8}(2.5) = 1.625 \\
RTT_D &= \tfrac{3}{4}(0.75) + \tfrac{1}{4}|1.625 - 2.5| = 0.78 \\
RTO &= 1.625 + 4 \times 0.78 = 4.74
\end{aligned}$$

![RTO 계산 시퀀스 다이어그램](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-18.png)

### Karn's Algorithm

재전송된 세그먼트의 RTT 측정은 모호하다. 받은 ACK가 원본에 대한 것인지 재전송본에 대한 것인지 구분할 수 없기 때문이다.

![Karn's algorithm 모호성](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-19.jpeg)

**Karn's algorithm**의 규칙은 단순하다.

- **재전송된 세그먼트에 대해 RTT를 업데이트하지 않는다**
- 재전송되지 않은 세그먼트에 대한 ACK를 받아야만 RTT 측정을 재개한다

그리고 [RFC 6298]의 **Exponential Backoff**: 재전송마다 RTO를 **두 배**로 늘려야 한다(MUST). 최대값을 설정할 수 있다(MAY).

![Karn's algorithm 예시](/assets/images/posts/tcp-sliding-window/tcp-sliding-window-20.png)

손실 발생 시 RTO가 4.74 → 9.48로 두 배가 되고, Karn 규칙에 따라 재전송본의 ACK는 RTT 측정에 쓰지 않는다. 이후 새 데이터의 정상 ACK가 도착하면 그 측정값으로 RTT 변수들이 다시 갱신된다.
