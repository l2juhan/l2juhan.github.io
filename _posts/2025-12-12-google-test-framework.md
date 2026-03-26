---
title: "구글 테스트 프레임워크"
date: 2025-12-12
categories: [Software-Engineering]
subcategory: OpenSource
tags: [testing, google-test, gtest, unit-test]
toc: true
toc_sticky: true
---

**개요**

---

##  구글의 테스트 기준 및 구글테스트 프레임워크 정리

###   1. 구글의 테스트 기준

#### 테스트 크기별 분류

**작은 테스트 (Small Test)**

- 단 하나의 프로세스에서 실행 (때로는 단일 스레드까지 제한)

- sleep, I/O 연산 사용 금지, 대신 **테스트 대역(test double)** 사용 → 실제 의존성을 가짜 객체로 대체

- 목적: 테스트 스위트(테스트 케이스의 집합)가 하루 종일 돌아가는 환경에서 빠른 실행 속도 확보

**중간 크기 테스트 (Medium Test)**

- 여러 프로세스, 여러 스레드 활용 가능

- 로컬호스트와 네트워크 통신 허용 (예: WebDriver)

- 외부 시스템 통신(x) → 하나의 단말에서 수행하도록 강제

**큰 테스트 (Large Test)**

- 제약 없이 무엇이든 가능

- 단점: 여러 기기를 네트워크로 연결하면서 느려지거나 비결정적 동작 가능성 증가

- 사용 사례: 종단간(end-to-end) 테스트, 레거시 컴포넌트 테스트(테스트 대역 사용 불가능)

#### 테스트 범위별 분류

| 범위 | 대응 테스트 유형 | 검증 대상 |
| --- | --- | --- |
| 좁은 범위 | 유닛 테스트 | 독립된 클래스나 메서드 |
| 중간 범위 | 통합 테스트 | 적은 수의 컴포넌트 간 상호작용 (예: 서버-DB) |
| 넓은 범위 | 기능/시스템/종간단 | 여러 컴포넌트 조합 시 예기치 못한 동작 |

#### 이상적인 테스트 분포 (테스트 피라미드)

![구글 테스트 프레임워크](/assets/images/posts/google-test-framework/google-test-framework-1.png)

**아이스크림 콘 패턴**: 시간이 오래 걸림 + 신뢰도↓

**모래시계 패턴**: 독립적으로 만들기 어려울 때 나타나는 패턴

**핵심 원칙**

- 구글은 작은 테스트 + 좁은 범위 테스트를 추구함

- 코드 커버리지는 테스트 품질 지표로 적합하지 않음

- **코드 커버리지**: 전체 코드의 어느정도 비율을 실행했는지 나타내는 지표

---

###   2. 좋은 테스트의 조건

1. **독립적이고 반복적** - 다른 테스트 결과에 영향받지 않아야 함

1. **잘 구성됨** - 테스트 대상 코드의 구조를 반영

1. **이식성 및 재사용 용이 **- 플랫폼에 중립적이어야 함

1. **풍부한 실패 정보** - 문제 발생 시 가능한 많은 정보 제공

1. **빠른 속도**

1. **자동 추적** - 테스트를 수동으로 열거할 필요 없어야 함

---

###   3. 구글테스트(GoogleTest) 프레임워크

#### 개요

- C++ 단위 테스트 라이브러리

- 저장소: http://code.google.com/p/googletest/

**사용 프로젝트들**

- Android 오픈소스 프로젝트

- Chromium (Chrome, Edge 브라우저, ChromeOS)

- LLVM 컴파일러

- Protocol Buffers

- OpenCV

#### Assertion 매크로

**치명성에 따른 분류**

| 종류 | 동작 |
| --- | --- |
| EXPECT_* | 실패해도 테스트 계속 진행 (비치명적) |
| ASSERT_* | 실패하면 테스트 즉시 종료 (치명적) |

**기본 Assertion**

```c++
ASSERT_TRUE(condition);   | EXPECT_TRUE(condition);
ASSERT_FALSE(condition);  | EXPECT_FALSE(condition);

```

