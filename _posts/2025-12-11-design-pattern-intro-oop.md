---
title: "디자인 패턴 개요 및 객체지향 설계 원칙"
date: 2025-12-11
categories: [Software-Engineering]
subcategory: OpenSource
tags: [design-pattern, oop, solid, object-oriented]
toc: true
toc_sticky: true
---

**개요**

---

##  디자인 패턴 개요, 객체지향개발 특성, 객체지향설계 원칙 정리

###   1. 디자인 패턴이란?

#### 정의

- 소프트웨어 디자인 과정에서 자주 발생하는 문제들에 대한 전형적인 해결책

- 여러 설계 사례를 분석해 비슷한 문제를 해결하기 위한 방법들 속에서 공통점을 찾아 정립한 것으로, 문제 해결 방법의 best practice(혹은 청사진)

  ⇒ 소프트웨어 설계 문제에 대한 구조적 해결책 또는 추상적인 해결책(eg.템플릿)을 제공하며 고수준의 고프트웨어 설계에 사용

#### 알고리즘과의 차이점

- **알고리즘**: 특정 문제를 해결하기 위한 구체적인 절차나 단계를 정의하며 저수준의 문제 해결에서 사용

- 알고리즘은 요리법처럼 목표 달성을 위한 명확한 단계들이 제시되어 있는 반면, 패턴은 청사진에 가까움

- 청사진은 결과와 기능은 제시하지만 구현 단계 및 순서는 사용자가 결정함

#### 필요성

- 소프트웨어 개발에서 경험은 매우 중요하지만, 항상 비슷한 소프트웨어를 설계할 가능성은 적고, 경험이 적은 사람도 설계를 잘 하려면 전문가의 지식과 노하우를 공유할 방법이 필요함

- 경험의 중요성 → 기존 경험의 재활용 → 디자인패턴

- ⇒ 재사용성, 가독성 및 유지보수성, 유연성 및 확장가능성 등을 확보

**설계 지식 공유 방법들의 한계:**

- 설계 방법론과 지침은 너무 일반적이어서 구체적인 문제에 적용하기 어렵고, 개별 설계 사례는 너무 구체적이고 특정 문제에 의존적

- GoF(Gang of Four)의 디자인 패턴은 너무 일반적이지도, 너무 구체적이지도 않은 형태로 설계 지식을 공유할 수 있게 해줌

#### 배워야 하는 이유

- 디자인 패턴은 이미 검증되고 테스트된 구조이기 때문에 설계 과정의 속도를 높일 수 있음

- 재사용성을 높이고 변경을 쉽게 하는 구조를 제공하며, 복잡한 구조를 합의된 용어로 쉽게 설명할 수 있어 의사소통의 효율성도 높아짐

#### 비판점

- 일부에서는 좋은 프로그래밍 언어에서는 패턴이 불필요하다고 주장하며, 패턴을 프로젝트 맥락에 맞게 적용하지 않고 문자 그대로 구현하면 비효율적인 해결책이 될 수 있다고 비판

- 또한 초보자들이 간단한 코드로도 해결 가능한 상황에 패턴을 무분별하게 적용하려는 경향도 문제로 지적됨

---

###   2. 객체지향개발 특성

#### **추상화 (Abstraction)**

클래스들의 공통적인 특성(변수, 메소드)을 묶어 표현

**핸드폰 예시:**

```c++
class CellPhone {
public:
    void Call();      // 통화기능 제공
    void Display();   // 디스플레이 제공
    void SetMemory(int value) { memory_ = value; }
    int GetMemory() { return memory_; }

private:
    bool mic_status_;      // 마이크 상태
    bool speaker_status_;  // 스피커 상태
    bool display_status_;  // 디스플레이 상태
    int memory_;
};
```

핸드폰이 가지는 공통된 속성(마이크, 스피커, 디스플레이)과 기능(통화, 화면 표시)을 묶어 클래스로 표현한 것이 추상화

#### **캡슐화 (Encapsulation)**

데이터와 코드의 형태를 외부로부터 알 수 없게 하고, 데이터의 구조와 역할, 기능을 하나의 캡슐 형태로 만드는 방법

외부에서 내부위 세부 구현을 직접 알 수 없게 하는 객체지향의 기본 원칙으로 외부에서 객체 내부 데이터를 직접 수정하거나 접근하는 것을 막음

