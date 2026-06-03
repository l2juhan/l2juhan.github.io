---
layout: post
title: "ARP, ICMP, and MPLS — 링크 계층 주소 해석과 IP 보조 프로토콜"
date: 2026-06-03
categories: [Computer-Network]
tags: [arp, icmp, mpls, mac-address, vlan, traceroute, ping, proxy-arp, 802-1q]
description: "IP 주소를 MAC 주소로 바꾸는 ARP, 네트워크 오류를 알리는 ICMP, 라벨 기반 고속 전달을 하는 MPLS, 그리고 물리 LAN을 논리적으로 나누는 VLAN까지 링크·네트워크 계층의 보조 프로토콜을 정리한다."
---

IP 데이터그램이 실제로 케이블 위를 흐르려면 링크 계층의 도움이 필요하다. 다음 홉의 **MAC 주소**를 알아내는 ARP, 전달 중 생긴 문제를 되돌려 알리는 ICMP, 그리고 라벨로 빠르게 스위칭하는 MPLS를 차례로 본다.

## MAC 주소

인터페이스에는 두 종류의 주소가 붙는다.

| | IP 주소 | MAC 주소 |
|---|---|---|
| 계층 | 네트워크 계층(L3) | 링크 계층(L2) |
| 길이 | 32비트 | 48비트 (대부분 LAN) |
| 표기 | `128.119.40.136` | `1A-2F-BB-76-09-AD` (16진수) |
| 용도 | L3 포워딩 | 같은 서브넷 내 인접 인터페이스로 프레임 전달 |
| 할당 | 부착된 IP 서브넷에 의존 | NIC의 ROM에 각인(IEEE 관리) |

**MAC(또는 LAN, physical, Ethernet) 주소**는 같은 서브넷 안에서 한 인터페이스의 프레임을 물리적으로 연결된 다른 인터페이스로 옮기는 데 **로컬로** 쓰인다. 48비트 주소는 보통 NIC의 ROM에 각인되지만 소프트웨어로 설정 가능한 경우도 있다.

MAC 주소 할당은 **IEEE**가 관리한다. 제조사가 MAC 주소 공간의 일부를 사서 유일성을 보장받는다. 비유하면 **MAC 주소는 주민등록번호, IP 주소는 우편 주소**다. MAC은 평면(flat) 주소라 **이식성(portability)**이 있다 — 인터페이스를 다른 LAN으로 옮겨도 그대로다. 반면 IP 주소는 노드가 붙은 IP 서브넷에 의존하므로 이식되지 않는다.

## ARP

IP 주소는 TCP와 IP 모듈에게만 의미가 있다. 데이터 링크는 자기만의 주소 체계(예: 이더넷의 48비트 MAC)를 갖는다. 그래서 IP가 다음 홉을 정하면, 그 다음 홉의 **링크 계층 주소**를 알아내야 한다.

여기서 핵심은 알아내야 하는 것이 **IP 데이터그램의 목적지 주소가 아니라는 점**이다. 호스트 A가 멀리 있는 호스트 C로 보낼 때, A가 알아야 할 건 첫 홉 라우터 B의 MAC 주소이지 C의 MAC 주소가 아니다.

**ARP(Address Resolution Protocol, RFC 826)**는 IP 주소와 데이터 링크가 쓰는 주소 사이의 **동적(dynamic) 매핑**을 제공한다. 여기서 동적이란 사람의 개입 없이 자동으로 주소를 변환한다는 뜻이다. ARP는 각 네트워크 인터페이스가 **하드웨어 주소(physical address)**를 가진다고 가정하며, 정상 형태로는 **브로드캐스트 네트워크에서만** 동작한다. 점대점(point-to-point) 링크는 ARP를 쓰지 않는다. (역방향 매핑용 RARP(RFC 903)는 거의 쓰이지 않는다.)

### ARP의 두 동작: request와 reply

![ARP request는 multicast, reply는 unicast](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-1.png)

ARP에는 **request**와 **reply** 두 동작이 있다.

- **ARP request**: "IP 주소 141.23.56.23을 쓰는 노드의 물리 주소를 찾는다"를 **브로드캐스트(멀티캐스트)**로 LAN 전체에 뿌린다
- **ARP reply**: 해당 IP를 가진 노드만 자기 MAC 주소를 담아 **유니캐스트**로 답한다

