---
title: "React Native Modal 패턴 (웹 Portal 비교)"
date: 2026-02-18
categories: [Frontend]
tags: [react-native, modal, bottom-sheet, web-comparison]
toc: true
toc_sticky: true
---
{% raw %}

React Native의 `<Modal>` 컴포넌트와 웹의 Portal 패턴을 비교하고, BottomSheet 모달 구현 패턴을 정리합니다.

## 웹 vs React Native 모달

| 항목 | 웹 React | React Native |
|---|---|---|
| 렌더링 위치 | `createPortal` → `document.body` | `<Modal>` 자체가 네이티브 최상위 레이어 |
| z-index 관리 | 수동 관리 필요 | 자동 (Modal은 항상 최상위) |
| 배경 오버레이 | CSS `position: fixed` | `transparent` prop + View 구현 |
| 애니메이션 | CSS `@keyframes` / `transition` | `animationType` 또는 Animated API |
| 뒤로가기 | 해당 없음 | `onRequestClose` (Android 필수) |
| 스크롤 차단 | `body { overflow: hidden }` 수동 | 자동 |

## Modal 기본 사용법

```typescript
import { Modal } from "react-native";

<Modal
  visible={visible}
  transparent
  animationType="none"
  onRequestClose={onClose}
>
  {/* overlay + 컨텐츠 */}
</Modal>
```

## BottomSheet 모달 구현

```typescript
const BottomSheetModal = ({ visible, onClose, children, maxHeight = "90%" }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      overlayAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [onClose]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={{ opacity: overlayAnim, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity onPress={handleClose} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY }], maxHeight }}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
};
```

## 열기/닫기 애니메이션 비대칭

- **열기**: `Animated.spring` — 자연스러운 바운스 효과
- **닫기**: `Animated.timing` — 빠르게 사라짐

spring은 duration이 없어서 닫기에는 timing을 쓰는 것이 일반적입니다.

## 닫기 완료 후 콜백

```typescript
Animated.timing(slideAnim, { toValue: 0, duration: 200 })
  .start(() => onClose()); // 애니메이션 끝난 후 모달 닫기
```

이걸 안 하면 애니메이션이 끝나기 전에 모달이 사라져서 뚝 끊기는 느낌이 납니다.

{% endraw %}
