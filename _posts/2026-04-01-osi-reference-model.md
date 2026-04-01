---
title: "OSI Reference Model — OSI 참조 모델과 TCP/IP 프로토콜"
date: 2026-04-01
categories: [Computer-Network]
tags: [computer-network, OSI, TCP/IP, protocol, layering, encapsulation, addressing]
description: "프로토콜 계층화의 동기부터 OSI 7계층, TCP/IP 5계층, 캡슐화, 주소 체계까지 네트워크 참조 모델의 핵심을 정리한다."
---

네트워크 통신은 너무 복잡해서 하나의 프로그램에 모든 기능을 구현하기 어렵다. 이 문제를 해결하기 위해 통신 기능을 계층별로 나누어 구현하는 방식이 등장했다. 이것이 **프로토콜 계층화(Protocol Layering)**이다.

## 프로토콜 계층화의 동기

두 사람이 가까이 있으면 말(Speaking)로 직접 소통하면 된다 — 단일 계층(Layer 1)으로 충분하다. 하지만 한 사람은 스페인어만 쓰고 다른 사람은 시각장애인이라면? 번역기(Translator)와 점자 변환기(Braille Maker)가 필요하고, 물리적 거리가 멀면 우체국(Post Office)도 필요하다. 각각의 제약 조건마다 새로운 계층이 추가되는 셈이다.

네트워크도 마찬가지다. 데이터 통신과 네트워킹이 너무 복잡하므로 전체 프로세스를 관리 가능한 단위로 분리하는 것이 합리적이다. 여러 모듈화 방법 중에서도 **계층화(Layering)**가 적합한 이유는 두 가지다:

1. 통신 기능의 **순차적(sequential) 특성**에 잘 맞는다
2. 하위 계층을 **블랙박스(black box)**로 취급하여 구현 세부사항을 숨길 수 있어 **단순하다**

현재 사용되는 네트워크 아키텍처들은 이러한 수직적 계층 분해를 반영한 **프로토콜 스택(protocol stack)** 또는 **프로토콜 스위트(protocol suite)** 구조를 따른다.

## 프로토콜 계층화의 기본 용어

핵심 정의부터 정리한다.

| 용어 | 정의 | 예시 |
|---|---|---|
| **서비스(Service)** | 특정 네트워킹 기능 | 신뢰적 메시지 전달 |
| **프로토콜(Protocol)** | 서비스의 구현체 | TCP |
| **인터페이스(Interface)** | 애플리케이션이 프로토콜을 조작하는 방법 | 패킷 포맷 |
| **계층화(Layering)** | 프로토콜을 순서 있는 추상화 단계로 조직하는 기법 | OSI 7계층 |

### 서비스 인터페이스와 피어 인터페이스

각 프로토콜은 두 가지 인터페이스를 정의한다.

![서비스 인터페이스와 피어 인터페이스](/assets/images/posts/osi-reference-model/osi-reference-model-1.png)

- **서비스 인터페이스(Service Interface)**: 상위 계층에 제공하는 로컬 연산을 정의한다. Layer k가 Layer k+1에게 서비스를 제공하는 수직적 관계이다.
- **피어 인터페이스(Peer Interface)**: 같은 계층의 프로토콜 피어(peer) 간에 교환하는 메시지의 형식과 의미를 정의한다. Host A의 Layer k와 Host B의 Layer k 사이의 수평적 관계이다.

각 계층의 서비스 예시:
- **Ethernet**: 비신뢰적(Unreliable) 서브넷 유니캐스트/멀티캐스트/브로드캐스트 데이터그램 서비스
- **IP**: 비신뢰적 종단간(end-to-end) 유니캐스트 데이터그램 서비스
- **TCP**: 신뢰적(Reliable) 종단간 양방향 바이트 스트림 서비스

### 캡슐화와 역캡슐화

각 계층은 바로 아래 계층이 제공하는 서비스만 사용할 수 있다. 데이터가 아래 계층으로 내려갈 때마다 **헤더(header)**가 추가되고, 일부 프로토콜은 **트레일러(trailer)**도 붙인다. 이 과정을 **캡슐화(Encapsulation)**라 하며, 수신 측에서는 역순으로 헤더를 제거하는 **역캡슐화(Decapsulation)**가 이루어진다.

