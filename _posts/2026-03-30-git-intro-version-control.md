---
layout: post
title: "Git Introduction — Git 소개 및 버전 관리"
date: 2026-03-30
categories: [Software-Engineering]
subcategory: OpenSource
tags: [git, version-control, cli, staging, commit]
description: "Git의 개념, 기초 리눅스 명령어, Working tree/Stage/Repository 구조, 버전 관리 흐름 정리"
---

코드를 수정하다 보면 이전 상태로 되돌리고 싶은 순간이 반드시 온다. 새로 추가한 기능이 제대로 동작하지 않거나, 예기치 못한 버그가 발생하는 경우가 대표적이다. `main_1.cpp`, `main_2.cpp`, `main_final.cpp` 식으로 파일을 복사해두는 것은 규모가 커지면 한계가 있다. Git은 이 문제를 체계적으로 해결하는 도구이다.

## Git이란?

Git은 **오픈소스 분산 버전 관리 시스템(DVCS)**의 일종이다. 2005년에 리눅스의 창시자인 **Linus Torvalds**에 의해 제작되었다. 처음에는 리눅스 소스코드를 효율적으로 관리하고 협업하기 위해 만들어졌으나, 현재는 수많은 소프트웨어들의 소스코드 및 협업 프로젝트가 Git에 의해 관리되고 있다.

소규모 프로젝트부터 대규모 프로젝트까지도 효율적으로 관리 가능하다.

### Git vs GitHub

| 구분 | Git | GitHub |
|------|-----|--------|
| 유형 | 소프트웨어 | 웹 서비스 |
| 환경 | 로컬 환경에 설치하여 사용 | 웹 상에서 활용 |
| 역할 | 저장소를 바탕으로 소스 코드를 관리하기 위한 소프트웨어 | Git 저장소에 대한 호스팅 서비스 |
| 인터페이스 | CLI 환경에서 동작 | GUI 환경에서 동작 |

Git은 로컬에서 동작하는 버전 관리 소프트웨어이고, GitHub는 Git 저장소를 클라우드에 호스팅하는 서비스이다. Git으로 관리하는 저장소를 GitHub에 올려서 백업하거나 다른 개발자와 협업할 수 있다.

## Git으로 할 수 있는 작업

Git을 이용하여 크게 세 가지 작업을 수행할 수 있다.

- **버전 관리**: 같은 파일명을 가진 소스코드를 여러 시점에서의 버전으로 저장 가능하다. 누가, 언제, 무엇을 고쳤는지가 기록에 남으며 특정 시점의 버전으로 되돌릴 수 있다.
- **백업**: 문서 작업 시에 에러나 디스크 장애에 대비해 백업이 필수적이다. Git의 경우에는 GitHub를 주로 활용한다.
- **협업**: GitHub를 활용하면 여러 명의 개발자가 손쉽게 협업하여 소프트웨어 개발을 진행할 수 있다. 원격 저장소 하나에서 전체 소스코드 및 관련 파일들을 관리하므로 여러 개발자들이 하나의 저장소에 접근하여 최신 코드를 바탕으로 작업 가능하다.

## 기초 리눅스 명령어

Git은 CLI 환경에서 동작한다. Git Bash(Windows) 또는 터미널(Mac/Linux)에서 사용하며, 기본적인 리눅스 명령어를 알아야 한다.

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `pwd` | 현재 작업 중인 디렉터리 경로 출력 | `$ pwd` |
| `ls` | 현재 디렉터리 내 파일 리스트 출력 | `$ ls -la` |
| `cd` | 디렉터리 이동 | `$ cd Documents` |
| `mkdir` | 디렉터리 생성 | `$ mkdir test` |
| `rm` | 파일/디렉터리 삭제 | `$ rm -r test` |
| `vim` | VIM 에디터로 파일 생성/수정 | `$ vim test.txt` |
| `cat` | 파일 내용 출력 | `$ cat test.txt` |

- `~`는 홈 디렉터리를 나타낸다
- `..`은 상위 디렉터리를 나타낸다
- `ls -l` 옵션은 상세 정보 출력, `-a` 옵션은 숨겨진 파일 및 디렉터리까지 출력한다

### VIM 에디터 기본 사용법

- `i`를 누르면 입력 모드로 바뀌고 텍스트 수정 가능 (하단에 `-- INSERT --` 표시)
- 입력 모드에서 `Esc`를 누르면 Ex 모드로 전환되고, 커서 이동, 검색, 저장과 종료 등이 가능
- `:w` — 저장
- `:q` — 에디터 종료 (`:q!`로 강제 종료)
- `:wq` — 저장 및 종료

## Git 설정하기

Git을 처음 사용할 때 사용자 이름과 이메일을 등록해야 한다.

```bash
$ git config --global user.name "사용자 이름"
$ git config --global user.email [사용자 이메일 주소]
```

이름은 가급적 영어 사용을 권장한다. 설정된 값은 `git config user.name`, `git config user.email`로 확인 가능하다.

## Git 저장소 생성

`git init` 명령을 통해서 현재 디렉터리를 기준으로 Git 저장소를 생성할 수 있다.

```bash
$ mkdir hello-git
$ cd hello-git
$ git init
```

