---
title: "AWS CLF — Deployments & Global Infra"
date: 2026-03-25
categories: [Cloud]
subcategory: AWS-CLF
tags: [aws, clf, cloud-practitioner, deployment]
toc: true
toc_sticky: true
---


---

## AWS CloudFormation

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-1.png)

- AWS 인프라를 코드로 관리하고 프로비저닝하기 위한 관리형 서비스
- 사용자는 템플릿을 사용하여 AWS 리소스 생성, 업데이트, 삭제 등의 기능 수행 가능
- 인프라 자원을 코드로 관리함으로써 작업을 자동화하고 재현 가능성을 향상시키며, AWS 리소스 간의 의존성을 관리
- 템플릿을 업데이트하여 변경 사항을 적용하고, 필요한 경우 이전 상태로 롤백 가능
- 인프라가 많고 복잡한 경우 관리를 위해 필수적으로 사용되는 서비스

## AWS Cloud Development Kit (CDK)

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-2.png)

- AWS 인프라를 코드로 정의하고 프로비저닝하기 위한 오픈소스 프레임워크
- JavaScript/TypeScript, Python, Java, .NET 등 개발자에게 친숙한 언어를 사용하여 스크립트 정의 가능
- 앱 통합, 자동화, 코드 모듈화 및 재사용 등 프로그래밍적 이점을 누릴 수 있음
- CDK로 작성된 코드는 AWS CloudFormation 템플릿으로 변환되어 배포되고 관리됨

## AWS Elastic Beanstalk

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-3.png)

- 개발자가 애플리케이션을 손쉽게 배포하고 관리할 수 있도록 도와주는 PaaS 서비스
- 애플리케이션 코드를 업로드하면 Elastic Beanstalk가 자동으로 배포, 운영, 확장을 관리
- 개발자는 인프라의 구성 및 관리에 신경쓰지 않고 애플리케이션 개발에만 집중 가능
- Beanstalk 서비스 자체는 무료지만 Beanstalk을 통해 배포되는 인프라들에 대해서는 과금
- Java, .NET, PHP, Node.js, Python, Ruby 및 Docker와 같은 다양한 플랫폼을 지원
- 서버 인스턴스의 프로비저닝, 로드 밸런싱, 스케일링, 모니터링 등을 자동으로 처리

### Elastic Beanstalk vs. Lightsail 상세 비교표

| 구분 | Lightsail (라이트세일) | Elastic Beanstalk (EB) |
| --- | --- | --- |
| 핵심 개념 | 간편한 가상 서버 (Easy IaaS/VPS) | 애플리케이션 자동 배포/관리 (PaaS) |
| 관리의 초점 | '서버' 자체에 집중 | ‘애플리케이션 코드'에 집중 |
| 사용자 책임 | OS, 웹 서버, 애플리케이션 직접 설치 및 관리 | 코드만 업로드하면 나머지는 EB가 자동 구성 |
| 기반 기술 | 단순화된 EC2 인스턴스 | EC2, S3, Auto Scaling, ELB 등 AWS 핵심 서비스들의 '자동 조율(Orchestration)' |
| 확장성 | 수동 스케일업 (더 비싼 플랜으로 변경) | 로드 밸런싱 및 Auto Scaling 완전 자동 지원 |
| 제어/유연성 | 낮음 (정해진 플랜만 사용) | 높음 (기반이 되는 EC2, ELB 등을 직접 수정 가능) |
| 가격 정책 | 월 고정 요금 (예측 가능) | 종량제 (기반 리소스, 즉 실제 사용한 EC2, ELB 비용) |

## AWS Code Family (Deploy, Commit, Build, Pipeline, Artifact, Star)

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-4.png)

- 개발자가 애플리케이션을 구축, 배포 및 관리하는 데 도움을 주기 위해 설계된 서비스 제품군
- 쉽고 빠르며 확장 가능한 애플리케이션을 개발하고 배포하기 위한 플랫폼을 제공
- 인프라 관리를 AWS가 담당하므로 개발자는 코드 작성에 집중

### AWS Code Family , AWS Elastic BeanStalk  차이 비교

| 구분 | AWS Code Family (CodePipeline등) | AWS Elastic Beanstalk |
| --- | --- | --- |
| 핵심 역할 | CI/CD 파이프라인 구축 도구 모음 | 애플리케이션 배포 및 운영 자동화 플랫폼 |
| 관리의 초점 | 소프트웨어 배포 ‘과정’의 자동화 | ‘애플리케이션’ 자체의 간편한 운영 |
| 제공 형태 | 개별 서비스(CodeCommit, CodeBuild 등)의 조합 | 하나의 통합된 서비스 (PaaS) |
| 유연성/제어 | 매우 높음 (빌드,테스트,배포 각 단계를 세밀하게 제어) | 낮음 (정해진 배포 전략을 따름, 단순함 추구) |
| 사용자 | DevOps 엔지니어, 복잡하고 커스텀된 배포 파이프라인이 필요한 경우 | 개발자, 인프라 걱정 없이 코드에만 집중하고 싶을 때 |