**비교 Assertion**

```c++
ASSERT_EQ(expected, actual);  | expected == actual
ASSERT_NE(val1, val2);        | val1 != val2
ASSERT_LT(val1, val2);        | val1 < val2
ASSERT_LE(val1, val2);        | val1 <= val2
ASSERT_GT(val1, val2);        | val1 > val2
ASSERT_GE(val1, val2);        | val1 >= val2

```

**문자열 Assertion**

```c++
// 대소문자 구분
EXPECT_STREQ(str1, str2);
EXPECT_STRNE(str1, str2);

// 대소문자 무시
EXPECT_STRCASEEQ(str1, str2);
EXPECT_STRCASENE(str1, str2);

```

**부동소수점 Assertion**

```c++
EXPECT_FLOAT_EQ(expected, actual);
EXPECT_DOUBLE_EQ(expected, actual);
EXPECT_NEAR(expected, actual, absolute_range);  // 허용 오차 범위 지정

```

#### 코드 예시

```c++
double square-root(const double);
----------------------------------------------------

#include "gtest/gtest.h"

// 테스트 스위트: SquareRootTest, 테스트 이름: PositiveNos
TEST(SquareRootTest, PositiveNos) {
	EXPECT_EQ(18.0, square-root(324.0));
  EXPECT_EQ(25.4, square-root(645.16))
  EXPECT_EQ(50.3321, square-root(2533.310224)); // -> 이게 틀린값
}

TEST(SquareRootTest, ZeroAndNegativeNos) {
  ASSERT_EQ(0.0, square-root(0.0));
  ASSERT_EQ(-1, square-root(-22.0));
}

int main(int argc, char** argv) {
  ::testing::InitGoogleTest(&argc, argv);  // 프레임워크 초기화 (단 한 번만!)
  return RUN_ALL_TESTS();                  // 모든 테스트 자동 검출 및 실행
}
// 단 한번만 호출되어야 함 -> 여러 번 호출할 경우 프레임워크 내부의 여러 상태들에 충돌이 생길 가능성이 있음
// 자동으로 TEST 매크로를 통해 작성된 모든 테스트 케이스들을 검출 및 실행
```

#### 실행 결과 예시

```text
Running main() from user_main.cpp
[==========] Running 2 tests from 1 test case.
[----------] Global test environment set-up.
[----------] 2 tests from SquareRootTest
[ RUN      ] SquareRootTest.PositiveNos
..\user_sqrt.cpp(6862): error: Value of: sqrt (2533.310224)
Actual: 50.332
Expected: 50.3321
[  FAILED  ] SquareRootTest.PositiveNos (9 ms)
[ RUN      ] SquareRootTest.ZeroAndNegativeNos
[       OK ] SquareRootTest.ZeroAndNegativeNos (0 ms)
[----------] 2 tests from SquareRootTest (0 ms total)

[----------] Global test environment tear-down
[==========] 2 tests from 1 test case ran. (10 ms total)
[  PASSED  ] 1 test.
[  FAILED  ] 1 test, listed below:
[  FAILED  ] SquareRootTest.PositiveNos

1 FAILED TEST
```

#### 구글테스트가 좋은 테스트 조건을 충족하는 방법

| 조건 | 구글테스트의 해결책 |
| --- | --- |
| 독립성 | 각 테스트를 서로 다른 객체에서 실행, 개별 테스트 독립 실행 가능 |
| 구조화 | 관련 테스트를 테스트 스위트(test suite)로 그룹화 |
| 이식성 | 다양한 OS, 컴파일러에서 작동 |
| 실패 정보 | 첫 실패에서 멈추지 않고 계속 진행 → 한 사이클에서 여러 버그 발견 |
| 속도 | 테스트 간 공유 자원 재사용, 설정/해제 비용 1회만 지불 |
| 자동화 | 모든 테스트 자동 추적, 수동 열거 불필요 |

---

> 💡  학습정리

    -

    -

    -
