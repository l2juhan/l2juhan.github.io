---
title: "Dockerfile과 GitHub를 이용한 파일 공유"
date: 2025-10-13
categories: [Software-Engineering]
subcategory: OpenSource
tags: [docker, dockerfile, github, image-build]
toc: true
toc_sticky: true
---

**개요**

---

##  Dockerfile과 GitHub를 이용한 파일 공유

###   Dockerfile 핵심 명령어

- 수정 빈도수가 적은 명령부터 배치하는 것을 권장 + 도커 허브에서 제공하는 공식 이미지 권장

#### FROM 명령어

- 기본 이미지 정의

- 도커 허브에서 제공하는 공식 이미지 권장

- slim(작은 크기의 이미지) / Alpine(리눅스 배포판) 권장

```docker
FROM ubuntu:20.04
FROM python:3.9-slim-buster
FROM mongo:4.4.4-bionic
```

#### RUN 명령어

- 설정된 기본 이미지에 패키지 업데이트, 패키지 설치, 명령 실행 등을 작성 가능

1. **Shell 방식**

```docker
RUN apt update && apt install -y nginx git vim curl && \
apt-get clean -y && \
apt-get autoremove -y && \
rm -rfv /tmp/* /var/lib/apt/lists/* /var/tmp/*
```

1. **Exec 방식**

```docker
RUN [“/bin/bash”, “-c”, “apt update”]
RUN [“/bin/bash”, “-c”, “apt -y install nginx git vim curl”]
```

#### WORKDIR 명령어

- 컨테이터상에서 작업할 디렉터리 전환을 위해 작성

- 지정한 경로가 없으면 자동 생성

```docker
WORKDIR /workspace
WORKDIR /usr/share/nginx/html
WORKDIR /go/src/app
WORKDIR /a
WORKDIR b WORKDIR c      # b,c 는 상대 경로 (a/b/c)
```

#### COPY 명령어

- 호스트 환경의 파일이나 디렉터리를 이미지 안에 복사

- context 외부 파일은 복사 x

```docker
COPY <src> <dest>
COPY index.html /usr/share/nginx/html
```

```docker
project/
 ├─ app/           # 여기를 컨텍스트로 보냄
 │   ├─ Dockerfile
 │   ├─ package.json
 │   └─ .dockerignore  # node_modules 등 제외
 └─ secrets/      # 컨텍스트 밖

# 컨텍스트 = ./app
cd project
docker build -t myapp ./app

# Dockerfile 내부
WORKDIR /app
COPY package.json .        # OK: 컨텍스트 내부
COPY ../secrets/key /key   # 오류: 컨텍스트 밖

```

#### ADD 명령어

- 호스트 환경의 파일이나 디렉터리를 이미지 안에 복사 + URL 주소에서 직접 다운하여 이미지에 추가

- 압축파일(tar,tar.gz) 경우, 압축을 해제하여 이미지에 추가

```docker
ADD <src> <dest>
ADD http://example.com/view/customer.targz /workspace/data/
```

#### EXPOSE 명령어

- 호스트 네트워크를 통해 들어오는 트래픽을 수신하는 컨테이너의 포트와 프로토콜 정의

```docker
EXPOSE port_number[/protocol]
EXPOSE 80/tcp
```

#### CMD 명령어

- 해당 이미지를 기반으로 컨테이너가 실행될 때, 기본으로 수행할 명령 및 인자 정의(≠alias)(명령 실행)

- 여러개의 CMD를 작성해도 마지막 하나만 처리됨

```docker
# Shell 방식
CMD apachectl -D FOREGROUND
# Exec 방식
CMD ["usr/sbin/apachectl", "-D", "FOREGROUND"]
```

#### ENTRYPOINT 명령어

- CMD와 유사하게 생성된 이미지를 기반으로 컨테이너가 실행될 때, 수행할 명령 및 인자를 전달하여 실행(프로그램 실행)

- 컨테이너를 실행 파일로 사용할 때 ENTRYPOINT를 정의해야함

```docker
ENTRYPOINT ["npm", "start"]
```

#### CMD 와 ENTRYPOINT 차이

- 적어도 하나는 명시해야 함(?)

- CMD, ENTRYPOINT 동시에 사용 시

- **ENTRYPOINT**: 실행할 프로그램을 정함

- **CMD**: 프로그램에 전달한 기본 arg(인자)를 정함

