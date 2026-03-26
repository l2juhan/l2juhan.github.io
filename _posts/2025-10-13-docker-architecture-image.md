---
title: "Docker 아키텍처와 이미지 명령어"
date: 2025-10-13
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, image, architecture, registry]
toc: true
toc_sticky: true
---

**개요**

---

##  Docker 아키텍처와 이미지 명령어

- Client–Server 구조

- 도커 데몬(docker daemon)

- 백그라운드에서 특정 작업을 수행하는 프로그램 (API 요청, 도커 객체 관리, 데몬끼리의 통신 등)

- 도커 클라이언트(docker client)

- 내 컴퓨터의 터미널

- ‘사용자 - 도커’ 상호작용

- 도커 레지스트리(docker registry)

- 도커 이미지 저장 및 배포하는 허브

- 도커 객체(docekr object)

- 도커에 필요한 이미지, 컨테이너, 네트워크, 볼륨, 플로그인 및 기타 개체

- **Images**: 실행 환경 스냅샷(Read-only 템플릿), dockerfile에 정의됨

  - 목록: `docker image ls`

- **Containers**: 이미지를 인스턴스화한 **실행 중(또는 정지) 프로세스**

  - 목록: `docker ps -a`

- **Networks**: 컨테이너 간 통신 가상 네트워크

  - 목록: `docker network ls`

- **Volumes**: 컨테이너 외부에 두는 영속 데이터 저장소

  - 목록: `docker volume ls`

- **Plugins**: 볼륨/네트워크 등 기능 확장(환경에 따라 사용)

  - 목록: `docker plugin ls`

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-1.png)

---

###   도커 엔진

#### 도커 엔진의 기술 변화

- 초기 도커 엔진: 리눅스 컨테이너(LinuX Container, LXC)를 기반으로 작동 → 많은 컨테이너 런타임이 생김 + 표준 인터페이스 존재 x

- 개방형 산업 표준인 OCI(Open Container Initiative) 구성 → 0.9.0 버전부터는 libcontainer OCI 이용

- 1.11.0 이후 버전부터 도커 데몬(dockerd), 컨테이너 데몬(containerd), runC 로 컨테이너 관리

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-2.png)

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-3.png)

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-4.png)

- 컨테이너를 **빌드/실행/배포**하게 해주는 **클라이언트–서버 아키텍처** 런타임 스택

- **dockerd(도커 데몬) + containerd(컨테이너 데몬) + runc**로 이루어진 **컨테이너 런타임 스택**

- **도커 데몬** : 도커 CLI로부터 명령어 처리

- **컨테이너 데몬** : 컨테이너 관리 기능 런타임 툴

- **runC** : 컨테이너 생성 및 종료 수행(호스트OS와 독립적)

핵심 구성:

- **CLI**: `docker ...` 명령 → HTTP over Unix socket로 API 호출

- **Docker daemon** (`dockerd`): 요청 수신·스케줄·이미지/컨테이너 관리

- **containerd / runc**: 실제 컨테이너 생성·수명 주기 관리(OCI 표준)

---

###   이미지 주요 명령어

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-5.png)

