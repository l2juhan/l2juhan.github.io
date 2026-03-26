---
title: "BottomSheetModal — PanResponder 스와이프 닫기 구현"
date: 2026-03-04
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, pan-responder, gesture, bottom-sheet]
toc: true
toc_sticky: true
---

### 배경

`BottomSheetModal`이 화면을 가득 채울 경우, overlay 영역이 없어서 모달을 닫을 수 없는 문제가 있었다.

handle 바(회색 막대) 영역을 아래로 스와이프하면 모달이 닫히도록 `PanResponder`를 적용했다.

---

### 핵심 개념: PanResponder

웹 React에서는 `onMouseDown` / `onMouseMove` / `onMouseUp` 이벤트를 조합해서 드래그를 구현하지만,

React Native에서는 **PanResponder** API를 사용한다.

`PanResponder`는 터치 제스처를 감지하고, `gestureState` 객체를 통해 드래그 거리(`dy`), 속도(`vy`) 등을 제공한다.

```javascript
import { PanResponder } from "react-native";
```

---

### 구현 상세

#### 1. 추가된 Animated.Value

```javascript
const panY = useRef(new Animated.Value(0)).current;
```

- `panY`: 사용자의 스와이프 거리를 실시간으로 추적하는 값
- 기존 `slideAnim`(열기/닫기 애니메이션)과 별도로 관리

#### 2. PanResponder 생성

```javascript
const SWIPE_THRESHOLD = 100; // 100px 이상 내려야 닫힘

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
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      }
    },
  })
).current;
```

| 콜백 | 역할 |
| --- | --- |
| onStartShouldSetPanResponder | 터치 시작 시 이 뷰가 responder가 될지 결정 |
| onMoveShouldSetPanResponder | 터치 이동 시 responder 획득 여부 (5px 이상 움직이면) |
| onPanResponderMove | 드래그 중 호출. dy > 0(아래 방향)일 때만 panY 업데이트 |
| onPanResponderRelease | 손을 뗐을 때. 100px 이상이면 닫기, 미만이면 원위치 스냅백 |

#### 3. transform 합산

```javascript
const translateY = slideAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_HEIGHT, 0],
});

const combinedTranslateY = Animated.add(translateY, panY);
```

- `Animated.add()`로 열기/닫기 애니메이션(`translateY`)과 스와이프 오프셋(`panY`)을 합산
- 모달이 열린 상태(`translateY=0`)에서 스와이프하면 `panY`만큼 아래로 이동

#### 4. handle 영역에 PanResponder 연결

```javascript
<View {...panResponder.panHandlers} style={styles.handleArea}>
  <View style={styles.handle} />
</View>
```

- `panHandlers`를 handle 영역의 wrapper `View`에 spread
- `handleArea`의 `paddingVertical: 16`으로 터치 영역을 확대 (실제 handle 바는 4px이지만 터치 가능 영역은 32px+)

#### 5. panY 리셋 타이밍

```javascript
// visible 변경 시
useEffect(() => {
  if (visible) {
    panY.setValue(0); // 열릴 때 리셋
  } else {
    panY.setValue(0); // 닫힐 때도 리셋
  }
}, [visible]);

// handleClose 완료 후
handleClose = () => {
  // 닫기 애니메이션 완료 후
  panY.setValue(0);
  onClose();
};
```

---

### 웹 React와의 비교

| 항목 | 웹 React | React Native |
| --- | --- | --- |
| 드래그 감지 | onMouseDown  • onMouseMove  • onMouseUp | PanResponder API |
| 이동 거리 | event.clientY - startY 직접 계산 | gestureState.dy 자동 제공 |
| 애니메이션 | CSS transform  • transition | Animated.Value  • useNativeDriver |
| 값 합산 | JS로 직접 더하기 | Animated.add() (네이티브 스레드 처리) |
| 성능 | JS 메인 스레드 | useNativeDriver: true로 네이티브 스레드 |

---

### 파일 위치

`src/components/common/BottomSheetModal.tsx`

이 컴포넌트를 사용하는 모든 바텀시트에 스와이프 닫기가 자동 적용된다.
