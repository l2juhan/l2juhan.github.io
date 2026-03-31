---
layout: post
title: "Design Pattern Types — 디자인 패턴 종류와 행위 패턴"
date: 2026-03-30
categories: [Software-Engineering]
tags: [design-pattern, gof, behavioral, strategy, state, observer, command]
description: "GoF 디자인 패턴의 3가지 분류(행위/구조/생성), 행위 패턴 개요, Strategy 패턴과 State 패턴"
---

디자인 패턴은 복잡성, 상세도 및 설계 중인 전체 시스템에 대한 적용 범위에 따라 분류된다. GoF 설계 패턴은 크게 행위, 구조, 생성의 세 가지로 나뉜다.

## 디자인 패턴 종류

- **행위(Behavioral) 패턴**: 클래스나 객체들이 상호작용하는 방법과 책임을 분산하는 방법을 정의한다. 반복적으로 사용되는 객체들의 상호작용을 결합도를 최소화하는 방법으로 패턴화한 것이다. 객체 간의 효과적인 의사소통과 책임 할당을 처리한다.
- **구조(Structural) 패턴**: 프로그램의 구조(데이터 또는 인터페이스 구조 등)를 설계하는 데 활용한다. 클래스나 객체의 합성으로 더 큰 구조를 만들어야 할 때 유용한 디자인 패턴이다.
- **생성(Creational) 패턴**: 객체의 생성과 참조 과정에 관련된 패턴이다. 객체의 생성 과정을 분리함으로써 객체가 변경되더라도 전체 시스템에 미치는 영향을 최소화하여 코드의 유연성을 높이고 유지관리를 개선한다.

### GoF 설계 패턴

| 분류 | 패턴 이름 |
|------|--------|
| 행위(Behavioral) | 책임 연쇄(Chain of Responsibility), 커맨드(Command), 해석자(Interpreter), 반복자(Iterator), 중재자(Mediator), 메멘토(Memento), 옵서버(Observer), **상태(State)**, **전략(Strategy)**, 템플릿 메서드(Template Method), 비지터(Visitor) |
| 구조(Structural) | **어댑터(Adapter)**, 브리지(Bridge), 복합체(Composite), **데코레이터(Decorator)**, 퍼사드(Facade), 플라이웨이트(Flyweight), 프록시(Proxy) |
| 생성(Creational) | **팩토리 메서드(Factory Method)**, 추상 팩토리(Abstract Factory), 빌더(Builder), 프로토타입(Prototype), 싱글턴(Singleton) |

각 분류에 속한 패턴은 다른 분류에 속한 패턴과 서로 관련성이 있다. 예를 들어 구조 패턴 "Composite"는 연산을 추가하거나 하위 클래스를 나열하는 방식으로 행위 패턴의 "Visitor"나 "Iterator" 패턴으로 확장된다.

## 행위 패턴

행위 패턴은 반복적으로 사용되는 객체의 상호작용을 패턴화한 것이다. 객체에 주어지는 기능 및 책임과 관련 있으며, 객체 간의 상호작용을 표현한다. 패턴은 제어 흐름에 집중하기보다 상호 연결 방식에 집중할 수 있도록 지원하며, 행위 패턴은 상속을 통해서 클래스에 존재하는 동작을 전달(배포)한다.

| 행위 패턴 | 적용 측면 |
|--------|--------|
| 책임연쇄(Chain of Responsibility) | 서비스 요청을 충족하는 객체를 찾는 방법 제공 |
| 커맨드(Command) | 언제 어떻게 서비스를 제공할 것인가에 대한 방법 제공 |
| 해석자(Interpreter) | 언어 문법과 해석에 대한 방법 제공 |
| 반복자(Iterator) | 집합 요소들의 접근에 대한 방법 제공 |
| 중재자(Mediator) | 객체 간 상호작용을 단순화하는 방법 제공 |
| 메멘토(Memento) | 객체 외부에 저장되는 정보를 다루는 방법 제공 |
| 옵서버(Observer) | 의존 객체의 행동을 관찰하는 수단 제공 |
| 상태(State) | 객체 상태를 표현하고 상태에 따라 동작하는 방법 제공 |
| 전략(Strategy) | 다수의 구현 알고리즘의 선택을 지원하는 방법 제공 |
| 템플릿 메서드(Template Method) | 한 알고리즘의 처리 단계를 재구성하는 방법 제공 |
| 비지터(Visitor) | 클래스 변경 없이 연산을 적용하는 방법 제공 |

