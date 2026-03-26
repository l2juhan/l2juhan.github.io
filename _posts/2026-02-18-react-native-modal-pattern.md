---
title: "React Native Modal 패턴 (웹 Portal 비교)"
date: 2026-02-18
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, modal, portal, web-comparison]
toc: true
toc_sticky: true
---

## 개요

React Native의 `<Modal>` 컴포넌트와 웹의 Portal 패턴을 비교하고, BottomSheet 모달 구현 패턴을 정리합니다.

---

## 1. 웹 vs React Native 모달 비교

### 웹 React — Portal + CSS

```javascript
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body  // DOM 트리 최상단에 렌더링
  );
};
```

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.modal-content {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### React Native — Modal 컴포넌트

```typescript
import { Modal } from "react-native";

<Modal
  visible={visible}       // isOpen 역할
  transparent             // 배경 투명 (overlay 직접 구현)
  animationType="none"    // 기본 애니메이션 끄기 (커스텀 사용)
  onRequestClose={onClose} // Android 뒤로가기 버튼 처리
>
  {/* overlay + 컨텐츠 */}
</Modal>
```

### 핵심 차이

| 항목 | 웹 React | React Native |
| --- | --- | --- |
| 렌더링 위치 | createPortal → document.body | <Modal> 자체가 네이티브 최상위 레이어 |
| z-index 관리 | z-index: 1000 등 수동 관리 | 자동 (Modal은 항상 최상위) |
| 배경 오버레이 | CSS position: fixed  • background | transparent prop + 직접 View 구현 |
| 애니메이션 | CSS @keyframes / transition | animationType prop 또는 Animated API |
| 뒤로가기 | 해당 없음 | onRequestClose (Android 필수) |
| 스크롤 차단 | body { overflow: hidden } 수동 설정 | 자동 (Modal이 터치 이벤트 차단) |

---

## 2. BottomSheet 모달 구현 패턴

PayCheck 프로젝트에서 사용하는 재사용 가능한 BottomSheetModal 구현입니다.

### 컴포넌트 구조

```typescript
const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  maxHeight = "90%",
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // 열릴 때: overlay fade-in + content slide-up 동시 실행
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      overlayAnim.setValue(0);
    }
  }, [visible]);

  // 닫을 때: 애니메이션 후 onClose 호출
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0, duration: 200, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 200, useNativeDriver: true,
      }),
    ]).start(() => onClose());  // 애니메이션 완료 후 닫기
  }, [onClose]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none"
      onRequestClose={handleClose}>
      {/* Overlay */}
      <Animated.View style={% raw %}{{ opacity: overlayAnim, backgroundColor: "rgba(0,0,0,0.5)" }}{% endraw %}>
        <TouchableOpacity onPress={handleClose} />
      </Animated.View>
      {/* Content */}
      <Animated.View style={% raw %}{{ transform: [{ translateY }], maxHeight }}{% endraw %}>
        <View style={styles.handle} />  {/* 상단 드래그 핸들 */}
        {children}
      </Animated.View>
    </Modal>
  );
};
```

### 사용법

```typescript
<BottomSheetModal visible={visible} onClose={onClose} maxHeight="90%">
  <Text>모달 제목</Text>
  {/* 모달 내부 컨텐츠 */}
</BottomSheetModal>
```

---

## 3. animationType 옵션

Modal의 기본 제공 애니메이션입니다.

| 값 | 동작 | 사용 시점 |
| --- | --- | --- |
| "none" | 애니메이션 없음 | 커스텀 애니메이션 사용 시 |
| "slide" | 하단에서 올라옴 | 간단한 BottomSheet |
| "fade" | 페이드 인/아웃 | 알림, 확인 다이얼로그 |

> **팁**: 커스텀 애니메이션을 쓸 때는 `animationType="none"`으로 설정하고 Animated API로 직접 구현

---

## 4. Android 뒤로가기 처리

### 웹

뒤로가기 버튼 개념 없음 (브라우저 히스토리와 별개).

### React Native

```typescript
<Modal
  onRequestClose={handleClose}  // Android 뒤로가기 버튼 시 호출
>
```

> **필수**: `onRequestClose`를 설정하지 않으면 Android에서 뒤로가기 버튼을 눌러도 모달이 닫히지 않음

---

## 5. 주의사항

### transparent prop

```typescript
// transparent 없으면 → 모달 배경이 흰색 (전체 화면 모달)
<Modal visible={true}>

// transparent 있으면 → 배경 투명 (오버레이 직접 구현 가능)
<Modal visible={true} transparent>
```

### 열기/닫기 애니메이션 비대칭

```typescript
// 열기: spring (자연스러운 바운스)
Animated.spring(slideAnim, { toValue: 1, damping: 20, stiffness: 200 })

// 닫기: timing (빠르게 사라짐)
Animated.timing(slideAnim, { toValue: 0, duration: 200 })
```

> spring은 duration이 없어 닫을 때 느릴 수 있음. 닫기에는 timing을 쓰는 게 일반적

### 닫기 완료 후 콜백

```typescript
// .start(callback)으로 애니메이션 완료 후 실행
Animated.timing(slideAnim, { toValue: 0, duration: 200 })
  .start(() => onClose());  // 애니메이션 끝난 후 모달 닫기
```

> 이걸 안 하면 애니메이션이 끝나기 전에 모달이 사라져서 뚝 끊기는 느낌

---

## 빠른 참조 테이블

| 항목 | 웹 React | React Native |
| --- | --- | --- |
| 모달 렌더링 | createPortal(jsx, document.body) | <Modal visible={true}> |
| 오버레이 | CSS position: fixed | transparent  • Animated.View |
| 애니메이션 | CSS @keyframes | Animated.spring / Animated.timing |
| 닫기 트리거 | overlay onClick | overlay onPress  • onRequestClose |
| 스크롤 차단 | body { overflow: hidden } 수동 | 자동 |
| z-index | 수동 관리 필요 | 자동 (항상 최상위) |
