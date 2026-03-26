---
title: "Docker 소개 및 개발환경 설정"
date: 2025-10-13
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, container, dev-environment]
toc: true
toc_sticky: true
---

**개요**

---

##  Docker 소개 및 개발환경 설정

###   Docker 소개

- 컨테이너 기반 애플리케이션 개발, 실행 및 공유를 위한 개방형 플랫폼

- 느슨하게 격리된 환경(완전한 가상머신 수준의 격리가 아닌, 리눅스 커널을 공유하면서 프로세스•파일시스템•네트워크만 분리)

- 격리 및 보안, 호스트 환경에 독립적 (Linux 기반)

- 프로그래밍 언어 Go 로 작성됨

- 이미지(실행 환경 스냅샷)를 어디서든 컨테이너로 복원해 동일 환경 보장

- Docker Hub 등 레지스트리로 이미지 공유·배포 가능

Docker file

- 도커 이미지를 생성하는 일종의 스크립트

Docker Image

- Read-only 파일이며, 도커 엔진은 도커 이미지를 이용하여 컨테이너를 생성 가능

Docker Container

- 가상의 격리된 환경에서 독립된 프로세스로 동작

![Docker 소개 및 개발환경 설정](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-1.png)

---

###   도커 컨테이너

- 소스코드와 모든 종속성을 패키징하는 표준 소프트웨어 단위

#### 도커 엔진이 차용하는 컨테이너 기술

- **chroot(change root)** : 특정 디렉터리를 최상위 디렉터리 root로 인식하게 하는 Linux 명령어

- ** 네임스페이스(namespace)** : 커널 기능을 통해 동일한 시스템에서 격리된 공간을 운영 및 프로세스 자원 관리 기능

- **cgroup(control group)** : CPU, 메모리, 디스크 I/O, 네트워크 등의 자원 사용량을 관리

---

###   컨테이너 vs 가상머신

#### 가상머신(Virtual Machine)

- 물리적 하드웨어 가상화(하드웨어 레벨 가상화)

- 하이퍼바이저(가상화 소프트웨어)를 통해 게스트 OS 구동

- 독립적인 OS, 애플리케이션, 필수 바이너리 및 라이브러리 필요(수십 GB)

- 보완 및 네트워크에 강점

#### 컨테이너(Container)

- 프로세스 가상화(운영체제 레벨 가상화)

- 호스트 OS 커널 공유 + 격리된 프로세스로 실행 가능

- 게스트 OS + 하이퍼바이저 사용 x → 경량(수십 MB) + 이동•복제 쉬움 + 애플리케이션 시작 시간 빠름

- +) 컨테이너는 하나의 리눅스 VM 커널을 여러 컨테이너가 공유

**+) CPU 가상화 기능**

- CPU가 가상 머신 실행을 하드웨어 수준에서 지원하는 기능

![Docker 소개 및 개발환경 설정](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-2.png)

![Docker 소개 및 개발환경 설정](/assets/images/posts/docker-intro-dev-env/docker-intro-dev-env-3.png)

---

###   빠른 맛보기

```bash
# Getting Started 컨테이너 실행
docker run -d -p 80:80 docker/getting-started  # -d : 백그라운드에서 분리 모드로 컨테이너를 실행, -p 80:80 : 호스트의 포트 80을 컨테이너의 포트 80에 매핑,

# 정리
docker ps                    # 컨테이너 ID 확인(process status)
docker stop <CONTAINER_ID>   # 컨테이너 중지
docker rm <CONTAINER_ID>     # 컨테이너 제거

```

---

###   시험대비 Q&A

- Q1. VM과 컨테이너의 핵심 차이?

A. VM은 게스트 OS 부팅(무거움), 컨테이너는 커널 공유 프로세스 격리(가벼움)

- Q2. “어디서나 같은 환경”을 보장하는 기술 요소?

A. 이미지(레이어), 컨테이너, 레지스트리(Docker Hub)

---

> 💡  학습정리

    -

    -

    -
