---
title: "토스트 알림 (react-native-alert-notification)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, toast, notification, ui]
toc: true
toc_sticky: true
---

### 개요

사용자에게 성공/에러 메시지를 표시하는 토스트 알림 기능입니다. Alert보다 더 예쁜 UI를 제공합니다.

---

### 설치

```bash
npm install react-native-alert-notification
```

---

### 기본 설정

#### 1. App.tsx에 Provider 추가

```typescript
// App.tsx
import { AlertNotificationRoot } from "react-native-alert-notification";

export default function App() {
  return (
    <AlertNotificationRoot>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AlertNotificationRoot>
  );
}
```

---

### 유틸 함수 만들기

앱 전체에서 쉽게 사용할 수 있도록 유틸 함수로 분리합니다.

```typescript
// src/utils/alert.ts
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

/**
 * 성공 토스트 표시
 */
export const showSuccess = (title: string, message?: string): void => {
  Toast.show({
    type: ALERT_TYPE.SUCCESS,
    title,
    textBody: message || "",
  });
};

/**
 * 에러 토스트 표시
 */
export const showError = (title: string, message?: string): void => {
  Toast.show({
    type: ALERT_TYPE.DANGER,
    title,
    textBody: message || "",
  });
};

/**
 * 경고 토스트 표시
 */
export const showWarning = (title: string, message?: string): void => {
  Toast.show({
    type: ALERT_TYPE.WARNING,
    title,
    textBody: message || "",
  });
};

/**
 * 정보 토스트 표시
 */
export const showInfo = (title: string, message?: string): void => {
  Toast.show({
    type: ALERT_TYPE.INFO,
    title,
    textBody: message || "",
  });
};
```

---

### 컴포넌트에서 사용

```typescript
import { showSuccess, showError } from "../utils/alert";

const LoginScreen = () => {
  const handleLogin = async () => {
    try {
      await loginApi();
      showSuccess("로그인 성공", "환영합니다!");
    } catch (error) {
      showError("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <Button title="로그인" onPress={handleLogin} />
  );
};
```

---

### ALERT_TYPE 종류

| 타입 | 색상 | 용도 |
| --- | --- | --- |
| SUCCESS | 초록 | 성공 메시지 |
| DANGER | 빨간 | 에러 메시지 |
| WARNING | 노란 | 경고 메시지 |
| INFO | 파란 | 정보 메시지 |

---

### Toast 옵션

```typescript
Toast.show({
  type: ALERT_TYPE.SUCCESS,  // 타입 (필수)
  title: "제목",              // 제목 (필수)
  textBody: "내용",           // 본문 (선택)
  autoClose: 3000,           // 자동 닫힘 시간 (ms, 기본 3000)
  onPress: () => {},         // 클릭 시 콜백
  onShow: () => {},          // 표시 시 콜백
  onHide: () => {},          // 숨김 시 콜백
});
```

---

### Dialog (모달 형태)

토스트 대신 화면 중앙에 모달로 표시할 수도 있습니다.

```typescript
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

Dialog.show({
  type: ALERT_TYPE.SUCCESS,
  title: "회원가입 완료",
  textBody: "환영합니다! 이제 서비스를 이용하실 수 있습니다.",
  button: "확인",
  onPressButton: () => {
    // 버튼 클릭 시 동작
    navigation.navigate("Home");
  },
});
```

---

### Alert vs Toast vs Dialog 비교

| 항목 | Alert (기본) | Toast | Dialog |
| --- | --- | --- | --- |
| UI | 시스템 기본 | 상단 슬라이드 | 화면 중앙 모달 |
| 자동 닫힘 | X | O | X |
| 커스터마이징 | X | O | O |
| 사용자 액션 | 버튼 클릭 | 클릭 (선택) | 버튼 클릭 |
