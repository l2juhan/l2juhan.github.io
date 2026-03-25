---
title: "Animated API — 모달 & 피커 애니메이션 (웹 CSS 비교)"
date: 2026-02-18
categories: [Frontend]
tags: [react-native, animation, animated-api, web-comparison]
toc: true
toc_sticky: true
---
{% raw %}

React Native에서 애니메이션을 구현하는 핵심 API인 `Animated`를 정리합니다. BottomSheetModal과 WheelPicker 구현 과정에서 사용한 실제 코드 예시를 포함합니다.

## Animated.Value — 애니메이션 값

```typescript
// 웹: CSS transition으로 처리
// .modal { transition: transform 0.3s ease; }

// RN: Animated.Value 사용
const slideAnim = useRef(new Animated.Value(0)).current;
const overlayAnim = useRef(new Animated.Value(0)).current;
```

`useRef`로 감싸야 리렌더링 시에도 같은 인스턴스가 유지됩니다.

## timing vs spring

### Animated.timing — 일정 시간 동안 변화

```typescript
Animated.timing(overlayAnim, {
  toValue: 1,
  duration: 250,
  useNativeDriver: true,
}).start();
```

### Animated.spring — 스프링 물리 기반 변화

```typescript
Animated.spring(slideAnim, {
  toValue: 1,
  damping: 20,
  stiffness: 200,
  useNativeDriver: true,
}).start();
```

| 방식 | 웹 CSS | React Native | 특징 |
|---|---|---|---|
| 시간 기반 | `transition: 250ms` | `Animated.timing` | 정확한 duration 제어 |
| 물리 기반 | `cubic-bezier()` | `Animated.spring` | 자연스러운 바운스 효과 |

## parallel — 동시 실행

```typescript
Animated.parallel([
  Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
  Animated.spring(slideAnim, { toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true }),
]).start();
```

| API | 동작 | 용도 |
|---|---|---|
| `parallel` | 동시 실행 | overlay + slide-up 동시 |
| `sequence` | 순차 실행 | 먼저 fade → 그 다음 slide |
| `stagger` | 시차 실행 | 리스트 아이템 순차 등장 |

## interpolate — 값 변환

애니메이션 값(0~1)을 실제 UI 속성값으로 변환합니다.

```typescript
const SCREEN_HEIGHT = Dimensions.get("window").height;

const translateY = slideAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_HEIGHT, 0],
});

<Animated.View style={{ transform: [{ translateY }] }}>
  {/* 모달 컨텐츠 */}
</Animated.View>
```

## Animated.event — 이벤트 연동

스크롤 등의 네이티브 이벤트를 애니메이션 값에 직접 연결합니다.

```typescript
<Animated.FlatList
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  )}
/>
```

`useNativeDriver: true`로 JS 스레드를 거치지 않아 60fps 성능이 보장됩니다.

## useNativeDriver 제약사항

| 가능 | 불가능 |
|---|---|
| `transform` (translateX/Y, scale, rotate) | `width`, `height` |
| `opacity` | `padding`, `margin` |
| | `backgroundColor`, `borderRadius` |

> 레이아웃 속성 애니메이션이 필요하면 `useNativeDriver: false` 또는 `react-native-reanimated`를 사용하세요.

{% endraw %}