`git init`을 실행하면 `.git`이라는 숨겨진 디렉터리가 생성된다. 이 디렉터리가 Git 저장소의 핵심으로, 버전 관리에 필요한 모든 정보가 여기에 저장된다.

## Git에서의 버전 관리

### 세 가지 공간

Git에서는 아래와 같은 **세 가지의 공간**을 활용하여 저장소를 관리한다.

![Working tree / Stage / Repository](/assets/images/posts/git-intro-version-control/git-intro-version-control-1.png)

- **Working tree (작업 디렉터리)**: 소스코드를 직접 수정 및 저장하는 디렉터리이다. 실제 파일이 존재하는 공간이다.
- **Stage (Staging area)**: 버전관리를 수행할 대상이 되는 파일들이 모인 공간이다. `git add`로 파일을 이곳에 추가한다.
- **Repository (저장소)**: 각 버전이 저장되어 있는 공간이다. `git commit`으로 Stage의 파일들이 이곳으로 이동하며 새로운 버전이 생성된다.

### Git 명령어 흐름

![Git 명령어 흐름](/assets/images/posts/git-intro-version-control/git-intro-version-control-2.png)

로컬 영역에서 `git add` → `git commit` 순서로 버전을 생성하고, `git push`로 원격 저장소에 반영한다. 반대로 `git pull`로 원격 저장소의 내용을 로컬로 가져온다.

### 버전 관리 과정

**1단계: 파일 생성 후 상태 확인**

```bash
$ vim cal.py        # 소스코드 생성
$ git status        # 저장소 상태 확인
```

새로운 파일을 생성하면 `Untracked files`로 표시된다. 아직 Git에 의해 버전이 관리되고 있지 않은 파일이다.

**2단계: Stage에 파일 추가**

```bash
$ git add cal.py    # Stage에 파일 추가
$ git status        # Changes to be committed로 변경
```

`git add <파일명>` 명령을 통해 특정 파일을 Stage에 추가할 수 있다. 이후 `git status`로 확인하면 `Changes to be committed` 상태로 변경된 것을 확인할 수 있다.

**3단계: 커밋으로 버전 생성**

```bash
$ git commit -m "create cal.py"
```

`git commit` 명령을 통해서 현재 Stage의 파일들의 새로운 버전을 생성한다. `-m` 옵션은 버전 기록에 남을 메시지를 추가하는 옵션이다.

**4단계: 버전 이력 확인**

```bash
$ git log
```

commit hash(각 commit에 대한 고유 식별자), 누가 언제 commit하였는지와 commit 메시지가 출력된다. `HEAD -> master`는 최신 버전임을 의미한다.

### 변경사항 확인

파일을 수정한 후 아직 `add`하지 않은 상태에서 `git status`를 출력하면 `modified` 상태로 표시된다. 구체적인 변경사항을 확인하고 싶은 경우 `git diff`를 사용한다.

```bash
$ git diff
```

`-` 표시 뒤의 최신 버전에 있던 라인이 사라졌고, `+` 표시 뒤의 내용으로 대체되었음을 의미한다.

### Stage 제거 및 변경 취소

- **Stage에서 제거**: `$ git reset HEAD <파일명>` 또는 `$ git restore --staged <파일명>`
- **변경 취소 (최신 버전으로 되돌리기)**: `$ git checkout -- <파일명>` — working tree에 수정한 파일을 저장소에 있던 버전으로 다시 덮어쓴다. 수정했던 사항이 사라짐에 유의한다.

### 이전 버전으로 되돌리기

```bash
$ git reset HEAD^              # 최신 버전으로 되돌리기
$ git reset --hard <commit hash>  # 특정 버전으로 되돌리기
```

`git reset --hard`로 강제로 이전 버전으로 되돌릴 경우, 되돌린 버전 이후의 commit들이 기본적으로는 보이지 않는다. `git log`에서 사라져 있지만 `git reflog`로 확인 및 복구를 할 수는 있다. **`git reset --hard` 명령은 상당히 위험할 수 있다**는 것을 꼭 유념해야 한다.

## 파일 상태 lifecycle

![파일 상태 lifecycle](/assets/images/posts/git-intro-version-control/git-intro-version-control-3.png)

Git에서의 파일 상태는 네 가지로 나뉜다:

| 상태 | 설명 |
|------|------|
| **Untracked** | 새로 추가된 파일. 아직 Git이 추적하지 않는 상태 |
| **Unmodified** | 최신 버전 그대로의 파일. 변경사항 없음 |
| **Modified** | 최신 버전 이후 수정된 파일 |
| **Staged** | `git add`로 Stage에 추가된 파일. commit 대기 상태 |

- Untracked / Modified 파일을 `git add`하면 **Staged** 상태가 된다
- Staged 파일을 `git commit`하면 **Unmodified** 상태로 돌아간다
- Unmodified 파일을 수정하면 **Modified** 상태가 된다

`-a` 옵션을 통해 변경된 파일들을 자동으로 Stage에 반영 후 commit 가능하나, 해당 옵션으로 한번에 commit하기 보다는 **Stage를 꼼꼼히 확인 후 commit하길 추천**한다.