### AWS CodeCommit

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-5.png)

- 프라이빗 Git 리포지토리를 호스팅하는 안전하고 확장성 높은 AWS 전용 Git 서비스
- 안전한 클라우드 기반 리포지토리를 제공하여 개발자가 클라우드상에서 소스 코드 관리 가능

### AWS CodeDeploy

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-6.png)

- 애플리케이션을 배포하는 서비스로, 코드 변경 사항을 서버 또는 인프라에 자동으로 배포함
- EC2 인스턴스, 온프레미스 인스턴스, Lambda 함수, ECS 서비스 등으로 애플리케이션을 자동 배포

### AWS CodeBuild

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-7.png)

- 빌드 및 테스트 환경을 관리하는 완전 관리형 빌드 서비스
- 소스 코드를 컴파일하고 테스트하여 실행 가능한 소프트웨어 패키지를 생성

### AWS CodePipeline

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-8.png)

- 지속적인 통합 및 지속적인 배포 (CI/CD) 서비스
- 소프트웨어 변경 사항을 자동으로 테스트하고 배포하는 파이프라인을 구축

### AWS CodeArtifact

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-9.png)

- 안전하고 확장성이 뛰어난 관리형 아티팩트(바이너리 파일, 라이브러리, 설정 파일 등) 리포지토리 서비스
- 애플리케이션 개발을 위한 소프트웨어 패키지를 저장하고 공유

## AWS Cloud9

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-10.png)

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-11.png)

- AWS 클라우드 기반의 통합 개발 환경(IDE) 제공
- 로컬 개발 환경을 설정할 필요 없이 웹 브라우저에서 바로 개발 작업 가능
- 소프트웨어 개발 및 협업을 위한 환경을 구축하고, 코드를 작성, 편집, 디버깅이 가능
- 실시간으로 다른 개발자들과 협업할 수 있는 기능을 제공하여 여러 개발자가 동시에 같은 코드를 편집하고 협업 가능
- Lambda, Code Family 등 AWS 서비스들과 손쉽게 연동하여 소프트웨어 개발 가능
- IAM(Identity and Access Management)을 사용하여 사용자 및 리소스에 대한 액세스를 제어

## DNS 란?

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-12.png)

- DNS = Domain Name System
- 호스트의 도메인 네임 (www.example.com)을 네트워크 주소 (192.168.1.0)로 변환하거나, 그 반대의 역할을 수행하는 시스템
- www.naver.com의 주소 = 223.130.195.200

## AWS Route53

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-13.png)

- AWS에서 관리하는 클라우드 기반 DNS 서비스
- 다양한 도메인 확장자에 대한 도메인 등록을 지원하며, 편리한 관리 및 갱신 옵션을 제공
- DNS 레코드를 생성, 수정, 관리하여 도메인 이름을 인프라 리소스 (ELB, EC2 등)에 매핑하고, 트래픽을 라우팅
- 가까운 리전으로 트래픽을 라우팅하거나, 가용성이 높은 엔드포인트로 트래픽을 라우팅하는 등 다양한 라우팅 정책을 지원
- HTTP, HTTPS, TCP 및 ICMP 상태 확인을 통하여 엔트포인트의 가용성을 주기적으로 확인하고, 상태를 모니터링
- DNS 쿼리의 안전성을 보장하기 위해 DNSSEC (Domain Name System Extensions)을 지원
- Route 53은 DNS 수준에서 자동으로 장애를 감지하고 트래픽을 건강한 리소스로 보내주는 역할을 하므로, '다시 시작 가능한' 워크로드의 안정성을 확보하는 데 매우 효과적인 해결책이 됨

## AWS Route53의 라우팅 정책 

### 단순 라우팅 정책

- 하나의 리소스 또는 레코드 세트에 대해 하나의 IP 주소로 트래픽을 라우팅

### 가중치 라우팅 정책

- 여러 리소스 또는 레코드 세트에 가중치를 할당하여 트래픽을 분산

### 지연 시간 라우팅 정책

- 가장 낮은 지연 시간을 갖는 리전으로 트래픽을 보내 사용자의 지연 시간에 따라 트래픽을 라우팅

### 장애 조치 라우팅 정책

- 주와 보조 리소스 간에 트래픽을 전환하는 옵션으로, 주 리소스가 실패할 경우, 보조 리소스로 트래픽을 전환

