---
title: "WheelPicker — iOS 스타일 휠 피커 컴포넌트"
date: 2026-02-18
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, wheel-picker, animated-api, custom-component]
toc: true
toc_sticky: true
---

iOS 네이티브 UIPickerView와 유사한 커스텀 휠 피커 컴포넌트입니다. `Animated.FlatList` 기반으로 스크롤 시 중앙 아이템이 강조됩니다.

## 핵심 기술

- `Animated.FlatList`, `Animated.event`, `interpolate`, `Pressable`
- `snapToInterval`로 아이템 단위 스냅
- `useNativeDriver: true`로 60fps 보장

## Props

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `items` | `WheelPickerItem[]` | 필수 | { label, value } 배열 |
| `selectedValue` | `string \| number` | 필수 | 현재 선택된 값 |
| `onValueChange` | `(value) => void` | 필수 | 값 변경 시 호출 |
| `onConfirm` | `() => void` | undefined | 중앙 아이템 탭 시 호출 |
| `itemHeight` | `number` | 40 | 각 아이템 높이 (px) |
| `visibleCount` | `number` | 3 | 동시에 보이는 아이템 수 |

## 핵심 동작 원리

### 스크롤 애니메이션

```typescript
onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { useNativeDriver: true }
)}
```

각 아이템은 `scrollY` 기준으로 자신의 위치에 따라 scale과 opacity를 interpolate합니다.

```typescript
const scale = scrollY.interpolate({
  inputRange: [(i-2)*h, (i-1)*h, i*h, (i+1)*h, (i+2)*h],
  outputRange: [0.7, 0.85, 1, 0.85, 0.7],
  extrapolate: "clamp",
});
```

### 스냅 스크롤

```typescript
snapToInterval={itemHeight}
decelerationRate="fast"
```

웹 CSS의 `scroll-snap-type: y mandatory`와 동일한 효과입니다.

### 아이템 탭 처리

| 사용자 액션 | 동작 |
|---|---|
| 중앙(선택된) 아이템 탭 | `onConfirm()` 호출 |
| 비중앙 아이템 탭 | 해당 아이템으로 스크롤 이동 + `onValueChange()` |
| 스크롤 후 멈춤 | `onMomentumScrollEnd` → `onValueChange()` |

## 사용 예시

```typescript
<WheelPicker
  items={[{ label: "09", value: 9 }, { label: "10", value: 10 }]}
  selectedValue={9}
  onValueChange={(v) => setHour(v as number)}
/>
```

## 주의사항

- ScrollView 내부에서 사용 시 VirtualizedList 중첩 경고 발생
- `useNativeDriver: true`에서는 `transform`과 `opacity`만 애니메이션 가능
