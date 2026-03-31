---
layout: post
title: "Structural and Creational Pattern — 구조 패턴과 생성 패턴"
date: 2026-03-30
categories: [Software-Engineering]
tags: [design-pattern, structural, creational, decorator, adapter, factory-method]
description: "구조 패턴(Decorator, Adapter)과 생성 패턴(Factory Method)의 개념, 문제 상황, 적용 방법 정리"
---

객체지향 설계에서 클래스를 확장하거나 새로운 객체를 생성하는 과정은 반복적인 문제를 수반한다. 구조 패턴은 클래스의 합성 방법을, 생성 패턴은 객체 생성의 위임 방법을 체계화한다.

## 구조 패턴 (Structural Pattern)

구조 패턴은 클래스의 기본 구조를 확장하여 더 큰 구조를 제공할 수 있도록 클래스와 객체를 어떻게 구성하는지를 표현한다. 새로운 기능을 제공하기 위하여 기존의 객체를 어떻게 합성할 것인가를 설명하며, 객체를 생성하거나 합성하기 위한 융통성은 정적 클래스로부터 생성하기는 어렵고 대체로 런타임에서 이루어질 때 가능하다.

| 구조 패턴 | 적용 측면 |
|--------|--------|
| **어댑터(Adapter)** | 객체의 인터페이스를 융통성 있게 구성하는 방법 제공 |
| 브리지(Bridge) | 객체의 인터페이스와 구현을 분리하는 방법 제공 |
| 복합체(Composite) | 객체의 구조와 서로 다른 객체를 합성하는 방법 제공 |
| **데코레이터(Decorator)** | 하위 클래스 생성 없이 객체의 기능을 확장하는 방법 제공 |
| 퍼사드(Facade) | 서브시스템에 대한 통합 인터페이스를 구성하는 방법 제공 |
| 플라이웨이트(Flyweight) | 객체의 저장소 접근 및 활용 방법 제공 |
| 프록시(Proxy) | 객체의 접근 방법 및 위치에 대한 구성 방법 제공 |

## Decorator 패턴

### 기본 아이디어

> 기본 클래스를 조합해서 많은 클래스를 만들어야 한다면? 많은 클래스를 조용히 처리하라!

Decorator 패턴은 객체에 새로운 기능을 추가하는 디자인 패턴으로, 객체를 확장할 때 **상속을 사용하지 않고도 동적으로 기능을 추가**할 수 있도록 설계한다. 데코레이션(decoration)은 '장식'이란 뜻으로, 기본이 있고 그 위에 부수적으로 추가하는 것을 의미한다.

### 예제: 토스트 가게

토스트를 판매할 때 칼로리를 계산해 알려주는 토스트 가게가 있다.

- 현재 판매하는 메뉴: 치즈 토스트, 야채 토스트, 햄 토스트 (3종류)
- 앞으로 재료도 늘어날 것이고 재료를 혼합한 토스트 종류도 늘어날 예정
- 3가지 재료로 만들 수 있는 토스트는 총 **7가지** (기본 3 + 복합 4)
- 기본 재료로 달걀을 더 추가한다면 메뉴는 총 **15가지**로 폭증
- 가게를 확장하며 식빵 종류를 4가지(보통, 버터, 우유, 호밀)로 늘렸다면?

개방 폐쇄 원칙에 따라 식빵의 종류를 묶어서 상속 구조로 만들고 재료도 종류에 따라 상속 구조로 만들 것이다. 하지만 기본 재료가 추가될 때마다 그것을 조합해 만들어지는 토스트의 종류(클래스)는 급격하게 늘어난다.

### Decorator 패턴 적용

Decorator 패턴을 적용하면 식빵은 상속 구조를 사용하고, 재료를 기본 재료(햄, 야채, 치즈, 달걀)와 복합 재료로 나누는 것부터 시작한다.