요청은 모두에게, 응답은 요청자에게만 가는 비대칭 구조다.

### ARP 캐시(ARP 테이블)

매번 브로드캐스트하면 낭비다. 그래서 각 호스트와 라우터는 **ARP 캐시(ARP table)**를 둔다. 주소 변환을 쓰는 각 인터페이스에 대해 최근의 `<IP 주소, MAC 주소, TTL>` 매핑을 보관한다.

```
Linux% arp -a
printer.home (10.0.0.4) at 00:0A:95:87:38:6A [ether] on eth1
gw.home (10.0.0.1) at 00:0D:66:4F:60:00 [ether] on eth1
```

캐시 항목의 정상 만료 시간은 생성 후 **20분**이다(RFC 1122). `arp -a` 명령으로 전체 항목을 볼 수 있다(Linux, Windows 공통).

A가 같은 LAN의 B에게 데이터그램을 보내는데 B의 MAC을 모르는 경우의 흐름은 이렇다.

1. A가 B의 IP를 담은 ARP query를 **브로드캐스트**한다 (목적지 MAC = `FF-FF-FF-FF-FF-FF`). LAN의 모든 노드가 받는다
2. B만 자기 MAC을 담아 A에게 ARP response를 보낸다 (B의 MAC을 알려줌)
3. A가 응답을 받아 B 항목을 자기 ARP 테이블에 추가한다 (TTL과 함께)

### ARP 패킷 포맷

![ARP 패킷 포맷, 이더넷 기준 28바이트](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-2.png)

이더넷 ARP 메시지는 14바이트 MAC 헤더 뒤에 붙는다. 주요 필드는 다음과 같다.

- ARP request의 목적지 MAC(DST) = `FF:FF:FF:FF:FF:FF`
- 'Length or Type' 필드 = `0x0806` (ARP, request·reply 공통)
- 'Prot Type' 필드 = `0x0800` (IPv4 주소)
- IPv4 ↔ Ethernet ARP면 (Hard Size, Prot Size) = $(6, 4)$
- **Op** 필드: ARP request면 1, ARP reply면 2

존재하지 않는 호스트로 보내면 ARP request만 반복되고 응답이 없다. 그동안 ARP 캐시에는 `<incomplete>`로 남는다.

```
Linux% arp -a
? (10.0.0.99) at <incomplete> on eth0
```

### ARP 캐시 타임아웃과 Soft State

각 항목에는 타임아웃이 걸린다. 대부분의 구현은 완성된 항목은 **20분**, 미완성 항목은 **3분**을 쓴다. 보통 항목이 사용될 때마다 20분 타임아웃을 다시 시작한다(RFC 1122는 사용 중이어도 타임아웃이 발생해야 한다고 하지만, 많은 구현이 따르지 않는다).

ARP 캐시 타임아웃은 **soft state**의 예다. soft state는 타임아웃 전에 갱신(refresh)되지 않으면 폐기되는 정보를 말한다. 주기적으로 갱신하지 않으면 사라지는 상태라는 점이 핵심이다.

### Proxy ARP, Gratuitous ARP, ACD

ARP에는 몇 가지 변형이 있다.

**Proxy ARP(RFC 1027)**: 어떤 시스템(보통 특수 설정된 라우터)이 **다른 호스트를 대신해** ARP request에 응답하게 한다. 요청자는 응답한 시스템이 목적지인 줄 알지만 실제 목적지는 다른 곳(또는 없을 수도)에 있다. LAN 경계 보안을 깨므로 가능하면 피한다. *promiscuous ARP* 또는 *ARP hack*이라고도 불린다.

**Gratuitous ARP(GARP)**: 호스트가 **자기 자신의 주소**를 찾는 ARP request를 보내는 것이다. 보통 인터페이스가 부팅 시 "up"될 때 한다. 목적은 두 가지다 — IP 주소 중복 탐지, 그리고 다른 호스트들이 ARP 캐시 항목을 갱신하게 하는 것(리부트로 MAC이 바뀐 경우 유용). Linux-HA에서는 백업 서버가 GARP로 죽은 서버를 넘겨받는다.

```
Linux# tcpdump -e -n arp
1 0.0  0:0:c0:6f:2d:40 ff:ff:ff:ff:ff:ff arp 60:
        arp who-has 10.0.0.56 tell 10.0.0.56
```

