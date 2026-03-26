---
title: "오픈소스SW 개요 및 라이선스"
date: 2025-10-12
categories: [Software-Engineering]
subcategory: OpenSource
tags: [open-source, license, gpl, mit]
toc: true
toc_sticky: true
---

**개요**

---

##  오픈소스SW 및 라이선스

###   오픈소스SW

- 소스코드 공개 + 사용/수정/재배포 가능, 단 각 라이선스 의무 준수 필요

- ex) Linux 커널, Apache Web Server, FireFox 웹브라우저, MySQL 등

---

###   소프트웨어 저작권(Copyright)

- 창작 즉시 발생

- 원저작자가 해당 권리를 어떻게 다른 사람들과 공유할지 결정

---

###   라이선스(License)

- 소유자-사용자들 사이의 계약

- 허용여부가 명시됨

- 공개 코드라도 라이선스 없으면 임의 사용 불가

|  | 저작권 | 라이선스 |
| --- | --- | --- |
| 개념 | 독점적인 권리 | 서용을 허가하는 조건 및 계약 |
| 발생 시점 | 만들어지는 순간 | 선택 적용 |
| 목적 | 권리 보호, 무단사용 금지 | 사용조건 및 범위 → 공유 및 장려 |
| 주요 대상 | 저작자 중심 | 사용자 중심 |

---

###   독점 소프트웨어(Proprietary Software)

- 소유자가 수정 및 배포 권리를 독점하는 형태의 소프트웨어

- == Non-free software

- 일반적으로 binary code를 사용하기 위해서는 비용을 지불 (소유 x , binary code 재배포 허용 x)

- 구매하더라도 사용 권한을 구매하는 것으로, 수정 및 재배포 x

---

###   자유 소프트웨어(Free Software)

- ↔ 독점 소프트웨어

- 소스코드에 대한 사용, 수정, 배포에 대한 자유를 의미 (사용비용 무료 x)

- GNU/Linux 프로젝트 (리차드 스톨만)

- “GNU is Not Unix” → 지배적인 독점 소프트웨어 시스템 Unix 에 대항하는 의미

- 컴파일러, 편집기, 디버거 등 프로그래밍과 컴퓨터 운영에 필요한 다양한 도구 개발

- 실질적인 결실은 리눅스 커널과의 결합에 의해 완성

- 자유 소프트웨어의 네 가지 자유

- F0 : 원하는 목적으로 프로그램을 자유롭게 실행 가능

- F1 : 프로그램의 소스 코드를 파악하고 변경 가능

- F2 : 정확한 복사본을 배포 가능

- F3 : 원하는 대로 수정한 버전을 배포 가능

+) 리차드 스톨만은 FSF(Free Software Foundation)을 설립하여 copyleft 개념을 전파

---

###   Copyleft 라이선스

- 자유 소프트웨어 + 공유의무

- = 모든 사용자는 재배포 시 자신이 받은 것과 동일한 자유를 해당 재배포 소프트웨어의 사용자들에게 부여해야 함

---

###   General Public License (GPL)

- copyleft 원리를 구체 조항으로 만든 **개별 라이선스**

#### GPL 요건

1. 사용자에게 자유 소프트웨어로서의 조건을 만족하는 권리를 부여

1. GPL 라이선스 SW 에서 파생되는 SW를 배포할 때는 반드시 동일한 GPL 라이선스에 따라 배포

- 단, 배포 목적이 아니면 보유는 가능

#### GPL 라이선스 전파

- GPL 라이선스를 따르는 SW 재배포 → 소스 코드 및 동적 링크 방식으로 연결된 SW는 GPL 라이선스로 재배포

- 독점 소프트웨어와의 결합이 불가능(독점SW 저작권자가 허락하지 않는 한)

- But, 통신 메커니즘으로 엮이는 소프트웨어로는 라이선스 전파 x

- Ex) Git - Github

![오픈소스SW 개요 및 라이선스](/assets/images/posts/open-source-sw-license/open-source-sw-license-1.png)

---

###   Lesser General Public License (LGPL)

- GPL 라이선스 전파 조건을 완화 = GPL보다 약한 copyleft 라이선스

- 라이선스 전파 대상에서 동적 링크 제외됨

![오픈소스SW 개요 및 라이선스](/assets/images/posts/open-source-sw-license/open-source-sw-license-2.png)

---

###   오픈소스 소프트웨어

- Eric S.Raymond 에 의해 Open Source Initiative(OSI) 설립

- 재배포 시 라이선스를 자유롭게 매길 권한을 포함하여 모든 소프트웨어 사용자들의 권리를 위함

- 오픈소스 라이선스에는 **Copyleft**(GPL/LGPL/MPL…)도 있고 **Permissive**(MIT/BSD/Apache-2.0)도 있음

