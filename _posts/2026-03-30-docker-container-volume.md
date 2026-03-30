---
layout: post
title: "Docker Container and Volume — 도커 컨테이너 명령어와 볼륨"
date: 2026-03-30
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, container, volume, nginx, cadvisor, lifecycle]
description: "도커 컨테이너의 동작 원리, 실행/제어/모니터링 명령어, 볼륨을 이용한 데이터 영속화 정리"
---

컨테이너는 이미지를 실행한 인스턴스이다. 하지만 컨테이너가 제거되면 내부 데이터가 모두 사라진다. 컨테이너의 생명주기를 이해하고 볼륨(Volume)을 활용하여 데이터를 영속화하는 방법을 다룬다.

## 도커 컨테이너

**컨테이너**는 읽기 전용 이미지 레이어의 복사본(스냅숏) 위에 **읽기/쓰기 가능한 레이어**를 추가하여 생성되고, 가상의 격리된 공간에서 독립된 프로세스가 동작하는 기술이다.

![Image 레이어와 Container 구조](/assets/images/posts/docker-container-volume/docker-container-volume-1.png)

- 프로세스 격리 기술(chroot, namespace, cgroup) 이용
- 마치 독립된 호스트 운영체제가 동작하는 것과 유사

`docker run`을 수행하면 다음과 같이 컨테이너가 동작한다:

1. **PID 네임스페이스** 커널 기능을 통해, 시스템의 1번 프로세스(init)의 PID를 공유하고 그 하위로 프로세스를 격리 (호스트와 컨테이너의 PID 공간을 분리하는 역할)
2. **chroot(change root)** 커널 기능을 통해, 격리된 프로세스를 루트로 변경하여 독립된 1번 PID를 갖음 (root 디렉터리를 컨테이너 전용 파일 시스템으로 변경하여 독립된 환경처럼 보이게 해줌)
3. **cgroup(control group)** 커널 기능을 통해, 컨테이너 동작 시 필요한 자원(CPU, Memory, Disk I/O 등)을 할당 받음

## 도커 컨테이너 명령어

![도커 컨테이너 명령어 흐름도](/assets/images/posts/docker-container-volume/docker-container-volume-2.png)

### 컨테이너 생성 및 실행

| 명령 | 설명 | 사용법 |
|------|------|-------|
| `create` | 이미지로부터 새로운 컨테이너를 생성 (실행하지 않음) | `docker create [OPTIONS] IMAGE [COMMAND]` |
| `start` | 정지된 컨테이너를 실행 | `docker start [OPTIONS] CONTAINER` |
| `stop` | 실행 중인 컨테이너를 정지 | `docker stop [OPTIONS] CONTAINER` |
| `attach` | 실행 중인 컨테이너에 표준 입출력 연결 | `docker attach [OPTIONS] CONTAINER` |
| `rm` | 정지된 컨테이너를 삭제 | `docker rm [OPTIONS] CONTAINER` |
| `run` | 이미지로부터 컨테이너를 **생성 및 실행** (create + start) | `docker run [OPTIONS] IMAGE [COMMAND]` |

`create`는 컨테이너를 생성만 하고, `start`로 실행해야 한다. 반면 `run`은 create + start를 한번에 처리하는 명령이다.

만약 도커 이미지가 로컬에 존재하지 않으면, Docker Hub에서 자동으로 다운로드한다.

```bash
# create + start 방식
$ docker create -it --name container-test1 ubuntu:14.04
$ docker start container-test1
$ docker attach container-test1    # 컨테이너 셸에 접속

# run 방식 (위와 동일한 결과)
$ docker run -it --name container-test1 ubuntu:14.04 bash
```

### 주요 옵션

| 옵션 | 설명 |
|------|------|
| `-i` | 표준 입력(stdin) 활성화 |
| `-t` | TTY 모드 사용 (셸 사용 시 필수) |
| `-it` | `-i`와 `-t`를 함께 사용 |
| `--name` | 컨테이너 이름 지정 |
| `-d` | 백그라운드(detach) 모드로 실행 |
| `-p` | 포트 매핑 (호스트포트:컨테이너포트) |
| `--volume` | 볼륨 마운트 |

### 컨테이너 상태 확인

```bash
$ docker ps              # 실행 중인 컨테이너 목록
$ docker ps -a           # 모든 컨테이너 목록 (정지 포함)
```

`docker ps` 출력에는 CONTAINER ID, IMAGE, COMMAND, CREATED, STATUS, PORTS, NAMES가 표시된다. `attach`로 컨테이너에 접속한 후 `exit`를 입력하면 컨테이너가 **정지** 상태가 된다.

### 컨테이너 제어

| 명령 | 설명 |
|------|------|
| `stop` | 컨테이너 정지 (SIGTERM → SIGKILL) |
| `pause` | 컨테이너 일시 중지 |
| `unpause` | 일시 중지된 컨테이너 재개 |
| `restart` | 컨테이너 재시작 |
| `kill` | 컨테이너 강제 종료 (SIGKILL) |
| `rm` | 정지된 컨테이너 삭제 |

