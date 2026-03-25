---
title: "토스트 알림 구현 (react-native-alert-notification)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, toast, alert, ui]
toc: true
toc_sticky: true
---

사용자에게 성공/에러 메시지를 표시하는 토스트 알림 기능입니다. 기본 Alert보다 더 예쁜 UI를 제공합니다.

## 설치

```bash
npm install react-native-alert-notification
```

## 기본 설정

App.tsx에 Provider를 추가합니다.

```typescript
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

## 유틸 함수

앱 전체에서 쉽게 사용할 수 있도록 유틸 함수로 분리합니다.

```typescript
// src/utils/alert.ts
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

export const showSuccess = (title: string, message?: string): void => {
  Toast.show({ type: ALERT_TYPE.SUCCESS, title, textBody: message || "" });
};

export const showError = (title: string, message?: string): void => {
  Toast.show({ type: ALERT_TYPE.DANGER, title, textBody: message || "" });
};

export const showWarning = (title: string, message?: string): void => {
  Toast.show({ type: ALERT_TYPE.WARNING, title, textBody: message || "" });
};
```

## 컴포넌트에서 사용

```typescript
import { showSuccess, showError } from "../utils/alert";

const handleLogin = async () => {
  try {
    await loginApi();
    showSuccess("로그인 성공", "환영합니다!");
  } catch (error) {
    showError("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
  }
};
```

## ALERT_TYPE 종류

| 타입 | 색상 | 용도 |
|---|---|---|
| `SUCCESS` | 초록 | 성공 메시지 |
| `DANGER` | 빨간 | 에러 메시지 |
| `WARNING` | 노란 | 경고 메시지 |
| `INFO` | 파란 | 정보 메시지 |

## Alert vs Toast vs Dialog 비교

| 항목 | Alert (기본) | Toast | Dialog |
|---|---|---|---|
| UI | 시스템 기본 | 상단 슬라이드 | 화면 중앙 모달 |
| 자동 닫힘 | X | O | X |
| 커스터마이징 | X | O | O |
| 사용자 액션 | 버튼 클릭 | 클릭 (선택) | 버튼 클릭 |