```bash
#Dockerfile에서 이미지 빌드(생성)
docker image bulid -t 이미지명[:태그명] Dockerfile경로

# 레지스트리에서 이미지 내려받기
docker [image] pull [OPTIONS] NAME[:Tag|@IMAGE_DIGEST] # Tag: 이미지 버전, @image_digest: 레지스트리에서 관리하는 이미지 고유 식별 값
# pull options: -a(해당 리포지토리의 모든 태그 가져오기), -q(출력 진행 최소화), --platform(특정 플랫폼 이미지)

docker pull debian:10.3
docker pull docker.io/library/debian:latest    # 동일 의미

# 조회/점검
docker image ls                                # 이미지 목록 나열
docker image inspect [OPTIONS] IMAGE[IMAGE]    # 하나 이상의 이미지에 대한 세부 정보 표시(JSON 형식으로 반환)(--format(-f): 지정한 형식의 정보만 출력 가능)
docker image history <IMAGE>                   # 이미지의 기록 표시(레이어별 명령/용량 조회)
docker search                                  # 레지스트리에서 공개 이미지 검색

# 태깅/업로드
docker image tag SOURCE_IMAGE TARGET_IMAGE  #SOURCE_IMAGE를 참조하는 TARGET_IMAGE 태그 생성(이미지 ID 변경 x)
docker login
docker push <REPO>:<TAG>        # 이미지(또는 저장소)를 레지스트리에 업로드

#tarball에서 내용 가져와서 실행중인 컨테이너의 '파일 시스템' 이미지 생성
docker image export -o file_name.tar image_name
docker image import file_name.tar image_name

# 도커 이미지(Image)를 아카이브로 저장/복원
docker image save mysql:5.7 > mysql57.tar      # 도커 이미지 -> tar 파일 저장 ( gzip: tar 파일 용량 줄이기)
docker image load < mysql57.tar                # save한 tar 파일 -> 도커 이미지 불러옴

docker image prune              # 미사용 이미지 제거(-a: + 어떤 컨테이너도 사용하지 않는 이미지 삭제,-f: 확인없이 진행)
docker image rm <IMAGE>         # 실행중이지 않은 특정 이미지 삭제

# 도거 로그인/로그아웃
docker login
Username: 본인 아이디 입력
Password: 본인 암호 입력

docker logout # 도커 데스크탑에도 접속이 해제
```

---

###   시험대비 Q&A

- Q1. `docker pull`과 `docker run`의 관계?

A. `run`은 없으면 자동 pull, 있으면 즉시 컨테이너 생성/실행

- Q2. `inspect`/`history` 차이?

A. `inspect`는 JSON 상세 메타, `history`는 레이어별 생성 명령/용량

---

###   간단한 도커 컨테이너 서비스

#### BusyBox를 이용하여 문자열 “Hello World” 출력하기

- BusyBox: UNIX CLI 유틸리티의 기능을 하나의 실행 파일 안에 통합시킨 소프트웨어

```bash
docker pull busybox                    # 도커 허브 레지스트리에서 제공하는 docker 이미지 다운로드
docker images                          # 내 로컬에 존재하는 모든 도커 이미지들을 조회
docker run busybox echo 'Hello World'  # 이미지로 busybox 컨테이너 실행하고 'Hello World' 출력
docker ps -a                           # 실행 중인 모든 컨테이너 정보 조회
```

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-6.png)

---

###   도커 실행 원리

```bash
docekr -v      # 도커 버전 정보 확인
	Docker version 28.5.1, build e180ab8
docker version # 도커 엔진의 세부 정보 확인
	Client:
 Version:           28.5.1
 API version:       1.51
 Go version:        go1.24.8
 Git commit:        e180ab8
 Built:             Wed Oct  8 12:16:17 2025
 OS/Arch:           darwin/arm64
 Context:           desktop-linux

Server: Docker Desktop 4.49.0 (208700)
 Engine:
  Version:          28.5.1
  API version:      1.51 (minimum version 1.24)
  Go version:       go1.24.8
  Git commit:       f8215cc
  Built:            Wed Oct  8 12:18:25 2025
  OS/Arch:          linux/arm64
  Experimental:     false
 containerd:
  Version:          1.7.27
  GitCommit:        05044ec0a9a75232cad458027ca83437aae3f4da
 runc:
  Version:          1.2.5
  GitCommit:        v1.2.5-0-g59923ef
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

- 도커는 클라이언트와 서버로 구성

- **클라이언트**: 도커 명령을 받고 도커 데몬에 전달 및 결과를 출력

- **서버**: 도커 엔진의 도커 데몬을 이용하여 컨테이너를 운영

---

###   도커 이미지 및 컨테이너 구조

- **이미지** = 레이어 묶음(읽기 전용)

- ex) `docker pull httpd` 출력의 “Pull Complete” 한줄이 한 레이어를 뜻함

- **컨테이너** = 이미지 레이어 + 쓰기 레이어(읽기/쓰기)

- **Union File System** = 여러 레이어를 겹쳐 하나의 파일시스템처럼 보이게 함

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-7.png)

![Docker 아키텍처와 이미지 명령어](/assets/images/posts/docker-architecture-image/docker-architecture-image-8.png)

---

> 💡  학습정리

    -

    -

    -
