---
title: "Networking Technologies — 네트워킹 기술"
date: 2026-04-01
categories: [Computer-Network]
tags: [computer-network, multiplexing, packet-switching, delay, ethernet, WiFi, CSMA, switch, router]
description: "다중화, 패킷 교환, 지연 분석부터 이더넷, 무선 LAN, 접속망, 연결 장치까지 핵심 네트워킹 기술을 정리한다."
---

네트워크를 이해하려면 데이터가 실제로 어떻게 전달되는지를 알아야 한다. 데이터 통신의 기본 개념부터 이더넷, 무선 LAN, 그리고 네트워크를 구성하는 장비까지 — 네트워킹 기술의 전체 그림을 잡는다.

## 데이터 통신의 핵심 개념

### 다중화와 역다중화 (Multiplexing / Demultiplexing)

**다중화(Multiplexing)**는 비용 효율적인 자원 공유 기술이다. 여러 개의 신호(데이터 스트림)를 하나의 전송 매체(링크)로 합쳐서 보내는 기술이며, 수신 측에서 이를 다시 분리하는 것이 **역다중화(Demultiplexing)**이다.

다중화를 구현하는 대표적인 방법 두 가지가 있다.

![TDM과 FDM 비교](/assets/images/posts/networking-technologies/networking-technologies-1.png)

- **동기식 시분할 다중화(STDM, Synchronous Time-Division Multiplexing)**: 시간 슬롯을 나누어 할당한다. 각 사용자에게 고정된 시간 슬롯이 배정되며, 사용자가 데이터를 보내지 않으면 해당 슬롯이 낭비된다.
- **주파수 분할 다중화(FDM, Frequency-Division Multiplexing)**: 주파수 대역을 나누어 할당한다. 각 사용자가 서로 다른 주파수 대역을 사용하며, 역시 미사용 시 대역이 낭비된다.

다중화/역다중화는 특정 계층에만 국한되지 않는다. 전송 계층에서 TCP가 포트 번호로 프로세스를 구별하는 것도 다중화의 일종이다.

### 회선 교환 vs 패킷 교환

네트워크에서 데이터를 전달하는 방식은 크게 두 가지이다.

![패킷 교환과 회선 교환 비교](/assets/images/posts/networking-technologies/networking-technologies-2.png)

| 구분 | 패킷 교환 (Packet Switching) | 회선 교환 (Circuit Switching) |
|---|---|---|
| **경로** | 전용 경로 없음. 각 패킷이 독립적으로 라우팅 | 통신 시작 전 전용 경로를 미리 확보 |
| **자원** | 공유. 링크 용량 전체를 사용 가능 | 독점(dedicated). 공유 없음 |
| **성능** | 보장 없음 (best-effort) | 보장됨 (guaranteed) |
| **예시** | 인터넷 | 전화망 |

패킷 교환은 전용 경로 없이 **각 라우터에서 패킷마다 다음 홉을 결정**하는 방식이다. 회선 교환은 통신이 끝날 때까지 경로를 독점하는 **중앙 제어** 방식이다.

### 인터넷에서의 패킷 교환

인터넷에서 패킷은 각 호스트의 IP에서 생성되어 **게이트웨이(gateway)**라 불리는 라우터로 전송된다. 라우터는 **store-and-forward** 방식의 패킷 교환을 수행한다.

- **큐잉(Queueing)**: 패킷 도착이 버스트하므로, 라우터는 각 출력 링크마다 **버퍼(queue)**를 준비한다. 도착한 패킷은 기본적으로 **FIFO(First-In First-Out)** 순서로 처리된다.
- **패킷 손실(Packet Loss)**: 출력 링크로의 패킷 도착률이 링크의 데이터 전송률을 초과하면 패킷이 큐에 대기한다. 큐가 가득 차면 패킷이 **드롭(drop)**된다.

### 패킷 지연의 4가지 요소

![패킷 지연의 4가지 요소](/assets/images/posts/networking-technologies/networking-technologies-3.png)

패킷이 한 노드를 통과할 때 발생하는 **노달 지연(Nodal Delay)**은 네 가지 성분의 합이다.

$$d_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop}$$

