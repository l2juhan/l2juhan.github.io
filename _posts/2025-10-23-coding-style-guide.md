---
title: "코딩 스타일가이드"
date: 2025-10-23
categories: [Software-Engineering]
subcategory: OpenSource
tags: [style-guide, coding-convention, clean-code]
toc: true
toc_sticky: true
---

**개요**

---

##  스타일가이드

###   좋은 소프트웨어 코드의 6가지 공통점

- `가독성`: 의미 있는 이름, 적절한 줄바꿈·들여쓰기

- `주석`: “무엇을”이 아니라 “왜”를 설명, 추후 이해·수정을 돕는 주석 권장 but 주석사용은 호불호가 있음

- **장점**: 의도 전달 명확, 가독성 보완, 기술적 맥락 가능

- **단점**: 유지보수 관리문제, 보안 및 배포과정에서의 문제, 언어 불일치

- `구조 단순화`: 중복·복잡도 축소가 버그 감소로 연결

- `변경 용이성`: 최소 수정으로 미래 요구 반영

- `관리성`: 비밀정보 하드코딩 금지, 모듈화·재사용성

- `기능 충실성`: 배포 전 충분한 점검

###   좋은 코드 작성을 위한 규칙

- 최적화 < 가독성

- 아키텍처 우선 설계(개발 전 사용법·모듈화·테스트·업데이트 고려)

- KISS(Keep It Simple And Stupid): 불필요한 추상화 자제, 간단·단순하게

- 주석은 보조 수단, 클래스·메서드 수준의 요약 문서화

###   프로그래밍 스타일가이드(= 코드 컨벤션)

- “코드를 어떻게 작성할지” 규칙 집합, 팀 표준을 배우고 따를 것

- 절대 법칙 아님(팀 가이드가 우선)

###   스타일가이드에서 다루는 내용들

- 일반적인 이름 규칙

- 파일 이름

- 타입 이름

- 변수 이름

- 일반적인 변수, 상수, 함수, 네임 스페이스, 매크로 이름

- 주석

#### 스타일가이드 코드 예시

```c
int pow(int x, int n){ // 함수이름과 괄호 및 인자 사이에는 공백x, 매개변수 사이에 공백 한칸씩
	int result = 1;

	for (int i = 0; i<n; i++){ //for/while/if 뒤에 공백 한칸
		result *= x; //공백 4칸(Tab 금지), 연산자 앞에 공백 한칸
		}

		return result;
}

int main(){
	int x = 0;
	int n = 0;

	scanf("%d", &x);
	scanf("%d", &n);
	// 논리적으로 다른 블럭은 한 줄 띄어쓰기
	if (n < 0){
		printf("Power %d is not supported, \ // 한줄은 너무 길지 않게
		please enter a non-negative integer number\n", n); // 프로그램 구조를 단순화, 중첩된 조건문 최대한 배제하기
		return 0;
	}

	printf("%d\n", pow(x,n));

	return 0;
}
```

```c
// 나쁜 예시
int main(){
int score,char grade;
printf("test");
scanf("%d",&score);
if(num>=90)
grade = 'A';
else if(score>=80)
grade = 'B';
else
grade = 'F';
return 0;}


```

```c
// 좋은 예시
int main(){
	int score = 0;
	// A is an initial value for grade.
	//It should be updated properly.
	char grade = 'A';

	printf("test");
	scanf("%d",&score);

	if (num>=90)
		grade = 'A';
	else if (num>=80)
		grade = 'B';
	else
		grade = 'F';
	return 0;
}
```

###   Google C++ 스타일가이드 예시

- **#define 가드**: `<PROJECT>_<PATH>_<FILE>_H_`

```c
#ifdef FOO_BAR_BAZ_H_
#define FOO_BAR_BAZ_H_
...
#endif
```

- **지역 변수**: 가장 좁은 범위, 선언과 동시에 초기화

```c
// Bad Case 1 (initialization seperate from declaration)
int i;
i=f();

//Bad Case 2 (declaration separate from use)
int jobs = NumJobs();
//More code...
f(jobs);
```

