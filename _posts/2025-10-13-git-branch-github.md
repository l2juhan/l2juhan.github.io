---
title: "Git 브랜치 및 GitHub"
date: 2025-10-13
categories: [Software-Engineering]
subcategory: OpenSource
tags: [git, branch, github, merge]
toc: true
toc_sticky: true
---

**개요**

---

##  Git 브랜치 및 GitHub

###   Git 브랜치(Branch)

- 버전 이력에서 갈라진 **독립 개발 라인**

- 기능·버그 단위로 분리해 병렬 개발

- 브랜치가 갈라진 목적을 달성하고 나면 메인 브랜치로 다시 합쳐지는 경우가 많음

```bash
# (1) 예제 프로젝트 초기화
mkdir git_branch && cd git_branch
git init
echo "hello" > sample.txt
git add sample.txt && git commit -m "first commit"

# (2) 브랜치 만들기/전환
git branch issue1                # 새 브랜치
git branch                       # branch 목록(*: 현재)
git checkout issue1              # branch 전환 (git switch issue1)

# (3) 작업/커밋 후 메인에 병합
echo "설명 추가" >> sample.txt
git add sample.txt && git commit -m "add 설명 추가"
git checkout master
git merge issue1                # 현재(master)로 issue1 병합

# (4) 브랜치 삭제
git branch -d issue1

# (5) 여러 브랜치로 작업하고 이력 시각화
git branch issue2 && git branch issue3
git checkout issue2 && echo "commit 설명" >> sample.txt && git add . && git commit -m "commit 설명 추가"
git checkout issue3 && echo "pull 설명"   >> sample.txt && git add . && git commit -m "pull 설명 추가"
git log --graph --all --oneline  # --all : 전체 이력 확인가능 --graph : 분기된 지점 표현

# (6) 병합 충돌 해결 흐름
git checkout master
git merge issue2
git merge issue3             # 충돌 발생 가정
# >>> 파일 열어 <<<<<<< ======= >>>>>>> 구간 수동 편집
git add sample.txt
git commit -m "issue3 병합(충돌 해결)"
git log --graph --all --oneline
```

![Git 브랜치 및 GitHub](/assets/images/posts/git-branch-github/git-branch-github-1.png)

---

###   GitHub 개요

- 현재 사용하고 있는 로컬 환경에 위치한 것이 아닌 다른 원격 데스크탑 혹은 서버에 존재하는 저장소를 의미

- **원격 연결/동기화**: `remote add origin`으로 연결 → `push`로 업로드, `pull`로 원격 변경을 로컬 반영, `u`로 upstream 설정

#### **왜 필요한가**

- 미완성/실험 코드를 메인과 **격리**하고, 검증 후 **안전하게 통합**

- 원격 저장소로 백업/협업/리뷰(PR)가 가능해지

- 분기/병합 이력을 시각화하여 **변경 맥락**을 명확히 관리

```bash
# (7) GitHub 원격 연결 & 동기화
git remote add origin <https://github.com/><id>/<repo>.git
git remote -v                # fetch/push URL 등의 상세한 정보 확인
git push -u origin master    # 최초 1회 upstream 설정
# 이후엔
git push                     # 간단히 푸시
git pull origin master       # 원격 변경 로컬 반영

# (8) GitHub branch 연결 & 동기화
git push -u origin branchName

```

---

###   시험대비 Q&A

- Q1. “현재 브랜치로 다른 브랜치를 병합한다”는 의미?

A. **체크아웃된 브랜치의 HEAD**에 `git merge <다른브랜치>`를 적용한다는 뜻

- Q2. 충돌이 나는 이유와 해결 절차?

A. 동일 위치를 각기 다르게 수정해 자동 병합 실패. 파일의 충돌 표식 구간을 **사람이 선택/통합 → **`**add**`** → **`**commit**`.

- Q3. `git log --graph --all`을 쓰는 이유?

A. **분기/병합 트리**를 한눈에 파악(시간순 로그만으로는 구조 파악이 어려움)

- Q4. `git push -u origin master`에서 `u`의 의미?

A. **upstream(tracking)** 설정. 이후 동일 원격/브랜치로 `git push`만으로 푸시 가능

- Q5. Git과 GitHub의 차이?

A. Git=로컬 버전관리 도구, GitHub=원격 호스팅/협업 서비스. `push/pull`로 연동

---

> 💡  학습정리

    -

    -

    -
