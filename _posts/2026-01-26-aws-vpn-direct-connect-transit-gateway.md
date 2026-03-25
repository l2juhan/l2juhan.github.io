---
title: "AWS Site-to-Site VPN, Direct Connect, Transit Gateway 정리"
date: 2026-01-26
categories: [Cloud]
tags: [aws, vpn, direct-connect, transit-gateway, saa]
toc: true
toc_sticky: true
---

온프레미스와 AWS를 연결하는 네트워킹 서비스를 정리합니다.

## Site-to-Site VPN

**인터넷을 이용해 암호화된 터널**을 만들어 온프레미스와 AWS를 연결합니다.

- 셋팅이 쉽고 저렴
- 속도가 들쭉날쭉 (인터넷 경유)

## Direct Connect

**전용선을 직접 깔아서** 온프레미스와 AWS를 연결합니다. 인터넷을 거치지 않습니다.

- 보안성 높고, 높은 대역폭과 일관된 성능
- 설치에 시간이 오래 걸리고 비용이 비쌈

## Site-to-Site VPN vs Direct Connect

| 항목 | Site-to-Site VPN | Direct Connect |
|---|---|---|
| 연결 방식 | 인터넷 + 암호화 터널 | 전용선 |
| 비용 | 저렴 | 비쌈 |
| 셋팅 | 빠름 | 오래 걸림 |
| 속도 | 불안정 | 일관적 |
| 보안 | 암호화 | 전용선 + 암호화 |

## Transit Gateway

여러 VPC와 온프레미스 네트워크를 **하나의 네트워크로 연결**하는 허브 역할입니다.

VPC가 많아지면 VPC 피어링으로는 관리가 복잡해집니다. Transit Gateway는 중앙 허브로 모든 VPC를 연결하여 관리를 단순화합니다.
