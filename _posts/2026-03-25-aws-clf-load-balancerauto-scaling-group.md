---
title: "AWS CLF — Load Balancer&Auto Scaling Group"
date: 2026-03-25
categories: [Cloud]
subcategory: AWS-CLF
tags: [aws, clf, cloud-practitioner, elb, auto-scaling]
toc: true
toc_sticky: true
---


---

![](/assets/images/posts/aws-clf-load-balancerauto-scaling-group/aws-clf-load-balancerauto-scaling-group-1.png)

## 확장성(Scalability)

- 성능에 영향을 주지 않고 리소스를 추가하거나 용량을 조정하여 증가하는 작업 부하나 수요 증가를 처리할 수 있는 시스템의 능력

### 수평적 확장(Scale Out)

- 시스템에 증가된 워크로드를 분산시키기 위해 인스턴스나 노드의 개수를 추가

### 수직적 확장(Scale Up)

- 증가된 수요를 처리하기 위해 기존 인스턴스 또는 리소스(CPU,메모리 또는 스토리지)를 늘리는 작업

### 탄력성(Elasticity)

- 시스템이 수요에 따라 리소스를 자동으로 프로비저닝 및 프로비저닝 해제하여 최적의 성능과 비용 효율성을 보장

## 가용성(Availability)

- 서버와 네트워크, 프로그램 등의 정보 시스템이 정상적으로 사용 가능한 정도

### 고가용성

- 시스템이 항상 사용 가능하고 중단되지 않는 상태를 유지하는 능력

### 내결함성

- 시스템이 하드웨어 또는 소프트웨어의 오류,장애 또는 고장에도 계속해서 정상적으로 동작하는 능력

### 회복력

- 사용자에게 최소한의 영향을 미치면서 오류나 중단으로부터 신속하게 복구하고 정상적인 작업을 재개할 수 있는 시스템의 능력

## Load Balancer(LB)

![](/assets/images/posts/aws-clf-load-balancerauto-scaling-group/aws-clf-load-balancerauto-scaling-group-2.png)

- 서버나 컴퓨팅 리소스에 들어오는 네트워크 트래픽을 분산시켜주는 장치나 시스템
- 네트워크 트래픽을 처리하는 동안 단일 서버에 대한 부하를 분산하여 서버의 가용성,성능 및 안정성을 향상
- LB를 통해 서버를 동적으로 추적하여 리소스를 최적화할 수 있음
- AWS와 같은 클라우드 및 Nginx, HAProxy등과 같은 오픈소스를 통해서 제공
- 유형에 따라 크게 NLB와 ALB로 구분됨
      **Network LB**: IP주소와 포트 정보를 기반으로 트래픽을 분산

      **Application LB**: HTTP 헤더, 쿠키, URL 경로 등과 같은 요청의 내용을 기반으로 트래픽을 분산(80, 443)

## Elastic Load Balancer (ELB)

![](/assets/images/posts/aws-clf-load-balancerauto-scaling-group/aws-clf-load-balancerauto-scaling-group-3.png)

- AWS에서 제공하는 완전 관리형 로드밸런서 서비스
- 네트워크 트래픽을 EC2 인스턴스, 컨테이너, IP 주소 등 여러 대상으로 자동으로 분산
- 자동으로 서버 인스턴스를 추가하거나 제거하여 트래픽 변동에 대응
- Auto Scaling 그룹과 함께 사용되어 Horizontal Scaling이 가능함
- Health Check 기능을 통해 서버 상태를 주기적으로 확인하여 정상적인 인스턴스로만 트래픽을 배분

### Application Load Balancer

- Layer 7(응용 계층)
- HTTP, HTTPS(80,443)
- 애플리케이션 프로토콜
- HTTP Header Content를 통한 라우팅 처리
- EC2, 컨테이너,IP주소
- 웹 애플리케이션 서비스

### Network Load Balancer

- Layer 4(전송 계층)
- 네트워크 프로토콜
- TCP, UDP
- 포트 번호를 통한 라우팅 처리
- 수백만의 대용량 트래픽 처리에 적합

### Gateway Load Balancer

- Layer 3(네트워크 계층)
- GENEVE 프로토콜(6081)
- EC2, IP 주소
- 모든 포트에서 모든 IP 패킷을 수신하고 리스너 규칙에 지정된 대상 그룹으로 트래픽을 전달
- GWLB Endpoint-VPC 경계 전체에서 트래픽을 안전하게 교환