| 지연 요소 | 설명 | 수식 |
|---|---|---|
| **처리 지연** ($d_{proc}$) | 비트 오류 검사, 출력 링크 결정. 일반적으로 마이크로초 수준 | — |
| **큐잉 지연** ($d_{queue}$) | 출력 링크 대기 시간. 라우터 혼잡도에 따라 달라진다 | — |
| **전송 지연** ($d_{trans}$) | 패킷의 모든 비트를 링크에 올려놓는 시간 | $d_{trans} = L / R$ |
| **전파 지연** ($d_{prop}$) | 비트가 링크를 따라 물리적으로 전파되는 시간 | $d_{prop} = d / s$ |

여기서 $L$은 패킷 길이(bits), $R$은 링크 대역폭(bps), $d$는 물리적 링크 길이, $s$는 전파 속도(유선에서 약 $2 \times 10^8$ m/sec)이다.

**전송 지연과 전파 지연을 혼동하지 말 것.** 전송 지연은 패킷을 링크에 "밀어 넣는" 시간이고, 전파 지연은 비트가 링크를 "달리는" 시간이다.

### 처리량 (Throughput)

**처리량(Throughput)**은 송신자로부터 수신자에게 비트가 전달되는 속도(bits/time unit)이다.

- **순간 처리량(Instantaneous throughput)**: 특정 시점의 전송 속도
- **평균 처리량(Average throughput)**: 일정 기간 동안의 평균 전송 속도

서버에서 클라이언트까지 경로에 $R_s$ bits/sec 링크와 $R_c$ bits/sec 링크가 있을 때, 종단간 처리량은 $\min(R_s, R_c)$이다. 처리량을 제한하는 가장 느린 링크를 **병목 링크(bottleneck link)**라 한다.

### 대역폭 (Bandwidth)

엄밀히 말하면 **대역폭(bandwidth)**은 전송 매체의 주파수 범위(Hz)를 의미한다. 하지만 컴퓨터 네트워킹에서는 관례적으로 **최대 데이터 전송 속도**(bps)를 뜻한다.

- **총 대역폭(Aggregate bandwidth)**: 네트워크가 제공하는 전체 데이터 대역폭
- **유효 대역폭(Effective bandwidth)** = **처리량(Throughput)**: 애플리케이션에 실제 전달되는 대역폭

### 왕복 시간 (RTT)

**왕복 시간(RTT, Round Trip Time)**은 네트워크 요청이 출발지에서 목적지까지 갔다가 다시 돌아오는 데 걸리는 시간이다. 4가지 패킷 지연 요소 때문에 측정 방법(데이터 크기)이나 네트워크 환경(라우터 혼잡 여부)에 따라 RTT가 달라진다.

전송 완료 시간(Transfer Completion Time) 추정에서:
- **작은 데이터 전송**: RTT가 지배적이다 (예: 1 byte 파일)
- **대용량 데이터 전송**: 처리량이 지배적이다 (예: 1 GB 파일)

### 지연×대역폭 곱 (BDP)

**BDP(Bandwidth-Delay Product)**는 네트워크를 파이프로 볼 때, **파이프 안에 들어있는 데이터의 양**(bits or bytes)이다.

$$BDP = bandwidth \times delay$$

예를 들어, 100 Mbps 링크에서 지연이 10 ms이면 BDP = 1 Mbit이다. 이는 첫 번째 비트가 목적지에 도착하기 전에 송신자가 보낸 데이터의 양을 의미한다. 네트워크를 완전히 활용하려면 전송 중인 바이트가 BDP 이상이어야 한다.

## 이더넷 (Ethernet)

**이더넷(Ethernet)**은 지배적인 유선 LAN 기술이다. 1980년 DEC, Intel, Xerox(DIX)가 최초로 표준을 발표하고, 1982년 Ethernet II로 개정했다. 단순하고 저렴하며, 10 Mbps에서 400 Gbps까지 속도 경쟁을 이어오고 있다.

### 물리적 토폴로지

- **버스(Bus)**: 1990년대 중반까지 주류. 동축 케이블을 공유하며, 모든 노드가 같은 **충돌 도메인(collision domain)**에 속한다.
- **스위치드(Switched)**: 현재 주류. 중앙에 L2 스위치가 위치하며, 각 연결(spoke)이 독립적인 이더넷 프로토콜을 실행한다. 노드 간 충돌이 발생하지 않는다.

### CSMA/CD

전통적인 이더넷은 **CSMA/CD(Carrier Sense Multiple Access with Collision Detection)** 매체 접근 메커니즘을 사용한다.

