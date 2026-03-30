---
layout: post
title: "Dockerfile and GitHub Sharing — 도커 파일과 깃허브를 이용한 파일 공유"
date: 2026-03-30
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, dockerfile, build, buildkit, optimization, github, dockerhub]
description: "Dockerfile 명령어(FROM/RUN/COPY/CMD/ENTRYPOINT 등), 빌드, 최적화, GitHub/DockerHub를 통한 공유"
---

도커 이미지를 수동으로 만드는 것은 반복적이고 실수하기 쉽다. Dockerfile은 이미지 생성 과정을 **코드로 정의**하여 자동화된 빌드를 가능하게 한다.

## Dockerfile이란?

Dockerfile은 도커 이미지를 생성하기 위한 **스크립트**이다. `docker build` 명령을 통해 Dockerfile에 작성한 명령을 순서대로 읽으며 자동으로 이미지를 빌드한다. 이미지 빌드는 사용자와의 대화식 처리가 아닌 **자동화 빌드**이다.

## Dockerfile 명령어

### FROM — 기본 이미지 정의

```dockerfile
FROM <image>
```

도커 파일에는 일반적으로 `FROM` 명령부터 작성하며, 이후 수정 빈도수가 적은 명령부터 배치하는 것을 권장한다. 도커 허브에서 제공하는 공식 이미지를 권장하며, 일반적으로 작은 크기의 이미지(**slim**)와 리눅스 배포판인 **알파인(Alpine)** 이미지를 권장한다. 태그를 넣지 않으면 `latest`로 지정된다.

```dockerfile
FROM ubuntu:20.04
FROM python:3.9-slim-buster
FROM mongo:4.4.4-bionic
```

### RUN — 명령 실행

```dockerfile
RUN <command>
```

설정된 기본 이미지에 패키지 업데이트, 각종 패키지 설치, 명령 실행 등을 작성하며, 1개 이상 작성 가능하다.

```dockerfile
RUN apt update
RUN apt -y install nginx git vim curl
```

RUN 명령은 **Shell 방식**과 **Exec 방식** 두 가지로 작성할 수 있다:

```dockerfile
# Shell 방식 — 셸을 통해 실행
RUN apt update && apt install -y nginx git vim curl && \
    apt-get clean -y && \
    apt-get autoremove -y && \
    rm -rfv /tmp/* /var/lib/apt/lists/* /var/tmp/*

# Exec 방식 — 배열 형태로 명령어
RUN ["/bin/bash", "-c", "apt -y install nginx git vim curl"]
```

### WORKDIR — 작업 디렉터리 전환

```dockerfile
WORKDIR <directory>
```

컨테이너상에서 작업할 경로(디렉터리) 전환을 위해 작성한다. `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD` 명령은 해당 디렉터리를 기준으로 실행된다. 지정한 경로가 없으면 자동으로 생성된다.

```dockerfile
WORKDIR /workspace
WORKDIR /usr/share/nginx/html
WORKDIR /a
WORKDIR b
WORKDIR c        # 최종 WORKDIR는 /a/b/c
```

### COPY — 파일 복사

```dockerfile
COPY <src> <dest>
```

호스트 환경의 파일이나 디렉터리를 이미지 안에 복사한다. WORKDIR 외부의 파일은 복사할 수 없다.

```dockerfile
COPY index.html /usr/share/nginx/html
COPY ./runapp.py /
```

### ADD — 파일 추가

```dockerfile
ADD <src> <dest>
```

`COPY`와 비슷하지만 추가 기능을 제공한다. **URL에서 직접 다운로드**하여 이미지에 추가 가능하며, **압축 파일(tar, tar.gz)**인 경우 압축을 해제하여 이미지에 추가한다.

```dockerfile
ADD index.html /usr/share/nginx/html
ADD http://example.com/view/customer.tar.gz /workspace/data/
ADD website.tar.gz /var/www/html
```

### EXPOSE — 포트 정의

```dockerfile
EXPOSE port_number[/protocol]
```

호스트 네트워크를 통해 들어오는 트래픽을 수신하는 컨테이너의 포트와 프로토콜을 정의한다. Docker run 사용 시 `-p` 옵션을 통해 사용한다.

```dockerfile
EXPOSE 80
EXPOSE 80/tcp
EXPOSE 443
EXPOSE 8080/udp
```

### CMD — 실행 명령 정의

```dockerfile
CMD <command>
```

해당 이미지를 기반으로 컨테이너가 실행될 때 수행할 명령 및 인자(arguments)를 정의한다. **여러 개의 CMD를 작성해도 마지막 하나만 처리된다.**

```dockerfile
# Shell 방식
CMD apachectl -D FOREGROUND

# Exec 방식
CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]
CMD ["nginx", "-g", "daemon off;"]
CMD ["python", "app.py"]
```

### ENTRYPOINT — 실행 진입점 정의

```dockerfile
ENTRYPOINT <command>
```

CMD와 유사하게, 생성된 이미지를 기반으로 컨테이너가 실행될 때 수행할 명령 및 인자를 전달하여 실행한다. 컨테이너를 실행 파일로 사용할 때 ENTRYPOINT를 정의해야 한다.

```dockerfile
ENTRYPOINT ["npm", "start"]
ENTRYPOINT ["python", "runapp.py"]
```

