---
title: "Overview of Computer Networks — 컴퓨터 네트워크 개요"
date: 2026-04-01
categories: [Computer-Network]
tags: [computer-network, internet, protocol, standard, ISP, TCP/IP, RFC]
description: "네트워크의 정의부터 인터넷 구조, 프로토콜, 표준화 기구까지 컴퓨터 네트워크의 전체 그림을 정리한다."
---

컴퓨터 네트워크는 현대 IT 인프라의 근간이다. 웹 브라우저를 열든, 카카오톡을 보내든, 넷플릭스를 스트리밍하든 — 모든 것은 네트워크 위에서 동작한다. 이 글에서는 네트워크의 기본 정의부터 인터넷의 구조, 프로토콜의 개념, 그리고 표준화 체계까지 컴퓨터 네트워크의 전체 그림을 잡는다.

## 네트워크란 무엇인가

**네트워크(Network)**란 **2개 이상의 엔티티(entity) 사이에서 상품(commodity)을 운반하는 시스템**이다. 교통망은 사람과 차량을, 전력망은 전기를, 우편망은 편지를 운반한다. 네트워크는 본질적으로 **노드(Node)**와 **링크(Link)**로 구성된다.

> "A network is, in its simplest form, a collection of points (i.e., nodes) joined together in pairs by lines (i.e., edges)."
> — M.E.J. Newman, *Networks: An Introduction* (2010)

### 컴퓨터 네트워크의 정의

**컴퓨터 네트워크(Computer Network)**는 범용 컴퓨터들이 통신 채널로 상호 연결되어 정보를 주고받는 시스템이다. 불특정 다수의 네트워크(와 최근에는 서버)의 집합을 **클라우드(Cloud)**라고 부르기도 한다.

Tanenbaum의 정의가 간결하다:

> "We will use the term 'computer network' to mean a collection of autonomous computers interconnected by a single technology."

### 교통망과 컴퓨터 네트워크 비교

컴퓨터 네트워크의 개념은 교통망에 비유하면 직관적으로 이해할 수 있다.

| 교통 네트워크 | 컴퓨터 네트워크 |
|---|---|
| 차량/사람 (Vehicles/People) | 패킷/페이로드 (Packets/Payload) |
| 도로 주소 (Street address) | IP 주소 (IP address) |
| 교차로 (Intersection) | 브리지/라우터 (Bridge/Router) |
| 도로, 고속도로 (Street, highway) | 링크/광대역/경로 (Link/Broadband/Path) |
| 교통 체증 (Traffic jam) | 네트워크 혼잡 (Network congestion) |
| 신호등 (Traffic light) | 흐름 제어 (Flow control) |
| 우회 경로 (Alternative path) | 대체 경로 (Alternative route) |
| 차량 충돌 (Collision) | 패킷 충돌 (Collision of packets) |
| HOV 차선 (HOV lane) | 스트림 우선순위 (Stream priority) |
| 등교 경로 (Route to school) | 라우팅 알고리즘 (Routing algorithm) |

### 네트워크 구성 요소

네트워크는 크게 두 가지 요소로 이루어진다.

- **노드(Node)**: PC, 서버, 스위치, 브리지, 라우터 등 특수 목적 장치
- **링크(Link)**: 노드 간의 연결. 광섬유(Optical fiber), 동축 케이블(Coaxial cable), 무선(Wireless) 등

## 인터넷이란 무엇인가

**인터넷(Internet)**은 **"network of networks"**, 즉 네트워크들의 네트워크이다. 수백만 개의 Access ISP들이 계층적으로 연결된 구조다.

여기서 대문자 **I**nternet과 소문자 **i**nternet의 의미가 다르다. **Internet**은 우리가 사용하는 특정 글로벌 네트워크를, **internet**은 네트워크를 상호 연결할 수 있는 기술 자체를 의미한다. 또한 공개된 **Internet**과 사설 **intranet**(특정 조직 내부에서만 사용하는 사설 네트워크)도 구분해야 한다.

