---
title: "UML과 클래스 다이어그램"
date: 2025-12-11
categories: [Software-Engineering]
subcategory: OpenSource
tags: [uml, class-diagram, modeling]
toc: true
toc_sticky: true
---

**개요**

---

##  UML과 클래스 다이어그램 정리

###   1. UML (Unified Modeling Language)

#### 정의

- UML은 시스템을 시각적으로 설계하고 문서화하는 데 사용되는 표준화된 모델링 언어

- 소프트웨어뿐만 아니라 비즈니스 프로세스, 조직 구조 등 여러 분야에서 사용될 수 있는 범용적 모델링 언어

#### 특징

- 객체 지향 설계 개념을 기반으로 하며, 다양한 다이어그램을 통해 시스템의 구조, 동작, 상호작용 등을 표현

- UML은 총 12개의 다이어그램을 제시

**구조 다이어그램 (Structural Diagram):** 클래스, (객체, 복합 구조, 배치, 컴포넌트, 패키지)

**행위 다이어그램 (Behavioral Diagram):** 활동, 유스케이스, 상태 머신

**상호작용 다이어그램 (Interaction Diagram):** 순차, 통신, 타이밍

---

###   2. 클래스 다이어그램

#### 정의

시스템을 구성하는 클래스, 클래스의 속성(데이터)과 메서드, 클래스 간의 관계 등을 시각적으로 표현

#### 클래스 표현 방식

세 칸의 직사각형 모양으로 클래스를 표현함

```text
┌─────────────────┐
│     Person      │  ← 클래스 이름
├─────────────────┤
│ -nationality    │
│ -name           │  ← 속성 (attributes)
│ -age            │
│ -gender         │
├─────────────────┤
│ +eat()          │
│ +smile()        │  ← 메서드 (operations)
│ +walk()         │
│ +run()          │
└─────────────────┘
```

#### 구성 요소

**클래스 이름:** 다른 클래스와 구별되는 유일한 이름을 가짐. 명사 또는 명사구를 사용하며, 두 단어 사용 시 각 단어의 첫 글자는 대문자로 씀 (예: `CellPhone`).

**속성 (Attributes):** 클래스가 가지는 특성 또는 변수. 이름은 소문자로 나타내며 두 단어 사용 시 두 번째 단어의 첫 글자는 대문자로 씀 (예: `phoneNumber`).

**메서드 (Operations):** 클래스가 수행할 수 있는 동작 또는 함수

#### 가시성 (Visibility)

속성과 메서드의 접근 권한을 지정하는 방식임:

| 가시성 | 기호 | 설명 |
| --- | --- | --- |
| public | + | 같은 시스템에 있는 모든 클래스에서 접근 가능 |
| private | - | 같은 시스템 내의 다른 클래스는 직접 접근 불가. 해당 클래스의 메서드를 통해서만 접근 가능. 대부분의 속성은 private으로 설정 |
| protected | # | 다른 클래스가 접근할 수 없고, 해당 클래스의 메서드와 상속받은 하위 클래스만 접근 가능 |

---

###   3. 클래스 간의 관계유형

- 객체지향 시스템은 클래스들이 모여 서로 관계를 맺고, 관계를 통해 메시지를 주고받으며 기능을 제공함

#### 3.1 연관 관계 (Association Relationship)

- 클래스 간에 서로 메시지를 주고받으며 이용하는 관계

- 한 클래스가 상대 클래스에서 제공하는 기능을 사용함

**1) 양방향 연관 관계**

단순한 연관 관계로, 두 클래스가 서로를 알고 있는 관계

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-1.png)

"교수는 학생에게 수업하고, 학생은 교수에게 수업을 받는다"로 해석

**2) 역할이 부여된 연관 관계**

연관 관계에서 각자에게 역할을 부여할 수 있음

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-2.png)

**3) 다중 연관 관계**

다중 관계는 선 위에 다중성을 표기해 나타냄

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-3.png)

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-4.png)

교수 1명이 여러 명의 학생을 가르치는 관계(다 대 다 관계는 실제로 구현하기 어려우므로 일 대 다 관계로 변환해 사용하는 것이 좋음)

**4) 단방향 연관 관계**

두 클래스가 서로 아는 관계가 아니고 한쪽만 아는 관계를 나타냄(방향성을 나타내는 화살표가 있는 직선 실선으로 표현)

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-5.png)

**5) 연관 클래스**

연관 관계를 더 구체적으로 나타내고 싶을 때 클래스를 추가해 사용(점선을 사용해 나타내며, 일반 클래스처럼 다른 클래스와도 연관 관계를 맺을 수 있음)

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-6.png)

---

#### 3.2 일반화 관계 (Generalization Relationship)

- 공통점을 가지고 있는 여러 개의 클래스를 묶어서 새로운 클래스를 만들고 공통적인 이름을 붙인 것

- 일반화 관계는 **상속 구조**이며 하위 클래스는 상위 클래스의 모든 것(속성, 메서드)을 상속받아 사용

`**is a kind of**`** 관계가 성립되어야 함:**

"사각형은 도형의 일종이다", "원은 도형의 일종이다"

