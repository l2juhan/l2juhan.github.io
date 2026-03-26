---
title: "코드 리뷰"
date: 2025-10-23
categories: [Software-Engineering]
subcategory: OpenSource
tags: [code-review, best-practices, collaboration]
toc: true
toc_sticky: true
---

**개요**

---

##  코드 리뷰

###   코드 리뷰의 정의

- 원 작성자가 아닌 동료가 소스 코드를 체계적으로 검사

- 목표: “완벽”이 아닌 “더 나은 코드”

- 검수와 유사하지만 공동 개선 활동

###  코드 리뷰의 효과

- 초기 버그·설계 결함 조기 발견

- 모든 코드를 최소 1인 이상 검토

- 지식 공유와 버스 팩터 완화

- 문서화·테스트·명명 개선을 유도

- 품질 기준 상향, 책임감 강화

- 신입은 안전하게 실전 경험 축적, 시니어와 협업 기회

- (연구·사례) 리뷰 도입 시 결함 대폭 감소, 생산성 증가

---

###  산업계 코드 리뷰

- 일반적 관행, SCM과 통합된 도구 사용

- 기능: 변경점 Diff, 히스토리, 코멘트·승인 워크플로

- 예: Gerrit, Critique(내부), GitHub PR 등

###  흔한 오해

- “리뷰면 완벽해진다” → 속도 저하·집착 위험

- “승인=책임 전가” 아님 → 공동 소유 의식이 핵심

- “시니어→주니어 일방 교육” 아님 → 상호 학습이 본질

---

###  리뷰 시 체크리스트

- **디자인**: 시스템 적합성

- **기능성**: 의도대로 동작, 사용자 적합성

- **복잡성**: 단순화 가능 여부, 향후 유지보수 용이성

- **테스트**: 자동화 테스트 유무·적절성

- **이름 짓기**: 명확한 네이밍

- **주석**: 명료·유용성

- **스타일**: 가이드 준수

- **문서화**: 관련 문서 갱신

###  기본 프로세스

1. 변경 생성 → 2) 리뷰 요청 → 3) 코멘트 → 4) 변경 반영·응답 반복 → 5) 승인(LGTM) → 6) 커밋·빌드 검사

![코드 리뷰](/assets/images/posts/code-review/code-review-1.png)

#### 세부 단계

- **코드 변경**: 변경 업로드 시 자동 정적 검사 도구 실행 가능

- **리뷰 요청**: 요청 시 리뷰어 지정·알림 전파

- **코멘트**: 기본 ‘미해결’ → 작성자가 수정 또는 근거 답변 후 ‘해결’ 처리

- 리뷰 요청 ↔ 코멘트 반복 가능, 최신 상태에 리뷰어가 만족하면 **승인**

- **커밋•빌드 검사**: 추가 자동 검사 통과 시 메인에 병합

#### 코드 리뷰할 때 주의해야 하는 것들

- 개인적인 스타일 x, 속한 팀의 스타일 가이드 따르기

---

###  Chromium Docs의 ‘Respectful Code Reviews’ 가이드

#### 해야 할 것

- 능력·선의 가정

- 충돌 시 직접 대화로 정리하고 결과 기록

- “왜”를 설명하고 근거 제시

- 작성 의도 질문 허용

- 과도한 반복 지양, “LGTM=충분함”의 의미 준수

- 합리적 응답 시간 준수, 시간대 고려

- 긍정 포인트도 언급

#### 하지 말아야 할 것

- 사람 비난·과격한 표현 금지 → 코드에 집중

- 도구 사용 방해 금지(자동 포맷터·봇 등)

- 사소한 선호에 집착 금지, 장기 중요도 기준으로 판단

---

###  코드 포매터: clang-format

- 다양한 스타일(LLVM/Google/WebKit/GNU 등) 지원

- 파일 저장 시 자동 포맷팅 설정 가능

- VS 확장 또는 로컬 clang 설치 후 사용

- 단축키 예: Alt+Shift+F

---

###  Bad Smells

- 중복 코드

- 갑자기 나타나는 매직 넘버·문자열

- 미사용 코드

- 중복·불필요 주석

---

###  예제: Student 클래스 리팩터링 요점

#### 예시 코드 (Bad vs Good)

```c
#define Fresh 1
#define Sophomore 2      // define 사용 자제
#define Junior 3
#define Senior 4

class Student {
	public:
	Student(int id, int year) {  // Initializer list 사용 x
		student_id = id;
		student_year = year;      // Rule of the three 위반
	}

	~Student();

	int GetStudent(){return student_id;}      // 함수 이름 일관성
	int get_student_year(){return student_year;}

	private:
	int student_id;
	int student_year;     // 클래스 멤버 변수와 지역 변수 이름 구분 x
};
                   // 컨테이너 인자를 reference로 처리 x, iterator x
bool FindStudent(int id, std::vector<Student>students) {
	for(int i=0;i<students.size();i++){ // 함수 위치 이상함
		if(students[i].GetStudentID()==id){
			return true;
		}
	}

	return false;
}
```

```c
class Student {
	public:
	enum StudentYear { kFresh = 1, kSophomore, kJunior, kSenior };

	Student(const int id, const StudentYear year):
		id_(id), year_(year) {}
	Student(const Student& student):
		id(student.id_), year_(student.year_) {}
	Student& operator=(const Student& student) {
		if(this != &student) {
			*this = Student(student);
		}
		return *this;
	}
	~Student();

	int id() { return id_;}
	int year() { return year_;}

	bool FindStudent(const int id,
		const std::vector<Student>& students) const {
			for(const auto& student: students) {
				if(student.id_ == id) {
					return true;
				}
			}
		return false;
	}
	private:
	const int id_;
	StudentYear year_;
};

```

---

###  실습: 코드 리뷰 도구·GitHub 워크플로우

- 도구 목록: Gerrit, Crucible, Review Board, Upsource, GitHub CR 등

- **Github의 Fork**: 외부 저장소를 내 원격 저장소로 복제

- **Github의 Pull Request(PR)**: merge 요청 단위로 리뷰·토론·승인

- **PR 화면**: 커밋 메타정보, 파일별 Diff, 인라인 코멘트, 상태 변경(승인/변경요청)

- **Merge**: 충돌 없고 승인 시 메인에 병합

---

###  실습 문제(계산 수수료 함수)

#### bad vs good

```c
int STANDARD=0,BUDGET=1,PREMIUM=2,PREMIUM_PLUS=3;

class Account {
	public:
	double principal,rate;int daysActive,accountType;
};

double caculateFee(std::vector<Account>accounts)
{
double totalFee = 0.0;
Account account;
for(int i=0;i<accounts.size();i++){
	account=accounts[i];
	if(account.accountType==PREMIUM ||
		account.accountType==PREMIUM_PLUS)
		totalFee+=0.0125*(.    //1.25% broker's fee
		account.dayActive/365.25))
		-account.principal);    // interest-principal
	}
	return totalFee;
}
```

    -

    -
