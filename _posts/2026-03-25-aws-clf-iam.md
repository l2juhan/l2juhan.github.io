---
title: "AWS CLF — IAM"
date: 2026-03-25
categories: [Cloud]
subcategory: AWS-CLF
tags: [aws, clf, cloud-practitioner, iam]
toc: true
toc_sticky: true
---


---

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-1.png)

## IAM 개요

- 사용자가 AWS 리소스에 대한 접근을 안전하게 관리할 수 있도록 하는 서비스
- 리소스 접근 제어를 위해 사용자, 그룹, 역할을 생성하고 이들에 대한 관리를 도와줌
- 역할, 리소스 및 특정 조건을 기반으로 세분화된 액세스 제어 정책을 제공
- MFA 설정을 통해 리소스 접근에 대한 추가 확인 단계를 요구하여 보안을 강화
- 유저 현황에 대한 자세한 로깅 및 모니터링 기능을 제공하므로 사용자 활동과 권한 변경 상항 추적이 용이

### IAM 유저

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-2.png)

- AWS 계정에 접근하는 개별 사용자로 이름과 자격 증명으로 구성
- 각 사용자는 고유한 자격 증명을 가지고 있으며 이를 통해 AWS 리소스에 접근
- 기본적으로 새로운 IAM 사용자는 작업을 수행할 어떠한 권한도 없음 -> 정책 연결 필요
- 각 IAM 사용자는 오직 한 개의 Root 계정과 연결

## IAM 그룹

- 여러 사용자에 대한 권한을 일괄적으로 관리하기 위한 IAM 유저의 집합
- 그룹에 권한을 할당하게 되면 그 그룹에 속한 모든 사용자가 해당 권한을 상속
- 유저는 그룹에 속하지 않거나 하나 이상의 그룹에 속할 수 있음
- 그룹은 사용자만 포함할 수 있으며 다른 그룹은 포함할 수 없음
- Root 계정별 할당된 유저수 및 그룹내 유저수 최대값이 있음

## IAM 정책

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-3.png)

- AWS 리소스 접근 권한을 정의하는 문서로 사용자, 그룹, 역할 등에 부여됨
- 정의된 정책을 통해 AWS 리소스에 대한 접근을 제어
- JSON 형식의 문서로 작성
- Deny가 Allow에 항상 우선하기 때문에 특정 정책을 지정하지 않으면 기본적으로 모든 요청이 거부

## IAM 역할

- 특정 권한을 지닌 IAM 자격 증명으로 AWS 리소스에 대한 접근 권한 부여에 사용
- 역할은 한 사람하고만 연관되지 않고 해당 역할이 필요한 유저라면 누구든지 맡을 수 있음
- 특정 리소스에 접근 권한이 없는 사용자나 서비스에 엑세스 권한을 위임
- 역할에는 그와 연관된 암호 또는 액세스 키와 같은 표준 장기 자격 증명이 없음
- AWS Security Token Service (AWS STS)를 사용하여 임시 보안 자격 증명을 생성하여 사용
- EC2나 Lambda 등의 서비스가 다른 권한을 받아 다른 AWS 서비스에 대한 액세스 가능

## IAM 보안 자격 증명

### 비밀번호

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-4.png)

- AWS 관리 콘솔에 로그인하기 위해서는 사용자의 IAM ID와 비밀번호가 필요
- 암호 만료를 활성화시켜 주기적으로 비밀번호 변경 권장

### MFA(Multi Factor Authentication)

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-5.png)

- 멀티 팩터 인증의 약자로 두 단계의 인증을 통해 계정에 로그인하는 보안 기술
- 비밀번호에 추가적인 보안 요소로 사용자가 로그인할 때 추가적인 인증을 요구
- AWS 계정 루트 사용자와 IAM 사용자에 대해 MFA를 활성화할 수 있음
- 가상 MFA 디바이스 또는 하드웨어 토큰을 가장 흔히 사용하며 최대 8개의 MFA 디바이스 등록 지원

### Access Key

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-6.png)

