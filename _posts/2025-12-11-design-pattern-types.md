---
title: "디자인 패턴 종류 — 행위, 구조, 생성 패턴"
date: 2025-12-11
categories: [Software-Engineering]
subcategory: OpenSource
tags: [design-pattern, behavioral, structural, creational]
toc: true
toc_sticky: true
---

**개요**

---

## 디자인 패턴 종류 - 행위 패턴 정리

###   1. 디자인 패턴 종류

디자인 패턴은 복잡성, 상세도 및 적용 범위에 따라 세 가지로 분류됨

**행위(Behavioral) 패턴**: 클래스나 객체들이 상호작용하는 방법과 책임을 분산하는 방법을 정의함, 객체 간의 결합도를 최소화하면서 효과적인 의사소통과 책임 할당을 처리

**구조(Structural) 패턴**: 프로그램의 구조(데이터, 인터페이스 등)를 설계하는 데 활용됨, 클래스나 객체의 합성으로 더 큰 구조를 만들 때 유용

**생성(Creational) 패턴**: 객체의 생성과 참조 과정에 관련된 패턴, 객체 생성 과정을 분리해서 시스템에 미치는 영향을 최소화하고, 코드의 유연성과 유지관리를 개선함

---

###   2. GoF 설계 패턴 목록

| 분류 | 패턴 이름 | 강의에서 배우는 것 |
| --- | --- | --- |
| 행위 패턴 | 책임 연쇄, 커맨드, 해석자, 반복자, 중재자, 메멘토, 옵서버, 상태, 전략, 템플릿 메서드, 비지터 | 상태(state), 전략(strategy) |
| 구조 패턴 | 어댑터, 브리지, 복합체, 데코레이터, 퍼사드, 플라이웨이트, 프록시 | 어댑터(Adapter), 데코레이터(Decorator) |
| 생성 패턴 | 팩토리 메서드, 추상 팩토리, 빌더, 프로토타입, 싱글턴 | 팩토리 메서드(Factory Method) |

#### 패턴 간의 관계

- 각 분류에 속한 패턴은 다른 분류에 속한 패턴과 서로 관련성이 있음

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-1.png)

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-2.png)

---

###   3. 행위 패턴의 적용 측면

#### 행위 패턴

- 반복적으로 사용되는 객체의 상호작용을 패턴화

- 객체에 주어지는 기능 및 책임과 관련 있으며, 객체 간의 상호작용을 표현

- 패턴은 제어 흐름에 집중하기보다 상호 연결 방식에 집중할 수 있도록 지원

- 상속을 통해서 클래스에 존재하는 동작을 전달(배포)

---

#### 전략(Strategy) 패턴

#### 기본 아이디어

> 자주 바뀌는 것이 기능(method)이라면?
→ 메서드를 클래스로 바꾸고 <<interface>> 타입의 상속 구조를 만들어라

#### 예제: 포켓몬스터 게임

포켓몬의 종류가 자주 추가/삭제되고, 기술(공격, 패시브)이 수정되거나 새로운 기술이 추가됨

#### 일반적인 클래스 설계

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-3.png)

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-4.png)

#### 문제점 (일반적인 설계)

- 기술이 계속 교체되지만 해결책이 없음

- **OCP(개방 폐쇄 원칙)** 위반

- 프로그램이 복잡해짐

#### 해결책

- 자주 바뀌는 `attack()`, `passive()`를 별도의 클래스로 분리 → 추가되는 공격 기술을 하위 클래스에 계속 추가할 수 있음

- 인터페이스 타입의 상속 구조로 설계

#### Strategy 패턴을 적용한 클래스 구조

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-5.png)

#### 핵심 코드 및 클래스 설계

```c++
class Pokemon {
public:
	Attack* attack;
	Passive* passive;
	Pokemon() {}

	void introduce() {
		name();
		attack->motion();
		passive->detail();
	}
	virtual void name() {}
	void setAttack(Attack* attack) {
		this->attack = attack;
	}
	void setPassive(Passive* passive) {
		this->passive = passive;
	}
}
```

```c++
class Purin : public Pokemon {
public:
Purin() {
	attack = new Sing();
	passive = new Avoidability();
	}
	void name() {
		cout << "이름: 푸린, 속성: 노멀\n";
	}
};
```