```docker
ENTRYPOINT ["python"]
CMD ["runapp.py"]
```

---

###   도커 파일 빌드

#### Docker build

- 도커 파일로부터 이미지 생성

- OPTIONS

- -**t(tag)**: ‘이미지명:태그’ 지정

- **-f(file)**: Dockerfile이 아닌 다른 파일명 사용하는 경우

- **IMAGE:[TAG]**

- 버전 관리 차원

- **경로**

- Dockerfile이 있는 경로(path) 작성

- **URL**

- Dockerfile이 포함된 Github URL 경로

- **압축 파일**

- 압축 파일 내에 Dockerfile이 존재할때

```docker
Docker build [OPTIONS]IMAGE[:TAG]경로|URL|압축파일
docker build -t nginx:1.18
```

---

###   도커 파일 작성 라이프사이클

Docker build → Dockerfile에 작성한 명령을 순서대로 읽으며 자동으로 이미지를 빌드(대화식 처리x, 자동화 빌드)

- 예시) 파이썬이 설치된 이미지 생성

```bash
mkdir python_lab
cd python_lab
vi Dockerfile
----------------------------
#Dockerfile 내용             |
FROM ubuntu:18.04           |
RUN apt-get install python  |
----------------------------
docker build -t mypyapp:1.0      # Error -> Ubuntu 기반의 이미지는 반드시 apt-get update를 포함해야함
vi Dockerfile
----------------------------
#Dockerfile 내용             |
FROM ubuntu:18.04           |
RUN apt-get update          |
RUN apt-get install python  |
----------------------------
docker build -t mypyapp:1.0      # Error -> 패키지 설치 시, -y 옵션을 사용하지 않으면 강제 종료됨
vi Dockerfile
-------------------------------
#Dockerfile 내용               |
FROM ubuntu:18.04             |
RUN apt-get update            |
RUN apt-get install python -y |
------------------------------
docker build -t mypyapp:1.0      # 정상적으로 빌드 완료!
```

---

###   Buildkit 소개

- 이미지 빌드에 향상된 기능을 제공

#### Buildkit 기능

- 빌드 과정 병렬 처리(빠른 빌드 제공)

- 사용하지 않는 빌드 단계 비활성화

- 민감한 데이터 비밀구축 가능(보완 강화)

- 빌드 중 빌드 정보에 따라 변경된 파일만 전송(file 전송 호율적)

- 자동 빌드시, 빌드 캐시의 우선순위를 정함(캐시 최적화)

---

###   빌드/실행/최적화

1. FROM 명령에 있는 Ubuntu 대신 알파인 리눅스와 같은 용량이 작은 리눅스 선택 → 빌드 속도 향상 (경량 이미지 사용)

1. COPY 명령은 RUN 명령을 사용한 파이썬과 pip와 같은 패키지 종속성 설치 이후에 작성 → 만약 COPY 명령이 수정되면, 그 이후에 모든 레이어의 빌드 캐시는 무효화되므로 레이어 빌드가 발생

```docker
# 최적화 전 Dockerfile 코드
FROM ubuntu:20.04
COPY app.py /app
RUN apt-get update && apt-get -y install python python-pip
RUN pip install -r requirements.txt
CMD pyhton /app/app.py
```

```docker
# 최적화 후 Dockerfile 코드
FROM python:3.9.2-alpine
RUN apt-get update && apt-get -y install python python-pip
RUN pip install -r requirements.txt
COPY app.py /app
CMD pyhton /app/app.py
```

---

###   실습 — 셸 스크립트를 이용한 환경 구성

```docker
# 베이스 이미지 작성
FROM ubuntu:18.04
# 아파치2 패키지 설치
RUN apt-get update && \
	apt-get -y install apache2
# 웹 기본 페이지 생성
RUN echo 'Docker Container Application.' > /var/www/html/index.html
# 필요한 작업 경로 생성
RUN mkdir /webapp
# 아파치2에 필요한 환경변수, 디렉터리, 서비스 실행 등의 정보를 셸 스크립트에 작성하고 권한 부여
RUN .....
# 80 포트 오픈
EXPOSE 80
# RUN 명령어로 작성된 셸 스크립트를 컨테이너가 동작할 때 실행
CMD /webapp/run http.sh
```

---

> 💡  학습정리

    -

    -

    -
