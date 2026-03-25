---
title: "AWS 절약 플랜, Budgets, Cost Explorer, Trusted Advisor 정리"
date: 2026-02-13
categories: [Cloud]
tags: [aws, cost-optimization, savings-plan, budgets, saa]
toc: true
toc_sticky: true
---

AWS 비용 관리 및 최적화 서비스를 정리합니다.

## 절약 플랜 (Savings Plan)

일정 기간/사용량을 **약정하면 할인**되는 모델입니다.

| 유형 | 설명 |
|---|---|
| **컴퓨팅 절약 플랜** | 가장 유연. EC2, Fargate, Lambda까지 할인 적용 |
| **EC2 인스턴스 절약 플랜** | 특정 인스턴스 유형과 리전을 고정하면 더 큰 할인 |

## AWS Budgets

미래의 사용량과 비용을 **예측해서 예산을 설정**하고, 초과 시 알림을 보내는 서비스입니다.

- **비용 태그**: 리소스에 태그를 붙여 특정 태그 기준으로 예산 설정 및 감시

## Cost Explorer

**과거/현재에 발생한 비용을 분석**하는 서비스입니다.

- **비용 태그**: 태그 기준으로 팀별, 프로젝트별, 환경별 비용 분류/집계

## Billing and Cost Management

사용 요금의 **조회/결제/관리**를 담당하는 비용 관리 콘솔(상위 대시보드)입니다.

## Trusted Advisor

AWS 환경을 자동으로 점검해서 **개선 권장사항**(비용 절감, 성능 개선, 보안 등)을 알려주는 서비스입니다.
