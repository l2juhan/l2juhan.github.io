---
title: "리눅스마스터 2급 기출문제 정리 (50문항)"
date: 2026-03-05
categories: [Linux]
tags: [linux, certification, linux-master]
toc: true
toc_sticky: true
---

리눅스마스터 2급 시험 기출문제 50문항을 정리했습니다. 시험 준비에 참고하세요.

## 파일/디렉토리 관련

**Q. `mkdir`으로 부모 디렉토리까지 함께 생성하는 옵션은?**
> `-p` — `mkdir -p www/pds/pic`

**Q. `cp` 명령으로 디렉토리 복사 시 사용하는 옵션이 아닌 것은?**
> `-d` — `-d`는 심볼릭 링크 복사 옵션. `-r`, `-R`, `-a`는 디렉토리 재귀 복사.

**Q. `ls` 명령에서 알파벳 역순 출력 옵션은?**
> `-r` (reverse). `-R`은 재귀(recursive).

**Q. `ls -ld /home`에서 `-ld`의 의미는?**
> `-l`은 상세 정보, `-d`는 디렉토리 자체의 정보 출력 (내용이 아닌 디렉토리 자체).

**Q. `cat -b`와 `cat -n`의 차이는?**
> `-b`는 비어있지 않은 줄에만 번호, `-n`은 모든 줄에 번호.

## 리다이렉션/파이프

**Q. 오류 메시지를 파일로 저장하는 명령은?**
> `cat nofile 2> error_log_file` — stderr의 파일 디스크립터는 2.

**Q. b.txt 내용을 a.txt에 추가하는 명령은?**
> `cat < b.txt >> a.txt` — `>>`는 추가(append), `>`는 덮어쓰기.

## 시스템 관리

**Q. 커널 버전만 확인하는 `uname` 옵션은?**
> `-r` — 커널 릴리즈 출력. `-a`는 전체, `-s`는 커널 이름.

**Q. 메모리(Mem, Swap) 사용량을 보여주는 명령은?**
> `free`

**Q. 하드웨어 상세 정보(CPU product, vendor 등)를 트리 형태로 보여주는 명령은?**
> `lshw`

**Q. 달력 출력 명령은?**
> `cal`

**Q. 시스템 시간을 설정하는 명령은?**
> `date -s 21:06:00`

## 리눅스 배포판

| 계열 | 배포판 |
|---|---|
| 레드햇 | RHEL, CentOS, Fedora, Scientific Linux |
| 데비안 | Ubuntu, Linux Mint, Kali Linux, Knoppix |
| 슬랙웨어 | SUSE, Vector Linux |

**Q. RHEL 소스를 리빌드한 무료 클론은?** → CentOS

**Q. 6개월 주기 릴리즈, 레드햇 후원 커뮤니티 배포판은?** → Fedora

## 파티션/파일시스템

**Q. BIOS의 파티션 형식 vs EFI의 파티션 형식은?**
> MBR vs GPT

**Q. 확장 파티션은 몇 개까지?**
> 1개만. 주 파티션은 4개까지.

**Q. 스왑 파티션 크기 권장은?**
> RAM 용량의 2배 (디스크 용량이 아님)

**Q. 윈도우 관련 파일시스템 유형은?**
> vfat (FAT)

**Q. 네트워크 파일시스템이 아닌 것은?**
> JFS (IBM의 로컬 저널링 파일시스템). CIFS, SMB, NFS는 네트워크 FS.

## 네트워크

**Q. 도메인으로 IP 조회 명령은?**
> `host` 또는 `nslookup`

**Q. 모든 사용자에게 메시지 브로드캐스트하는 명령은?**
> `wall`

## 기타

**Q. 리눅스 개발자는?** → 리누스 토발즈

**Q. GNU 프로젝트 소속이 아닌 것은?** → KDE (독립 커뮤니티 프로젝트)

**Q. 아파치 라이선스가 아닌 것은?** → jQuery (MIT 라이선스)

**Q. GRUB에서 `(hd0,3)`의 의미는?** → 첫 번째 디스크의 4번째 파티션 (0부터 시작)

**Q. `export PATH=$PATH:/etc`의 의미는?** → 기존 PATH에 /etc를 추가