```c++
class Pikachu : public Pokemon {
public:
Pikachu() {
	attack = new millionVolt();
	passive = new Speedability();
	}
	void name() {
		cout << "이름: 피카츄, 속성: 번개\n";
	}
};
```

```c++
class Pairi : public Pokemon {
public:
Pairi() {
	attack = new Flame();
	passive = new Defensibility();
	}
	void name() {
		cout << "이름: 파이리, 속성: 불\n";
	}
};
```

```c++
class Attack {
public:
	virtual void motion() = 0;
};
```

```c++
class Flame : public Attack {
public:
	void motion() override {
		cout << "공격 스킬 - 불꽃: 뜨거운 불꽃을 쏘아 공격\n";
	}
};
```

```c++
class Sing : public Attack {
public:
	void motion() override {
		cout << "공격 스킬 - 노래하기: 노래를 불러 상대를 잠재움\n";
	}
};
```

```c++
class millionVolt : public Attack {
public:
	void motion() override {
		cout << "공격 스킬 - 백만 볼트: 백만 볼트의 강력한 전압으로 공격\n";
	}
};
```

```c++
class Passive {
public:
	virtual void detail() = 0;
};
```

```c++
class Avoidability : public Passive {
public:
	void detail() override {
		cout << "패시브 스킬 - 회피: 30% 확률로 공격 회피\n\n";
	}
};
```

```c++
class Speedability : public Passive {
public:
	void detail() override {
		cout << "패시브 스킬 - 스피드: 한 번에 두 번 공격\n\n";
	}
};
```

```c++
class Defensibility : public Passive {
public:
	void detail() override {
		cout << "패시브 스킬 - 방어: 받는 피해 40% 감소시킴\n\n";
	}
};
```

```c++
int main() {
	Pokemon* pikachu = new Pikachu();
	pikachu->introduce();
	Pokemon* pairi = new Pairi();
	pairi->introduce();
	Pokemon* purin = new Purin();
	purin->introduce();
	purin->setAttack(new millionVolt());
	purin->setPassive(new Defensibility());
	purin->introduce();
	return 0;
}
```

#### 장점

- 런타임에 전략(기능) 교체 가능: `purin->setAttack(new millionVolt());`

- 새로운 공격/패시브 추가 시 기존 코드 수정 불필요

- OCP 준수

---

#### 상태(State) 패턴

#### 기본 아이디어

> 자주 바뀌는 것이 상태(State)라면?
→ 상태를 클래스로 바꾸고 <<interface>> 타입의 상속 구조를 만들어라

#### 예제: 선풍기

- 초기: 정지 ↔ 송풍 두 가지 상태만 존재

- 확장: 수면, 약풍, 중간풍, 강풍 등 계속 추가됨

```text
      ON
정지  ──→ 송풍
     ←──
     OFF

```

#### 문제점 (일반적인 설계)

```c++
class ElecFan {
public:
	ElecFan() {
	State = "Stop";
	cout << "<<현재 상태: " << State << " >>\n";
	}
	void setState(string state) {
		this->State = state;
	}
	void on_button() {
		if (State == "Stop") {
			State = "Wind";
			cout << "\n***on 버튼 눌림***\n" << "정지에서 송풍 상태로 바뀜\n";
			cout << "\n<<현재 상태: " << State << ">>\n";
		}
		else if (State == "Wind") {
			cout << "\n***on 버튼 눌림***\n" << "상태 변화 없음\n";
			cout << "\n<<현재 상태: " << State << ">>\n";
		}
	}
	void off_button() {
		if (State == "Stop") {
			cout << "\n***off 버튼 눌림***\n" << "상태 변화 없음\n";
			cout << "\n<<현재 상태: " << State << ">>\n";
		}
		else if (State == "Wind") {
			State = "Stop";
			cout << "\n***off 버튼 눌림***\n" << "송풍에서 정지 상태로 바뀜\n";
			cout << "\n<<현재 상태: " << State << ">>\n";
		}
	}
private:
	string State;
};
```

```c++
void main() {
	ElecFan* electricfan = new ElecFan();
	electricfan->on_button();
	electricfan->off_button();
}

----------------------<실행 결과>----------------------------
<< 현재 상태: Stop >>

***on 버튼 눌림***
정지에서 송풍 상태로 바뀜

<< 현재 상태: Wind >>

***off 버튼 눌림***
송풍에서 정지 상태로 바뀜

<< 현재 상태: Stop >>
```

