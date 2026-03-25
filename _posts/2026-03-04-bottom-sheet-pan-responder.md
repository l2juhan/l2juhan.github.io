---
title: "BottomSheetModal — PanResponder 스와이프 닫기 구현"
date: 2026-03-04
categories: [Frontend]
tags: [react-native, pan-responder, gesture, bottom-sheet]
toc: true
toc_sticky: true
---

BottomSheetModal이 화면을 가득 채울 경우 overlay 영역이 없어서 모달을 닫을 수 없는 문제가 있었습니다. handle 바 영역을 아래로 스와이프하면 모달이 닫히도록 `PanResponder`를 적용했습니다.

## PanResponder란?

웹에서는 `onMouseDown` / `onMouseMove` / `onMouseUp` 이벤트를 조합해서 드래그를 구현하지만, React Native에서는 **PanResponder** API를 사용합니다.

## 구현

### Animated.Value 추가

```typescript
const panY = useRef(new Animated.Value(0)).current;
```

### PanResponder 생성

```typescript
const SWIPE_THRESHOLD = 100;

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        panY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > SWIPE_THRESHOLD) {
        handleClose();
      } else {
        Animated.spring(panY, {
          toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200,
        }).start();
      }
    },
  })
).current;
```

| 콜백 | 역할 |
|---|---|
| `onStartShouldSetPanResponder` | 터치 시작 시 responder 획득 여부 |
| `onMoveShouldSetPanResponder` | 5px 이상 움직이면 responder 획득 |
| `onPanResponderMove` | 아래 방향일 때만 panY 업데이트 |
| `onPanResponderRelease` | 100px 이상이면 닫기, 미만이면 스냅백 |

### transform 합산

```typescript
const translateY = slideAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_HEIGHT, 0],
});

const combinedTranslateY = Animated.add(translateY, panY);
```

`Animated.add()`로 열기/닫기 애니메이션과 스와이프 오프셋을 합산합니다.

### handle 영역에 연결

```typescript
<View {...panResponder.panHandlers} style={styles.handleArea}>
  <View style={styles.handle} />
</View>
```

## 웹 React와의 비교

| 항목 | 웹 React | React Native |
|---|---|---|
| 드래그 감지 | `onMouseDown` + `onMouseMove` + `onMouseUp` | `PanResponder` API |
| 이동 거리 | `event.clientY - startY` 직접 계산 | `gestureState.dy` 자동 제공 |
| 값 합산 | JS로 직접 더하기 | `Animated.add()` (네이티브 스레드 처리) |
| 성능 | JS 메인 스레드 | `useNativeDriver: true`로 네이티브 스레드 |
