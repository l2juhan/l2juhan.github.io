---
title: "AWS CLF — Elastic Compute Cloud (EC2)"
date: 2026-03-25
categories: [Cloud]
subcategory: AWS-CLF
tags: [aws, clf, cloud-practitioner, ec2]
toc: true
toc_sticky: true
---


---

## EC2 개요

- 안전하고 크기 조정이 가능한 컴퓨팅 파워를 클라우드에서 제공하는 웹 서비스(Iaas)
- 클라우드하면 가장 흔히 생각하는 가상 컴퓨터 대여 서비스
- AWS가 관리하는 가상 서버를 제공하여 사용자의 필요에 따라 컴퓨팅 리소소를 사용 가능
- EC2 서버는 '인스턴스' 라고 불리기도 함

## EC2 인스턴스 유형

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-2.png)

- Amamzon EC2는 각 사용 사례에 최적화된 다양한 인스턴스 유형을 제공
- 인스턴스를 시작할 때 지정하는 인스턴스 유형에 따라 인스턴스에 사용되는 호스트 컴퓨터의 하드웨어가 결정
- 인스턴스 유형은 CPU,메모리,스토리지,네트워킹 용량 등의 조합으로 구성되며 인스턴스 패밀리로 묶임
- 인스턴스 유형에 따라 인스턴스의 스펙 및 가격이 다르기 때문에 사용자의 목적에 맞는 적합한 유형 선택이 필요

## EC2 인스턴스 네이밍 규칙

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-3.png)

#### c : Instance Family(Instance Class)

- 목적에 따른 인스턴스 분류(메모리 최적화,스토리지 최적화,컴퓨팅 최적화 등)

#### 5 : Instance Generation

- 유형별 서버에 대한 세대(버전)

#### a : Processor families

- EC2에 사용된 프로세서의 종류

#### large : Instance Size

- 인스턴스가 가지고 있는 하드웨어적인 스펙(CPU, Memory)

## EC2 인스턴스 분류

### 범용

- 균형 있는 컴퓨팅,메모리 및 네트워킹 리소스를 제공하며, 다양한 여러 워크로드에 사용
- 웹 서버 및 코드 Repo와 같이 리소스를 동등한 비율로 사용하는 앱에 적합

### 컴퓨팅 최적화

- 고성능 프로세서를 활용하는 컴퓨팅 집약적인 앱에 적합
     인스턴스 배치 처리 워크로드

     고성능 웹 서버

     고성능 컴퓨팅

     과학적 모델링, 기계 학습 추론

     전용 게임 서버 및 광고 서버 엔진

### 메모리 최적화

-  메모리에서 대규모 데이터 세트를 처리하는 워크로드 작업에 대한 빠른 성능 제공

### 가속 컴퓨팅

- 하드웨어 액셀러레이터 또는 보조 프로세서를 사용하여 CPU에서 실행되는 소프트웨어보다 훨씬 효율적인 계산 수행을 위해 설계
     부동 소수점 수 계산

     그래픽 처리

     데이터 패턴 일치

### 스토리지 최적화

- 로컬 스토리지에서 매우 큰 데이터 세트에 대해 많은 순차적 읽기 및 쓰기 액세스를 요구하는 워크로드를 위해 설계
- 애플리케이션에 대해 대기 시간이 짧은,초당 수만 단위의 I/O 작업 수(IOPS)를 지원하도록 최적화

### HPC 최적화

- High Performance Computing
- HPC 워크로드를 대규모로 실행할 때 최고의 가격 대비 성능을 제공하도록 설계
- 대규모의 복잡한 시뮬레이션 및 딥 러닝 워크로드와 같이 고성능 프로세서가 유용한 앱에 적합

## EC2 네트워크 인터페이스 (ENI)

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-4.png)