핵심은 **혼합 재료의 숫자만큼 클래스를 만들지 않고, 기본 재료만 가지고 해결**하는 것이다. 기본 재료는 하위 클래스에 놓고 상위 클래스에 `ToppingDecorator`라는 이름의 클래스를 만든다.

![Decorator 패턴 클래스 다이어그램](/assets/images/posts/structural-creational-pattern/structural-creational-pattern-1.png)

`ToppingDecorator`는 `Toast`를 상속받으면서 동시에 `Toast*` 멤버 변수를 가진다. 이를 통해 기본 재료를 계속 늘려 나가는 방식으로 프로그래밍한다:

```cpp
Toast* toast1 = new NormalBread();    // 1. Toast 타입의 '일반 식빵' 객체 생성
toast1 = new Cheese(toast1);          // 2. '치즈' 객체의 toast_를 '일반 식빵'으로 초기화
toast1 = new Ham(toast1);             // 3. '햄' 객체의 toast_를 '치즈→일반 식빵'으로 초기화
toast1->serve();                      // 4. 누적된 이름과 칼로리 출력
// 결과: 햄치즈 식빵 토스트, 550Kcal
```

### Decorator 패턴 정리

- 객체지향 방법에서는 객체를 안정적으로 추가/삭제할 수 있는 방법으로 **상속**을 많이 활용한다
- 하지만 상속 구조는 상위 클래스와 하위 클래스 간에 강한 결합으로 묶이게 되고 객체를 동적으로 확장할 때는 구현하기 쉽지 않다
- **구성(합성)은 객체를 실행하는 도중에 동적으로 확장**한다는 장점이 있다

## Adapter 패턴

### 기본 아이디어

> 구매한 컴포넌트가 맞지 않아 바로 사용할 수 없다면? Adapter를 만들어 사용하라!

Adapter의 의미는 '접속 소켓', '확장 카드', '(물건을 다른 것에) 맞추어 붙이다', '맞추다'이다. **호환되지 않는 두 인터페이스를 작동시킬 수 있도록 만든 인터페이스**이다.

Adapter 패턴은 다음 두 가지 형태로 사용한다:
- **클래스 adapter 패턴**: 상속을 이용한 어댑터 패턴
- **인스턴스 adapter 패턴**: 위임을 이용한 어댑터 패턴

### 예제: 삼성폰에서 에어팟 사용하기

삼성 휴대폰에 무선 이어폰 Buds 대신 애플의 무선 이어폰 Airpods을 사용할 수 있게 하는 것이다. 두 이어폰의 기능은 재생과 멈춤으로 한정한다.

- Buds는 재생 기능에 `play()`, 멈춤 기능에 `stop()` 메서드를 사용
- Airpods은 재생 기능에 `playing()`, 멈춤 기능에 `stopping()` 메서드를 사용

인터페이스가 다르기 때문에 SamsungPhone에서 Airpods을 직접 사용할 수 없다.

### Adapter 패턴 적용

`<<interface>>` 타입의 `AirPodsInterface` 클래스를 정의하고 그 메서드는 Buds에서 사용하는 `play()`, `stop()`과 같게 한다. 어댑터로 `AirPodsAdapter` 클래스를 만들어 `AirPods` 클래스를 상속받아 삼성 휴대폰에서 AirPods 메서드들이 동작할 수 있도록 `AirPodsInterface`를 실체화한다.

![Adapter 패턴 클래스 다이어그램](/assets/images/posts/structural-creational-pattern/structural-creational-pattern-2.png)

`AirPodsAdapter`는 `AirPods`와 `AirPodsInterface`를 모두 상속받는다. `play()` 호출 시 내부적으로 `playing()`을, `stop()` 호출 시 `stopping()`을 호출하는 방식이다. SamsungPhone은 `AirPodsAdapter`를 Buds처럼 사용할 수 있다.

## 생성 패턴 (Creational Pattern)