- IAM 사용자 또는 AWS 계정 루트 사용자에 대한 장기 보안 인증
- 액세스 키 ID와 보안 액세스 키 쌍으로 구성되어 있으며 이 두 가지를 함께 사용하여 요청을 인증
- API 또는 CLI를 통해 프로그래밍 방식으로 AWS 리소스에 액세스하는 데 사용
- 보안 액세스 키는 생성시 한 번만 저장이 가능
- 보안 액세스 키를 분실한 경우 액세스 키를 삭제하고 새 키를 생성
- 액세스 키는 보안을 보장하기 위해 안전한 장소에 보관해야 하며, 필요하지 않을 때 사용되지 않도록 비활성화하는 것을 권장

## AWS 리소스 접근

### ID and Password

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-7.png)

- AWS 콘솔에 로그인(https://console.aws.amazon.com)
- 웹 기반 콘솔 인터페이스를 통해 다양한 AWS 서비스 및 리소스에 액세스
- IAM 사용자에게 할당된 권한에 따라 액세스가 제어되므로 허용된 서비스들만 콘솔을 통해 접근 가능
- AWS 리소스 및 서비스 관리를 위한 그래픽 사용자 인터페이스(GUI)를 제공
- 직관적이고 손쉽게 리소스들에 대한 생성, 통제 등의 작업 가능

### CLI(Command Line Interface)

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-8.png)

- CLI를 사용하여 터미널 환경에서 코드를 통해 다양한 AWS 서비스와 상호 작용하고 리소스 관리 가능
- AWS CLI라는 통합 관리 도구를 설치하여 여러 개의 AWS 서비스를 제어하고 스크립트를 통해 자동화 가능
- 웹 콘솔에서 제공하는 거의 모든 기능을 구현하는 명령을 실행(EC2 생성, S3 버킷 관리, VPC 구성 등)
- IAM 유저에게 발급되는 액세스 키(Access Key ID + Secret Access Key) 조합을 통해 권한 인증 후 사용 가능

### SDK(Software Development Kit)

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-9.png)

- Python 및 Java와 같은 코드를 통해 AWS 리소스에 액세스할 수 있는 도구
- SDK를 사용하여 AWS 기능을 애플리케이션에 통합하여 코드 내에서 AWS 리소스를 생성, 관리 및 상호 작용이 가능
- AWS CLI와 동일하게 액세스 키(Access Key ID + Secret Access Key) 조합을 통해 권한 인증 후 사용 가능

## IAM Access Reports

![](/assets/images/posts/aws-clf-iam/aws-clf-iam-10.png)

- AWS 리소스에 대한 액세스 이력을 모니터링하고 검토할 수 있는 기능을 제공
- 비밀번호, 액세스 키, MFA 장치를 포함하여 계정의 모든 사용자와 자격 증명 상태를 나열하는 자격 증명 보고서 생성
- 최소 4시간에 한 번씩 자격 증명 보고서 생성이 가능
- 비밀번호 변경, 액세스 키 업데이트와 같은 보안 인증 수명 주기 관련 내용에 대한 감사에 유용

## IAM 권고 사항

- AWS 계정 설정 외에는 루트 계정을 사용하지 않는 것을 권장
- 강력한 비밀번호 정책을 만들고 MFA를 함께 사용하는 것을 권장
- AWS 서비스에 권한을 부여하기 위한 역할 생성 및 사용
- 그룹별 액세스 권한 설정 후 계정 내 유저들을 그룹에 할당
- 장기 저장 액세스 키 이용 보다는 IAM 역할을 통한 임시 키 발급으로 서비스에 액세스
- IAM 사용자 및 액세스 키를 절대 공유하지 않도록 주의
- GitHub 공개 저장소에 키를 업로드하지 않도록 주의

## AWS Organizations

