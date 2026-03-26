---
title: "AWS CLF — DataBase"
date: 2026-03-25
categories: [Cloud]
subcategory: AWS-CLF
tags: [aws, clf, cloud-practitioner, database]
toc: true
toc_sticky: true
---


---

## 관계형 데이터베이스

![](/assets/images/posts/aws-clf-database/aws-clf-database-1.png)

- 테이블 간의 관계를 기반으로 데이터를 저장하고 관리하는 데이터베이스 시스템
- 데이터를 행과 열의 형태로 구성돤 테이블에 저장하며,각 테이블은 고유한 식별자(primary key)에 의해 구분
- SQL을 사용하여 테이블 생성/삭제 및 데이터에 대한 검색,삽입,수정,삭제 등의 작업을 수행

## AWS의 관계형 데이터베이스 - Relational Database Service (RDS)

![](/assets/images/posts/aws-clf-database/aws-clf-database-2.png)

- Amazon RDS는 AWS의 ‘관계형 데이터베이스’ 서비스
- 사용자가 관리 작업을 최소화하고 확장성과 가용성을 갖는 관계형 데이터베이스를 쉽게 설정할 수 있음
- MySQL, PostgreSQL, MariaDB, Oracle DataBase, Microsoft SQL Server등 다양한 엔진을 제공
- 사용자는 데이터베이스 엔진 버전을 선택하고 필요에 따라 용량을 조정할 수 있음
- 자동 백업 ,복제, 스냅샷, 보안 등 다양한 관리 기능을 제공하여 데이터베이스 운영을 단순화함

### Read Replicas

- 읽기만 가능한 DB 인스턴스의 복제본을 여러 개 만드는 기능
- 원본 DB의 읽기/쓰기 트래픽을 분산시켜 성능 향상
- 최대 15개까지 생성 가능
- 실제 데이터는 메인 RDS에만 저장

### Multi-AZ

- 데이터 베이스를 여러 가용영역에 배치
- 한곳의 DB에서 장애가 발생하면 다른 곳으로 연결

## AWS의 관계형 데이터베이스 - Aurora

![](/assets/images/posts/aws-clf-database/aws-clf-database-3.png)

- AWS RDS에서 선택할 수 있는 종류 중 하나
- MySQL 및 PostgreSQL과 호환되는 AWS의 독자적인 완전 관리형 관계형 데이터베이스 엔진(오픈소스x)
- MySQL의 5배,PostgreSQL의 3배 처리량을 제공
- Aurora 스토리지는 10GB 단위로 최대 128TB까지 자동으로 증가
- 여러 인스턴스를 하나로 운영하는 클러스터 DB 기반으로 구성됨
- 데이터베이스 설정,패치 적용 및 백업과 같은 관리 태스크를 자동화
- RDS보다 약 20% 가량 더 비용이 높음
- Aurora의 온디맨드 자동 크기 조정 구성 버전인 Aurora Serverless도 지원

### PostgreSQL

- 데이터를 체계적으로 저장, 관리, 검색할 수 있게 해주는 매우 강력하고 안정적인 오픈소스 관계형 데이터베이스 시스템(RDBMS)
- 가장 쉬운 비유: '매우 똑똑하고 기능이 많은 슈퍼 엑셀(Super Excel)’
- PostgreSQL의 주요 특징
- 관계형 데이터베이스 (Relational Database)
- 오픈소스 (Open Source)
- 뛰어난 안정성과 신뢰성
- 강력한 확장성과 풍부한 기능

## 비관계형 데이터베이스(NOSQL)

![](/assets/images/posts/aws-clf-database/aws-clf-database-4.png)

- NoSQL=Non-SQL=Non Relative DataBases
- NoSQL 데이터베이스는 스키마리스(Schemaless) 또는 유연한 스키마(Flexible Schema)를 사용하여 데이터 모델을 정의
- RDB에 비해 데이터 구조 변경 및 확장이 용이
- 대규모 데이터셋과 높은 처리량을 처리할 수 있도록 설계
- 문서(Document), 열(Column), 그래프(Graph), 키-값(Key-Value) 등 다양한 데이터 모델을 지원

### NoSQL DataBases in AWS - Dynamo DB

![](/assets/images/posts/aws-clf-database/aws-clf-database-5.png)