**IPv4 Address Conflict Detection(ACD, RFC 5227)**: ARP probe와 ARP announcement 패킷을 정의한다. *ARP probe*는 Sender's Protocol(IP) Address 필드를 0으로 설정한 ARP request로, 캐시 오염을 막는다. "Up"일 때 무작위 지연 알고리즘으로 probe 3개를 보내고(동시 전원 인가 혼잡 방지), 충돌이 없으면 2초 간격으로 announcement 2개를 보내 기존 캐시 매핑을 갱신한다.

### 다른 서브넷으로 라우팅

ARP가 어떻게 실제 전달에 쓰이는지, A가 라우터 R을 거쳐 다른 서브넷의 B로 보내는 과정을 본다.

![다른 서브넷으로 라우팅하는 토폴로지](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-3.png)

전제: A는 B의 IP 주소를 알고, 첫 홉 라우터 R의 IP 주소를 알고(어떻게? — DHCP나 설정), R의 MAC 주소도 안다(어떻게? — ARP). 주소 지정을 IP(데이터그램)와 MAC(프레임) 두 계층에서 따라가면 이렇다.

1. A가 IP 데이터그램을 만든다 — **IP src = A, IP dest = B**
2. A가 이 데이터그램을 담은 링크 계층 프레임을 만든다 — **프레임의 목적지 MAC = R의 MAC**. R로 프레임 전송
3. R이 프레임을 받아 데이터그램을 꺼내 IP로 올린다
4. R이 나갈 인터페이스를 정하고, A→B 데이터그램을 다시 링크 계층으로 내린다. 이번엔 **프레임 목적지 MAC = B의 MAC**. 프레임 전송
5. B가 프레임을 받아 데이터그램을 꺼내 IP로 올린다

핵심은 **IP 주소(src=A, dest=B)는 끝까지 변하지 않지만, MAC 주소는 매 홉마다 바뀐다**는 점이다. IP는 최종 목적지를, MAC은 바로 다음 홉을 가리킨다.

## ICMP

IP는 데이터그램을 전달하다 문제가 생겨도 송신자에게 알리지 않는다. 이 빈틈을 메우는 게 **ICMP(Internet Control Message Protocol)**다. 호스트와 라우터가 네트워크 수준 정보를 주고받는 데 쓴다.

- **오류 보고**: 도달 불가능한 호스트, 네트워크, 포트, 프로토콜
- **echo request/reply**: `ping`이 사용

ICMP는 IP "위"의 네트워크 계층 프로토콜이지만, ICMP 메시지 자체는 **IP 데이터그램에 담겨** 운반된다. ICMP 메시지는 type, code, 그리고 **오류를 일으킨 IP 데이터그램의 첫 8바이트**로 구성된다.

### ICMP 메시지 포맷과 오류 데이터 필드

ICMP 일반 메시지 포맷은 Type(8비트) + Code(8비트) + Checksum(16비트) + Rest of header + Data section이다.

![ICMP 오류 메시지의 데이터 필드](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-4.png)

오류 메시지의 데이터 필드에는 **원본 IP 데이터그램의 IP 헤더 + 데이터 첫 8바이트만** 담긴다. 받은 데이터그램(IP 헤더 + 8바이트 + 나머지)에서 앞부분만 떼어 ICMP 헤더를 붙이고, 다시 IP 헤더로 감싸 송신측에 돌려보낸다. 첫 8바이트면 상위 계층(TCP/UDP)의 포트 번호까지 들어 있어 어떤 연결의 문제인지 송신측이 식별할 수 있다.

### 주요 ICMP 메시지 타입

| Type | 이름 | E/I | 용도 |
|---|---|---|---|
| 0 | Echo Reply | I | `ping` 응답 |
| 3 | Destination Unreachable | E | 호스트/프로토콜 도달 불가 |
| 4 | Source Quench | E | 혼잡 표시 (deprecated) |
| 5 | Redirect | E | 다른 라우터를 쓰라고 알림 |
| 8 | Echo | I | `ping` 요청 |
| 9 | Router Advertisement | I | 라우터 주소/선호도 |
| 10 | Router Solicitation | I | Router Advertisement 요청 |
| 11 | Time Exceeded | E | 자원 소진 (예: IPv4 TTL) |
| 12 | Parameter Problem | E | 잘못된 패킷/헤더 |