### CMD vs ENTRYPOINT

도커 파일은 `CMD` 또는 `ENTRYPOINT` 명령 중 적어도 하나는 명시해야 한다. 동시에 사용할 경우:

- **ENTRYPOINT**: 실행할 프로그램을 정함
- **CMD**: 프로그램에 전달할 기본 인자(arg)를 정함

```dockerfile
ENTRYPOINT ["python"]
CMD ["runapp.py"]          # docker run 시 다른 인자로 대체 가능
```

## Dockerfile 빌드

`docker build` 명령을 사용하여 도커 파일로부터 이미지를 생성한다.

```bash
$ docker build [옵션] 이미지명[:태그] 경로|URL|압축파일(tar|tar.gz)
```

주로 사용하는 두 가지 옵션:

- `-t (tag)`: "이미지명:태그"를 지정하는 경우
- `-f (file)`: Dockerfile이 아닌 다른 파일명을 사용하는 경우

```bash
$ docker build -t mypyapp:1.0 .          # 현재 디렉터리의 Dockerfile 사용
$ docker build -t nginx:1.18 -f Dockerfile_nginx .
```

### 빌드 라이프사이클 예시

Python이 설치된 이미지를 생성하는 과정:

```dockerfile
# Dockerfile 초기 버전 (실패)
FROM ubuntu:18.04
RUN apt-get install python
```

이 상태로 빌드하면 `Unable to locate package python` 에러가 발생한다. Ubuntu 기반의 이미지를 생성하는 경우, 반드시 **`apt-get update`**(또는 `apt update`)를 포함해야 한다.

```dockerfile
# 수정 1: apt-get update 추가 (실패)
FROM ubuntu:18.04
RUN apt-get update
RUN apt-get install python
```

패키지 설치 시 `-y` 옵션을 사용하지 않으면 대화형으로 확인을 요구하여 자동화 빌드에서 강제 종료(abort)된다.

```dockerfile
# 수정 2: -y 옵션 추가 (성공)
FROM ubuntu:18.04
RUN apt-get update
RUN apt-get install python -y
```

## Buildkit

도커 18.09 버전에 **Buildkit**이 추가되어 이미지 빌드에 향상된 기능을 제공하기 시작하여, 도커 20.10버전부터 안정화되었다.

Buildkit 기능:

- 빌드 과정을 **병렬 처리**하여 더 빠른 빌드를 제공
- 사용되지 않는 빌드 단계를 찾아 **비활성화**
- 비밀번호 등의 민감한 데이터가 포함되는 경우, 비밀(**secret**) 구축이 가능
- 빌드 중 빌드 정보에 따라 **변경된 파일만 전송**
- 자동 빌드 시, 빌드 **캐시의 우선순위**를 정함

```bash
$ DOCKER_BUILDKIT=1 docker build -t mypyapp:1.0 .
```

## Dockerfile 최적화

Dockerfile에 정의된 모든 명령이 레이어가 되는 것은 아니다. `FROM`, `RUN`, `ADD`, `COPY` 명령은 레이어로 저장되고, `CMD`, `LABEL`, `ENV`, `EXPOSE` 등과 같이 메타 정보를 다루는 명령은 저장되지 않는 임시 레이어로 생성되어 도커 이미지 용량에 영향을 주지 않는다.

**최적화 1**: FROM 명령에 있는 Ubuntu 대신 **알파인 리눅스(alpine linux)**와 같이 용량이 작은 리눅스를 선택 → 경량 이미지 사용으로 빌드 속도 향상

**최적화 2**: COPY 명령은 RUN 명령을 사용한 파이썬과 파이프(pip)와 같은 패키지 종속성 설치 이후에 작성 → 만약 COPY 명령이 수정되면, 그 이후의 모든 레이어의 빌드 캐시는 무효화되므로 다시 레이어 빌드가 발생. COPY 위치를 조정하여 빌드 속도를 최적화한다.

```dockerfile
# 최적화 전
FROM ubuntu:20.04
COPY app.py /app
RUN apt-get update && apt-get -y install python python-pip
RUN pip install -r requirements.txt
CMD python /app/app.py

# 최적화 후
FROM python:3.9.2-alpine
RUN apt-get update && apt-get -y install python python-pip
RUN pip install -r requirements.txt
COPY app.py /app                    # COPY를 뒤로 이동
CMD python /app/app.py
```

## GitHub를 이용한 Dockerfile 공유

Dockerfile을 GitHub 저장소에 올려 다른 개발자와 공유할 수 있다. GitHub에 Dockerfile이 포함된 저장소 URL을 제공하면 `docker build` 명령에서 직접 사용 가능하다.

Docker Hub에서도 이미지를 공유할 수 있다:

```bash
$ docker login                           # Docker Hub 로그인
$ docker tag 이미지명:태그 사용자명/이미지명:태그   # 태그 설정
$ docker push 사용자명/이미지명:태그              # Docker Hub에 업로드
```

Docker Hub에 업로드된 이미지는 다른 사용자가 `docker pull`로 다운로드할 수 있다. GitHub에서 Dockerfile을 공유하면 이미지 빌드 과정이 투명해지고, Docker Hub에서 이미지를 공유하면 빌드 없이 바로 사용 가능하다는 차이가 있다.