- 네트워크 인터페이스 -> 컴퓨터와 네트워크간에 상호작용이 가능하도록 하는 기기
- EC2의 ENI는 가상의 네트워크 인터페이스로 이를 통해 EC2 인스턴스는 VPC 내에서 네트워크 트래픽을 주고받을 수 있음
- 인스턴스에 접속하여 네트워크 통신을 수행하는 역할
- 인스턴스 생성 시 IP 주소 등의 정보가 할당된 기본 네트워크 인터페이스가 생성
- ENI는 서브넷의 보안 그룹과 연결되어 있으며, 보안 그룹을 통해 인바운드 및 아웃바운드 네트워크 트래픽을 제어
- 여러 개의 추가 네트워크 인터페이스를 EC2에 연결하는 것 또한 가능
     다중 네트워크 구성

     로드 밸런싱

### VPC(Virtual Private Cloud)란?

- VPC(Virtual Private Cloud)는 AWS라는 거대한 퍼블릭 클라우드 공간 안에 논리적으로 완전히 분리된 사용자만의 가상 네트워크 환경을 만드는 서비스

### 서브넷 이란?

- VPC라는 큰 네트워크 공간을 더 작은 단위로 나눈 것을 '서브넷'이라고 함

## EC2 탄력적 IP

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-5.png)

- EC2 인스턴스에 대한 정적 IPv4 주소
- EC2의 IP -> private IP(필수) + public IP(선택)
- 특정 IP 주소를 비용 지불 후 점유해서 사용
- 일반적으로 인스턴스가 중지되었다가 다시 시작하면 기존의 public IP가 변경되는데 이러한 상황을 방지
- 탄력적 IP 주소는 특정 리전에서만 사용할 수 있으며 다른 리전으로 이전할 수 없음
- 아마존의 IP 풀 또는 AWS 계정으로 가져온 사용자 지정 IPv4 주소 풀에서 탄력적 IP 주소를 할당할 수 있음
- 인스턴스와 연결되어 있지 않더라도 이미 IP를 점유하고 있기 때문에 비용은 계속 지불됨

## EC2 보안 그룹

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-6.png)

- 인스턴스 수준의 방화벽 역할을 하는 가상 방화벽
- 특정 네트워크 트래픽을 허용하거나 차단함으로써 네트워크 보안을 관리
- 인스턴스로 들아오는 인바운드 및 아웃바운드 트래픽에 대한 규칙을 정의
- 허용 규칙만 지정하고 특정 트래픽에 대한 거부 규칙은 지정 할 수 없음
- 처음에 만들어지면 아웃바운드는 다 열려있고 인바운드는 기본적으로 막혀있음
- 인바운드 규칙을 보수적으로 잡는 것이 중요
- 제어 규칙
     트래픽 유형(예: SSH,HTTP 등)

     프로토콜(TCP,UDP 등)

     포트(예: SSH 22,HTTP 80, HTTPS 443 등)

     대상(개별 IP 주소,IP 주소 대역,다른 보안 그룹)

## EC2 Key Pairs

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-7.png)

- Amazon EC2 인스턴스에 접속하기 위해 사용화된 파일
- Public Key와 Private Key로 구성되어 Public Key를 인스턴스에 저장하며 Private Key는 사용자가 저장
- Private Key를 이용하여 인스턴스에 SSH 접근이 가능
- Private Key를 소유하는 사람은 누구나 인스턴스에 연결할 수 있으므로 반드시 보안된 위치에 키를 저장

## EC2에 접속하는 방법

- SSH를 통한 접속
- EC2 직렬 콘솔을 사용한 접속
- AWS Session Manager를 통한 접속
- EC2 Instance Connect를 사용한 접속

## EC2 인스턴스 역할

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-8.png)

- EC2 인스턴스에서 접근 가능한 리소스들에 대한 권한 정책이 연결된 역할
- IAM에서 역할 생성 후 해당 역할을 인스턴스에 부여 가능
- EC2 인스턴스가 권한을 받아 AWS 리소스에 대한 액세스를 안전하게 수행

## EC2 구매 옵션

### 온디맨드 (On-Demand)