### 인터넷의 구성 요소

![인터넷 구성 요소 — hosts, communication links, packet switches, networks](/assets/images/posts/computer-network-overview/computer-network-overview-1.png)

인터넷을 구성하는 핵심 요소는 다음과 같다.

- **호스트(Host) = 종단 시스템(End System)**: 네트워킹이 가능한 컴퓨팅 장치. 클라이언트와 서버로 나뉜다. 인터넷의 **가장자리(edge)**에 위치하며 네트워크 애플리케이션을 실행한다.
- **통신 링크(Communication Link)**: 광섬유, 구리선, 라디오, 위성 등의 물리적 매체. 데이터를 전송하는 속도를 **대역폭(bandwidth)**이라 한다.
- **패킷 스위치(Packet Switch)**: 데이터 덩어리인 패킷(packet)을 전달하는 장치. **라우터(router)**와 **스위치(switch)**가 대표적이다.
- **네트워크(Network)**: 장치, 라우터, 링크의 집합으로, 특정 기관이 관리하는 단위이다.

### 인터넷의 두 가지 관점

인터넷은 두 가지 시각으로 바라볼 수 있다.

**구조적 관점**: 수백만 개의 Access ISP들이 계층적으로 연결된 interconnected network이다.

**서비스 관점**: 분산 애플리케이션을 위한 **통신 인프라**이다. 웹, VoIP, 이메일, 게임, 전자상거래 등 다양한 분산 애플리케이션을 가능하게 한다. 두 가지 통신 서비스를 제공하는데, **신뢰적(reliable) 데이터 전달**과 **비신뢰적(best-effort) 데이터 전달**이 그것이다.

### 인터넷 구조 — 세 영역

인터넷의 물리적 구조는 세 영역으로 나뉜다.

- **네트워크 에지(Network Edge)**: 호스트(클라이언트, 서버)가 위치하는 인터넷의 가장자리. 서버는 주로 데이터센터에 배치된다.
- **접속 네트워크(Access Network)**: 최종 사용자를 네트워크에 연결하는 부분. 유선/무선 통신 링크로 이루어지며, 다양한 링크 기술(DSL, 케이블, 광섬유, WiFi, 4G/5G 등)이 사용된다.
- **네트워크 코어(Network Core)**: 상호 연결된 라우터들로 이루어진 인터넷의 핵심부. "network of networks" 구조다.

## 인터넷의 역사

### 1961~1972: 패킷 교환의 태동

- **1961**: Kleinrock의 **큐잉 이론(queueing theory)**이 패킷 교환의 효율성을 입증
- **1964**: Baran — 군사 네트워크를 위한 패킷 교환 제안. 공격을 받아도 끊기지 않는 통신 시도
- **1967**: ARPA(Advanced Research Projects Agency)가 **ARPAnet** 구상
- **1969**: 최초의 ARPAnet 노드 가동
- **1972**: ARPAnet 공개 시연, **NCP(Network Control Protocol)** — 최초의 호스트 간 프로토콜, 최초의 이메일 프로그램 등장. ARPAnet 15개 노드 달성

### 1972~1980: 인터네트워킹과 독점 네트워크

- **1970**: ALOHAnet — 하와이의 위성 네트워크
- **1974**: Cerf와 Kahn이 네트워크 상호 연결 아키텍처를 설계. 이때 정립된 원칙이 오늘날 인터넷 아키텍처의 근간이다:
  1. **최소주의(Minimalism)** & **자치(Autonomy)** — 네트워크 내부 변경 없이 상호 연결
  2. **최선형 서비스(Best-effort service model)**
  3. **비상태 라우팅(Stateless routing)** — 매번 보낼 때마다 경로를 찾음
  4. **분산 제어(Decentralized control)**
- **1976**: Xerox PARC에서 **이더넷(Ethernet)** 탄생 (근거리 네트워크)
- **1979**: ARPAnet 200개 노드 달성

