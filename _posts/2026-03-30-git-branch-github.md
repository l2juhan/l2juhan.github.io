---
layout: post
title: "Git Branch and GitHub — Git 브랜치 및 GitHub"
date: 2026-03-30
categories: [Software-Engineering]
subcategory: OpenSource
tags: [git, branch, merge, github, remote, push, pull]
description: "Git 브랜치의 개념과 생성/병합/삭제, GitHub를 통한 원격 저장소 연결 및 push/pull 정리"
---

하나의 프로젝트에서 여러 기능을 동시에 개발하거나, 메인 코드에 아직 반영할 수 없는 실험적 변경을 관리하려면 독립적인 작업 공간이 필요하다. Git의 브랜치(Branch)가 바로 그 역할을 한다.

## Git 브랜치

브랜치(Branch)란 버전 관리 이력에서 마치 따로 떨어져 나온 가지와 같은 개념으로써, **특정 버전에서 분화하여 독립적으로 관리되고 있는 분리된 버전들**을 의미한다.

![브랜치 개념](/assets/images/posts/git-branch-github/git-branch-github-1.png)

- 협업을 수행할 때 브랜치 기능을 활용하여 다수의 작업자가 **병렬적으로 작업** 가능하다
- 메인 버전에 아직은 반영할 수 없는 검증이 덜 된 코드는 별도의 브랜치에서 관리할 수도 있다

보다 상세하게 이야기하면 브랜치란 **독립적인 개발 라인**을 의미하는 것으로써, `git init`으로 저장소를 생성하면 `master`라는 이름의 브랜치 하나가 생성되어 있고, 보통 해당 브랜치를 해당 소프트웨어의 메인 브랜치로 사용한다.

### HEAD

`checkout` 명령을 통해 현재 선택된 브랜치를 변경할 수 있다. (최근에는 `switch`를 권장한다.) **HEAD**는 현재 선택된 브랜치의 최신 버전을 나타낸다. 다른 브랜치를 사용하는 명령(`checkout`)을 수행하지 않는 이상 모든 commit은 master 브랜치를 기준으로 이루어진다.

## 브랜치 만들기

`git branch <브랜치 이름>` 명령을 통해 새로운 브랜치를 생성할 수 있다.

```bash
$ git branch issue1       # issue1 브랜치 생성
$ git branch              # 브랜치 목록 확인
  issue1
* master                  # * 표시가 현재 선택된 브랜치
```

브랜치를 생성한 직후에는 아직 별도 커밋이 없으므로 두 브랜치 모두 같은 지점을 가리키고 있다.

## 브랜치 전환하기

`git checkout <브랜치 이름>` 명령을 통해 현재 선택된 브랜치를 전환할 수 있다.

```bash
$ git checkout issue1     # issue1 브랜치로 전환
```

이 상태에서 파일을 수정하고 커밋하면 issue1 브랜치에만 반영된다. master 브랜치는 수정되지 않은 상태이다.

```bash
$ vim sample.txt          # 파일 수정
$ git add sample.txt
$ git commit -m "add 설명 추가"
$ git log                 # HEAD -> issue1 확인
```

## 브랜치 병합하기

`git merge <브랜치 이름>` 명령을 통해 브랜치를 병합할 수 있다. 이 때 **현재 선택된 브랜치의 HEAD**로 merge 명령 뒤에 입력한 브랜치가 병합된다.

즉, master에 issue1을 병합하기 위해서는 **master 브랜치로 현재 브랜치 전환 후 merge를 수행**하여야 한다.

```bash
$ git checkout master     # master 브랜치로 전환
$ git merge issue1        # issue1 브랜치를 master에 병합
```

병합 후 master 브랜치에서 파일을 확인하면 issue1에서 변경한 내용이 반영되어 있다.

## 브랜치 삭제하기

병합이 완료된 브랜치는 `git branch -d` 명령으로 삭제할 수 있다.

```bash
$ git branch -d issue1    # issue1 브랜치 삭제
$ git branch              # master만 남아있음
* master
```

## 여러 개 브랜치를 이용한 작업

실제 개발 과정에서는 여러 브랜치가 동시에 존재하는 것이 일반적이다. issue2, issue3 브랜치 두 개를 만들어서 작업하는 상황을 가정한다.

```bash
$ git branch issue2
$ git branch issue3
$ git checkout issue2
```

issue2에서 파일을 수정하고 커밋한 후, issue3으로 전환하여 다르게 수정하고 커밋하면 두 브랜치가 갈라진 상태가 된다.

```bash
$ git log --graph --all   # 분기된 지점을 포함하여 전체 이력 출력
```

`git log`는 현재 브랜치에 대한 이력만 확인 가능하지만, `--graph --all` 옵션을 통해서 분기된 지점을 포함한 전체 이력을 시각적으로 확인할 수 있다.

