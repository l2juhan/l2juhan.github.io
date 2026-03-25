---
title: "푸시 알림 권한 요청 (expo-notifications)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, push-notifications]
toc: true
toc_sticky: true
---

앱에서 푸시 알림을 보내려면 먼저 사용자에게 권한을 요청해야 합니다. iOS는 명시적 권한이 필수이고, Android는 13+ 버전부터 필요합니다.

## 설치

```bash
npx expo install expo-notifications expo-device expo-linking
```

## 권한 요청 플로우

```
권한 요청 버튼 터치
    ↓
물리 디바이스 확인 (시뮬레이터는 푸시 미지원)
    ↓
Android: 알림 채널 설정 (8.0+ 필수)
    ↓
현재 권한 상태 확인
    ├─ granted → 완료
    ├─ undetermined → 시스템 권한 다이얼로그 표시
    └─ denied → 설정 앱으로 이동 안내
```

## 구현 코드

```typescript
// src/utils/notification.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";

// Android 알림 채널 설정
const setupAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본 알림",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#769fcd",
    });
  }
};

// 권한 거부 시 설정 앱으로 이동 안내
const showPermissionDeniedAlert = (): void => {
  Alert.alert(
    "알림 권한 필요",
    "알림을 받으려면 설정에서 알림 권한을 허용해주세요.",
    [
      { text: "나중에", style: "cancel" },
      { text: "설정으로 이동", onPress: () => Linking.openSettings() },
    ]
  );
};

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log("시뮬레이터에서는 푸시 알림이 지원되지 않습니다.");
    return true;
  }

  await setupAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  if (existingStatus === "undetermined") {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  showPermissionDeniedAlert();
  return false;
};
```

## 컴포넌트에서 사용

```typescript
const handleAllowAlarm = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    console.log("알림 권한 허용됨");
  }
  navigation.navigate("Step5Complete");
};
```

## 권한 상태 종류

| 상태 | 설명 | 대응 방법 |
|---|---|---|
| `granted` | 이미 허용됨 | 바로 알림 사용 가능 |
| `undetermined` | 아직 결정 안함 | `requestPermissionsAsync()` 호출 |
| `denied` | 거부됨 | `Linking.openSettings()`로 안내 |

## iOS vs Android 차이점

| 항목 | iOS | Android |
|---|---|---|
| 권한 필요 시점 | 항상 필요 | 13+ 버전부터 필요 |
| 알림 채널 | 불필요 | 8.0+ 버전 필수 |
| 시뮬레이터 | 푸시 알림 미지원 | 에뮬레이터에서 지원 |

## Android importance 옵션

| 값 | 설명 |
|---|---|
| `MAX` | 소리 + 팝업 알림 |
| `HIGH` | 소리 + 알림 |
| `DEFAULT` | 소리 |
| `LOW` | 소리 없음 |
| `MIN` | 소리 없음 + 상태바에만 표시 |