- **Copyleft**: “같은 자유를 **계속 전파**하라”

- 장점: 자유 보존, 개선 사항이 공개 생태계로 **귀환**

- 단점: 기업·혼합 라이선스 프로젝트에 **법무 부담**↑

- **Permissive**: “라이선스 명시만 유지, 나머지는 **자유**”

- 장점: 채택/상용 결합 용이, 생태계 **빠른 확산**

- 단점: 개선 사항이 사유화될 **리스크**

| 구분 | Copyleft | Permissive |
| --- | --- | --- |
| 대표 라이선스 | GPL, AGPL, LGPL(약한), MPL | MIT, BSD-2/3, Apache-2.0 |
| 전파(바이럴) | 강함/중간: 수정·결합 산출물 공개 의무(정도는 라이선스별 상이) | 약함: 저작권·고지만 유지하면 재라이선스/비공개 가능 |
| 링크/결합 | GPL: 링크된 전체에 전파 가능 / LGPL: 라이브러리 수정만 공개,                 앱은 비공개 가능(동적 링크 조건) / MPL: 파일 단위 공개 | 링크 제한 없음. 상용 코드와 자유롭게 결합 가능 |
| 재라이선스 | 보통 동일계열 요구(예: GPL→GPL) | 가능(사유화 포함), 단 원저작권·고지 유지 |
| 특허 조항 | GPLv3/AGPLv3 일부 포함, MPL 2.0 포함 | Apache-2.0 특허 라이선스 명시(강점) |
| 네트워크 전파 | AGPL: 네트워크 제공도 전파 | 해당 없음 |
| 채택성/도입 장벽 | 전파 의무로 높음(법무 검토↑) | 낮음(도입 쉬움, 생태계 확장 유리) |
| 커뮤니티 철학 | 자유의 보존에 중점 | 채택과 확산에 중점 |

![오픈소스SW 개요 및 라이선스](/assets/images/posts/open-source-sw-license/open-source-sw-license-3.png)

---

###   FOSS, Freeware, Shareware

#### FOSS (Free and Open Source Software)

- 자유 소프트웨어 + 오픈소스 소프트웨어

- 가격은 상관없음(무료/유료 모두 가능), 자유(권리)가 핵심

- **장점**

- 소프트웨어 사용 비용 절감

- 소프트웨어 개발 시간 및 비용 절감

- 신뢰성

- 외부 지원 (많은 경우 OSS는 커뮤니티를 갖추고 있음)

- 특정 소프트웨어 제작사에 대한 락인(lock-in) 완화

- **단점**

- 개발자 친화적이나 사용자 친화적이지는 않을 수 있음

- 지적재산권 관련 리스크

- 숨겨진 비용

#### Freeware

- 무료로 사용할 수 있는 소프트웨어

- 보통 소스 코드를 제공 x

- Ex) Adobe Acrobat Reader, Skype 등

#### Shareware

- 평가판은 무료 but 이후 비용이 드는 소프트웨어

-  무료 배포될 수 있어도 **오픈소스/자유SW 아님**

|  | FOSS | Freeware | Shareware |
| --- | --- | --- | --- |
| 가격 | 무료/유료 모두 가능 | 무료(Gratis) | 보통 무료 체험(+ 유료 전환) |
| 소스 공개 | 공개 | 비공개(대부분) | 비공개(대부분) |
| 수정/재배포 | 라이선스에 따라 허용(perm./copyleft) | 대개 불가/제한적 | 대개 불가/제한적 |
| 철학/목표 | 자유/개방, 협업 | 보급/사용자 확대(조건부) | 체험 후 구매 전환 |

![오픈소스SW 개요 및 라이선스](/assets/images/posts/open-source-sw-license/open-source-sw-license-4.png)

---

###   공개 도메인 소프트웨어

- 저작권 보호 대상 x

- ≠ (Open Source, Copyleft)

---

###   시험대비 Q&A

- Q1. Copyleft vs Permissive 차이?

A. 재배포 시 **자유 전파 의무** 존재 여부. Copyleft=전파 의무, Permissive=라이선스 명시 유지, 나머지는 자유

- Q2. GPL과 LGPL 전파 범위 차이?

A. GPL은 링크 수준까지 전파 / LGPL은 **라이브러리 수정본 공개**가 핵심, 앱은 비공개 가능(재링크 가능 조건·고지 필요)

- Q3. 라이선스가 없는 공개 코드 사용 가능?

A. 불가. 저작권은 자동 발생. 사용 전 라이선스 명시·확인 필수

- Q4. Free Software의 “Free” 의미?

A. 무료가 아니라 **자유,** 실행/이해·변경/복제/수정본 배포의 4자유

> 💡  학습정리

    -

    -

    -