## 병합 및 충돌 해결

![Branch + Merge 흐름](/assets/images/posts/git-branch-github/git-branch-github-2.png)

앞서 merge 명령으로 브랜치 병합을 수행했던 것과 유사하게 master 브랜치와 issue2 브랜치를 병합한다.

```bash
$ git checkout master
$ git merge issue2        # 정상 병합
```

이후 issue3까지 병합하고자 하면 **충돌(Conflict)**이 발생할 수 있다.

```bash
$ git merge issue3
# Auto-merging sample.txt
# CONFLICT (content): Merge conflict in sample.txt
# Automatic merge failed; fix conflicts and then commit the result.
```

같은 파일의 같은 부분을 서로 다르게 수정한 두 브랜치를 병합하면 자동 병합이 실패한다. 충돌이 발생한 파일을 열어보면 다음과 같은 형태이다:

```
<<<<<<< HEAD
commit에 대한 설명
=======
pull에 대한 설명
>>>>>>> issue3
```

- `<<<<<<< HEAD`와 `=======` 사이: 현재 브랜치(master)의 내용
- `=======`와 `>>>>>>> issue3` 사이: 병합하려는 브랜치(issue3)의 내용

**충돌 해결은 사람이 직접 보고 수정해주어야 한다.** 원하는 내용으로 수정한 후 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)를 제거하고 다시 커밋하면 된다.

```bash
$ git add sample.txt
$ git commit -m "issue3 병합"
$ git log --graph --all   # 병합 이력 확인
```

## GitHub와 원격 저장소

**원격 저장소(Remote Repository)**란 현재 사용하고 있는 로컬 환경에 위치한 것이 아니라 다른 원격 데스크탑 혹은 서버에 존재하는 저장소를 의미한다. GitHub는 가장 널리 활용되고 있는 Git 원격 저장소 서비스이다.

원격 저장소를 활용하면:

- 작업한 내용을 원격으로 **백업**할 수 있다
- 여러 작업자가 일을 나누어서 수행한 후 원격 저장소에 반영하는 방식으로 **협업**을 수행할 수 있다

### 원격 저장소 연결

GitHub에서 새 저장소를 생성한 후, 로컬 저장소와 연결한다.

```bash
$ git remote add origin <원격 저장소 주소>
```

`origin`이란 기본값으로 지정된 원격 저장소명으로, 메인 브랜치를 `master`라고 하는 것과 유사하다. `git remote` 명령으로 현재 추가된 원격 저장소를 확인할 수 있고, `-v` 옵션으로 상세한 URL까지 확인 가능하다.

```bash
$ git remote              # origin 출력
$ git remote -v           # fetch/push URL 출력
```

### Push — 원격 저장소에 반영

`git push <원격 저장소> <로컬 브랜치>` 명령을 통해 로컬 브랜치의 내용을 원격 저장소에 백업 및 반영한다.

```bash
$ git push -u origin master
```

`-u` 옵션은 upstream (tracking) reference의 줄임말로, 한번 세팅한 이후에는 원격 저장소명 및 로컬 브랜치명을 생략하고 `git push` 명령만으로 간편하게 동일 대상에 대해 push를 수행할 수 있도록 해준다.

처음으로 push할 시에는 GitHub 로그인 및 인증이 필요하다.

### Pull — 원격 저장소에서 가져오기

```bash
$ git pull origin master
```

원격 저장소의 내용을 로컬로 가져온다. 여러 명이 협업할 때, 다른 사람이 push한 변경사항을 내 로컬에 반영하기 위해 사용한다.

### Clone — 원격 저장소 복제

```bash
$ git clone <원격 저장소 주소>
```

원격 저장소의 전체 내용을 로컬에 복제한다. 새로운 환경에서 프로젝트를 시작할 때 사용한다.

## 주요 Git 명령어 정리

| 명령어 | 설명 |
|--------|------|
| `git init` | 현재 디렉터리에 Git 저장소 생성 |
| `git status` | 저장소 상태 확인 |
| `git add <파일>` | 파일을 Stage에 추가 |
| `git commit -m "메시지"` | Stage의 파일들로 새 버전 생성 |
| `git log` | 버전 이력 확인 |
| `git diff` | 최신 버전과 working tree의 차이 확인 |
| `git branch <이름>` | 브랜치 생성 |
| `git checkout <이름>` | 브랜치 전환 |
| `git merge <이름>` | 브랜치 병합 |
| `git branch -d <이름>` | 브랜치 삭제 |
| `git remote add origin <URL>` | 원격 저장소 연결 |
| `git push` | 원격 저장소에 반영 |
| `git pull` | 원격 저장소에서 가져오기 |
| `git clone <URL>` | 원격 저장소 복제 |