### 지리 위치 라우팅 정책

- 사용자의 지리적 위치에 따라 트래픽을 라우팅

### 다중 응답 라우팅 정책

- 여러 IP 주소로 트래픽을 보내 여러 리전에 동일한 애플리케이션을 배포하고 트래픽을 분산

## AWS CloudFront (CDN)

 

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-14.png)

- 전 세계의 사용자에게 안정적이고 빠른 콘텐츠 전송을 제공하는 컨텐츠 전송 네트워크(CDN) 서비스
- CDN = Content Delivery Network
- 이는 사용자가 정적 및 동적 콘텐츠를 안전하게 전송하고 더 빠르게 로드할 수 있도록 도와줌
- 전 세계에 200개가 넘는 분산된 엣지 위치를 통해 콘텐츠를 더 가깝고 빠르게 전송
- 엣지 로케이션에서 데이터 캐싱이 가능하여 콘텐츠를 더 빠르고 효율적으로 전달 가능
- HTTPS를 통한 암호화 및 AWS WAF(Web Application Firewall)와의 통합을 통해 콘텐츠를 안전하게 전송

## AWS Global Accelerator

![](/assets/images/posts/aws-clf-deployments-global-infra/aws-clf-deployments-global-infra-15.png)

- 글로벌 네트워크를 통해 인터넷 트래픽을 안정적으로 전달하는 서비스
- 애플리케이션에 대한 요청을 가장 가까운 엣지 로케이션으로 라우팅하여 응답 시간을 최적화하고 가용성을 향상
- AWS 엣지 로케이션에서 할당되는 두 개의 글로벌 고정 IP 주소가 가속기와 연결
- Elastic IP, EC2 인스턴스, ALB, NLB 등의 AWS 엔드포인트를 연결하여 사용 가능
- 애플리케이션의 Health Check 기능을 통해 하나의 서버 장애 발생시 다른 서버로 라우팅 가능

## AWS Fargate

- 별도로 인스턴스를 생성 관리하지 않고, 완전한 매니지드 서비스의 형태로 도커 컨테이너를 실행시킬 수 있는 아마존의 서비리스 컨테이너 상품이다. **Docker** 이미지가 리파지터리에 푸시되어 있다면, **클러스터** → **작업 정의** → **서비스**의 순서로 생성하여 완전히 24시간 서비스 가능한 애플리케이션을 기동할 수 있다.

## AWS Snowball Edge

- 대규모 데이터를 온프레미스에서 AWS 클라우드로 안전하게 전송하고, 엣지 환경에서 로컬로 데이터를 처리하는 데 사용되는 물리적인 디바이스이다.
- 이 디바이스는 온보드 스토리지와 컴퓨팅 성능을 갖추고 있어 네트워크 연결이 제한적이거나 불안정한 환경에서도 대용량 데이터 마이그레이션과 엣지 컴퓨팅 워크로드를 효율적을 수행할 수 있음
- 데이터는 물리적인 방법으로 전송됨

## AWS Snowmobile

- **엑사바이트(Exabyte) 규모**의 데이터를 이전하기 위한 '데이터 운송용 컨테이너 트럭'입니다.

### 핵심 특징

- 압도적인 용량
-  **45피트(약 14미터) 길이의 컨테이너 트럭** 한 대에 최대 **100 페타바이트(PB)**의 데이터를 저장할 수 있습니다. (1 PB = 1,000 TB, 1 EB = 1,000 PB)
- 물리적 실체
- 서비스 이름이기도 하지만, 실제로 거대한 트럭이 여러분의 데이터 센터로 운전해서 옵니다.
- 높은 보안
- 컨테이너는 방수, 온도 조절, 변조 방지 기능이 있으며, GPS 추적, 영상 감시, 보안 요원 동행 등 철저한 물리적/논리적 보안 하에 운송됩니다. 모든 데이터는 전송 전에 강력하게 암호화됩니다.
- 완전 관리형 프로세스
- AWS 직원이 직접 트럭을 운전해와서, 고객의 데이터 센터 네트워크와 고속으로 연결하여 데이터 로딩을 돕고, 다시 AWS 데이터 센터로 안전하게 운전해 갑니다.

### AWS Snow Family

| 구분 | AWS Snowcone | AWS Snowball Edge | AWS Snowmobile |
| --- | --- | --- | --- |
| 용량 | ~14 TB | ~80 TB | ~100 PB (100,000 TB) |
| 형태 | 작은 휴대용 장치 | 여행 가방 크기 장치 | 45피트 컨테이너 트럭 |
| 주요 사용 사례 | 엣지 환경, 소규모 데이터 | 데이터 센터 이전, 대용량 백업 | 엑사바이트 규모 마이그레이션 |

---