생성 패턴은 클래스의 인스턴스가 어떻게 생성되는가를 추상화하여 나타낸 것이다. 객체가 생성, 합성, 표현되는 방식에 관계없이 시스템을 **독립적**으로 생성할 수 있도록 지원한다.

| 생성 패턴 | 적용 측면 |
|--------|--------|
| **팩토리 메서드(Factory Method)** | 객체 생성 시점을 하위 클래스가 결정할 수 있도록 제공 |
| 추상 팩토리(Abstract Factory) | 제품 군의 유사 객체들을 생성하는 방법 제공 |
| 빌더(Builder) | 유사한 다수 객체들을 생성하여 합성하는 방법 제공 |
| 프로토타입(Prototype) | 생성 객체를 복사 및 변경하여 객체를 생성하는 방법 제공 |
| 싱글턴(Singleton) | 오직 하나의 객체만 생성 |

## Factory Method 패턴

### 기본 아이디어

> 객체 생성을 직접 하지 않고 누군가에게 맡기고 싶다면? Factory method 패턴을 생각해보라.

클래스(class A)에서 다른 클래스(class B)의 객체를 생성할 때, 두 클래스 사이에는 의존 관계가 발생한다. 서로 간에 강한 결합을 이루게 되고 변경에 따른 영향을 받아 코드의 유연한 확장이나 변경 같은 유지보수를 어렵게 만든다.

핵심: 필요한 객체를 클래스(class A)에서 생성하지 말고, **객체를 전문으로 생성하는 factory 클래스를 만들어 해결**한다. 구체적인 클래스를 명시하지 않고 객체를 생성하는 것이다.

### 예제: 게임 서버

게임 서버는 게임의 종류가 늘어날 때마다 추가된다. 하나의 게임을 선택하면 게임 서버는 '정상 연결' 메시지와 함께 게임명, 게임 버전, '게임 실행 준비 완료' 메시지를 화면에 띄운다. 추후에는 게임 서버도 국가별로 별도로 둘 예정이다.

### Factory Method 패턴 적용 — 1단계

GameServer 클래스에서 `new`를 사용해 자신이 직접 객체를 생성하지 않고, 객체 생성을 `GameServerFactory` 클래스에게 위임한다.

게임 종류의 추가/삭제에 따른 변화로 수정되는 부분을 분리(의존성 분리)하여 오류가 발생한 위치를 쉽게 찾을 수 있고 새로운 요구사항에도 쉽게 대응 가능하다.

### Factory Method 패턴 적용 — 2단계

국가별로 GameServer를 계속 추가할 수 있도록 `KRGameServer`와 `JPGameServer`로 GameServer를 확장한다. 국가별 특성에 맞게 약간 수정한 `KRSuperMario`, `KRTetris`, `JPSuperMario`, `JPTetris`를 추가해 Games를 확장한다.

![Factory Method 최종 클래스 다이어그램](/assets/images/posts/structural-creational-pattern/structural-creational-pattern-3.png)

1단계와의 차이점:
1. GameServer 확장을 고려한 상속 구조
2. 나라별 game 증가를 고려한 상속 구조
3. `GameServerFactory` 클래스가 사라지고, 객체 생성 역할(factory method)을 수행하는 추상 메서드(`chooseGame()`)를 상위 클래스 `GameServer`에 정의하고, 이 메서드는 하위 클래스(`KRGameServer`, `JPGameServer`)에서 특성별로 구현

### Factory Method 패턴 정리

- **1단계**: 객체를 생성할 수 있는 factory 클래스를 만들어 모든 객체의 생성을 위임
- **2단계**: factory 클래스의 역할(객체 생성)을 수행하는 추상 메서드를 상위 클래스에 정의하고, 이 메서드는 하위 클래스에서 특성별로 구현 (1단계에서 생성한 factory 클래스는 제거)

일반적으로 `new`를 사용한 객체 생성은 강한 결합을 만들어서 유지보수를 어렵게 한다.