![캡슐화와 역캡슐화 과정](/assets/images/posts/osi-reference-model/osi-reference-model-2.png)

송신 측의 RRP(Request/Reply Protocol)가 헤더를 붙이고, HHP(Host-to-Host Protocol)가 또 헤더를 붙여 최종적으로 `[HHP][RRP][Data]` 형태의 패킷이 네트워크로 나간다. 수신 측에서는 HHP 헤더를 먼저 제거하고, RRP 헤더를 제거하여 원본 데이터를 복원한다.

## OSI 참조 모델

**OSI(Open Systems Interconnection) 참조 모델**은 ISO(International Organization for Standardization)가 개발한 7계층 네트워크 모델이다.

![OSI 7계층 구조](/assets/images/posts/osi-reference-model/osi-reference-model-3.png)

### 각 계층 상세

| 계층 | 이름 | 역할 | 주소 | PDU | 예시 |
|---|---|---|---|---|---|
| **7** | **응용(Application)** | 사용자에게 네트워크 서비스 제공 | Application-specific | Message | HTTP, SMTP, SSH, DNS |
| **6** | **표현(Presentation)** | 데이터 포맷 변환, 암호화, 압축 | — | — | NFS의 XDR |
| **5** | **세션(Session)** | 세션 설정/유지/종료, 동기화 | — | — | SMIL |
| **4** | **전송(Transport)** | 프로세스 간 신뢰적 데이터 전달, 흐름 제어 | Port 번호 | Segment | TCP, UDP |
| **3** | **네트워크(Network)** | 출발지→목적지 패킷 라우팅, 단편화/재조합 | IP 주소 (논리) | Datagram (Packet) | IP |
| **2** | **데이터 링크(Data Link)** | 프레이밍, 같은 물리 매체의 노드 간 hop-by-hop 전달 | MAC 주소 (물리) | Frame | Ethernet, 802.11 |
| **1** | **물리(Physical)** | 물리적 링크로 비트 전송 | — | Bits | 광섬유, 동축 케이블 |

여기서 각 계층이 다루는 데이터 단위를 **PDU(Protocol Data Unit)**라 한다. 상위 계층에서 받은 데이터에 해당 계층의 헤더를 붙인 것이 그 계층의 PDU이다.

### 종단 장치와 중간 노드의 계층

실제 통신에서 모든 장치가 7계층 전부를 구현하지는 않는다.

![종단 장치와 중간 노드의 프로토콜 계층](/assets/images/posts/osi-reference-model/osi-reference-model-4.png)

- **종단 장치(Device A, B)**: 7계층 전체를 구현한다. 응용 계층에서 물리 계층까지 모두 갖추고 있다.
- **중간 노드(Intermediate Node, 라우터)**: 1~3계층(Physical, Data Link, Network)만 구현한다. 패킷의 목적지 주소를 확인하여 다음 홉으로 전달(forwarding)하는 역할만 수행한다.

같은 계층 간의 통신은 **논리적(logical)**이다. 4~7계층의 peer 간 통신은 점선으로 표시되며, 실제 물리적 통신은 1계층에서만 일어난다.

### OSI 모델의 한계

OSI 프로토콜 스택은 OSI 모델에 맞는 구체적 프로토콜들의 집합이다. 하지만 OSI 모델은 **개념적(conceptual) 참조 모델**일 뿐, 실제 인터넷에서는 사용되지 않는다. 실제 인터넷은 TCP/IP 프로토콜 스위트를 사용한다.

## TCP/IP 프로토콜 스위트

### 인터넷 아키텍처 (RFC 1122)

TCP/IP의 설계 철학은 **장애에 대한 견고성(robustness)**과 다양한 네트워크에서의 **유연성(flexibility)**을 강조한다. 이것이 네트워크 계층의 필요성으로 이어진다.

현대 교과서(Tanenbaum, Kurose/Ross, Stallings, Forouzan)는 **5계층 하이브리드 모델**을 사용한다. OSI의 Data Link + Physical을 합쳐 Link layer로 취급하기도 하지만, 별도로 나누는 것이 일반적이다.

### OSI와 TCP/IP 비교

![OSI 모델과 TCP/IP 프로토콜 스위트 비교](/assets/images/posts/osi-reference-model/osi-reference-model-5.png)