- 조건문(`if ~ else if`)으로는 상태 변화를 쉽게 파악하기 어려움

- 상태 추가/삭제 시 `on_button()`, `off_button()` 메서드를 계속 수정해야 함

- **OCP 위반**, 유지보수 어려움

#### State 패턴을 적용한 해결책

- 상태를 클래스로 변경

- 상속 구조로 만들어 하위 클래스에서 상태 추가/삭제

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-6.png)

#### 핵심 코드

```c++
class State {
	public:
	virtual void on_button(ElectricFan* EF) = 0;
	virtual void off_button(ElectricFan* EF) = 0;
};
```

```c++
class Wind : public State {
public:
	Wind() {
		cout << "\n<<현재 상태: 송풍>>\n";
	}
	void on_button(ElectricFan* EF) override {
		cout << "\n***on 버튼 눌림***\n" << "송풍에서 수면 상태로 바뀜\n";
		EF->setState(new Sleep());
	}
	void off_button(ElectricFan* EF) override {
		cout << "\n***off 버튼 눌림***\n" << "송풍에서 정지 상태로 바뀜\n";
		EF->setState(new Stop());
	}
};
```

```c++
class Stop : public State {
public:
	Stop() {
		cout << "\n<<현재 상태: 정지>>\n";
	}
	void on_button(ElectricFan* EF) override {
		cout << "\n***on 버튼 눌림***\n" << "정지에서 송풍 상태로 바뀜\n";
		EF->setState(new Wind());
	}
	void off_button(ElectricFan* EF) override {
		cout << "\n***off 버튼 눌림***\n" << "상태 변화 없음\n";
	}
};
```

```c++
class Sleep : public State {
public:
	Sleep() {
		cout << "\n<<현재 상태: 수면>>\n";
	}
	void on_button(ElectricFan* EF) override) {
		cout << "\n***on 버튼 눌림***\n" << "수면에서 송풍 상태로 바뀜\n";
		EF->setState(new Wind());
	}
	void off_button(ElectricFan* EF) override {
		cout << "\n***off 버튼 눌림***\n" << "수면에서 정지 상태로 바뀜\n";
		EF->setState(new Stop());
	}
};
```

```c++
class ElectricFan {
public:
	ElectricFan() {
		state = new Stop();
	}
	~ElectricFan() {
		delete state;
	}
	void setState(State* newState) {
		delete state;
		state = newState;
	}
	void on_push() {
		state->on_button(this);
	}
	void off_push() {
		state->off_button(this);
	}
	void operation() {
		off_push();
		on_push();
		on_push();
		on_push();
		off_push();
	}
private:
	State* state;
};
```

```c++
int main() {
ElectricFan* EF = new ElectricFan();
EF->operation();
delete EF;
return 0;
}

----------------------<실행 결과>---------------------------

<< 현재 상태: 정지 >>

***off 버튼 눌림***
상태 변화 없음

***on 버튼 눌림***
정지 상태에서 송풍 상태로 바뀜

<< 현재 상태: 송풍 >>

***on 버튼 눌림***
송풍 상태에서 수면 상태로 바뀜

<< 현재 상태: 수면 >>

***on 버튼 눌림***
수면 상태에서 송풍 상태로 바뀜

<< 현재 상태: 송풍 >>

***off 버튼 눌림***
송풍 상태에서 정지 상태로 바뀜

<< 현재 상태: 정지 >>
```

#### 장점

- 상태 추가/삭제 시 `ElectricFan` 클래스에 영향 없음

- 상태 변화 로직이 각 상태 클래스 안에 캡슐화됨

- 새로운 상태(약풍, 강풍 등) 추가가 용이함

---

### 6. Strategy vs State 패턴 비교

| 구분 | Strategy 패턴 | State 패턴 |
| --- | --- | --- |
| 바뀌는 것 | 기능(알고리즘) | 상태 |
| 목적 | 다양한 알고리즘을 교체 가능하게 | 상태에 따라 다른 동작 수행 |
| 변경 주체 | 클라이언트가 직접 전략 설정 | 상태 객체 스스로 다음 상태로 전환 |
| 예시 | 공격 기술 교체 | 선풍기 모드 전환 |

---

### 7. 핵심 정리