대신 공개된 메서드(public method)를 통해 안전하게 접근하도록 제한

⇒ 코드의 안정성과 유지보수성을 높여줌

```c++
class CellPhone {
public:
    void Call();
    void Display();
    void set_memory(int value) { memory_ = value; }
    int memory() { return memory_; }

private:
    bool Connect();  // 외부에 노출될 필요 없는 함수는 private에 캡슐화
    bool mic_status_;
    bool speaker_status_;
    bool display_status_;
    int memory_;     // 멤버 변수들도 보통 private에 캡슐화
};
```

`Connect()` 함수처럼 외부에 노출될 필요가 없는 것은 `private`에 캡슐화하고, 필요한 경우 `public`의 getter/setter를 통해 접근을 허용

#### **상속성 (Inheritance)**

부모 클래스에 정의된 변수 및 메서드를 자식 클래스에서 상속받아 사용하는 것입니다.

```text
CellPhone →  2GPhone  →  3GPhone  → SmartPhone
 (전화기능)  (+문자,카메라) (+인터넷,유심) (+앱 지원 기능)
```

**접근 지정자:**

`public`은 외부에서 접근 가능하고, `private`은 외부 접근을 막음

`protected`는 비공개이지만 상속 관계에 있는 파생클래스에서는 접근 가능하여 캡슐화에 유연성을 제공

```c++
class CellPhone {
protected:
    int memory_;  // 파생 클래스에서 접근 가능
};

class 2GPhone: public CellPhone {
public:
    void Message() { memory_ = memory_ - 1; }  // protected 멤버 접근 가능
    void Camera() { memory_ = memory_ - 10; }
};
```

**주의점:**

각 클래스의 기능을 명확히 분류해야 하며, 기능을 사용하고자 상속을 무분별하게 하면 난해하고 비효율적인 코드가 됨

예를 들어 핸드폰에 디스플레이가 있다고 TV가 핸드폰을 상속받을 수는 없음. 다중상속 시에는 상속 대상이 애매해지는 다이아몬드 문제에도 주의해야 함

**다중 속성 문제 해결방법:**

1. 가상 상속(Virtual Inheritance)(C++)

  - 특정 클래스가 다중 상속 구조에서 단 한 번만 상속되도록 보장하는 방식

1. 명시적 호출(C++)

  - 자식 클래스에서 명시적으로 부모 클래스의 메서드를 호출하는 방법으로 어느 부모 클래스의 메서드를 사용할지 명확히 지정

1. 인터페이스 사용(JAVA)

  - 메서드의 구현이 없는 추상 메서드만을 가지므로, 메서드 충돌의 문제가 발생하지 않음

#### **다형성 (Polymorphism)**

다양한 형태로 표현이 가능한 구조로, 파생클래스 객체가 기본클래스의 멤버함수를 커스터마이징하고 싶을 때 사용함

**오버로딩(Overloading):** 매개변수의 유형 또는 개수는 다르지만 같은 이름의 메서드를 중복 정의하는 것, 매개변수는 같고 리턴 타입만 다르면 오버로딩이 성립되지 않음

**오버라이딩(Overriding):** 상위 클래스의 메서드를 하위 클래스가 재정의해서 사용하는 것, 메서드 명, 매개변수, 리턴 타입이 모두 같아야 함

```c++
class SmartPhone: public 3GPhone {
public:
    void RecognizeVoice();  // "음성 인식 및 분석"
};

class IPhone: public SmartPhone {
public:
    void RecognizeVoice();  // 재정의: "시리 호출"
};

class GalaxyPhone: public SmartPhone {
public:
    void RecognizeVoice();  // 재정의: "빅스비 호출"
};
```

**정적 바인딩 vs 동적 바인딩:**

정적 바인딩은 컴파일 타임에 호출될 함수가 결정되어 실행 효율이 높고 안정적이지만 유연하지 않음

동적 바인딩은 런타임에 호출될 메서드가 결정되며, `virtual` 키워드를 통해 구현, 유연하지만 타입 확인으로 인해 속도가 느릴 수 있음, 동적 바인딩은 다형성의 핵심

---

###   3. 객체지향설계 원칙 (SOLID)

#### **S - 단일 책임 원칙 (Single Responsibility Principle)**

