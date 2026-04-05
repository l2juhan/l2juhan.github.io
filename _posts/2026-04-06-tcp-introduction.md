---
layout: post
title: "TCP Introduction — 전송 계층과 TCP 핵심 개념"
date: 2026-04-06
categories: [Computer-Network]
tags: [tcp, transport-layer, socket, sequence-number, ack, retransmission, tcp-header, flow-control, congestion-control]
description: "전송 계층의 역할과 소켓 개념부터 TCP의 세 가지 서비스, 시퀀스 번호·ACK·재전송 메커니즘, TCP 헤더 구조까지 정리한다."
---

IP는 **호스트(host)** 간 통신을 담당한다. 그런데 실제로 통신하는 것은 호스트 안의 **프로세스(process)**다. 전송 계층은 이 간격을 메운다 — 호스트 간 통신을 프로세스 간 **논리적 통신(logical communication)**으로 확장한다.

## 전송 계층 기초

### 전송 계층의 역할

전송 계층 프로토콜은 **끝 시스템(end system)**에서만 동작한다. 라우터는 전송 계층을 모른다.

**송신 측(Sender)**:
1. 응용 계층에서 메시지를 넘겨받는다
2. 세그먼트 헤더 필드 값을 결정한다 (포트 번호, 시퀀스 번호 등)
3. `[헤더 + 데이터]`로 세그먼트를 생성한다
4. 세그먼트를 네트워크 계층(IP)으로 전달한다

**수신 측(Receiver)**:
1. 네트워크 계층(IP)으로부터 세그먼트를 받는다
2. 헤더 값을 확인한다 (포트 번호, 체크섬 등)
3. 자기 헤더만 제거하고 메시지를 추출한다 — 각 계층은 자기 헤더만 처리한다
4. 소켓(socket)을 통해 올바른 응용 프로세스로 올려 보낸다 — **역다중화(demultiplexing)**

인터넷에서 사용하는 전송 프로토콜은 두 가지다.

| 프로토콜 | 특성 | 주요 사용처 |
|---|---|---|
| **TCP** | 신뢰적, 순서 보장, 연결 설립, 흐름/혼잡 제어 | HTTP, FTP |
| **UDP** | 비신뢰적, 순서 미보장, 연결 없음 | 스트리밍, 게임, DNS |

전송 계층이 보장하지 않는 것도 있다. **지연 보장(delay guarantee)**과 **대역폭 보장(bandwidth guarantee)**은 제공하지 않는다.

### 포트 번호와 소켓

**포트 번호(port number)**는 전송 계층(L4)의 개념이다. IP 주소가 호스트를 식별한다면, 포트 번호는 그 호스트 안의 특정 프로세스(소켓)를 식별한다.

- **포트 번호** = 찾아오는 주소(숫자)
- **소켓(socket)** = 그 주소로 열린 실제 통신 객체

소켓의 정의는 관점에 따라 다르다.
- **운영체제 관점**: 응용 계층과 전송 계층 사이의 인터페이스
- **TCP/IP 프로토콜 관점**: IP 주소 + 포트 번호의 조합 (endpoint). 예: `192.168.1.1:80`

이 강의는 TCP/IP 프로토콜 관점으로 소켓을 다룬다.

각 TCP/UDP 세그먼트에는 **source port #** 와 **dest port #** 가 들어있다. 호스트가 IP 데이터그램을 받으면:
1. IP 헤더에서 src/dst IP 주소 확인
2. 그 안의 TCP/UDP 세그먼트에서 src/dst 포트 번호 확인
3. IP 주소 + 포트 번호 조합으로 올바른 소켓에 전달

### TCP/IP 스택에서 TCP의 위치

![TCP/IP Protocol Suite 레이어 구조](/assets/images/posts/tcp-introduction/tcp-introduction-1.png)

TCP는 전송 계층(Transport layer)에서 UDP, SCTP와 함께 위치한다. 응용 계층의 SMTP, FTP, DNS 등이 TCP를 거쳐 네트워크 계층(IP)으로 내려간다. SCTP(Stream Control Transmission Protocol)는 TCP의 신뢰적 전송과 UDP의 메시지 경계 보존을 합친 프로토콜이나 이 강의 범위 밖이다.

---

## 다중화와 역다중화