```c
// Good Case 1 (declaration has initialization)
int i = f();

// Good Case 2 (declaration immediately followed by use)
int jobs = NumJob();
f(jobs);
```

- 암시적 변환 금지(필요한 경우 `explicit`)

###   Chromium C++ 스타일가이드 요점

- 모든 파일에 공통 라이선스 헤더 (`#pragma once` 대신 include guard)

- 코드 검색: style 참고를 위한 공개 코드베이스

###   기타 스타일가이드

- **MISRA-C**: 유럽의 자동차 연합에서 개발한 C 프로그램 코딩 규칙·지침 집합(예: `default` 필수, 콤마 연산자 비권장)

- **SEI CERT C**: 행정안전부에서 개발한 코딩 규칙별 심각도·발생가능성·교정비용 지표

![코딩 스타일가이드](/assets/images/posts/coding-style-guide/coding-style-guide-1.png)

---

##  CSE3210 C++ 스타일가이드

###   헤더 파일

- `#define` 가드 필수

- **형식**: `<PROJECT>_<PATH>_<FILE>_H_`

```c
#ifdef FOO_BAR_BAZ_H_
#define FOO_BAR_BAZ_H_
...
#endif
```

###   인라인 함수

- 10라인 내외의 짧은 함수만 인라인 권장

###   include 이름과 순서

- **순서**: C → C++ → 외부 라이브러리 → 현재 프로젝트

- 경로는 프로젝트 루트 기준

```c
#include "foo/public/fooserver.h" // proper location

#include <sys/types.h>
#include <unistd.h>
#include <hash_map>
#include <vector>

#include "base/basictypes.h"
#include "base/commandlineflags.h"
#include "foo/public/bar.h"
```

###   범위와 변수

- **지역 변수**: 가장 좁은 범위, 선언과 동시에 초기화

```c
int i;
i = f(); // bad - initialization is separated from the declaration.

int j = g(); // good

vector<int> v;
v.push_back(1);
v.push_back(2); // bad - use parathesis to combine initialization and decl.

vector<int> vv = {1,2}; // good
```

- 전역/정적(클래스 타입) 지양(필요 최소화)

###   클래스

- **생성자**: initializer list 사용, 복잡 초기화는 지양

```c
Thing (int foo, int bar) {
	foo_ = foo;
	bar_ = bar;    // bad = It is not using an initialization list
}

Thing(int foo, int bar): foo_(foo), bar_(bar) { }  // good
```

- **Rule of Three**: 소멸자·복사생성자·대입연산자 셋을 함께 고려, 복사 금지는 매크로로 차단 가능

```c
// Macro to disallow copy cconstructor and '=' operator
// This macro should be defined in ther private part of the class declaration
#define DISALLOW_COPY_AND_ASSIGN(TypeName) \
	TypeName (const TypeName&) = delete;     \
	TypeName& operator=(const TypeName&) = delete

class Foo {
	public:
	Foo(int f);
	~Foo();

	private:
	DISALLOW_COPY_AND_ASSIGN(Foo);
};
```

- **접근 제어**: 데이터 멤버는 private, 필요시 접근자 함수를 통해 접근

- **선언 순서**: `public → protected → private`, 메서드가 데이터 멤버보다 먼저

1. typedef 들과 열거형

1. 상수 (static const 데이터 멤버)

1. 생성자

1. 소멸자

1. 정적 메서드를 포함한 모든 메서드

1. 데이터 멤버 (단 static const 데이터 멤버 제외)

- 짧은 함수 선호(40라인 넘으면 분리 고려)

###   레퍼런스 인자

- 레퍼런스로 전달되는 모든 인자는 const로 수식되어야 함

- 컨테이너를 인자로 사용 할 경우, 레퍼런스 사용을 선호

```c
void Foo(const string &in, string *out);
```

###   형 변환

- C++ 스타일 캐스트 사용(`static_cast` 등)

- C식 캐스트 금지