`하나의 클래스는 하나의 역할을 담당하여 하나의 책임을 수행하는데 집중되어야 함`

클래스를 변경해야 하는 이유는 단 하나여야 함

**적용 전:**

```c++
class User {
public:
    void Login() { cout << "User logged in" << endl; }
    void Logout() { cout << "User logged out" << endl; }
    void PrintUserInfo(string username) { cout << "Username: " << username << endl; }
};
```

**적용 후:**

```c++
class Authentication {
public:
    void Login() { cout << "User logged in" << endl; }
    void Logout() { cout << "User logged out" << endl; }
};

class UserInfo {
public:
    void PrintUserInfo(string username) { cout << "Username: " << username << endl; }
};

class User: public Authentication, public UserInfo {};
```

#### **O - 개방-폐쇄 원칙 (Open-Closed Principle)**

`확장에는 열려 있어야 하고, 수정에는 닫혀 있어야 함`

**적용 전 문제점:**

```c++
class Account {
public:
    double CalculateInterest() const {
        if (type_of_account_ == 1) { /* ... */ }
        else if (type_of_account_ == 2) { /* ... */ }
        // 새 계좌 유형 추가 시 기존 클래스 수정 필요 -> 수정에 닫혀 있지 않으므로 개방-폐쇄 원칙의 기본을 위배
    }
private:
    int type_of_account_;
};
```

**적용 후:**

```c++
class SavingAccount: public Account {
public:
	SavingAccount(double balance,
		double interate_rate):
		balance_(balance),
		interest_rate_(interest_rate) {}
	void Deposit(double amount) override {
		balance_ += amount;
	}
	void withdraw(double amount) override {
		balance_ -= amount;
	}
	double balance() override {
		return balance_;
	}
	double CalculateInterest() override {
		return balance_ * interest_rate_;
	}
private:
	double balance_;
	double interest_rate_;
};
```

```c++
class CreditCardAccount: public Account {
public:
	CreditCardAccount(double balance,
		double interate_rate,
		double limit): balance_(balance),
		interest_rate_(interest_rate),
		limit_(limit) {}
	void Deposit(double amount) override {
		balance_ -= amount;
	}
	void withdraw(double amount) override {
		balance_ += amount;
	}
	double balance() override {
		return balance_;
	}
	double CalculateInterest() override {
		return balance_ * interest_rate_;
	}
	void IncresaseLimit(double add_on) {
		limit_ += add_on;
	}
private:
	double balance_;
	double interest_rate_;
};
```

```c++
class FixedDepositAccount:public Account{
public:
	FixedDepositAccount(double balance,
		double interate_rate,
		int time): balance_(balance),
		interest_rate_(interest_rate),
		time_(time) {}
	void Deposit(double amount) override {
		balance_ += amount;
	}
	void withdraw(double amount) override {
		balance_ -= amount;
	}
	double balance() override {
		return balance_;
	}
	double CalculateInterest() override {
		return balance_ * interest_rate_;
	}
private:
	double balance_;
	double interest_rate_;
	int time_;
};
```

새로운 계좌 유형을 추가할 때 기존 클래스를 수정하지 않고 새 클래스만 추가하면 됨

#### **L - 리스코프 치환 원칙 (Liskov Substitution Principle)**

`상위 클래스의 객체는 언제나 자신의 하위 클래스의 객체로 대체될 수 있어야 함`

하위 클래스는 상위 클래스의 규약을 위반하거나 기능을 변경하면 안됨

클라이언트는 상위 클래스와 하위 클래스의 차이를 인식하지 않아도 됨

재정의를 사용할 때는 “`**피터 코드**`”의 상속 규칙에 맞게 사용해야 함

- “is-a” 관계 유지

- 하위 클래스는 상위 클래스의 책임을 약화시키지 않는다

- 상위 클래스에서 하이 클래스로의 전이성을 보장

- 상속은 확장을 위해 사용

**적용 전 문제점:**

```c++
class Bird {
public:
    virtual void Fly() = 0;
};

class Crow: public Bird {
public:
	void Fly() override {
		cout << "Crow is flying" << endl;
	}
};

class Penguin: public Bird {
public:
    void Fly() override {
        throw runtime_error("Penguins can't fly");  // LSP 위반!
    }
};

void makeBirdFly(const Bird& bird) {
	bird.fly();
}
```