전송 계층은 한 호스트에서 여러 프로세스가 동시에 통신할 수 있도록 **다중화(multiplexing)**와 **역다중화(demultiplexing)**를 수행한다.

![Multiplexing / Demultiplexing 동작](/assets/images/posts/tcp-introduction/tcp-introduction-2.png)

- **다중화 (송신 측)**: 여러 소켓에서 온 데이터를 하나의 세그먼트 스트림으로 합쳐 IP로 내려 보낸다. 전송 헤더를 추가한다.
- **역다중화 (수신 측)**: 수신한 세그먼트를 헤더 정보를 기반으로 올바른 소켓으로 올려 보낸다.

### UDP demux vs TCP demux

두 프로토콜은 역다중화 방식이 다르다.

**UDP — connectionless demultiplexing:**
- 소켓을 식별하는 것: **목적지 포트 번호(dest port #) 하나**
- 출발지 IP/포트가 달라도 목적지 포트가 같으면 같은 소켓으로 올라간다
- "누가 보냈는지 상관없이 목적지 포트만 같으면 같은 소켓으로 전달"

**TCP — connection-oriented demultiplexing:**
- 소켓을 식별하는 것: **4-tuple 전부** (src IP, src port, dst IP, dst port)
- TCP에서 **connection** = 소켓 + 시퀀스 번호 + 윈도우 크기 등의 상태 정보 조합 (RFC 793)
- 같은 목적지 포트(예: 80)로 오더라도 출발지가 다르면 **다른 소켓**으로 분리된다

![TCP Connection-oriented demultiplexing 예제](/assets/images/posts/tcp-introduction/tcp-introduction-3.png)

위 그림에서 세 세그먼트는 모두 서버(IP B, port 80)를 목적지로 하지만, TCP는 4-tuple을 전부 확인하여 P4, P5, P6 **각각 다른 소켓**으로 분리한다. 하나의 서버가 수많은 동시 연결을 처리할 수 있는 이유다. TCP demux는 src 정보까지 확인하는데, 이것이 connection-oriented와 직결된다.

---

## TCP 서비스: 세 가지 정의

TCP는 **connection-oriented**, **reliable**, **byte stream** 서비스를 제공한다. 시험 출제 포인트.

### 1. Connection-oriented (연결 지향)

데이터를 교환하기 전에 반드시 **연결을 먼저 맺어야** 한다. TCP 연결은 항상 정확히 2개의 엔드포인트가 존재한다 — 1:1 통신만 가능하며, 브로드캐스트/멀티캐스트는 불가능하다.

연결은 두 엔드포인트 간에 **상태(state)를 동기화**하는 것이다. 이를 위해 **3-way handshake**를 수행한다.

![TCP 송수신 버퍼 구조](/assets/images/posts/tcp-introduction/tcp-introduction-4.png)

각 TCP 종점은 **연결마다** 독립적인 전송 버퍼(send buffer)와 수신 버퍼(receive buffer)를 유지하고, 각 방향마다 독립적인 시퀀스 번호를 관리한다.

connection-oriented라는 말의 핵심: 연결을 먼저 맺기 때문에 src 정보까지 확인하는 것이고, 연결 식별이 4-tuple 전부인 이유가 여기 있다.

### 2. Reliable (신뢰적 전송)

보낸 데이터가 **반드시 도착함을 보장**한다. 유실되면 재전송한다. 손상되면 폐기 후 재요청한다.

신뢰적 전송을 구현하는 수단:
- **Packetization**: 바이트 스트림을 IP가 운반할 수 있는 세그먼트 단위로 분할. MSS(Maximum Segment Size)를 넘지 않는 선에서 유동적
- **시퀀스 번호(Sequence Number)**: 세그먼트 내 첫 번째 바이트의 바이트 오프셋. 패킷 번호가 아니다
- **체크섬(Checksum)**: 데이터 손상 감지
- **ARQ(Automatic Repeat reQuest)**: Go-Back-N 기반 재전송 메커니즘

### 3. Byte Stream (바이트 스트림)

TCP는 앱이 넘겨준 데이터를 **바이트 덩어리로 취급**한다. 안에 뭐가 들어있는지 전혀 신경 쓰지 않는다.

핵심: **메시지 경계(message boundary)를 보존하지 않는다**. UDP는 경계를 보존하지만, TCP는 보존하지 않는다. 앱이 100바이트를 한 번에 쓰든 1바이트씩 100번 쓰든, 수신 측에서는 구분할 수 없다. 각 엔드포인트가 읽기/쓰기 크기를 독립적으로 결정한다.

**Full-duplex** 서비스: 8비트 바이트 스트림이 양방향으로 **독립적으로** 흐른다.

![Byte Stream + Full-duplex 구조](/assets/images/posts/tcp-introduction/tcp-introduction-6.png)

통신 방향성 비교:
- **Simplex**: 단방향 (송신 또는 수신만)
- **Half-duplex**: 양방향이지만 동시 불가 (무전기)
- **Full-duplex**: 양방향 동시 가능 (전화, TCP)

TCP는 Full-duplex이므로 각 방향에 독립적인 버퍼와 시퀀스 번호를 유지한다.

---

## TCP 핵심 기능

### 시퀀스 번호 (Sequence Number)

시퀀스 번호는 **패킷 번호가 아니라 바이트 오프셋**이다. 세그먼트 내 첫 번째 바이트가 전체 데이터 스트림에서 몇 번째 바이트인지를 나타낸다.

**예시**: 5,000바이트 파일을 1,000바이트씩 5개 세그먼트로 전송. 첫 바이트 번호가 10,001이면:

| 세그먼트 | 시퀀스 번호 | 범위 |
|---|---|---|
| 1 | 10,001 | 10,001 ~ 11,000 |
| 2 | 11,001 | 11,001 ~ 12,000 |
| 3 | 12,001 | 12,001 ~ 13,000 |
| 4 | 13,001 | 13,001 ~ 14,000 |
| 5 | 14,001 | 14,001 ~ 15,000 |

**ISN (Initial Sequence Number)**: 연결 설립 시 딱 한 번 **랜덤으로 생성**한다. 보안상 예측 불가능하게 만들기 위해서다. SYN 세그먼트에 ISN을 담아 보내며, **SYN 비트는 시퀀스 번호 1개를 소비**한다. 따라서 첫 데이터 세그먼트의 시퀀스 번호는 $ISN + 1$이다.

시퀀스 번호는 **32비트 unsigned** 값이다. $2^{32} = 4\text{GB}$를 표현할 수 있으며, 최댓값을 넘으면 0으로 돌아온다 — 이를 **wrap around**라 한다.

### ACK: 확인 응답

TCP가 상대방으로부터 데이터를 수신하면 **ACK 세그먼트**를 돌려보낸다. 이 ACK는 데이터 세그먼트에 실어 함께 보낼 수 있는데, 이를 **피기배킹(piggybacking)**이라 한다.

비효율적 방식: A→[data]→B, A←[ACK]←B (각각 별도 세그먼트)

Piggybacking: A→[data]→B, A←[data + ACK]←B (ACK를 데이터에 실어 보냄)

**Cumulative ACK (누적 ACK)** — TCP 기본:

ACK 번호는 "**다음에 받아야 할 바이트 번호**"다. ACK #701은 700번까지 전부 받았고 701번을 기다린다는 뜻이다.

$$\text{ACK number} = \text{마지막으로 받은 바이트 번호} + 1$$

ACK가 즉시 전송되지 않고 약간(fraction of a second) 지연될 수 있다. ACK가 유실되더라도 이후 ACK로 커버 가능해 **ACK 유실에 대한 내성**이 있다.

**Selective ACK (SACK)** — TCP 옵션:

수신 측이 out-of-order로 받은 세그먼트를 **송신 측에 알려줄 수 있다**. "이 번호의 세그먼트는 받았어"라고 명시적으로 알린다. TCP 기본이 아니라 옵션이다.

![Cumulative ACK vs Selective ACK 비교](/assets/images/posts/tcp-introduction/tcp-introduction-7.png)

Selective ACK(왼쪽)는 받은 세그먼트 번호 자체를 응답하고, Cumulative ACK(오른쪽)는 "다음에 받아야 할 번호"를 응답한다.

### 재전송 (Retransmission)

유실을 감지하는 방법은 두 가지다.

1. **타임아웃 (Timeout)**: 세그먼트를 보내면 타이머를 시작한다. ACK가 RTO(Retransmission Timeout) 시간 안에 오지 않으면 재전송한다.
2. **중복 ACK (Duplicate ACK)**: 같은 ACK 번호를 여러 번 받으면 해당 세그먼트가 유실됐다고 판단한다.

**타이머 관리**: TCP는 세그먼트마다 타이머를 따로 두지 않는다. **ACK를 못 받은 세그먼트 중 첫 번째 것**에만 타이머를 유지한다. 자원 낭비를 줄이기 위해서다.

**Out-of-order 처리**: 순서가 바뀐 세그먼트가 도착하면 버퍼에 저장해두고 빠진 부분이 채워지면 앱으로 전달한다. 중복 세그먼트는 시퀀스 번호로 식별하여 discard한다.

![Retransmission Timer 동작](/assets/images/posts/tcp-introduction/tcp-introduction-8.png)

Seq: 701~800이 유실되면, 서버는 ACK 701을 계속 돌려보낸다 (중복 ACK). 타임아웃 후 클라이언트는 701~800을 재전송하고, 서버는 ACK 901을 보낸다.

**재전송 방식 비교:**

| 방식 | 동작 | TCP 적용 |
|---|---|---|
| **Go-Back-N** | 유실 지점부터 끝까지 전부 재전송 | TCP 기본 동작 |
| **Selective Repeat** | 유실된 것만 재전송 | SACK 옵션으로 구현 |

현대 TCP = Go-Back-N 기반 + SACK 옵션으로 Selective Repeat처럼 동작한다.

**Fast Retransmit**: 중복 ACK가 **3번** 오면 타임아웃을 기다리지 않고 **즉시 재전송**한다. 중복 ACK는 유실 감지 신호인 동시에 **혼잡 제어 보조 신호**이기도 하다.

---

## TCP 헤더 구조

TCP 세그먼트는 **IP 데이터그램** 안에 캡슐화된다.
- IP 헤더: 최소 20바이트 (IPv4, 옵션 없을 때)
- TCP 헤더: 최소 20바이트, 옵션 포함 시 최대 60바이트

```
 ←──────────────── IP Datagram ──────────────────────►
 [   IP Header   ][         TCP Segment               ]
 [   20 bytes    ][ TCP Header (20~60B) ][ TCP Data   ]
```

![TCP 헤더 구조](/assets/images/posts/tcp-introduction/tcp-introduction-9.png)

### 주요 필드 설명

**포트 번호 (Source/Destination Port Number)**
- 각 16비트
- IP 주소 + 포트 번호 조합 = endpoint (TCP 문헌에서 socket이라고도 부름)
- 두 소켓 쌍(4-tuple)이 TCP 연결을 고유하게 식별한다

**시퀀스 번호 (Sequence Number)**
- 32비트 — $2^{32} = 4\text{GB}$ 표현 가능
- 세그먼트 내 첫 번째 데이터 바이트의 바이트 오프셋

**확인 번호 (Acknowledgment Number)**
- 32비트
- "다음에 받아야 할 바이트 번호" (Cumulative)
- ACK 비트가 1일 때만 유효

**헤더 길이 (Header Length / HLEN)**
- 4비트 (0~15 표현 가능)
- **단위는 32비트 워드(4바이트)** → 실제 바이트 수 = 필드값 × 4
- 최솟값: $5 \times 4 = 20$ 바이트, 최댓값: $15 \times 4 = 60$ 바이트
- Options 필드가 가변 길이이므로 헤더 길이 필드가 필요하다

**플래그 비트 (Flag Fields)** — 8비트:

| 플래그 | 이름 | 의미 |
|---|---|---|
| **CWR** | Congestion Window Reduced | 송신 측이 전송 속도를 줄였다 |
| **ECE** | ECN Echo | 혼잡 알림을 수신했다 |
| **URG** | Urgent | Urgent Pointer 필드가 유효 (거의 미사용) |
| **ACK** | Acknowledgment | ACK Number 필드가 유효. 연결 수립 후 항상 1 |
| **PSH** | Push | 즉시 앱으로 전달 요청 (실제 구현은 불안정) |
| **RST** | Reset | 연결 강제 종료 (오류 발생 시) |
| **SYN** | Synchronize | 시퀀스 번호 동기화 → 연결 설립 |
| **FIN** | Finish | 더 이상 보낼 데이터 없음 → 연결 종료 |

**수신 윈도우 크기 (Window Size)**
- 16비트 — 최대 $2^{16} - 1 = 65535$ bytes ≈ 64KB
- **흐름 제어(Flow Control)**의 핵심 필드: 수신 측이 ACK를 보낼 때 "현재 받을 수 있는 바이트 수"를 알려준다
- 수신 측이 명시적으로 알려주는 것 = **흐름 제어**, 송신 측이 네트워크 상태를 유추하는 것 = **혼잡 제어**
- 현대 네트워크에서 64KB는 너무 작다 → **Window Scale 옵션**으로 확장 가능
- 실제 유효 윈도우 크기 = $\min(rwnd,\; cwnd)$ (rwnd: 수신 윈도우, cwnd: 혼잡 윈도우)

**체크섬 (Checksum)**
- 16비트
- 계산 범위: **TCP 헤더 + TCP 데이터(payload) + pseudo-header(IP 정보 포함)**
- 계산 방법: 16비트씩 나눠서 모두 더한 합의 **1의 보수(one's complement)**
- 검증: $\text{Sum} + \text{Checksum} = \underbrace{1111\;1111\;1111\;1111}_{\text{16개의 1}}$ 이면 정상
- 검증 실패 시 세그먼트 버림

### TCP 체크섬과 Pseudo-header

TCP 체크섬은 TCP 세그먼트만이 아니라 **IP 헤더의 일부 정보**도 포함하여 계산한다. 이 IP 정보를 담은 가상의 헤더를 **pseudo-header**라 한다.

![TCP Pseudo-header 구조](/assets/images/posts/tcp-introduction/tcp-introduction-10.png)

TCP 체크섬 계산에 포함되는 세 가지:
1. **TCP 헤더**
2. **TCP 데이터(payload)**
3. **pseudo-header** (32비트 src IP, 32비트 dst IP, 8비트 프로토콜 번호=6, 16비트 TCP 전체 길이)

pseudo-header 자체는 실제로 전송되지 않는다. 체크섬 계산 시에만 사용하는 가상의 헤더다.

---

## 혼잡 제어가 TCP 서비스 정의에 없는 이유

TCP의 공식 서비스 정의(RFC793)에는 **connection-oriented**, **reliable**, **byte stream** 세 가지만 있다. 혼잡 제어(congestion control)는 포함되지 않는다.

이유:

> "혼잡 제어는 특정 애플리케이션에 제공하는 서비스라기보다, **인터넷 전체를 위한 공익 서비스**다." — Kurose-Ross

혼잡 제어는 1981년 RFC793에 없었으며 이후 구현에서 추가됐다. 흐름 제어가 수신 측 버퍼를 보호하는 것이라면, 혼잡 제어는 **네트워크 전체를 보호**하는 것이다.

---

## TCP 핵심 요약

| 항목 | 내용 |
|---|---|
| **서비스 정의** | connection-oriented, reliable, byte stream |
| **통신 방향** | Full-duplex (양방향 독립 전송) |
| **시퀀스 번호** | 패킷 번호가 아닌 바이트 오프셋, 32비트 ($2^{32} = 4\text{GB}$) |
| **ISN** | 연결 설립 시 랜덤 생성, SYN 비트가 1개 소비 → 첫 데이터는 $ISN+1$ |
| **ACK 방식** | Cumulative ACK 기본, SACK 옵션 |
| **재전송 트리거** | 타임아웃 또는 중복 ACK × 3 (Fast Retransmit) |
| **Go-Back-N vs SACK** | 기본은 Go-Back-N, SACK 옵션으로 Selective Repeat처럼 동작 |
| **헤더 크기** | 최소 20바이트, 최대 60바이트 |
| **HLEN 필드** | 4비트, 필드값 × 4 = 실제 바이트 수 |
| **Window Size** | 16비트, 최대 64KB (Window Scale 옵션으로 확장) |
| **체크섬 범위** | TCP 헤더 + 데이터 + pseudo-header |
| **TCP vs UDP demux** | UDP: dest port만, TCP: 4-tuple 전부 |
| **메시지 경계** | TCP는 보존 안 함, UDP는 보존 |