**공통점**: 둘 다 자주 변하는 부분을 별도의 클래스로 분리하고, 인터페이스 기반 상속 구조를 만들어 OCP를 준수함

**Strategy 패턴**: 기능(메서드)이 자주 바뀔 때 사용. 메서드를 클래스로 추출하고 런타임에 교체 가능하게 함

**State 패턴**: 상태가 자주 바뀔 때 사용. 조건문으로 처리하던 상태를 클래스로 분리하고, 상태 전환 로직을 각 상태 클래스가 담당하게 함

##  구조 패턴 정리

###   구조 패턴 (Structural Patterns)

- 클래스의 기본 구조를 확장하여 더 큰 구조를 제공할 수 있도록 클래스와 객체를 구성하는 방법을 다룸

- 새로운 기능을 위해 기존 객체를 어떻게 합성할 것인지를 설명하며, 대체로 런타임에서 융통성이 발휘됨

---

#### 데코레이터(Decorator) 패턴

**핵심 아이디어:** 기본 클래스를 조합해서 많은 클래스를 만들어야 한다면? → 많은 클래스를 조용히 처리하라!

**개요:**

- 데코레이션(decoration)은 '장식'이란 뜻으로, 기본 위에 부수적으로 추가하는 것을 의미

- 장식이 있으면 더 화려해지지만, 없어도 큰 문제는 안 됨

- 너무 많아질 수 있는 장식을 어떻게 처리하는가를 설명하는 패턴

**예제 - 토스트 가게:**

- 3가지 재료(치즈, 야채, 햄)로 만들 수 있는 토스트는 총 7가지

- 달걀을 추가하면 → 15가지

- 식빵 종류를 4가지로 늘리면 → 클래스가 급격히 증가

**패턴 적용 방법:**

- 식빵은 상속 구조 사용 (Toast → NormalBread, WheatBread, ButterBread, MilkBread)

- 재료를 기본 재료와 복합 재료로 나눔

- 핵심: 혼합 재료의 숫자만큼 클래스를 만들지 않고, 기본 재료만으로 해결

- ToppingDecorator 클래스를 만들어 기본 재료(Ham, Vegetable, Cheese, Egg)가 이를 상속

#### 데코레이터 패턴

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-7.png)

**Decorator 패턴의 적용**

```c++
class Toast {
public:
	virtual string getName() const = 0;
	virtual int getKcal() const = 0;
};
```

```c++
class NormalBread : public Toast {
public:
	string getName() const override {
		return " 식빵 토스트";
	}
	int getKcal() const override {
		return 300;
	}
};
```

```c++
class WheatBread : public Toast {
public:
	string getName() const override {
		return " 호밀식빵 토스트";
	}
	int getKcal() const override {
		return 250;
	}
}
```

```c++
class ButterBread : public Toast {
public:
	string getName() const override {
		return " 버터식빵 토스트";
	}
	int getKcal() const override {
		return 400;
	}
};
```

```c++
class MilkBread : public Toast {
public:
	string getName() const override {
		return " 우유식빵 토스트";
	}
	int getKcal() const override {
		return 350;
	}
};
```

```c++
class ToppingDecorator : public Toast {
public:
	ToppingDecorator(Toast* toast) : toast_(toast) {}

	string getName() const override { // 생략 가능
		return toast_->getName();
	}
	int getKcal() const override { // 생략 가능
		return toast_->getKcal();
	}
protected:
	Toast* toast_;
};
```

```c++
class Ham : public ToppingDecorator {
public:
	Ham(Toast* toast) : ToppingDecorator(toast) {}

	string getName() const override {
		return "햄" + toast_->getName();
	}
	int getKcal() const override {
		return toast_->getKcal() + 200;
	}
};
```

```c++
class Cheese : public ToppingDecorator {
public:
	Cheese(Toast* toast) : ToppingDecorator(toast) {}

	string getName() const override {
		return "치즈" + toast_->getName();
	}
	int getKcal() const override {
		return toast_->getKcal() + 50;
	}
};
```

```c++
class Vegetable : public ToppingDecorator {
public:
	Vegetable(Toast* toast) : ToppingDecorator(toast) {}

	string getName() const override {
		return "야채" + toast_->getName();
	}
	int getKcal() const override {
		return toast_->getKcal() + 10;
	}
};
```