### 1980~1990: 새로운 프로토콜의 확산

- **1982**: SMTP 이메일 프로토콜 정의
- **1983**: **TCP/IP** 배치 — 현대 인터넷 프로토콜의 시작
- **1983**: DNS — 도메인 이름 → IP 주소 변환 정의
- **1985**: FTP 프로토콜 정의
- **1988**: TCP 혼잡 제어(congestion control)
- 새로운 국가 네트워크(CSnet, BITnet, **NSFnet**, Minitel) 등장. 10만 호스트 달성

### 1990~2000년대: 웹의 상용화

- 1990년대 초: ARPAnet 해체, **웹(Web)** 탄생 (HTML, HTTP — Berners-Lee)
- 1994: NCSA **Mosaic** 브라우저, 이후 Netscape
- 1990년대 말: 인터넷의 상용화, 닷컴 버블
- 인스턴트 메시징, P2P 파일 공유, 네트워크 보안 부상
- 5천만 호스트, 1억 명 이상의 사용자, 백본 링크 Gbps 수준

### 2005~현재: 규모, SDN, 모바일, 클라우드

- 광대역 가정 접속 보급 (10~100 Mbps)
- **2008**: 소프트웨어 정의 네트워킹(**SDN**, Software-Defined Networking)
- 고속 무선 접속 보편화 (4G/5G, WiFi)
- Google, Meta, Microsoft 등 서비스 제공자가 자체 네트워크 구축 — 상용 인터넷을 우회하여 사용자에게 가까이 접근
- 기업들이 클라우드(AWS, Azure)에서 서비스 운영
- **2017**: 모바일 기기가 고정 기기보다 많아짐
- **2023**: 약 **150억 대**의 기기가 인터넷에 연결 (statista.com)

## 오늘날의 인터넷 구조