- 선 결제 없이 사용한 만큼만 비용을 지불하는 인스턴스
- 처음 60초 이후 초당 과금
- 시간당 비용은 가장 높지만 선불로 결제되는 금액이 없음
- 단기간 동안 예측할 수 없는 워크로드 및 중단되어서는 안되는 애플리케이션에 적합

### 스팟 (Spot)

- 사용하지 않는 예비 EC2용량을 경매 방식으로 구매하여 사용하는 방식
- 온디맨드 인스턴스보다 최대 90% 저렴하여 가장 비용 효율적
- 다른 사용자가 해당 스펙의 EC2를 현재 가격보다 높게 입찰시 인스턴스가 중단될 수 있음
- 언제든 인스턴스가 종료될 수 있어, 서버가 지속적으로 실행되어야하는 경우에 부적합
- 배치작업,데이터분석,이미지처리,분산처리 등의 단발성 작업에 적합

### 절감형 플랜 (Savings Plan)

- 1년 또는 3년 기간에 특정 사용량 약정으로 구매하는 옵션으로 온디맨드에 비해 최대 72% 저렴
- Savings Plan으로 약정한 사용량 이상으로 사용한 부분은 온디맨드 가격이 청구한 시간에 10의 컴퓨팅 사용량 약정시 할인된 컴퓨팅 사용량에 대해 10까지 Savings Plan 가격이 청구되고 그 이외의 사용량은 온디맨드 요금 청구
- Compute Saving Plans
     서버의 컴퓨팅 사용량에 대한 약정

     인스턴스 패밀리,크기,AZ,리전,OS와 관계없이 사용량에 적용

     AWS Fargate 및 Lambda에서의 컴퓨팅 사용량에도 적용 가능

- EC2 Instance Saving Plans
     특정 리전의 개별 인스턴스 패밀리에 한정된 약정

     동일 리전의 인스턴스 패밀리 내에선 약정을 유지하며 인스턴스 자유롭게 변경 가능

### 예약 인스턴스 (Reserved Instance)

- 1년(365일) 또는 3년(1095일) 기간에 대해 최대 72% 저렴한 가격으로 선구매하는 것
- 기간이 길수록 할인율이 더 높아짐
- 지불방법은 전액 선결제/부분 선결제/선결제 없음이 있는데 전액을 먼저 지불하는 것이 더 저렴
- 수요가 꾸준하고 예측이 가능한 경우에 구매하는 것이 효율적
- Reserved Instance의 경우 사용하고 남은 부분을 AWS Marketplace에서 사거나 판매 가능
- Reserved Instance 유형
     Standard: 가장 큰 할인 혜택(온디맨드 대비 최대 72%)을 제공하며 사용량이 꾸준한 경우 적합

     Convertible: 사용중에 RI의 속성 변경 가능(금액이 크거나 같은 경우에만)

     Scheduled: 예약한 기간 범위 내에서 인스턴스를 시작

| 구분 (Category) | Reserved Instance (RI) | Savings Plans (SP) |
| --- | --- | --- |
| 핵심 개념 | 특정 인스턴스 사양'에 대한 할인 쿠폰 | '컴퓨팅 사용량 금액'에 대한 약정 할인 |
| 약정 대상 | 인스턴스 패밀리, 크기, OS, 리전 등 '사양’ | 시간당 지출'금액' (예: $10/hour) |
| 유연성 | 낮음 (정해진 사양과 정확히 일치해야 할인 적용) | 매우 높음(인스턴스 크기나 패밀리가 바뀌어도 약정 금액 내에서 자동 적용) |
| 적용 범위 | EC2, RDS, ElastiCache, Redshift 등 다양함 | EC2, AWS Fargate, AWS Lambda (컴퓨팅 서비스에 집중) |
| 관리 편의성 | 복잡함(사용량 변화에 맞춰 RI를 직접 교환(Convertible)하거나 매매해야 함) | 매우 간편함(한 번 구매하면 약정 금액까지 알아서 최적의 할인을 적용해 줌) |
| 추천 대상 | RDS처럼 수년간 사양이 거의 변동 없는 워크로드 | 대부분의 현대적인 EC2 워크로드 (변화가 잦고 유연성이 필요할 때) |