```c++
class Egg : public ToppingDecorator {
public:
	Egg(Toast* toast) : ToppingDecorator(toast) {}

	string getName() const override {
		return "달걀" + toast_->getName();
	}
	int getKcal() const override {
		return toast_->getKcal() + 100;
	}
}
```

```c++
int main() {
	Toast* toast1 = new NormalBread();
	toast1 = new Cheese(toast1);
	toast1 = new Ham(toast1);
	cout << "주문한 토스트: " << toast1->getName() << endl;
	cout << "칼로리: " << toast1->getKcal() << " Kcal\n" << endl;
	delete toast1;
	Toast* toast2 = new WheatBread();
	toast2 = new Vegetable(toast2);
	toast2 = new Egg(toast2);
	cout << "주문한 토스트: " << toast2->getName() << endl;
	cout << "칼로리: " << toast2->getKcal() << " Kcal\n" << endl;
	delete toast2;
	Toast* toast3 = new ButterBread();
	toast3 = new Ham(toast3);
	toast3 = new Ham(toast3);
	toast3 = new Ham(toast3);
	cout << "주문한 토스트: " << toast3->getName() << endl;
	cout << "칼로리: " << toast3->getKcal() << " Kcal\n" << endl;
	delete toast3;
	return 0;
}

----------------------------------------------------------------
주문한 토스트: 햄치즈 식빵 토스트
칼로리: 550kcal

주문한 토스트: 달걀야채 호밀식빵 토스트
칼로리: 360kcal

주문한 토스트: 햄햄햄 버터식빵 토스트
칼로리: 1000kcal
```

**패턴 정리:**

- 상속 구조는 상위-하위 클래스 간 강한 결합으로 동적 확장이 어려움

- 구성(합성)은 객체 실행 도중에 동적으로 확장할 수 있다는 장점이 있음

---

#### 어댑터(Adapter) 패턴

**핵심 아이디어:** 구매한 컴포넌트가 맞지 않아 바로 사용할 수 없다면? → adapter를 만들어 사용하라!

**개요:**

- **Adapter**의 의미: '접속 소켓', '확장 카드', '맞추어 붙이다'

- 호환되지 않는 두 인터페이스를 작동시킬 수 있도록 만든 인터페이스

- 두 가지 형태로 사용:

  - 클래스 adapter 패턴: 상속을 이용

  - 인스턴스 adapter 패턴: 위임을 이용(시험 출제 x)

**예제 - 무선 이어폰:**

- 삼성 휴대폰에 애플 AirPods를 사용하고 싶음

- Buds는 play(), stop() 메서드 사용

- AirPods는 playing(), stopping() 메서드 사용

**Adapter 패턴 적용:**

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-8.png)

```c++
class AirPods {
public:
	AirPods() {
		cout << "\n새로 구입한 Apple AirPods입니다." << endl;
	}
	void playing() {
		cout << "Apple AirPods 음악 재생 중…" << endl;
	}
	void stopping() {
		cout << "Apple AirPods 음악을 중지합니다!" << endl;
	}
}
```

```c++
class AirPodsInterface {
public:
	virtual void play() = 0;
	virtual void stop() = 0;
};
```

```c++
class Buds {
public:
	Buds() {
		cout << "무선 이어폰 호환 시스템." << endl;
	}
	void play() { // 음악을 재생하는 표준 API
		cout << "삼성 Buds 음악 재생 중…" << endl;
	}
	void stop() { // 음악을 정지하는 표준 API
		cout << "삼성 Buds 음악을 중지합니다!" << endl;
	}
};
```

```c++
class AirPodsAdapter : public AirPods, public AirPodsInterface {
public:
	AirPodsAdapter() {
		cout << "AirPods이 SamsungPhone과 호환됩니다." << endl;
	}
	void play() override {
		playing();
	}
	void stop() override {
		stopping();
	}
};
```

```c++
class SamsungPhone {
	Buds* buds;
	AirPodsAdapter* airpodsadapter;
public:
	SamsungPhone() : buds(new Buds()), airpodsadapter(nullptr) {
		installAirPods();
		cout << endl;
		testBuds();
		cout << endl;
		testAirPods();
	}
	~SamsungPhone() {
		delete buds;
		if (airpodsadapter)
			delete airpodsadapter;
		}
	void installAirPods() {
		airpodsadapter = new AirPodsAdapter();
		cout << "Buds와 새로 구입한 AirPods을 연결합니다." << endl;
	}
	void testBuds() {
		buds->play();
		buds->stop();
	}
	void testAirPods() {
		if (airpodsadapter) {
			airpodsadapter->play();
			airpodsadapter->stop();
		}
	}
}
```