### 컨테이너 모니터링

| 명령 | 설명 |
|------|------|
| `inspect` | 컨테이너 상세 정보 표시 |
| `ps` | 실행 중인 컨테이너 목록 |
| `logs` | 컨테이너 로그 출력 |
| `top` | 컨테이너 내부 프로세스 목록 |
| `stats` | 컨테이너 리소스 사용 통계 |

### 컨테이너 이미지 변환

| 명령 | 설명 |
|------|------|
| `commit` | 현재 상태를 기반으로 새로운 이미지 생성 |
| `export` | 실행 중 또는 종료된 컨테이너의 File System 전체를 아카이브로 보냄 |
| `import` | 아카이브를 읽어서 새로 이미지 생성 (단, 컨테이너의 실행상태는 이동 불가) |

## 컨테이너 모니터링 도구 — cAdvisor

Metric(CPU, 메모리 사용률, 네트워크 트래픽 등)을 모니터링하면서 특이사항이 있을 때 대응하기 위해 모니터링을 수행한다. 그러나 컨테이너라는 환경에서 기존 모니터링 도구로는 container 모니터링 진행이 어렵다.

이러한 문제점을 해결하고 컨테이너를 모니터링하기 위한 도구로 구글에서 제공하는 **cAdvisor(Container Advisor)**를 많이 사용한다.

```bash
$ docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:rw \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=9559:8080 \
  --detach=true \
  --name=cadvisor \
  google/cadvisor:latest
```

실행 후 `localhost:9559`에 접속하면 현재 구동 중인 컨테이너들의 ID를 확인하고 모니터링할 수 있다.

## 웹 서비스 실행 — Nginx 컨테이너

**Nginx(엔진엑스)**는 웹 서버용 오픈 소스 소프트웨어이다. 웹 서버, HTTP 프록시, 메일 프록시 기능을 가지며, 각 기능은 모듈화되어 있어 효율적인 운영이 가능하다.

```bash
$ docker pull nginx:1.18
$ docker run --name webserver1 -d -p 8001:80 nginx:1.18
```

`-p 8001:80`은 호스트의 8001번 포트를 컨테이너의 80번 포트에 매핑하겠다는 의미이다. 실행 후 `curl localhost:8001`로 접속 테스트가 가능하다.

### exec 명령으로 컨테이너 내부 접속

`docker exec` 명령으로 실행 중인 컨테이너에서 새로운 프로세스를 실행할 수 있다.

```bash
$ docker exec -it webserver1 bash         # bash 셸로 접속
$ docker exec webserver1 cat /etc/hostname # 단일 명령 실행
```

`attach`와의 차이: `exec`는 새로운 프로세스를 시작하므로 `exit`해도 컨테이너가 정지되지 않는다. `attach`는 기존 프로세스에 연결하므로 `exit` 시 컨테이너가 정지될 수 있다.

## 도커 볼륨(Volume)

컨테이너가 삭제되면 내부 데이터가 모두 사라진다. 데이터를 영속적으로 보존하려면 **볼륨(Volume)**을 사용해야 한다.

### 볼륨의 종류

| 유형 | 설명 | 사용법 |
|------|------|-------|
| **Volume** | 도커가 관리하는 영역에 저장 | `--volume 볼륨명:컨테이너경로` |
| **Bind Mount** | 호스트의 특정 경로를 직접 마운트 | `--volume 호스트경로:컨테이너경로` |

### Volume 사용

```bash
$ docker volume create my-volume         # 볼륨 생성
$ docker volume ls                       # 볼륨 목록 확인
$ docker volume inspect my-volume        # 볼륨 상세 정보

$ docker run -it --name vol-test \
  --volume my-volume:/app \
  ubuntu:14.04 bash
```

볼륨은 컨테이너가 삭제되어도 데이터가 유지된다. 여러 컨테이너에서 동일한 볼륨을 공유할 수도 있다.

### Bind Mount 사용

```bash
$ docker run -it --name bind-test \
  --volume /home/user/data:/app \
  ubuntu:14.04 bash
```

호스트의 `/home/user/data` 디렉터리가 컨테이너의 `/app`에 직접 마운트된다. 호스트에서 파일을 수정하면 컨테이너 내부에도 즉시 반영된다.

### Volume vs Bind Mount

| 구분 | Volume | Bind Mount |
|------|--------|------------|
| 관리 주체 | Docker가 관리 | 사용자가 직접 관리 |
| 저장 위치 | Docker 영역 (`/var/lib/docker/volumes/`) | 호스트 파일 시스템 어디든 |
| 이식성 | 높음 | 호스트 경로에 의존 |
| 권장 상황 | 데이터 영속화 | 개발 시 소스 코드 마운트 |
