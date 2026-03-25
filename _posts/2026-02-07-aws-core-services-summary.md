---
title: "AWS 핵심 서비스 간단 요약 — EC2, RDS, S3, Route53, ELB, CloudFront, Lambda"
date: 2026-02-07
categories: [Cloud]
tags: [aws, ec2, s3, rds, lambda, cloudfront, saa]
toc: true
toc_sticky: true
---

AWS SAA 시험 준비를 위한 핵심 서비스 7가지를 간단히 정리합니다.

## EC2 (Elastic Compute Cloud)

> 컴퓨터를 빌려서 원격으로 접속해 사용하는 서비스

EC2를 쉽게 말하면 **하나의 컴퓨터**입니다. Nitro System 기반으로 동작합니다.

## RDS (Relational Database Service)

> 관계형 데이터베이스 서비스

MySQL, MariaDB 등 여러 관계형 데이터베이스를 AWS로부터 빌려서 사용하는 형태입니다.

## S3 (Simple Storage Service)

> 파일 저장 서비스

구글 드라이브나 iCloud처럼 파일을 저장하는 서비스입니다. 부가 기능으로 **정적 웹 사이트 호스팅**도 가능합니다.

## Route 53

> 도메인을 발급하고 관리해주는 DNS 서비스

DNS(Domain Name System)는 문자로 된 도메인 주소(www.naver.com)를 IP 주소(12.134.122.11)로 변환해주는 시스템입니다. 사람이 복잡한 IP 주소를 외울 필요가 없게 해줍니다.

## ELB (Elastic Load Balancer)

> 트래픽(부하)을 적절하게 분배해주는 장치

로드밸런서(Load Balancer)라고도 부릅니다. 서버를 2대 이상 가용할 때 필수적으로 도입하게 됩니다.

## CloudFront

> 컨텐츠를 빠르게 전송하게 해주는 CDN 서비스

전세계 곳곳에 컨텐츠의 복사본을 저장해놓을 수 있는 임시 저장소(Edge Location)를 구축합니다. 사용자는 가장 가까운 임시 저장소에서 컨텐츠를 가져오므로 속도가 빨라집니다. 이런 형태의 서비스를 **CDN(Content Delivery Network)**이라고 합니다.

## Lambda

> 서버는 AWS가 관리하고, 개발자는 코드만 작성하면 알아서 실행되는 서비스

EC2처럼 서버를 직접 생성하고 관리할 필요 없이, 필요한 코드만 작성해서 실행시키면 알아서 작동합니다. **서버리스(Serverless)** 컴퓨팅의 대표적인 서비스입니다.