```c++
int main() {
	SamsungPhone samsungphone;
	return 0;
}

-------------------------------------------------

무선 이어폰 호환 시스템

새로 구입한 Apple AirPods입니다.
AirPods이 SamsungPhone과 호환됩니다.
Buds와 새로 구입한 AirPods을 연결합니다.

삼성 Buds 음악 재생 중...
삼성 Buds 음악을 중지합니다!

Apple AirPods 음악 재생 중...
Apple AirPods 음악을 중지합니다!
```

---

##  생성 패턴 정리

###   생성 패턴 (Creational Patterns)

생성 패턴은 클래스의 인스턴스가 어떻게 생성되는가를 추상화하여 나타낸 것. 객체가 생성, 합성, 표현되는 방식에 관계없이 시스템을 독립적으로 생성할 수 있도록 지원함.

**생성 패턴의 종류:**

| 패턴 | 적용 측면 |
| --- | --- |
| 팩토리 메서드(Factory Method) | 객체 생성 시점을 하위 클래스가 결정 |
| 추상 팩토리(Abstract Factory) | 제품 군의 유사 객체들을 생성 |
| 빌더(Builder) | 유사한 다수 객체들을 생성하여 합성 |
| 프로토타입(Prototype) | 생성 객체를 복사 및 변경하여 객체 생성 |
| 싱글턴(Singleton) | 오직 하나의 객체만 생성 |

---

#### 팩토리 메서드(Factory Method) 패턴

**핵심 아이디어:** 객체 생성을 직접 하지 않고 누군가에게 맡기고 싶다면? → factory method 패턴을 생각해보라

**개요:**

- 클래스 A에서 클래스 B의 객체를 생성할 때 의존 관계가 발생

- 강한 결합으로 변경에 따른 영향을 받아 유지보수가 어려워짐

- 해결책: 객체를 전문으로 생성하는 factory 클래스를 만들어 해결

**예제 - 게임 서버:**

- 게임 서버는 게임 종류가 늘어날 때마다 추가

- 추후 게임 서버도 국가별로 별도로 둘 예정

**문제점 (패턴 미적용 시):**

```c++
class GameServer {
    SuperMario* supermario;
    Tetris* tetris;
    // 게임 종류가 추가될 때마다 GameServer 클래스 수정 필요 → 개방 폐쇄 원칙 위반
};
```

#### 1단계: Factory 클래스 분리

객체 생성을 담당하는 별도의 GameServerFactory 클래스를 만들어 객체 생성을 위임

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-9.png)

```c++
class GameServer {
public:
	GameServer() {
		cout << "GameServer-정상 연결 완료\n" << endl;
	}

	GameServer(GameServerFactory* gsf) : gsf(gsf) {
		this->gsf = gsf;
		cout << "GameServer-정상 연결 완료\n" << endl;
	}

	void execute(const string& game) {
		Games* games = gsf->chooseGame(game);
		if (games != nullptr) {
			games->BootingGame();
			games->RunGame();
		}
	}

private:
	GameServerFactory* gsf;
};
```

```c++
class GameServerFactory {
public:
	GameServerFactory() : supermario(new SuperMario()), tetris(new Tetris()) {}

	~GameServerFactory() {
		delete supermario, tetris;
	}

	Games* chooseGame(const string& game) {
		if (game == "supermario") {
			return supermario;
		}
		else if (game == "tetris") {
			return tetris;
		}
		else {
			cout << "지원하지 않는 게임입니다." << endl;
			return nullptr;
		}
	}

private:
	SuperMario* supermario;
	Tetris* tetris;
};
```

```c++
class Games {
public:
	string title, version;

	virtual void BootingGame() {
		cout << "게임명: " << title << endl;
		cout << "게임 버전: " << version << endl;
		cout << title << " 게임이 실행 준비되었습니다\n" << endl;
	}
	virtual void RunGame() {
		cout << title << "을 시작합니다.\n" << endl;
	}
}
```

