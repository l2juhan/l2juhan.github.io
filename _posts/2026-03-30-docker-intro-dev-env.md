---
layout: post
title: "Docker Introduction — 도커 소개 및 개발환경 설정"
date: 2026-03-30
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, container, virtual-machine, image, dockerfile]
description: "도커의 필요성, 핵심 3요소(Dockerfile/Image/Container), 가상머신과 컨테이너의 차이, 개발환경 설정"
---

애플리케이션을 다른 환경에 배포할 때마다 OS 종류, 라이브러리 버전, 네트워크 설정 등이 달라서 제대로 동작하지 않는 문제가 빈번하다. 동일한 환경을 여러 곳에 반복적으로 구축하는 것도 비용이 크다. 도커(Docker)는 이 문제를 **컨테이너** 기술로 해결한다.

## 도커란?

도커는 2013년 3월 닷클라우드(dotCloud)의 엔지니어였던 **Solomon Hykes**가 오픈소스로 공개 발표한 프로젝트이다. 애플리케이션 개발, 실행 및 공유를 위한 **개방형 플랫폼**이다.

핵심 특징:

- 느슨하게 격리된 환경인 **컨테이너(Container)**에서 애플리케이션을 패키징하고 실행하는 기능을 제공한다
- 격리 및 보안을 통해 지정된 호스트에서 여러 컨테이너를 **동시에 실행** 가능하다
- 컨테이너는 애플리케이션 실행에 필요한 모든 것을 포함하므로 **호스트 환경에 종속적이지 않다**
- 프로그래밍 언어 **Go**로 작성되었으며, 리눅스 커널의 여러 기능을 활용한다

StackOverflow 2024 Developer Survey 기준 가장 많이 사용되는 기타도구 **1위**이다.

## 도커의 핵심 3요소

도커에서 가장 중요한 세 가지 개념은 **Dockerfile**, **이미지(Image)**, **컨테이너(Container)**이다.

![Dockerfile → Image → Container](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-1.png)

- **도커파일(Dockerfile)**: 도커 이미지를 생성하는 일종의 스크립트이다. 건축의 경우 설계도면, 요리의 경우 레시피의 역할에 해당한다.
- **이미지(Image)**: 읽기 전용 파일이다. 도커 엔진은 도커 이미지를 이용하여 컨테이너를 생성한다. 하나의 이미지로 여러 개의 컨테이너를 생성 및 실행할 수 있다.
- **컨테이너(Container)**: 가상의 격리된 환경에서 독립된 프로세스로 동작한다. 이미지를 인스턴스화한 것이라고 볼 수 있다.

## 도커 컨테이너

**컨테이너**란 소스코드와 모든 종속성을 패키징하는 표준 소프트웨어 단위이다. 애플리케이션이 다양한 컴퓨터 환경에서 빠르고 안정적으로 실행 가능하다.

도커 엔진이 차용하고 있는 컨테이너 기술은 본래 리눅스 자체 기술인 **chroot**, **네임스페이스(namespace)**, **cgroup**을 조합한 **리눅스 컨테이너(LinuX Container, LXC)**에서 출발하였다.

- **chroot(change root)**: 특정 디렉터리를 최상위 디렉터리 root로 인식하게끔 설정하는 리눅스 명령
- **네임스페이스(namespace)**: 동일한 시스템에서 격리된 공간을 운영하고 프로세스 자원을 관리하는 기능을 제공한다. mnt, pid, net, ipc, user, cgroup 등의 자원을 그룹화하여 할당한다.
- **cgroup(control group)**: CPU, 메모리, 디스크 I/O, 네트워크 등의 자원 사용량을 관리한다. 이를 통해 특정 애플리케이션의 과도한 자원 사용을 제한한다.

## 가상머신과 컨테이너 비교

### 가상머신(Virtual Machine)

![가상머신 아키텍처](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-2.png)

물리적 하드웨어 가상화(**하드웨어 레벨 가상화**)이다. 호스트 OS 위에 가상화 소프트웨어인 **하이퍼바이저(Hypervisor)**(VMware, VirtualBox 등)를 이용하여 여러 개의 게스트 OS를 구동하는 방식이다.

- 하이퍼바이저는 가상머신을 생성, 실행, 모니터링하는 중간 관리자 역할을 한다
- 각 가상머신은 독립적으로 OS, 애플리케이션, 필수 바이너리 및 라이브러리를 설치 및 동작한다 (일반적으로 수십 GB 사용)
- 장점: 보안 + 네트워크 격리, 훨씬 많은 일을 수행 가능

### 컨테이너(Container)

![컨테이너 아키텍처](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-3.png)

프로세스 가상화(**운영체제 레벨 가상화**)이다. 여러 컨테이너가 호스트 OS의 커널을 공유하고 격리된 프로세스로 실행 가능하다.

- 하이퍼바이저와 게스트 OS가 없기 때문에 **가볍다** (일반적으로 수십 MB 사용)
- 게스트 OS를 부팅하지 않기 때문에 애플리케이션 **시작 시간이 빠르다**
- 가상머신보다 경량이므로 더 많은 애플리케이션을 실행 가능하다
- 경량이기 때문에 이미지 파일의 복제, 이관, 배포가 쉽다

| 구분 | 가상머신 | 컨테이너 |
|------|--------|---------|
| 가상화 수준 | 하드웨어 레벨 | OS 레벨 |
| 격리 단위 | OS 전체 | 프로세스 |
| 크기 | 수십 GB | 수십 MB |
| 시작 시간 | 분 단위 | 초 단위 |
| 성능 | 오버헤드 있음 | 네이티브에 가까움 |
| 이미지 공유 | 어려움 | Docker Hub 등으로 용이 |

## 도커 개발환경 설정

### CPU 가상화 기능 활성화

도커를 사용하려면 먼저 CPU 가상화 기능이 활성화되어 있어야 한다.

- **AMD**: BIOS에서 SVM mode를 enable로 수정
- **Intel**: BIOS에서 Virtualization을 enable로 수정
- 작업관리자 > 성능에서 가상화에 "사용"으로 표시되어 있으면 활성화된 것이다

### Docker Desktop 설치

1. Docker 공식 사이트에서 Docker Desktop을 다운로드한다
2. 설치 시 "Use WSL 2 instead of Hyper-V (recommended)" 체크박스가 있을 수 있다
3. 설치 후 PC를 재시작한다
4. Docker가 자동 실행되면 Accept 버튼을 클릭한다

설치 확인:

```bash
$ docker -v              # 도커 버전 정보만 확인
$ docker version         # 설치된 도커 엔진의 세부 정보 확인 (Client + Server)
```