- AWS Organizations는 여러 개의 AWS 계정을 하나의 그룹으로 묶어 중앙에서 통합하여 관리하고 통제(governance)할 수 있게 해주는 서비스
- 회사가 커지면서 팀별/목적별로 여러 계열사를 만드는 것처럼, AWS 환경도 보안, 비용 분리, 환경 격리(개발/운영) 등을 위해 여러 계정을 사용하는 것이 모범 사례
-  AWS Organizations는 늘어난 계정들을 그룹 본사에서 효율적으로 관리하기 위한 도구

### Organizations 계층 구조

1. **관리 계정 (Management Account):**
- 조직을 생성한 계정으로, **'그룹 본사'** 역할을 합니다.
- 조직 내 모든 계정에 대한 최종 관리 권한을 가지며, 모든 비용이 이곳으로 통합 청구됩니다. (Payer Account)
1. **멤버 계정 (Member Accounts):**
- 관리 계정에 의해 조직으로 초대되거나 생성된 개별 계정들입니다. **'계열사' 또는 '지사'** 역할을 합니다.
1. **조직 단위 (Organizational Units - OUs):**
- 계정들을 담는 '폴더'입니다. '개발 부문', '프로덕션 부문'과 같이 실제 조직 구조에 맞게 OU를 만들어 계정들을 그룹화할 수 있습니다. 정책을 적용할 때 개별 계정이 아닌 OU 단위로 적용할 수 있어 관리가 매우 편리해집니다.

### 주요 기능 및 장점

#### 중앙 집중식 결제 (Consolidated Billing)

- **기능:** 모든 멤버 계정에서 발생한 AWS 사용 요금이 **관리 계정의 청구서 하나로 통합**되어 발행됩니다.
- **장점:** 여러 계정의 사용량을 합산하여 **더 높은 볼륨 할인(Volume Discount)** 등급을 쉽게 달성할 수 있어 전체 비용을 절감할 수 있습니다.

####  서비스 제어 정책 (Service Control Policies - SCPs) - ⭐가장 중요⭐

- **기능:** 관리 계정에서 조직 전체, 또는 특정 OU나 계정에 대해 허용할 수 있는 AWS 서비스 및 작업의 최대 범위를 제한하는 '가드레일(Guardrail)'을 설정하는 기능입니다.
- **중요한 점:** SCP는 권한을 '부여(Allow)'하는 기능이 아닙니다. 대신, IAM이 부여할 수 있는 권한의 '최대 한도'를 정합니다. SCP에서 금지된 작업은 해당 계정의 IAM 관리자가 아무리 강력한 권한을 부여해도 절대 실행할 수 없습니다.

#### 계정 관리 중앙화

- 조직 내에서 필요한 새 AWS 계정을 관리 계정에서 API나 콘솔을 통해 빠르고 일관된 설정으로 생성할 수 있습니다.

#### AWS 서비스 통합

- **Security Hub, AWS Config, Firewall Manager** 등 여러 AWS 관리 및 보안 서비스들을 Organizations와 연동하여, 모든 멤버 계정의 보안 및 규정 준수 현황을 중앙에서 한 번에 관리하고 정책을 배포할 수 있습니다.

### Security Hub, AWS Config, Firewall Manager

| 서비스 | 핵심 역할 | 답변하는 핵심 질문 |
| --- | --- | --- |
| Security Hub | 결과 통합 대시보드 | "현재 우리의 전반적인 보안 상태는 어떤가?” |
| AWS Config | 리소스 구성(설정) 이력 추적 | "이 리소스는 과거에 어떻게 변경되었고, 현재 규칙을 준수하는가?” |
| Firewall Manager | 중앙 방화벽 규칙 배포 | "이 방화벽 규칙을 모든 계정에 어떻게 일관되게 적용할까?” |

## IAM과 Organizations 차이

| 구분 | AWS IAM | AWS Organizations |
| --- | --- | --- |
| 관리 범위 | 단일 AWS 계정 | 여러 AWS 계정들의 묶음 |
| 주요 목적 | 계정 내 리소스에 대한 상세한 권한 제어	 | 여러 계정의 중앙 관리, 거버넌스, 통합 결제 |
| 핵심 기능 | IAM 정책 (Permissions) | 서비스 제어 정책 (SCPs - Guardrails) |

---