E는 오류 메시지, I는 질의/정보 메시지다.

**Echo request/reply (Type 8/0)**: 호스트나 라우터가 echo request를 보내면, 받은 쪽이 echo reply로 답한다. 호스트의 도달 가능성을 테스트하며, 보통 `ping` 명령으로 호출한다. Identifier와 Sequence number 필드로 요청-응답을 짝짓는다.

**Destination Unreachable (Type 3)**: code로 세분된다.

| Code | 의미 |
|---|---|
| 0 | 네트워크 도달 불가 — 라우팅 테이블에 목적지 경로가 없고 디폴트 라우트도 없음 |
| 1 | 호스트 도달 불가 — 최종 목적지 호스트에 도달 불가 |
| 2 | 프로토콜 도달 불가 — 목적지 호스트가 특정 프로토콜을 쓸 수 없음 |
| 3 | 포트 도달 불가 — 목적지 호스트가 특정 포트를 쓸 수 없음 |
| 4 | 단편화 필요하지만 DF 비트 설정됨 — MTU가 작은데 DF가 켜져 라우터가 폐기 |
| 13 | 통신이 관리적으로 금지됨 — 방화벽이 정책상 데이터그램을 폐기 (보통은 오류를 안 보냄) |

**Redirect (Type 5)**: 라우터가 같은 로컬 네트워크의 호스트에게 더 나은 대체 라우터를 알린다. 호스트 A가 R1으로 보낸 패킷을 R1이 R2로 보내야 한다고 판단하면, R1은 패킷을 R2로 전달하면서 A에게 redirect 메시지(RM)를 보내 다음부터 R2로 직접 보내게 한다.

**Time Exceeded (Type 11)**: code 0은 라우터가 TTL이 0이 됐음을 알릴 때만, code 1은 목적지 호스트가 정해진 시간 안에 모든 단편을 받지 못했음을 알릴 때만 쓴다.

**Parameter Problem (Type 12)**: 라우터나 목적지 호스트가 만든다. Pointer(바이트 오프셋)가 문제가 시작된 필드를 가리킨다.

### Traceroute

`traceroute`는 ICMP와 TTL을 영리하게 조합해 경로상의 라우터들을 알아낸다.

![Traceroute와 ICMP](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-5.png)

1. 출발지가 목적지로 UDP 세그먼트 묶음을 보낸다 — 1번째 묶음은 **TTL=1**, 2번째는 **TTL=2**, … 이런 식으로 늘린다
2. $n$번째 묶음의 데이터그램이 $n$번째 라우터에 도달하면, 그 라우터는 TTL이 0이 됐으므로 데이터그램을 폐기하고 출발지로 ICMP 메시지(**Type 11, Code 0**)를 보낸다. 이 메시지에 라우터 이름과 IP가 담긴다
3. ICMP가 출발지에 도착하면 RTT를 기록한다

**멈추는 조건**: UDP 세그먼트가 마침내 목적지 호스트에 도달하면, 목적지는 (열려 있지 않은 포트라서) ICMP "port unreachable"(**Type 3, Code 3**)을 돌려준다. 이걸 받으면 출발지가 멈춘다. 각 홉마다 보통 probe 3개를 보내 RTT를 3번 측정한다.

## MPLS

> 시간 관계상 MPLS는 시험범위가 아니다. 개념만 짚는다.

**MPLS(Multiprotocol Label Switching)**의 목표는 MPLS 지원 라우터들 사이에서 **고정 길이 라벨(label)**로 고속 IP 전달을 하는 것이다. 기존 IP는 목적지 주소의 **최장 프리픽스 매칭(longest prefix matching)**으로 전달하는데, 이는 가변 길이 비교라 느리다. 고정 길이 식별자를 쓰면 조회가 빨라진다. **가상 회선(Virtual Circuit)** 방식에서 아이디어를 빌렸지만, IP 데이터그램은 여전히 IP 주소를 그대로 유지한다.

![MPLS 라벨 구조](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-6.png)

라벨은 이더넷 헤더와 IP 헤더 사이에 끼워진다. label(20비트), Exp(3비트), S(1비트), TTL(8비트)로 구성된다.

