---
title: "Animated API — 모달 & 피커 애니메이션 (웹 CSS 비교)"
date: 2026-02-18
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, animation, animated-api, web-comparison]
toc: true
toc_sticky: true
---

## 개요

React Native에서 애니메이션을 구현하는 핵심 API인 `Animated`를 정리합니다.

BottomSheetModal(하단 모달)과 WheelPicker(드럼 롤 피커) 구현 과정에서 사용한 실제 코드 예시 포함.

---

## 1. Animated.Value (애니메이션 값)

### 웹 React

```javascript
// CSS transition으로 처리
.modal { transition: transform 0.3s ease; }
.modal.open { transform: translateY(0); }
.modal.closed { transform: translateY(100%); }
```

### React Native

```typescript
import { Animated } from "react-native";

// useRef로 애니메이션 값 생성 (리렌더링해도 유지)
const slideAnim = useRef(new Animated.Value(0)).current;
const overlayAnim = useRef(new Animated.Value(0)).current;
```

### 핵심 포인트

- `Animated.Value(초기값)` — 애니메이션에 사용할 값 생성
- `useRef`로 감싸야 리렌더링 시에도 같은 인스턴스 유지
- `.current`로 실제 값에 접근
---

## 2. Animated.timing & Animated.spring (구동 방식)

### Animated.timing — 일정 시간 동안 변화

```typescript
Animated.timing(overlayAnim, {
  toValue: 1,           // 목표값
  duration: 250,        // 밀리초
  useNativeDriver: true, // 네이티브 스레드에서 실행 (성능↑)
}).start();
```

> 웹의 `transition: opacity 250ms ease`와 유사

### Animated.spring — 스프링 물리 기반 변화

```typescript
Animated.spring(slideAnim, {
  toValue: 1,
  damping: 20,      // 감쇠 (높을수록 빨리 멈춤)
  stiffness: 200,   // 강성 (높을수록 빠르게 이동)
  useNativeDriver: true,
}).start();
```

> 웹의 `cubic-bezier`보다 자연스러운 물리 기반 애니메이션

### 비교 테이블

| 방식 | 웹 CSS | React Native | 특징 |
| --- | --- | --- | --- |
| 시간 기반 | transition: 250ms | Animated.timing | 정확한 duration 제어 |
| 물리 기반 | cubic-bezier() | Animated.spring | 자연스러운 바운스 효과 |

---

## 3. Animated.parallel (동시 실행)

여러 애니메이션을 동시에 실행합니다.

```typescript
// overlay fade-in + content slide-up 동시 실행
Animated.parallel([
  Animated.timing(overlayAnim, {
    toValue: 1,
    duration: 250,
    useNativeDriver: true,
  }),
  Animated.spring(slideAnim, {
    toValue: 1,
    damping: 20,
    stiffness: 200,
    useNativeDriver: true,
  }),
]).start();
```

### 다른 조합 방식

| API | 동작 | 용도 |
| --- | --- | --- |
| Animated.parallel | 동시 실행 | overlay + slide-up 동시 실행 |
| Animated.sequence | 순차 실행 | 먼저 fade → 그 다음 slide |
| Animated.stagger | 시차 실행 | 리스트 아이템 순차 등장 |

---

## 4. interpolate (값 변환)

애니메이션 값(0~1)을 실제 UI 속성값으로 변환합니다.

```typescript
import { Dimensions } from "react-native";
const SCREEN_HEIGHT = Dimensions.get("window").height;

// 0 → 화면 아래, 1 → 제자리
const translateY = slideAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_HEIGHT, 0],
});

// Animated.View에 적용
<Animated.View style={% raw %}{{ transform: [{ translateY }] }}{% endraw %}>
  {/* 모달 컨텐츠 */}
</Animated.View>
```

### WheelPicker에서의 interpolate

```typescript
// 스크롤 위치에 따른 아이템 크기/투명도 변화
const scale = scrollY.interpolate({
  inputRange: [
    (index - 2) * itemHeight,
    (index - 1) * itemHeight,
    index * itemHeight,        // 선택된 위치
    (index + 1) * itemHeight,
    (index + 2) * itemHeight,
  ],
  outputRange: [0.7, 0.85, 1, 0.85, 0.7],
  extrapolate: "clamp",  // 범위 밖은 최소/최대값 고정
});
```

> **웹 비교**: CSS에는 스크롤 위치 기반 interpolation이 없어서 JS로 `IntersectionObserver` 등을 써야 함

---

## 5. Animated.event (이벤트 연동)

스크롤 등의 네이티브 이벤트를 애니메이션 값에 직접 연결합니다.

```typescript
<Animated.FlatList
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }  // JS 브릿지 안 거침 → 60fps
  )}
  // ...
/>
```

### 핵심 포인트

- `onScroll` 이벤트의 `contentOffset.y` 값이 `scrollY`에 실시간 반영
- `useNativeDriver: true` → JS 스레드를 거치지 않아 **60fps 성능 보장**
- 웹에서는 `onScroll` + `requestAnimationFrame`으로 비슷하게 구현
---

## 6. Animated.View / Animated.FlatList (특수 컴포넌트)

```typescript
// 일반 View 대신 Animated.View 사용
<Animated.View style={% raw %}{{ opacity: overlayAnim }}{% endraw %}>
  {/* fade 효과가 적용된 컨텐츠 */}
</Animated.View>

// FlatList에 애니메이션 적용 시
<Animated.FlatList
  data={items}
  renderItem={renderItem}
  // ...
/>
```

> **중요**: 일반 `View`, `FlatList`에는 `Animated.Value`를 스타일로 전달할 수 없음. 반드시 `Animated.` 접두사가 붙은 컴포넌트 사용

---

## 7. useNativeDriver 제약사항

`useNativeDriver: true`는 성능이 좋지만 제약이 있습니다.

| 가능 | 불가능 |
| --- | --- |
| transform (translateX/Y, scale, rotate) | width, height |
| opacity | padding, margin |
|  | backgroundColor |
|  | borderRadius |

> **팁**: 레이아웃 속성을 애니메이션하려면 `useNativeDriver: false`로 설정하거나, `react-native-reanimated` 라이브러리 사용

---

## 빠른 참조 테이블

| 항목 | 웹 CSS/JS | React Native Animated |
| --- | --- | --- |
| 시간 기반 전환 | transition: 250ms | Animated.timing({ duration: 250 }) |
| 스프링 효과 | cubic-bezier() | Animated.spring({ damping, stiffness }) |
| 동시 실행 | CSS에서 자동 | Animated.parallel([]) |
| 값 변환 | 없음 (JS 계산) | .interpolate({ inputRange, outputRange }) |
| 스크롤 연동 | onScroll  • rAF | Animated.event (네이티브 스레드) |
| 성능 최적화 | GPU 합성 (will-change) | useNativeDriver: true |