```c++
class SuperMario : public Games {
public:
	SuperMario() {
		title = "Super Mario";
		version = "v1.0";
	}
};
```

```c++
class Tetris : public Games {
public:
	Tetris() {
		title = "Tetris";
		version = "v1.3";
	}
};
```

```c++
int main() {
	GameServer* gs = new GameServer(new GameServerFactory());
	gs->execute("supermario");
	gs->execute("tetris");
	delete gs;
	return 0;
}
```

```text
GameServer-정상 연결 완료

게임명: Super Mario
게임 버전: v1.0
Super Mario 게임이 실행 준비되었습니다

Super Mario를 시작합니다.

게임명: Tetris
게임 버전: v1.3
Tetris 게임이 실행 준비되었습니다

Tetris를 시작합니다.
```

**장점:** 게임 종류의 추가/삭제에 따른 변화로 수정되는 부분을 분리(의존성 분리)하여 오류 위치를 쉽게 찾을 수 있고 새로운 요구사항에도 쉽게 대응 가능

#### 2단계: Factory Method로 전환

Factory 클래스의 역할을 수행하는 추상 메서드를 상위 클래스에 정의하고, 하위 클래스에서 구현

**1단계와의 차이점:**

1. GameServer 확장을 고려한 상속 구조

1. 나라별 game 증가를 고려한 상속 구조

1. GameServerFactory 클래스가 사라짐

![디자인 패턴 종류 — 행위, 구조, 생성 패턴](/assets/images/posts/design-pattern-types/design-pattern-types-10.png)

**사용 예시:**

```c++
class GameServer {
public:
	GameServer() {
		cout << "GameServer-정상 연결 완료\n" << endl;
	}

	void execute(const string& game) {
		Games* games = chooseGame(game);
		if (games != nullptr) {
			games->BootingGame();
			games->RunGame();
		}
	}

protected:
	virtual Games* chooseGame(const string& game) = 0;
};
```

```c++
class KRGameServer : public GameServer {
public:
	KRGameServer() : supermario(new KRSuperMario()),
	tetris(new KRTetris()) {}
	~KRGameServer() {
		delete supermario;
		delete tetris;
	}

	Games* chooseGame(const string& game) override {
		if (game == "supermario") {
			return supermario;
		}
		else if (game == "tetris") {
			return tetris;
		}
		else {
			cout << "지원하지 않는 게임입니다." << endl;
			return nullptr;
		}
	}

private:
	KRSuperMario* supermario;
	KRTetris* tetris;
};
```

```c++
class Games {
public:
	string title, version;
	virtual void BootingGame() {
		cout << "게임명: " << title << endl;
		cout << "게임 버전: " << version << endl;
		cout << title << " 게임이 실행 준비되었습니다\n" << endl;
	}
	virtual void RunGame() {
		cout << title << "을 시작합니다.\n" << endl;
	}
};
```

```c++
class KRTetris : public Games {
public:
	KRTetris() {
		title = "Tetris_Korean";
		version = "v1.3";
	}
};
```

```c++
int main() {
	GameServer* gs = new KRGameServer();
  gs->execute("supermario");
  delete gs;

  gs = new JPGameServer();
  gs->execute("tetris");
  delete gs;
}

```

```text
GameServer-정상 연결 완료

게임명: Super Mario_Korean
게임 버전: v1.0
Super Mario_Korean 게임이 실행 준비되었습니다.

Super Mario_Korean을 시작합니다.

GameServer-정상 연결 완료

게임명: tetris_Japanese
게임 버전: v1.12
Tetris_Japanese 게임이 실행 준비되었습니다.

Tetris_Japaese를 시작합니다.
```

+) 일반적으로 new를 사용한 객체 생성은 강한 결합을 만들어서 유지보수를 어렵게 함

---

### 요약

| 패턴 | 목적 | 핵심 메커니즘 |
| --- | --- | --- |
| 데코레이터 | 하위 클래스 생성 없이 기능 확장 | 구성(합성)을 통한 동적 확장 |
| 어댑터 | 호환되지 않는 인터페이스 연결 | 상속 또는 위임을 통한 인터페이스 변환 |
| 팩토리 메서드 | 객체 생성을 하위 클래스에 위임 | 추상 메서드를 통한 객체 생성 지연 |

---

> 💡  학습정리

    -

    -

    -