### 용량 예약 (Capacity Reservation)

- 일반적으로 EC2 타입에 따라 가용 영역별 할당량 제한이 있음
- 특정 가용 영역의 EC2 인스턴스에 대해 원하는 기간만큼 컴퓨팅 용량을 예약할 수 있음
- 용량의 제약이 있는 경우 온디맨드 용량을 확보하지 못할 위험을 줄일 수 있음
- 1년 또는 3년 기간의 약정에 가입하지 않고도 언제든지 용량 예약을 생성할 수 있음

### 전용 인스턴스 (Dedicated Instances)

- 일반적인 EC2 인스턴스 -> AWS가 관리하는 동일한 물리적 하드웨어(호스트)를 공유하여 사용
- AWS 계정 사용자 전용 하드웨어에서 실행되는 EC2 인스턴스
- 동일한 AWS 계정의 다른 인스턴스와 하드웨어(호스트) 공유 가능
- 재부팅시 다른 호스트에 인스턴스가 배치될 가능성 있음
- 인스턴스에 대한 과금 발생

### 전용 호스트(Dedicated Hosts)

- 사용자를 위한 완전 전용인 물리적 서버
- 물리적 서버 용량 내에서 다양한 크기의 인스턴스를 자유롭게 배치하여 사용 가능
- 호스트 서버 전체에 대한 과금 발생

### EC2 전용 인스턴스 vs. 전용 호스트 비교

| 구분 | 인스턴스 수준의 격리 | 전용 호스트 (Dedicated Host) |
| --- | --- | --- |
| 핵심 개념 | 인스턴스 수준의 격리 | 물리적 서버(호스트) 수준의 격리 |
| 제어 수준 | 낮음 (AWS가 호스트 자동 배치) | 높음 (사용자가 특정 호스트 선택 및 제어) |
| 서버 가시성 | 없음 (호스트 ID 등 확인 불가) | 있음 (소켓, 코어, 호스트 ID 확인 가능) |
| 과금 단위 | 인스턴스별 과금 | 호스트별 과금 |
| 주요 사용 사례 | 단순 물리적 격리가 필요한 규정 준수 | 소프트웨어 라이선스(BYOL) 관리, 강력한 규제 준수 |

## EBS (Elastic Block Store)

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-9.png)

- EC2 인스턴스가 실행되면서 연결되는 영구 블록 스토리지 볼륨
- 볼륨이 인스턴스에 연결되면 해당 볼륨을 컴퓨터에 연결된 로컬 하드 드라이브처럼 사용가능
- 서버의 데이터를 저장하며,인스턴스 종료 후에도 지속됨
- EC2 종료 후 EBS가 같이 삭제되지 않으면 사용 비용이 청구됨
- 여러 개의 EBS 볼륨을 생성하여 EC2에 추가 연결 가능
- EBS와 EC2는 동일한 가용영역에 있어야 연결 가능
- 스냅샷 기능을 통해 EBS 볼륨 백업 가능
- AWS Key Management Service (KMS)를 이용해 EBS 볼륨 암호화 가능

## EBS (Elastic Block Store) 스냅샷

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-10.png)

- 볼륨 자체와 관계없이 지속되는 Amamzon EBS 볼륨의 특정 시점에 대한 백업본
- 스냅샷을 사용하여 저장 시점의 EBS 볼륨 데이터 복원 가능
- 증분식 백업이므로 가장 최근 스냅샷 이후 변경된(추가/삭제/업데이트)디바이스의 블록만 저장
- 스냅샷을 복사하여 다른 리전이나 가용영역에서도 사용가능
- 수명 주기 관리자(Data Life Cycle Manager)정책을 통해 스냅샷 생성 일정을 자동화 가능

## EC2 AMI(Amazon Machine Image)

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-11.png)