수백만 개의 Access ISP를 어떻게 연결할 것인가? 모든 ISP를 1:1로 직접 연결하면 $O(N^2)$개의 연결이 필요하다. 확장성이 없다(doesn't scale).

해결책은 **계층적 구조**이다.

![인터넷 계층 구조 — Tier 1 ISP, Regional ISP, access ISP, IXP, Content Provider](/assets/images/posts/computer-network-overview/computer-network-overview-2.png)

### ISP 계층 구조

| 계층 | 역할 | 예시 |
|---|---|---|
| **Tier 1 ISP** | 국가/국제 커버리지를 가진 상위 상용 ISP | Level 3, Sprint, AT&T, NTT |
| **Regional ISP** | 지역 단위로 access net을 ISP에 연결 | — |
| **Access ISP (Local ISP)** | 최종 사용자가 인터넷에 접속하는 통신사 | KT, SK브로드밴드, LGU+ |
| **IXP (Internet Exchange Point)** | 복수의 ISP가 직접 트래픽을 교환하는 지점 | 과거 NAP(Network Access Point) |
| **Content Provider Network** | 자체 데이터센터를 인터넷에 직접 연결하는 사설 네트워크 | Google, Meta |

- Access ISP는 **상위 ISP**에 접속하고, 상위 ISP끼리는 **피어링 링크(peering link)** 또는 **IXP**를 통해 상호 연결된다.
- Google, Meta 같은 대형 콘텐츠 제공자는 자체 네트워크를 구축하여 Tier 1 ISP나 Regional ISP를 우회하기도 한다. 목표는 사용자에게 더 가까이 서비스와 콘텐츠를 전달하는 것이다.

## 프로토콜이란 무엇인가

**프로토콜(Protocol)**은 통신 규칙이다. **무엇을, 어떻게, 언제** 주고받을지를 정의한다.

사람 간 대화도 프로토콜이 있다. "안녕"이라고 인사하면 상대도 "안녕"으로 응답하고, 그 후에 요청을 주고받는다. 네트워크 프로토콜도 같은 구조를 따른다.

![사람 프로토콜과 네트워크 프로토콜 비교](/assets/images/posts/computer-network-overview/computer-network-overview-3.png)

핵심은 프로토콜이 **분산된 엔티티** 간의 통신을 다룬다는 점이다. 각 엔티티는 상대방의 상태를 완전히 알 수 없으므로, **메시지 교환(message exchange)**을 통해 데이터 통신이나 상태 동기화를 수행한다.

### 프로토콜의 3요소

| 요소 | 설명 |
|---|---|
| **구문(Syntax)** | 메시지의 형식/구조. 헤더 비트 구성이나 문자열 형태 |
| **의미(Semantics)** | 어떤 요청/응답/동작을 할지 정의 |
| **타이밍(Timing)** | 이벤트의 순서. 언제 무엇을 보낼지 명시 |

## 표준(Standard)이란 무엇인가

**표준(Standard)**이란 "무언가를 하는 널리 합의된 방법"이다. 표준이 없으면 기술은 동작하지 않는다.

### 표준화 기구 (SDO)

**표준 개발 기구(SDO, Standard Development Organization)**는 공정한 절차를 통해 표준을 개발하는 조직이다.

| 기구 | 풀네임 | 역할 |
|---|---|---|
| **IETF** | Internet Engineering Task Force | 인터넷 프로토콜 표준 개발 (가장 중요) |
| **IEEE** | Institute of Electrical and Electronics Engineers | 전기/전자 분야 표준 (WiFi 등) |
| **W3C** | World Wide Web Consortium | 웹 표준 (HTML, CSS 등) |
| ISO, IEC, ANSI, ITU-T, ETSI | — | 기타 국제/지역 표준화 기구 |

### De facto vs De jure 표준

- **사실상 표준(De facto standard)**: 산업과 사용자에 의해 자연스럽게 채택된 표준. 예: PDF(1993년 생성, 사실상 표준으로 자리 잡음)
- **공식 표준(De jure standard)**: 공인 기관이 승인한 표준. 예: PDF/A — 2005년 ISO 19005-1:2005로 공식 표준화

### 인터넷 표준과 RFC

인터넷은 자율적이고 느슨하게 조직된 네트워크들의 국제적 협력으로 이루어진다. 호스트 간 통신은 **인터넷 표준(Internet Standard)**에 정의된 공개 프로토콜을 통해 이루어진다.

인터넷 표준의 분류:

- **Internet-Drafts**: IETF에 제출된 초기 사양
- **RFC (Request for Comments)**: 인터넷 권위 기관의 추천을 받아 출판되는 기술 문서. 각 RFC에는 고유 번호가 부여된다
- **Proposed Standard**: 안정적이고 잘 이해되며, 여러 그룹에 의해 구현/검증된 사양
- **Internet Standard**: 철저히 검증되어 인터넷 종사자들이 준수하는 최종 표준

과거에는 **Draft Standard** 단계가 있었으나 현재는 폐기되었다 (RFC 6410).

### 규제 기관

모든 통신 기술은 정부 기관의 규제를 받는다.

- **방송통신위원회(KCC)**: 한국의 방송통신 서비스 규제
- **FCC (Federal Communications Commission)**: 미국의 통신 관련 규제
- **ECC (Electronic Communications Committee)**: 유럽의 무선 장비 및 주파수 스펙트럼 관련 규제

### 인터넷 관리 조직

![IETF 조직 구조](/assets/images/posts/computer-network-overview/computer-network-overview-4.jpeg)

- **IESG (Internet Engineering Steering Group)**: IETF 활동과 인터넷 표준 프로세스의 기술적 관리
- **IRSG (Internet Research Steering Group)**: 장기적 인터넷 연구 주제에 집중하는 연구 그룹
- **IAB (Internet Architecture Board)**: 인터넷 아키텍처와 표준 프로세스 감독
- **IETF Administration LLC**: IETF, IAB, IRTF의 행정/재정 지원
- **IANA (Internet Assigned Numbers Authority)**: IP 주소, 도메인 이름 등 인터넷 자원 관리