```c
int y = (int)x; // bad

ch = static_cast<char>(i); // good
```

###   전처리기 매크로

- 최대한 회피

-  상수는 `const`

- 성능은 인라인 함수로 대체

- 조건부 컴파일 남발 금지

###   반복·수식·조건

- **반복**: 컨테이너 접근은 iterator 선호

```c
std::vector<int> v{1, 2, 3, 4};
  for (std::vector<int>::iterator it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << ' ';
  }
```

- 단항 연산자는 붙여 쓰기

```c
a ++; // bad
a++;  // good
```

- 이항은 공백

```c
a=b+c+d;       // bad
a = b + c + d; // good
```

- 삼항은 조건 괄호화

```c
a > b ? x : -x;   // bad
(a > b) ? x : -x; // good
```

- `switch`: `break`와 `default` 필수, fallthrough 시 주석

```c
case 1:
	statements
case 2:
	... // bad

case 1:
	statements
	break;
case 2:
	statements
	break;
default:  // good
```

- 중첩 조건 축소: 조기 `return` 등으로 가독성 향상

```c
if (...) {
	...
} else {
	...
	if (...) {
		if (...) {
			... // bad
--------------------------
if (...) {
	...
	return ...
}

if (...) {
	...  // good
```

###   이름 규칙

가능하면 상세하게 작성

- **파일**: 소문자+언더스코어(_) / 대시(-), `.cc`/`.h`. 구체적 이름 권장

```c
my_useful_class.cc
my-useful-class.cc
myusefulclass.cc
myusefulclass_test.cc
```

- **타입**: 파스칼 케이스, 언더스코어x

```c
// class and struct
class UrlTable { ...
class UrlTableTester { ...

// typedef
typedef hash_map<UrlTableProperties *, string> PropertiesMap;

// enum type
enum UrlTableError { ...
```

- **변수**: 소문자+언더스코어, class 데이터멤버는 끝에 `_`, 구조체 멤버는 `_` 생략, 전역변수는 g_ 접두어 사용

```c
string tableName;   // bad - there exists a uppercase
string table_name;  // good - it uses underscore
string tablename;   // good - all characters are lowercase

class Foo{
	string table_name_;
	string tablename_;   // good
};

struct Foo {
	string name;
	int num_entries;    // good
};

int g_number; // good
```

- **상수**: k로 시작+매 단어 첫글자만 대문자

```c
const int kDaysInAWeek = 7;
```

- **함수**: 대소문자가 섞인 이름, get_ / set_ 사용

```c
MyExcitingFunction();              // 일반함수 : 대문자로 시작 + 언더스코어x + 크래시 발생할 수 있다면 OrDie붙이기
get_my_exiciting_member_variable();  // 접근자 : get_ + 변수 이름 일치
set_my_exciting_member_variable();   // 변경자 : set_ + 변수 이름 일치

+) inline함수에서는 소문자 사용 가능
```

- **네임스페이스**: 소문자 + 프로젝트명 기반 ( 예시: google_awesome_project.)

- **열거형**: 상수 or 매크로 방식 사용

```c
enum UrlTableErrors {
	kOk = 0;
	kErrorOutOfMemory,
	kErrorMalformedInput,
};

enum AlternateUrlTableErrors {
	OK = 0;
	OUT_OF_MEMORY = 1,
	MALFORMED_INPUT = 2,
};
```

- **매크로 이름**: 꼭 필요 시 대문자+언더스코어 (일반적으로 사용하지 않는 것이 좋음)

```c
#define ROUND(x) ...
#define PI_ROUNDED 3.0
```

###   포매팅 및 주석

- **줄 길이**: 80자, 일부 예외 허용(URL, #include 등) but 헤더의 가드는 최대 길이 제한x

- **들여쓰기**: 스페이스만, 2칸(탭 금지)

- **주석 내 금지 문자열**: 주석 내부에 `/*`, `//` 재사용 금지, 원시 코드와 주석 일치

---

---

> 💡  학습정리

    -

    -

    -
