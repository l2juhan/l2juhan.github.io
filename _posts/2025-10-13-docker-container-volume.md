---
title: "Docker 컨테이너 명령어와 볼륨"
date: 2025-10-13
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, container, volume, mount]
toc: true
toc_sticky: true
---

**개요**

---

##  Docker 컨테이너 명령어와 볼륨

###   컨테이너란?

- 이미지의 읽기 전용 레이어의 복사본(스냅샷) 위에 **쓰기 가능한 레이어**를 얹어 실행되는 **격리된 프로세스**

- docker run → 커널 기능(chroot/pid namespace/cgroup)로 파일시스템·PID·네트워크·자원 격리

![Docker 컨테이너 명령어와 볼륨](/assets/images/posts/docker-container-volume/docker-container-volume-1.png)

---

###   컨테이너 기본 명령

```bash
# 생성/시작/접속/정지/삭제
docker create [OPTIONS]IMAGE[COMMAND][ARG...]  # 만약 도커 이미지가 로컬에 존재하지 않으면, 도커 허브에서 자동으로 다운로드
docker create -it --name c1 ubuntu:14.04

docker start[OPTIONS]CONTAINER[CONTAINER...]
docker start c1


docker attach [OPTIONS]CONTAINER[CONTAINER..]
docker attach c1     # 실행 중인 컨테이너에 표준 입력, 출력, 에러 스트림을 연결

docker stop[OPTIONS]CONTAINER[CONTAINER...]
docker stop c1
docker rm c1

# 한 번에 실행(run = create + start)
docker run[OPTIONS]IMAGE[COMMAND][ARG...]
docker run -it --name c1 ubuntu:14.04 bash

# 상태/모니터링/로그
docker ps [-a]
docker top c1      # 컨테이너 내부에서 실행 중인 프로세스 표시
docker stats c1    # 컨테이너 리소스 사용량 실시간 확인
docker logs -f c1  # 컨테이너 접근 로그를 도커 명령을 통해 확인
```

---

###   도커의 데이터 관리

#### cAdvisor

- 구글에서 제공하는 컨테이너 모니터링 도구

#### Nginx(엔진엑스)

- 웹 서버용 오픈 소스 소프트웨어

```bash
dodcker pull nginx
docker run --name webserver1 -d -p 8001:80 nginx:latest
sudo apt install net-tools    # Linux를 위한 기본 네트워킹 유틸리티 집합 설치
sudo netstat -nlp|grep 8001   # Host의 8001 포트가 열린 것을 확인
curl localhost:8001
docker pause webserver1       # 지정된 컨테이너 내부의 모든 프로세스 일시 중단
docker unpause webserver1     # 컨테이너 내부에 정지되었던 모든 프로세스를 재개
docker restart webserver1     # 기존 컨테이너 프로세스 정지 후 새로운 컨테이너 프로세스 시작

```

#### 유니언 파일 시스템(Union File System, UFS)

- 여러개의 디렉토리 or 파일 시스템을 겹쳐서 하나의 파일 시스템처럼 보이도록 하는 기술

- 새로운 컨테이너가 생성될 때, 이미지 레이어의 꼭대기에 새로운 쓰기 가능한 레이어(컨테이너 레이어)가 추가됨

![Docker 컨테이너 명령어와 볼륨](/assets/images/posts/docker-container-volume/docker-container-volume-2.png)

#### **쓰기 가능한 레이어의 한계**

- 컨테이너가 존재하지 않으면, 데이터는 유지 x

- 데이터를 다른 곳으로 쉽게 이동할 수 없음

#### 도커 볼륨(volume)

- 재사용 가능

- 컨테이너들 간 데이터 공유 가능

- 호스트 운영체제에서 직접 접근 가능

- 데이터 영속성 메커니즘

#### 도커 볼륨 타입

- **volume**

- 도커가 관리하는 호스트 파일 시스템의 일부에 저장(도커가 아닌 프로세스는 수정x)

- 여러 컨테이너에서 동시에 mount 가능(데이터 공유 가능)

- **bind mount**

- 호스트 파일시스템의 어느 곳에나 저장 가능(도커가 아닌 프로세스도 파일 수정 가능)

- [호스트 파일 시스템 절대경로]:[컨테이너 내부 경로]

- **tmpfs(temporary filesystem) mount**

- 호스트 메모리에 데이터 저장(휘발성)

![Docker 컨테이너 명령어와 볼륨](/assets/images/posts/docker-container-volume/docker-container-volume-3.png)

---

###   시험대비 Q&A

- Q1. `run`과 `create+start` 차이?

A. `run`은 둘을 합친 명령

- Q2. 데이터 영속을 위해 무엇을 써야 하나?

A. Volume/Bind(영속), tmpfs(휘발)

- Q3. `pause/unpause`와 `restart` 차이?

A. `pause`는 프로세스 일시중단/재개, `restart`는 정지 후 새 PID로 재시작

---

> 💡  학습정리

    -

    -

    -
