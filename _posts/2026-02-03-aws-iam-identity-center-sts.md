---
title: "AWS IAM, Identity Center, STS, Cognito, CloudTrail 정리"
date: 2026-02-03
categories: [Cloud]
tags: [aws, iam, security, saa, identity]
toc: true
toc_sticky: true
---

AWS SAA 시험에서 중요도가 높은(★★★) IAM 및 보안 관련 서비스를 정리합니다.

## IAM (Identity And Access Management)

AWS 리소스에 접근할 **권한들을 관리하는 서비스**입니다.

### IAM 사용자 (User)

- AWS 서비스에 접근할 수 있는 **Access Key** 발급
- Access Key는 만료 기간이 없는 **장기 자격 증명** → 유출 시 보안 위험
- 최근에는 IAM 사용자 대신 **IAM 역할** 사용을 권장

### IAM 역할 (Role)

- 자격 증명을 공유할 필요 없어 **보안에 좋음**
- 언제든 역할을 **해제할 수 있음**
- AWS 서비스 간 권한 부여에 사용 (예: EC2가 S3에 접근)

## Identity Center

여러 AWS 계정의 **로그인과 권한을 중앙에서 관리**하는 서비스입니다.

- **로그인 처리** — 한 곳에서 일괄 처리
- **Permission Set** — 허용할 권한을 정의해놓은 템플릿
- **그룹 단위 권한 부여** — 사용자를 그룹으로 묶어 관리
- **외부 IdP 연동** — Google Workspace, Microsoft Entra ID, 온프레미스 AD
- **MFA 강제** — 모든 계정에 MFA 필수 사용 가능

## STS (Security Token Service)

**임시 권한(Access Key, Token)을 발급**해주는 서비스입니다.

- 만료 기간이 있어 유출돼도 위험성이 비교적 적음
- IAM 역할 사용 시 내부적으로 STS가 임시 자격 증명을 발급

## Cognito

웹/모바일 애플리케이션의 **JWT 기반 로그인/회원가입(인증, 인가)**을 담당하는 서비스입니다.

- 소셜 로그인(Google, Facebook, Apple) 연동
- 사용자 풀 관리

## CloudTrail

AWS 계정에서 발생하는 **모든 API 호출(이벤트)을 기록**하는 서비스입니다.

- 어떤 계정이 AWS의 어떤 기능을 사용했는지 감시
- 보안 감사 및 컴플라이언스에 필수

## AWS Config

AWS 리소스의 **설정(Configuration)이 시간에 따라 어떻게 변했는지 기록/검사**하는 서비스입니다.

- 언제, 누가, 어떻게 변경했는지 기록
- 규정 준수 여부 자동 검사