## Strategy 패턴

### 기본 아이디어

> 자주 바뀌는 것이 기능(method)이라면? 메서드를 클래스로 바꾸고 `<<interface>>` 타입의 상속 구조를 만들어라.

### 예제: 포켓몬 게임

포켓몬의 종류가 자주 추가되고 삭제되며, 기술이 발전함에 따라 성능 개선을 위해 기능(공격, 패시브)이 수정되기도 하고 새로운 공격 기술이 추가된다.

### 일반적인 클래스 설계

모든 포켓몬이 공통으로 가지는 공격/패시브 기술은 상위 클래스의 `attack()`과 `passive()` 메서드로 놓고 하위 클래스에서 상속한다.

![Strategy 패턴 사용 전](/assets/images/posts/design-pattern-types/design-pattern-types-1.png)

상위 클래스 `Pokemon`에 `virtual` 메서드를 정의하고, `Purin`, `Pairi`, `Pikachu`가 이를 override하여 각자의 공격/패시브를 구현한다.

### 문제: 기능 변화

- 기술이 발전함에 따라 공격과 패시브 기술이 계속 교체되지만 이에 대한 해결책이 없다
- 클래스 설계 원칙 중 **OCP(개방 폐쇄 원칙)**를 위반하는 것일 뿐 아니라 프로그램을 복잡하게 만든다

### Strategy 패턴 적용

해결책은 자주 바뀌는 것이 무엇인지 찾아 그들을 **별도의 상속 구조**로 만들어 사용하는 것이다. 자주 바뀌는 것이 `attack()`과 `passive()`이기 때문에 이들을 클래스로 만들고 상속 구조로 설계한다.

![Strategy 패턴 적용 후](/assets/images/posts/design-pattern-types/design-pattern-types-2.png)

1. 포켓몬의 종류를 계속 추가/삭제할 수 있도록 `Pokemon` 클래스를 상위 클래스, 포켓몬 종류를 하위 클래스로 배치한 상속 구조로 설계
2. `Pokemon` 클래스에서 메서드로 구현한 공격(`Attack`)을 별도의 상속 구조로 만들어 사용
3. `Pokemon` 클래스에서 메서드로 구현한 패시브(`Passive`)를 별도의 상속 구조로 만들어 사용

`Pokemon` 클래스는 `Attack*`과 `Passive*` 포인터를 가지며, `setAttack()`과 `setPassive()` 메서드로 런타임에 전략을 교체할 수 있다. 추가되는 공격 기술을 하위 클래스에 계속 추가할 수 있다.

### Strategy 패턴 정리

- Strategy 패턴은 기능(메서드, 전략)이 자주 바뀌기 때문에 이들을 **별도로 구성하고 내부에서 변화하도록** 한다
- 메서드(전략)마다 각각의 클래스로 먼저 바꾸고 이를 `<<interface>>` 타입의 상속 구조로 만들어 구현한다

## State 패턴

State 패턴은 객체 상태를 표현하고 **상태에 따라 동작하는 방법**을 제공한다. 객체의 내부 상태가 변경될 때 해당 객체가 그의 행동을 변경할 수 있도록 하는 패턴이다. Strategy 패턴과 구조가 유사하지만, 목적이 다르다:

- **Strategy**: 알고리즘(전략)을 런타임에 교체
- **State**: 객체의 상태에 따라 동작을 변경