속이 빈 삼각형 화살표(△)를 사용하여 하위 클래스에서 상위 클래스 방향으로 표시함

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-7.png)

---

#### 3.3 집합 관계 (Aggregation Relationship)

상위 클래스가 하위 클래스로 구성될 때의 관계로 `'is composed of'`가 성립되어야 함

**특징:**

모든 객체가 **별개의 생명주기**를 가지고 있으며, 각각 독립적으로 동작하기 때문에 **약한 결합 관계**

**예시:** 컴퓨터는 모니터, 본체, 키보드로 이루어짐. 모니터는 다른 컴퓨터에서도 사용할 수 있으며, 모니터가 고장나면 모니터만 다른 것으로 교체 가능

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-8.png)

속이 빈 마름모()를 사용하여 전체 클래스 쪽에 표시함

---

#### 3.4 합성 관계 (Composition Relationship)

집합 관계와 많은 부분이 유사하지만, 전체 객체에 완전히 종속되어 “**독립된 객체로 존재할 수 없다”**는 것이 다름

**특징:**

모든 객체가 **같은 생명주기**를 가지고 있으므로 각각 독립적으로 동작할 수 없는 **강한 결합 관계**임

**예시:** 노트북은 본체, 모니터, 키보드가 일체형으로 되어 있고, 각각을 분리해 다른 곳에서 재사용할 수 없음

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-9.png)

속이 채워진 마름모(◆)를 사용하여 전체 클래스 쪽에 표시

---

#### 3.5 의존 관계 (Dependency Relationship)

서로 상대의 클래스를 사용(참조)할 때의 관계로, 클래스 A의 변화는 클래스 B의 변화로 연결되는 점에서 연관 관계와 유사

**연관 관계 vs 의존 관계 차이점:**

| 구분 | 연관 관계 | 의존 관계 |
| --- | --- | --- |
| 참조 방식 | 상대 클래스를 멤버 변수로 가짐 | 메서드에서 상대 객체를 사용 |
| 관계 유지 시간 | 객체가 존재하는 동안 지속 | 함수가 사용되는 짧은 시간만 유지 |

**연관 관계 예시 (멤버 변수로 사용):**

```java
public class Repeater {
    // Scan 클래스를 멤버 변수로 사용
    public Scan scan = new Scan();

    public void repeat() {
        int max = scan.returnInt();
        // ...
    }
}
```

**의존 관계 Case 1 (파라미터로 받아 사용):**

```java
public class Repeater {
    // Scan 클래스를 인자로 사용
    public void repeat(Scan scan) {
        // Repeater 클래스와 동일한 로직
    }
}
// Main에서 사용
repeater.repeat(new Scan());
```

**의존 관계 Case 2 (지역 변수로 생성해 사용):**

```java
public class Repeater {
    // Scan 클래스를 지역 변수로 선언하여 사용
    public void repeat() {
        Scan scan = new Scan();
        int count = 0;
        int max = scan.returnInt();
        // ...
    }
}
```

의존 관계는 점선 화살표(- - - →)로 표현

---

#### 3.6 실체화 관계 (Realization Relationship)

인터페이스 클래스는 **'메서드'의 공통 특성**을 묶어 새로운 인터페이스 클래스를 생성

**특징:**

인터페이스 클래스는 변수를 정의할 수 없고, 추상 메서드를 가지며, 이 메서드에 대한 구체적인 실현은 하위 클래스에서 구현

스테레오 타입으로 `<<interface>>`를 사용하고, 하위 클래스와의 관계는 일반화 관계와 다르게 **점선**으로 나타냄

**일반화 관계 vs 실체화 관계:**

일반화 관계는 공통 특성을 갖는 클래스를 생성하여 상속 구조를 갖는 반면, 실체화 관계는 메서드의 공통 특성만 묶어 인터페이스를 생성함

**예시:** 버스와 지하철에 환승 기능을 넣고 싶을 때 (택시는 환승이 불가), `Transferable`이라는 인터페이스 클래스를 생성하고 환승이 가능한 버스와 지하철에만 환승 기능을 구현함

![UML과 클래스 다이어그램](/assets/images/posts/uml-class-diagram/uml-class-diagram-10.png)

점선 삼각형 화살표(△ 점선)를 사용하여 구현 클래스에서 인터페이스 방향으로 표시

---

### 요약: 클래스 관계 표기법

| 관계 유형 | 표기법 | 키워드 |
| --- | --- | --- |
| 연관 관계 | 실선 (─) | - |
| 단방향 연관 | 실선 + 화살표 (→) | - |
| 일반화 관계 | 실선 + 빈 삼각형 (─△) | is a kind of |
| 집합 관계 | 실선 + 빈 마름모 (◇─) | is composed of (약한 결합) |
| 합성 관계 | 실선 + 채워진 마름모 (◆─) | is composed of (강한 결합) |
| 의존 관계 | 점선 + 화살표 (--→) | - |
| 실체화 관계 | 점선 + 빈 삼각형 (--△) | implements |

---

> 💡  학습정리

    -

    -

    -