- **CSMA(Carrier Sense)**: "말하기 전에 듣는다(listen before talk)." 하지만 전파 지연 때문에 충돌이 여전히 발생할 수 있다.
- **CD(Collision Detection)**: 충돌을 감지하면 즉시 전송을 중단하고 **재밍 신호(jamming signal)**를 보내 다른 스테이션에 알린다. 충돌의 영향을 최소화한다.

### 이더넷 프레임 구조

![이더넷 프레임 구조](/assets/images/posts/networking-technologies/networking-technologies-4.png)

| 필드 | 크기 | 설명 |
|---|---|---|
| **Preamble** | 8 Bytes | 수신자 클럭 동기화. 7바이트의 `10101010` + 1바이트의 `10101011` (SFD) |
| **Dest. Address** | 6 Bytes | 목적지 MAC 주소 |
| **Source Address** | 6 Bytes | 출발지 MAC 주소 |
| **Type** | 2 Bytes | 상위 계층 프로토콜 지시 (보통 IP, 0x0800). 역다중화에 사용 |
| **Data (Payload)** | 46~1500 Bytes | 실제 데이터 (IP 데이터그램 등) |
| **CRC** | 4 Bytes | 순환 중복 검사. 오류 감지 시 프레임 폐기 |

### IEEE 802와 이더넷

1985년 IEEE Computer Society는 LAN/MAN 물리 계층과 데이터 링크 계층의 기능을 명세하는 **Project 802**를 시작했다. IEEE는 OSI Layer 2를 **LLC(Logical Link Control)**와 **MAC(Media Access Control)** 두 하위 계층으로 세분화했다.

- **802.3**: 이더넷
- **802.11**: 무선 LAN (WiFi)
- **802.15**: WPAN (Bluetooth 등)

대부분의 이더넷 인터페이스는 DIX 이더넷 캡슐화와 IEEE 802.3 캡슐화를 모두 지원하지만, 효율성 때문에 **이더넷 캡슐화**가 널리 사용된다.

## 무선 LAN (IEEE 802.11)

### IEEE 802.11 표준 목록

| 표준 | 연도 | 최대 속도 | 실내 범위 | 주파수 |
|---|---|---|---|---|
| 802.11b | 1999 | 11 Mbps | 35 m | 2.4 GHz |
| 802.11g | 2003 | 54 Mbps | 38 m | 2.4 GHz |
| 802.11n (Wi-Fi 4) | 2009 | 600 Mbps | 70 m | 2.4, 5 GHz |
| 802.11ac (Wi-Fi 5) | 2013 | 6.933 Gbps | 35 m | 5 GHz |
| 802.11ax (Wi-Fi 6) | 2021 | 9.608 Gbps | 30 m | 2.4, 5 GHz |
| 802.11ax (Wi-Fi 6E) | 2021 | 9.608 Gbps | 30 m | 6 GHz |
| 802.11be (Wi-Fi 7) | 2024 (est.) | 46.1 Gbps | 30 m | 2.4, 5, 6 GHz |

### BSS와 ESS

대부분의 무선 LAN은 **인프라스트럭처 모드(infrastructure mode)**를 사용한다.

- **BSS(Basic Service Set)**: 무선 호스트(**STA**, Station)와 **AP(Access Point, 기지국)**로 구성된다. STA는 AP를 통해 통신한다.
- **ESS(Extended Service Set)**: 같은 SSID를 가진 여러 BSS가 **분배 시스템(DS, Distribution System)**으로 연결된 것이다. 예를 들어 INHA-WLAN2가 ESS이다.

### Association 과정

호스트가 네트워크에 연결하려면 AP와 **결합(association)**해야 한다.

1. 채널을 스캔하여 **비컨 프레임(beacon frame)**의 SSID와 MAC 주소를 수신
2. 결합할 AP를 선택
3. 인증(authentication) 수행
4. **DHCP**를 실행하여 AP 서브넷의 IP 주소를 획득

스캐닝 방식:
- **수동 스캐닝(Passive Scanning)**: AP가 주기적으로 보내는 비컨 프레임을 기다린다
- **능동 스캐닝(Active Scanning)**: 호스트가 먼저 프로브 요청(probe request)을 보내 응답을 받는다

### 무선 LAN의 충돌 감지 문제