| OSI 7계층 | TCP/IP 5계층 | 설명 |
|---|---|---|
| Application + Presentation + Session | **Application** | 여러 응용 프로토콜 (HTTP, SMTP, DNS 등) |
| Transport | **Transport** | TCP, UDP |
| Network | **Network** | IP 및 보조 프로토콜 |
| Data Link | **Data Link** | LAN/WAN 기술 (Ethernet, WiFi) |
| Physical | **Physical** | 물리적 전송 |

핵심 차이: OSI의 상위 3계층(Application, Presentation, Session)이 TCP/IP에서는 하나의 **Application** 계층으로 통합된다. TCP/IP는 실용적 관점에서 불필요한 구분을 제거한 것이다.

### TCP/IP 각 계층의 역할

**물리 계층(Physical Layer)**: 링크를 통해 개별 비트를 전송한다. 각 링크마다 source/destination이 존재한다.

**데이터 링크 계층(Data Link Layer)**: 같은 물리 매체에 연결된 노드 간의 **hop-by-hop** 전달을 담당한다. 프레임(Frame) 단위로 데이터를 전달하며, **프레임 헤더는 매 홉마다 새로 만들어진다**. MAC 주소를 사용한다.

**네트워크 계층(Network Layer)**: 출발지에서 목적지까지 **end-to-end** 패킷 전달을 담당한다. 데이터그램(Datagram) 단위로 전달하며 IP 주소를 사용한다. 라우터가 라우팅 테이블을 참조하여 포워딩(forwarding) — "이 패킷을 어디로 보낼 것인가"를 결정한다. **라우팅(Routing)**은 포워딩 테이블을 만드는 과정이다.

**전송 계층(Transport Layer)**: **프로세스 간(process-to-process)** 데이터 전달을 담당한다. 세그먼트(Segment) 단위이며 포트 번호(Port number)를 사용한다. 송신 측과 수신 측의 종단 시스템에서만 동작한다. 여러 애플리케이션이 하나의 네트워크 연결을 공유할 수 있도록 **다중화(Multiplexing)**를 제공한다.

**응용 계층(Application Layer)**: 사용자에게 네트워크 서비스를 직접 제공한다. 메시지(Message) 단위이며, 송신 측과 수신 측의 종단 시스템에서만 동작한다.

### 모래시계 모델 (Hourglass Model)

![인터넷 아키텍처의 모래시계 모델](/assets/images/posts/osi-reference-model/osi-reference-model-6.png)

인터넷 아키텍처에서 **IP는 좁은 허리(narrow waist)** 역할을 한다. 상위 계층에는 다양한 응용 프로토콜(HTTP, FTP, DNS 등)이 TCP 또는 UDP 위에서 동작하고, 하위 계층에는 다양한 네트워크 기술(Ethernet, WiFi, SONET 등)이 존재한다. 이 모든 것이 **IP라는 단일 프로토콜**을 통해 연결된다.

IP가 서로 다른 링크 계층 프로토콜을 사용하는 서브네트워크 간의 상호 연결(interconnection)을 가능하게 한다는 것이 핵심이다.

### 인터넷 계층화의 실제

인터넷 아키텍처는 **엄격한 계층화를 강제하지 않는다**. 일부 애플리케이션은 전송 계층을 건너뛰고 IP나 서브네트워크를 직접 사용할 수 있다. IP가 아키텍처의 **초점(focal point)** 역할을 하며, 호스트 간 메시지 전달 문제와 유용한 프로세스 간 통신 서비스 제공 문제가 완전히 분리된다.

> "We reject kings, presidents, and voting. We believe in rough consensus and running code."
> — David D. Clark

### Hop-by-hop vs End-to-end

프로토콜 기능은 두 가지 방식으로 구현된다.

| 방식 | 설명 | 대상 계층 |
|---|---|---|
| **End-to-end (E2E)** | 출발지와 최종 목적지에서만 해당 기능을 수행 | Transport, Application |
| **Hop-by-hop (HBH)** | 패킷이 지나가는 매 중간 노드가 해당 기능을 수행 | Physical, Data Link, Network |