**적용 후:**

```c++
class Bird {
public:
  virtual bool CanFly() = 0;
};

class FlyingBird: public Bird {
public:
  bool CanFly() override { return true; }
  virtual void Fly() = 0;
};

class Crow: public FlyingBird {
public:
  void Fly() override { cout << "Crow is flying" << endl; }
};

class Penguin: public Bird {
public:
  bool CanFly() override { return false; }
};

void makeBirdFly(const FlyingBird& bird) {
	bird.Fly();
}
```

#### **I - 인터페이스 분리 원칙 (Interface Segregation Principle)**

`클라이언트는 자신이 사용하지 않는 메서드와 의존 관계를 맺으면 안 됨`

각각의 클라이언트가 필요로 하는 메서드 군이 존재할 때 인터페이스를 분리

  - 용도가 명확한 인터페이스를 제공할 수 있음

  - 시스템 내부 의존성을 낮춰(낮은 결합) 리팩토링을 쉽게 해 재사용성을 높임

**적용 전 문제점:**

```c++
class Printer {
public:
    virtual void Print() = 0;
    virtual void Scan() = 0;
    virtual void Fax() = 0;
};

class LaserPrinter: public Printer {
public:
    void Fax() override {
        throw runtime_error("Laser Printer Can't Fax");  // 불필요한 구현 강제(LaserPrinter 클래스는 Fax() 메서드가 필요하지 않음)
    }
};
```

**적용 후:**

```c++
// Printer 클래스에 있는 메서드를 클래스화
class IsPrintable {
public:
    virtual void Print() = 0;
};

class IsScannable {
public:
    virtual void Scan() = 0;
};

class IsFaxable {
public:
    virtual void Fax() = 0;
};

class InkJetPrinter: public IsPrintable, public IsScannable, public IsFaxable {
    // 세 기능 모두 구현
};

class LaserPrinter: public IsPrintable, public IsScannable {
    // Fax 구현 불필요
};
```

#### **D - 의존 역전 원칙 (Dependency Inversion Principle)**

`클라이언트는 구체 클래스가 아닌 추상 클래스(인터페이스)에 의존해야 함`

고수준 모듈이 저수준 모듈에 의존하면 안 되며 두 모듈 모두 추상화(인터페이스)에 의존해야 함

추상화는 세부 사항에 의존하지 않고, 세부 사항이 추상화에 의존해야 함

**적용 전 문제점:**

```c++
class FruitBasket {  // Low-level module
public:
	void AddToBasket(const string& fruit, const string& color) {
		basket_.push_back(make_tuple(fruit, color));
	}
	vector<tuple<string,string>> get_basket() { return basket_; }
private:
	vector<tuple<string,string>> basket_;
};

class ColorSearcher {  // High-level module
public:
  void ListColor(FruitBasket fruit_basket, const string& color) {
    for (auto item: fruit_basket.get_basket()) {
	    if (get<1>(item) == color) {
		    cout << "Found" << get<0>(item) << endl;
	    }
    }
  }
};
// FruitBasket의 세부 구현에 직접 의존(낮은 수준 클래스를 수정하면 고수준 모듈에 영향을 미침
```

**적용 후:**

```c++
class BasketSearcher {  // 추상 모듈
public:
  virtual vector<string> SearchByColor(const string& color) = 0;
};

class FruitBasket: public BasketSearcher {  // Low-level module
public:
  void AddToBasket(const string& fruit, const string& color) {
	  basket_.push_back(make_tuple(fruit,color));
  }
  vector<string> SearchByColor(const string& color) override {
	  vector<string> found;
	  for(auto item: basket_){
		  if(get<1>(item) == color) found.push_back(get<0>(item));
	  }
	  return found;
  }
private:
	vector<tuple<string,string>> basket_;
};

class ColorSearcher {  // High-level module
public:
  void ListColor(BasketSearcher& basket, std::string color) {
    // 추상화에 의존
    for (auto item: basket.SearchByColor(color)) { /* ... */ }
  }
};
```

고수준 모듈이 추상화에 의존하게 되어, 저수준 모듈의 변경이 고수준 모듈에 영향을 미치지 않음

---

> 💡  학습정리

    -

    -

    -
