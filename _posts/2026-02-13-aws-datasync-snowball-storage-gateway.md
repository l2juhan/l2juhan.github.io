---
title: "AWS DataSync, Snowball Edge, Transfer Family, Storage Gateway 정리"
date: 2026-02-13
categories: [Cloud]
tags: [aws, datasync, snowball, storage-gateway, saa]
toc: true
toc_sticky: true
---

AWS SAA 시험에서 중요도가 높은(★★★) 데이터 전송 및 스토리지 게이트웨이 서비스를 정리합니다.

## DataSync

**대용량 데이터를 온라인으로 전송**할 때 사용하는 서비스입니다.

- 온프레미스 ↔ AWS 간 데이터 전송
- AWS 스토리지 서비스 간 전송
- 다른 클라우드 ↔ AWS 간 전송

## Snowball Edge

**물리적 장비 배송으로 대용량 데이터를 오프라인 전송**하는 서비스입니다.

1. AWS 사이트에서 Snowball Edge 신청
2. AWS에서 장비를 택배로 발송
3. 장비를 컴퓨터에 연결해 데이터 복사 (물리적 직접 연결으로 속도가 매우 빠름)
4. 장비를 다시 AWS로 반송

### DataSync vs Snowball Edge

| 항목 | Snowball Edge (오프라인) | DataSync (온라인) |
|---|---|---|
| 네트워크 의존도 | 거의 없음 | 매우 높음 |
| 전송 속도 | 대용량일수록 빠름 | 대역폭에 따라 다름 |
| 주요 강점 | 대역폭 제한 극복, 엣지 컴퓨팅 | 자동화, 실시간/증분 동기화 |
| 보안 | 물리적 변조 방지, KMS 암호화 | TLS 암호화 |

> Snowball Edge **Compute Optimized**는 로컬에서 EC2 인스턴스를 실행할 수 있는 미니 서버 역할도 합니다.

## Transfer Family

**FTP(SFTP, FTPS) 서버 역할**을 하는 서비스입니다.

- S3와 연동해서 파일을 송수신
- 기존 FTP 워크플로우를 AWS로 마이그레이션할 때 유용

## Storage Gateway

**온프레미스에서 S3 스토리지를 로컬 스토리지처럼 사용**하게 연결하는 서비스입니다.

데이터를 옮기는 것이 아닌, **연결해서 쓰는 것**이 목적입니다.

### 3가지 유형

| 유형 | 설명 | 프로토콜 | 실시간 사용 |
|---|---|---|---|
| **파일 게이트웨이** | 공유 폴더 형태로 S3에 저장 | NFS, SMB | 가능 |
| **볼륨 게이트웨이** | 블록 스토리지(EBS) 스냅샷을 S3에 저장 | iSCSI | 불가 |
| **테이프 게이트웨이** | 테이프 데이터를 S3에 백업 | VTL | 백업/아카이빙용 |