- 소프트웨어 구성에 대한 내용이 기재된 템플릿으로 OS,애플리케이션,서버 프로그램 설정 등이 미리 구성된 서버에 대한 스냅샷
- 특정 리전에 종속되어 있으며 리전 간 복제도 가능
- AMI 사용하여 EC2 시작 시 OS 설치나 서버 소프트웨어 설정 등을 추가로 할 필요없이 원하는 설정이 된 서버가 바로 구동됨
- 유저의 운영 상황에 맞게 커스텀한 AMI를 생성하여 사용할 수 있음
- AMI 이용 경로
     AWS 기본제공

     마켓 플레이스

     사용자 커스텀 AMI

## EC2 Image Builder

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-12.png)

- AWS 또는 온프레미스에서 사용할 가상 머신 및 컨테이너 이미지를 간편하게 구축,테스트 및 배포할 수 있는 도구
- 일반적으로 가상머신 및 컨테이너 이미지를 최신 상태로 유지하기 위해서는 많은 시간과 리소스가 사용
- 간단한 그래픽 인터페이스,기본 자동화 및 AWS 제공 보안 설정을 통해 이미지를 최신 상태로 유지하고 보안을 강화
- 콘솔에서 직관적으로 자동화된 파이프라인을 생성해 Linux 및 Windows 이미지를 생성
- 이미지 생성 스케쥴링 가능
- 이미지를 생성,저장 및 공유하는 데 사용되는 기본 AWS 리소스 비용 외에는 모두 무료로 제공

## 인스턴스 스토어

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-13.png)

- 일반 하드디스크와 같은 블록 레벨의 스토리지
- 호스트 컴퓨터에 물리적으로 연결된 디스크에 위치하여 IOPS 성능이 매우 높은 고성능 스토리지
- 인스턴스에 직접 연결되어 인스턴스에 종속적이므로 인스턴스가 삭제되면 함께 삭제됨
- 삭제의 위험이 있기 때문에 장기 보관이 필요한 데이터의 경우 EBS,S3 등을 활용
- 버퍼,캐시,스크래치 데이터,기타 임시 콘텐츠와 같이 자주 변경되는 정보의 임시 저장에 적합
- 초당 수백 만개의 트랜잭션을 지원하는 I/O처리량이 높은 데이터베이스의 데이터의 임시 스토리지 옵션으로 사용가능

## EFS(Elastic File System)

![](/assets/images/posts/aws-clf-elastic-compute-cloud-ec2/aws-clf-elastic-compute-cloud-ec2-14.png)

- EC2 인스턴스에서 연결하기 위한 리눅스용 네트워크 파일 스토리지
- 완전히 탄력적인 serverless파일 스토리지로 동일 리전에 있는 여러 개의 인스턴스와 연결되어 파일 데이터 공유 가능
- 애플리케이션을 중단하지 않고 페타바이트급까지 온디맨드 규모로 확장 가능
- 온프레미스의 NAS나 NFS 같은 서비스로 Network File System(NFS)프로토콜을 지원
- EC2 보안그룹에서 EFS 보안그룹을 허용해주어야 마운트 가능
| 구분 | AWS EFS (Elastic File System) | AWS S3 (Simple Storage Service) |
| --- | --- | --- |
| 스토리지 종류 | 파일 스토리지 (File Storage) | 객체 스토리지 (Object Storage) |
| 비유 | 네트워크 공유 폴더 / NAS | 인터넷 파일 보관함 / Dropbox |
| 주요 접근 방식 | NFS 프로토콜 (EC2 인스턴스에 마운트) | HTTP/HTTPS 프로토콜 (API, URL) |
| 동시성 | 여러 EC2 인스턴스가 동시에 읽고 쓰기(수정) 가능 | 여러 사용자가 동시에 읽고 쓰기 가능 (덮어쓰기) |
| 파일 수정 | 가능 (파일의 일부만 수정 가능) | 불가능 (수정하려면 전체 파일을 새로 업로드) |

---