- 서버 프로비저닝, 패치 적용 또는 관리가 필요없는 Serverless NoSQL 데이터베이스 서비스
- 프로비저닝: 사용자의 요구에 맞게 IT 인프라 자원을 ‘할당’하고 ‘배치’하여 사용할 수 있도록 ‘준비’하는 모든 과정
- 3개의 가용영역에 걸친 데이터 복제를 통한 고가용성 확보
- 다중 리전, 다중 활성 데이터베이스를 제공하여 애플리케이션 복원력을 개선하고 빠른 로컬 읽기 및 쓰기를 제공
- 초당 수백만개 이상 의 요청 처리가 가능하며, 10밀리 초 미만의 빠른 응답을 제공
- 지연시간이 짧은, 빠른 응답이 필요한 애플리케이션에 사용
- 완전 관리형 인메모리 캐시 서비스인 Amazon DynamoDB Accelerator(DAX) 지원

### DocumentDB

- mongoDB와 호환되는 완전관리형 기본 JSON Document 데이터베이스
- 클라우드에서 MongoDB 호환 데이터베이스를 쉽게 설치,운영 및 규모 조정이 가능
- MongoDB에서 사용하는 것과 동일한 애플리케이션 코드를 실행하고 동일한 드라이버와 도구를 사용

### Keyspaces

- 고가용성의 확장 가능한 관리형 Apache Cassandra 호환 데이터베이스 서비스
- 사용 중인 것과 동일한 Cassansdra 애플리케이션 코드 및 개발자 도구를 사용하여 AWS에서 Cassandra 워크로드를 실행
- Serverless 서비스로 서버를 프로비저닝, 운영, 관리할 필요가 없음
- 모든 규모에서 일관되게 10밀리초 미만의 응답 시간을 지원하며 초당 수천 건의 요청을 처리가 가능

## 인메모리(In-Memory) 데이터베이스

![](/assets/images/posts/aws-clf-database/aws-clf-database-6.png)

- 데이터를 메모리에 저장하고 처리하는 데이터베이스 시스템
- 디스크가 아닌 주 메모리(RAM)에 데이터를 저장하여 데이터에 대한 접근 및 처리 속도를 향상
- 전통적인 디스크 기반 데이터베이스 시스템과 비교하여 빠른 응답 시간, 고성능, 높은 확장성 등의 장점도 있음

### Amazon ElastiCache

- AWS에서 제공하는 완전관리형 인메모리 데이터 스토어 서비스
- Redis 또는 Memcached와 같은 인메모리 데이터 스토어를 지원
- 빠른 응답 시간과 고성능을 제공하여 데이터베이스 및 웹 애플리케이션의 성능을 향상
- 클러스터 프로비지넝, 백업 및 복원, 모니터링 및 경보 등의 관리 기능을 제공하여 운영 부담을 감소

### MemoryDB for Redis

- AWS에서 제공하는 완전관리형 Redis 호환 인메모리 데이터베이스 서비스
- 마이크로초의 읽기 및 밀리초의 쓰기 지연 시간등 높은 성능의 처리 기능을 제공
- Redis 프로토콜 호환성을 제공하여 기존 Redis 애플리케이션에 대한 손쉬운 이식이 가능

## AWS의 기타 데이터베이스

### AWS Neptune

- Amazon에서 제공하는 완전관리형 ‘그래프 데이터베이스’ 서비스
- 데이터 간의 관계를 ‘시각적’으로 표현

### Amamzon Timestream

- 완전 관리형 ‘시계열 데이터베이스’ 서비스
- 시간에 따라 변화하는 대규모 데이터셋을 저장하고 분석

### Amamzon QLEB

- 완전 관리형 분산형 ‘원장 데이터베이스’ 서비스
- 투명하고 불변성이 보장된 원장(Ledger)을 저장하고 관리하는 데 사용
- 블록체인과 유사한 분산 원장 기술을 기반으로 하며, 트랜잭션의 완전성과 불변성을 보장하여 신뢰할 수 있는 데이터 기록을 제공
![](/assets/images/posts/aws-clf-database/aws-clf-database-7.png)

## AWS Storage Gateway

- **온프레미스 환경과 AWS 클라우드 스토리지를 매끄럽게 연결**해주는 하이브리드 클라우드 스토리지 '다리(Bridge)'

### 3가지 유형

1. 파일 게이트웨이 (File Gateway) : 온프레미스에서 **Amazon S3**를 **일반적인 파일 공유 폴더**처럼 사용할 수 있게 해줌 (S3 버킷의 객체)
1. 볼륨 게이트웨이 (Volume Gateway) : 온프레미스 서버에 클라우드 기반의 디스크 볼륨(하드 디스크)을 제공 (Amazon EBS 스냅샷)
1. 테이프 게이트웨이 (Tape Gateway) : 존의 **물리적 테이프 백업 시스템**을 **클라우드 기반의 가상 테이프 라이브러리**로 대체 (Amazon S3 Glacier 또는 Deep Archive 스토리지)

---