유선 이더넷과 달리 무선에서는 **충돌 감지(Collision Detection)가 어렵다**. 자신의 강한 송신 신호 때문에 약한 수신 신호를 감지하기 힘들고, **페이딩(fading)**이나 **숨겨진 터미널 문제(hidden terminal problem)** 때문이다.

### CSMA/CA

IEEE 802.11은 충돌을 감지하는 대신 **회피(avoidance)**하는 **CSMA/CA(Collision Avoidance)**를 사용한다.

![CSMA/CA RTS/CTS 메커니즘](/assets/images/posts/networking-technologies/networking-technologies-5.png)

1. 송신자 A가 **RTS(Ready To Send)**를 보낸다
2. RTS 충돌이 발생하면 (A와 B가 동시에 RTS 전송), 재시도한다
3. AP가 **CTS(Clear To Send)**를 A에게 보낸다. 이 CTS는 B에게도 전달되어 B는 **전송을 미룬다(defer)**
4. A가 DATA를 전송한다
5. AP가 **ACK**를 보낸다

RTS/CTS 교환을 통해 데이터 전송 전에 채널을 **예약**하는 구조이다. 충돌이 발생하더라도 짧은 RTS 프레임에서만 발생하므로 피해가 작다.

### 전송률 적응 (Rate Adaptation)

기지국과 모바일 기기는 SNR(Signal-to-Noise Ratio) 변화에 따라 **전송률을 동적으로 조절**한다.

- 기기가 AP에서 멀어지면 SNR이 감소하고 BER(Bit Error Rate)이 증가한다
- BER이 너무 높아지면, 낮은 전송률이지만 더 낮은 BER을 가진 변조 방식으로 전환한다
- 예: QAM256(8 Mbps) → QAM16(4 Mbps) → BPSK(1 Mbps)

## 광역 네트워크 — 접속망 (Access Networks)

### 케이블 기반 접속 (Cable)

케이블 TV 인프라를 활용한 인터넷 접속 방식이다. **FDM**으로 서로 다른 주파수 대역에 비디오 채널과 데이터 채널을 할당한다.

- **HFC(Hybrid Fiber Coax)**: 광섬유와 동축 케이블의 하이브리드 구조
- 비대칭: 다운스트림 40 Mbps ~ 1.2 Gbps, 업스트림 30~100 Mbps
- 가정들이 cable headend까지 **접속망을 공유**한다
- **CMTS(Cable Modem Termination System)**가 cable headend에서 케이블 모뎀 신호를 처리

### DSL (Digital Subscriber Line)

기존 **전화선**을 활용하여 central office의 **DSLAM(DSL Access Multiplexer)**에 연결한다. 음성과 데이터가 서로 다른 주파수로 전송되며, **전용 회선(dedicated line)**이므로 케이블과 달리 공유하지 않는다.

- 다운스트림: 24~52 Mbps
- 업스트림: 3.5~16 Mbps

### 셀룰러 네트워크 (Cellular Networks)

광역 모바일 인터넷을 위한 해결책이다. SIM 카드로 사용자를 식별한다.

4G(LTE) 아키텍처의 주요 구성 요소:
- **UE(User Equipment)**: 모바일 기기
- **eNode-B**: 기지국
- **MME(Mobility Management Entity)**: 이동성 관리
- **S-GW(Serving Gateway)** → **P-GW(PDN Gateway)** → 인터넷
- **HSS(Home Subscriber Service)**: 가입자 정보

## 연결 장치 (Connecting Devices)

네트워크를 구성하려면 호스트와 네트워크를 연결하는 장치가 필요하다. 이들은 인터넷 모델의 서로 다른 계층에서 동작한다.

![연결 장치의 동작 계층](/assets/images/posts/networking-technologies/networking-technologies-6.png)

### 리피터와 허브 (Repeater / Hub)

**리피터(Repeater)**는 **물리 계층에서만 동작**하는 2포트 장치이다. 한쪽 포트에서 받은 신호를 증폭하여 다른 포트로 전달한다. 네트워크를 확장하는 간단하고 저렴한 방법이지만, **필터링 기능이 없다**.

**허브(Hub, Dummy Hub)**는 멀티포트 리피터이다. 한 포트에서 받은 신호를 **모든 다른 포트**로 전달한다. 여러 네트워크 세그먼트를 하나의 세그먼트로 만들 수 있지만, 역시 필터링이 없다. Gigabit Ethernet 이후로는 허브 대신 스위치가 대세이다.