인터넷 커뮤니티의 **end-to-end 원칙** (RFC 1958): "해당 기능은 통신 시스템의 종단점(endpoint)에 있는 애플리케이션의 지식과 도움으로만 완전하고 정확하게 구현될 수 있다." 즉, **지능(intelligence)은 네트워크 내부가 아니라 종단에 있어야 한다**는 것이 인터넷의 아키텍처 원칙이다.

## 주소 체계 (Addressing)

네트워크 통신에서 "누구에게 보낼 것인가"를 지정하려면 주소가 필요하다. TCP/IP에서는 계층마다 다른 주소 체계를 사용한다.

| 계층 | PDU | 주소 유형 | 설명 |
|---|---|---|---|
| Application | Message | Application-specific | 애플리케이션별 고유 주소 |
| Transport | Segment | **Port 주소** | 컴퓨터 내에서 프로세스 식별 |
| Network | Datagram | **논리 주소 (IP)** | 전체 인터넷에서 고유 |
| Data Link | Frame | **물리 주소 (MAC)** | 같은 LAN 내에서 고유 |
| Physical | Bits | — | — |

### 물리 주소 (MAC Address)

**MAC(Medium Access Control) 주소**는 IEEE 802 네트워킹 기술(Ethernet, Wi-Fi, Bluetooth)에서 사용하는 물리 주소이다. **NIC(Network Interface Card)** 제조사가 하드웨어에 새겨 넣기 때문에 **burned-in address**라고도 부른다.

- 대부분 **48비트(6 octet)** 구조이며, 64비트 MAC 주소도 존재한다
- 앞 3 octet은 **OUI(Organizationally Unique Identifier)** — 제조사 식별
- 뒤 3 octet은 NIC 고유 번호
- 첫 번째 octet의 최하위 비트(b0): 0 = unicast, 1 = multicast
- 첫 번째 octet의 두 번째 비트(b1): 0 = globally unique(OUI 적용), 1 = locally administered
- 표기법: `ad:12:13:fc:14:ee` (콜론), `ad-12-13-fc-14-ee` (대시) 등

물리 주소의 분류:

| 유형 | 설명 |
|---|---|
| **유니캐스트(Unicast)** | 특정 단일 수신자 |
| **멀티캐스트(Multicast)** | 특정 그룹의 수신자 |
| **브로드캐스트(Broadcast)** | 네트워크 내 모든 시스템 |
| **애니캐스트(Anycast)** | 그룹 중 아무나 하나 |

프라이버시 보호를 위해 최근 기기들은 Wi-Fi 네트워크마다 다른 **사설 MAC 주소(Private MAC Address)**를 사용한다. burned-in 주소도 소프트웨어적으로 변경 가능하다.

### 논리 주소 (IP Address)

LAN을 넘어서 통신하려면 전체 인터넷에서 고유한 주소 체계가 필요하다. 이것이 **논리 주소**, 즉 **IP 주소**이다.

| 구분 | 물리 주소 (MAC) | 논리 주소 (IP) |
|---|---|---|
| **범위** | 같은 LAN | 전체 인터넷 |
| **역할** | hop-by-hop 전달 | end-to-end 전달 |
| **변화** | 매 홉마다 바뀜 | 출발~도착 유지 (원칙적으로) |
| **부여** | 하드웨어 제조→NIC 고정 | 네트워크 관리자/DHCP 할당 |
| **구조** | 평면적(flat) | 계층적(hierarchical) |

패킷이 라우터를 거칠 때마다 프레임의 **물리 주소(MAC)**는 바뀌지만, 패킷의 **논리 주소(IP)**는 원칙적으로 출발지부터 목적지까지 유지된다. 각 장치는 라우팅 테이블에서 목적지(D), 다음 홉의 논리 주소(N), 다음 홉의 물리 주소(NP)를 조회하여 패킷을 전달한다.

### 포트 주소 (Port Address)

전송 계층(L4)에서 사용하는 주소로, **프로세스(애플리케이션)를 식별하는 번호**이다. 하나의 컴퓨터에서 여러 네트워크 애플리케이션이 동시에 실행되므로, IP 주소만으로는 어떤 애플리케이션에 데이터를 전달할지 알 수 없다. 포트 번호가 이 문제를 해결한다. 즉, **프로세스 간(process-to-process) 메시지 전달**에 사용된다.