**MPLS 지원 라우터**는 *label-switched router*라고도 한다. **IP 주소를 보지 않고 라벨 값만으로** 나갈 인터페이스를 정한다. MPLS 포워딩 테이블은 IP 포워딩 테이블과 별개다.

유연성이 장점이다. MPLS 전달 결정은 IP와 다를 수 있다 — 목적지뿐 아니라 **출발지 주소까지** 써서 같은 목적지로 가는 흐름을 다르게 라우팅할 수 있고(트래픽 엔지니어링), 링크 장애 시 미리 계산해 둔 백업 경로로 빠르게 우회(fast reroute)할 수 있다.

![MPLS 포워딩 테이블](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-7.png)

각 MPLS 라우터는 `(in label, out label, dest, out interface)` 테이블을 갖는다. 들어온 라벨을 보고 나갈 라벨로 바꿔 달면서(label swapping) 지정된 인터페이스로 내보낸다. 진입 라우터는 OSPF·IS-IS 링크 상태 플러딩을 확장해 MPLS 정보(링크 대역폭, 예약된 대역폭 등)를 나르고, **RSVP-TE** 시그널링으로 하류 라우터들의 MPLS 전달을 설정한다.

## VLAN (Optional)

LAN이 커지고 사용자가 접속 위치를 바꾸면 문제가 생긴다. 단일 브로드캐스트 도메인에서는 모든 L2 브로드캐스트 트래픽(ARP, DHCP, 알 수 없는 MAC)이 **LAN 전체를 가로질러야** 한다. 확장성, 효율, 보안, 프라이버시가 나빠진다. 관리 문제도 있다 — CS 부서 사용자가 EE 부서로 자리를 옮기면 물리적으로는 EE 스위치에 붙지만 논리적으로는 CS에 남고 싶을 수 있다.

**VLAN(Virtual Local Area Network)**은 VLAN 기능을 지원하는 스위치를 설정해 **하나의 물리 LAN 인프라 위에 여러 논리 LAN**을 정의한다.

![Port-based VLAN](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-8.png)

**Port-based VLAN**은 스위치 포트를 그룹으로 묶어, 하나의 물리 스위치가 여러 개의 가상 스위치처럼 동작하게 한다. 예를 들어 포트 1~8은 EE VLAN, 9~15는 CS VLAN으로 묶는다.

- **트래픽 격리**: 포트 1~8을 오가는 프레임은 포트 1~8에만 도달한다. 스위치 포트 대신 단말의 MAC 주소로 VLAN을 정의할 수도 있다
- **동적 멤버십**: 포트를 VLAN 사이에서 동적으로 재배정할 수 있다
- **VLAN 간 전달**: 별개의 스위치들처럼 **라우팅**을 통해 이뤄진다 (실무에선 스위치+라우터 결합 제품을 판매)

### 여러 스위치에 걸친 VLAN과 802.1Q

VLAN이 여러 물리 스위치에 걸치면 **trunk port**가 스위치 사이에서 VLAN 프레임을 나른다. 그런데 스위치 사이를 오가는 프레임은 평범한 802.1 프레임일 수 없다 — 어느 VLAN 소속인지(VLAN ID)를 실어야 하기 때문이다. **802.1q** 프로토콜이 trunk port 사이 프레임에 헤더 필드를 추가·제거한다.

![802.1Q VLAN 프레임 포맷](/assets/images/posts/arp-icmp-mpls/arp-icmp-mpls-9.png)

802.1Q 프레임은 기존 802.1 이더넷 프레임의 source address 뒤에 4바이트를 끼운다.

- **2바이트 Tag Protocol Identifier** (값 `81-00`)
- **Tag Control Information**: 12비트 VLAN ID 필드 + 3비트 우선순위 필드(IP TOS와 유사)

태그가 끼워지므로 CRC도 다시 계산한다.

**EVPN(Ethernet VPN, 일명 VXLAN)**은 한 걸음 더 나간다. 서로 떨어진 데이터센터의 L2 이더넷 스위치를 **IP를 언더레이(underlay)로 삼아 논리적으로** 연결한다. 이더넷 프레임을 IP 데이터그램 안에 담아 사이트 사이로 나르는 **터널링**으로, L3 네트워크 위에 L2 네트워크를 오버레이해 L2 네트워크를 "늘린다"(RFC 7348).