### GENEVE 프로토콜

- **핵심 개념 :** 물리 네트워크 위에 소프트웨어로 정의된 **가상의 네트워크**를 만들기 위한 터널링 프로토콜
- **동작 방식:** 원래의 데이터 패킷을 표준 IP 패킷으로 한번 더 **감싸서(캡슐화)** 전송
- **특징:** **확장 가능한 메타데이터**를 포함할 수 있어, VPC와 같은 현대 클라우드 네트워크 가상화 환경에 매우 유연하고 강력함

### 한눈에 보는 OSI 7계층 요약

| 계층 | 이름 | 주요 역할 | 대표 프로토콜 / 장비 |
| --- | --- | --- | --- |
| 7계층 | 애플리케이션 | 사용자에게 서비스 제공, 데이터의 '내용' 결정 | HTTP, HTTPS, SSH, FTP, SMTP |
| 6계층 | 표현 (Presentation) | 데이터 형식 변환, 암호화, 압축 | JPEG, MPEG, TLS, SSL |
| 5계층 | 세션 (Session) | 통신 세션 수립, 관리 및 종료 | NetBIOS, SAP |
| 4계층 | 전송 (Transport) | 데이터 전송 방식 결정 (신뢰성/속도), 종단 간 통신 | TCP, UDP |
| 3계층 | 네트워크 (Network) | 최종 목적지 경로 설정 (라우팅), 논리적 주소(IP) 관리 | IP, ICMP, 라우터 |
| 2계층 | 데이터 링크 | 인접 노드 간 데이터 전송, 물리적 주소(MAC) 관리 | Ethernet, MAC 주소, 스위치 |
| 1계층 | 물리 (Physical) | 물리적인 신호(전기, 빛) 전송 | 케이블, 허브, 리피터 |

## ELB의 작동 방식

![](/assets/images/posts/aws-clf-load-balancerauto-scaling-group/aws-clf-load-balancerauto-scaling-group-4.png)

1. 클라이언트가 ELB에 요청 전송
1. 로드 밸런싱의 알고리즘에 따라 요청 보낼 대상 또는 대상 그룹을 선택(EC2,ASG,IP주소,Lambda,ALB 등)
1. 선택된 대상으로 클라이언트 요청이 전달
1. 대상은 클라이언트 요청에 대한 응답을 생성
1. 대상이 생성한 응답이 다시 ELB로 전송
1. ELB는 받은 응답을 원래 요청을 보낸 클라이언트에게 전달

## Auto Scaling Group(ASG)

![](/assets/images/posts/aws-clf-load-balancerauto-scaling-group/aws-clf-load-balancerauto-scaling-group-5.png)

### Auto Scaling

- 애플리케이션의 수요에 따라 EC2 인스턴스를 자동으로 확장하고 축소하는 기능
- 클라우드로 인해 서버를 빨리 늘리고 줄이는게 가능해져 훨씬 더 효율적인 운영이 가능

### Auto Scaling Group

- 자동 크기 조정 및 관리를 위해 논리적 그룹으로 취급되는 EC2 인스턴스 모음
- 인스턴스의 최소/최대 개수 설정 가능
- 그룹 내 인스턴스에 대한 주기적인 건정성 체크를 수행하여 인스턴스를 자동으로 교체하는 등으로 인스턴스 수를 유지
- 온디맨드 인스턴스를 띄울지,스팟 인스턴스 또는 둘 모두를 띄울지를 선택 가능
- 조정 정책을 사용하여 바뀌는 조건을 충족하도록 그룹의 인스턴스 수를 동적으로 늘리거나 줄일 수 있음

## Auto Scaling Group 구성 요소

- Auto Scaling Group: 오토 스케일링을 위한 EC2 그룹
- Launch Template: 인스턴스의 AMI, init Script, 타입, 최소/최대 개수 등 스케일링에 적용될 인스턴스의 스펙을 명시한 템플릿
- Scaling Condition: 특정 지표 값을 기반으로 Auto Scaling 그룹의 용량을 자동으로 조정하는 정책
     수동 스케일링: 원하는 인스턴스의 수를 직접 변경하는 방식

     동적 스케일링: 기준되는 지표의 값에 따라서 자동으로 스케일링되도록 설정하는 방식

- 단순 정책,단계별 정책,목표 추적 정책
     예약된 작업: 특정 일정이나 날짜에 맞춰 스케일링되도록 설정하는 방식

---

