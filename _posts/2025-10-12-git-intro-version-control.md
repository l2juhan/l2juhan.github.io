---
title: "Git 소개 및 버전 관리"
date: 2025-10-12
categories: [Software-Engineering]
subcategory: OpenSource
tags: [git, version-control, vcs]
toc: true
toc_sticky: true
---

**개요**

---

##  Git 소개 및 버전 관리

###   Git 소개

- 2005년, 리눅스 창시자 리누스 토발즈가 만듦

- Git은 초기에 리눅스 소스코드를 관리하고 협업하기 위해 제작되었으나, 현재는 소프트웨어 소스코드 및 협업 프로젝트에 사용

---

###   Git & Github

![Git 소개 및 버전 관리](/assets/images/posts/git-intro-version-control/git-intro-version-control-1.png)

---

###   Git 으로 할 수 있는 작업들 (크게 3가지)

- **버전 관리**

- Git은 저장소를 바탕으로 같은 파일명을 가진 소스코드의 버전 관리를 손쉽게 할 수 있음

- 소프트웨어 개발 진행 시에는 중간에 버전 저장이 필수

- 특정 시점의 버전으로 되돌리기 가능

- **백업**

- 예기치 못한 에러나 디스크 장애에 대비 가능

- **협업**

- Github로 여러 명의 개발자가 손쉽게 협업하여 개발 가능

---

###   Git 활용을 위한 기초 리눅스 명령어

- **$pwd**

- 현재 작업 중인 디렉터리명 출력

- **$ls**

- 현재 디렉터리 내 파일 리스트 출력

- `$ls -l` : 상세 정보 출력

- `$ls -a` : 숨겨진 파일 및 디렉터리까지 출력

- `$cd /path`

- 현재 디렉터리 이동

- `$cd ..` : 상위 디렉터리로 이동

- **$mkdir /path**

- 디렉터리 생성

- **$rm file**

- 파일 or 디렉터리 삭제

- **$rm -r directory**: 디렉터리 경우는 -r 옵션으로 삭제

- **$vim file**

- Linux에서 쓰이는 텍스트 에디터

- **i** : 입력모드 (텍스트 수정 가능)

- **Esc** : Ex모드 (커서 이동, 검색, 저장 및 종료 가능)

  - w : 저장

  - q : 에디터 종료 ( q! : 강제종료)

  - wq : 저장 + 종료

- **$nano file**

- 쉬운 터미널 편집기(따로 설치 필요)

- **$cat file**

- 파일 내용 출력

- **$touch file**

- 빈 파일 생성 및 수정시간 갱신

- **$mv a b**

- 이동 및 이름변경

- **$cp a b**

- 파일 복사 (-r 디렉토리)

---

###   Git 저장소

![Git 소개 및 버전 관리](/assets/images/posts/git-intro-version-control/git-intro-version-control-2.png)

#### Working tree (working directory)

- 소스코드를 직접 수정 및 저장하는 디렉터리

#### Stage (Staging area)

- 버전관리를 수행할 대상이 되는 파일들이 모인 공간

- 수정된 부분 중 일부분만 commit 가능

- commit 전 코드 리뷰 및 테스트 용이

#### Repository

- 각 버전이 저장되어 있는 공간

![Git 소개 및 버전 관리](/assets/images/posts/git-intro-version-control/git-intro-version-control-3.png)

![Git 소개 및 버전 관리](/assets/images/posts/git-intro-version-control/git-intro-version-control-4.png)

---

###   git 명령어

```bash
# 0) 최초 설정(1회)
git config --global user.name "Your Name"   # 이름은 영어 사용 권장
git config --global user.email your@mail.com

# 1) 저장소 생성 및 git 연결
mkdir hello-git && cd hello-git
git init                            # .git 이라는 이름의 숨겨진 디렉토리가 생성됨

# 2) 상태/추가/커밋
git status                          # 저장소 상태 확인 가능 (working tree & staging area)
git add cal.py                      # "cal.py" 파일을 working tree -> staging area 로 이동
git commit -m "create cal.py"       # "cal.py" 파일을 staging area -> local repository 로 이동

# 3) 변경 확인
git diff                            # 최신 커밋과 Working tree 차이점 요약 확인
git log                             # 커밋 버전 확인
git reflog                          # reset commit 복구

# 4) Stage 비우기/되돌리기
git restore --staged cal.py         # Staging area -> Working tree 로 되돌림
git reset HEAD cal.py               # 위에 명령과 같은 명령 수행
git checkout -- cal.py              # Working 파일을 마지막 커밋으로 복구(수정 사항 사라짐)
git reset HEAD cal.py

# 5) Git에서 버전 관리
git reset --soft HEAD^              # HEAD 이동 + staging/working 그대로
git reset -- mixed HEAD^            # HEAD 이동 + staging을 HEAD 내용으로 덮음 + working tree 유지 ( == git reset HEAD~1 ), 이게 default
git reset --hard HEAD^              # HEAD 이동 + staging을 HEAD 내용으로 덮음 + working tree 되돌림
git reset --hard <hash code>        # 특정 버전으로 되돌리기
# 6) -a 옵션
git commit -a -m "update a, remove b" # tracked 파일의 변셩, 삭제만 자동 stage, 새 파일은 불가능
```

- `-soft`

- 이동: **HEAD만**

- 인덱스: 유지

- 워킹 트리: 유지

- 효과: “직전 커밋을 안 한 상태(전부 **staged**)”

- 용도: 커밋 메시지 수정, 여러 커밋 스쿼시

전) HEAD=C,  인덱스=C,  워킹트리=C
후) HEAD=B,  인덱스= C, 워킹트리= C   # 인덱스/워킹트리 그대로

- `-mixed` *(기본)*

- 이동: **HEAD+인덱스**

- 워킹 트리: 유지

- 효과: 변경이 **unstaged**로 내려옴

- 용도: 스테이지만 비우고 다시 담기

전) HEAD=C,  인덱스=C,  워킹트리=C

후) HEAD=B, 인덱스=B, 워킹트리=C

- `-hard`

- 이동: **HEAD+인덱스+워킹 트리**

- 효과: 파일까지 **완전히 되돌림**(삭제 위험)

- 용도: 깨끗이 초기화

전) HEAD=C,  인덱스=C,  워킹트리=C

후) HEAD=B, 인덱스=B, 워킹트리=B

#### 시험대비 Q&A

- Q1. Working/Stage/Repo 차이?

A. Working: 수정 중, Stage: 커밋 후보, Repo: 커밋 이력. 커밋은 Stage만 반영

- Q2. 왜 Stage가 필요한가?

A. 변경 중 **일부만 선택 커밋** 및 커밋 전 **테스트/검토**에 유리

- Q3. `git diff`와 `git log` 차이?

A. diff: 현재 변경점 요약 / log: 커밋 이력(해시/작성자/메시지)

- Q4. `git reset --hard` 위험한 이유?

A. 지정 커밋으로 **작업트리까지** 덮어쓰므로 이후 변경 손실 가능, reflog로 복구 시도 가능

---

> 💡  학습정리

    -

    -

    -