### 브리지와 스위치 (Bridge / Switch)

**브리지(Bridge)**는 1983년 DEC의 Mark Kempf가 발명했다. **데이터 링크 계층(L2)**에서 동작하며, 허브와 달리 **MAC 목적지 주소 학습**을 통한 **필터링 기능**을 갖는다. 호스트는 브리지의 존재를 모르는 **투명(transparent)** 설계이다.

**MAC 주소 학습 과정**: 스위치에 4개의 포트(1~4)와 호스트 A, B, C, D가 연결되어 있다고 하자.

1. **초기 상태**: 테이블 비어 있음
2. **A → D 프레임 전송**: A의 MAC을 포트 1에 학습. D의 위치 모르므로 **플러딩(flooding)** — 모든 포트로 전달
3. **D → B 프레임 전송**: D의 MAC을 포트 4에 학습. B의 위치 모르므로 플러딩
4. **B → A 프레임 전송**: B의 MAC을 포트 2에 학습. A는 포트 1에 있으므로 **포트 1로만 전달**
5. **C → D 프레임 전송**: C의 MAC을 포트 3에 학습. D는 포트 4에 있으므로 **포트 4로만 전달**

점차 테이블이 완성되면서 불필요한 플러딩이 줄어든다.

**스위치(Switch)**는 멀티포트 브리지의 현대적 명칭이다. 1990년 Kalpana가 최초의 멀티포트 이더넷 스위치를 출시하면서 'switch'라는 용어가 보편화되었다. IEEE 802.1D/802.1Q 표준에서는 여전히 'bridge'라는 용어를 사용한다. 실질적으로 이더넷 브리지와 이더넷 스위치는 **같은 장치**이다.

스위치의 종류:
- **비관리형(Unmanaged)**: CLI/웹 인터페이스 없음. 저가 모델
- **관리형(Managed)**: 설정 변경 가능. 기업용
- **투명 브리지(Transparent bridge)**: IEEE 802.1D 명세에 따라 포워딩, 자기학습, **루프 방지** 기능 필수

### 스패닝 트리 프로토콜 (STP)

브리지/스위치 네트워크에서 중복 경로가 존재하면 **루프 문제**가 발생한다. A가 D에게 프레임을 보내면, 두 스위치가 모두 포워딩하여 프레임이 무한히 순환한다.

**STP(Spanning Tree Protocol)**는 1984년 DEC의 Radia Perlman이 제안하고 IEEE 802.1D로 표준화된 프로토콜이다. 네트워크에서 루트 브리지(Root bridge)를 선출하고, 루프를 형성하는 일부 포트를 **Blocking** 상태로 전환하여 **트리 토폴로지**를 만든다. 다만 저가 스위치 중에는 STP를 지원하지 않는 것도 있어, 실무에서 루프 문제가 간혹 발생한다.

### 라우터 (Router)

**라우터(Router)**는 물리, 데이터 링크, **네트워크 계층(L3)**에서 동작한다.

- 물리 계층: 수신 신호를 재생
- 데이터 링크 계층: 프레임의 물리 주소(MAC) 확인
- 네트워크 계층: IP 주소를 확인하여 라우팅 테이블 기반으로 포워딩

핵심 차이: **브리지는 충돌 도메인(collision domain)을 분리**하고, **라우터는 브로드캐스트 도메인(broadcast domain)을 분리**한다.

라우터는 각 인터페이스마다 물리 주소(MAC)와 논리 주소(IP)를 모두 가지며, 패킷을 포워딩할 때 물리 주소(source, destination 모두)를 변경한다.

## 접속망 정리

| 접속망 유형 | 구성 요소 | 특징 |
|---|---|---|
| **가정(Home)** | WiFi AP + 라우터 + 케이블/DSL 모뎀 | 종종 하나의 장치로 통합 |
| **무선(Wireless)** | WLAN (WiFi, ~100ft) / 셀룰러 (4G/5G, ~10km) | AP 또는 기지국 경유 |
| **기업(Enterprise)** | 이더넷 스위치 + WiFi AP + 라우터 | 유/무선 혼합, 100 Mbps~10 Gbps |
| **데이터센터(Data Center)** | 고대역폭 링크 (10s~100s Gbps) | 수백~수천 대 서버 연결 |
