---
title: "푸시 알림 권한 요청 (expo-notifications)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, push-notifications]
toc: true
toc_sticky: true
---

### 개요

앱에서 푸시 알림을 보내려면 먼저 사용자에게 권한을 요청해야 합니다. iOS는 명시적 권한이 필수이고, Android는 13+ 버전부터 필요합니다.

---

### 설치

```bash
npx expo install expo-notifications expo-device expo-linking
```

> **주의**: 네이티브 모듈이므로 Development Build 재빌드 필요

---

### 권한 요청 플로우

```javascript
권한 요청 버튼 터치
    ↓
물리 디바이스 확인 (시뮤레이터는 푸시 미지원)
    ↓
Android: 알림 채널 설정 (8.0+ 필수)
    ↓
현재 권한 상태 확인
    ├─ granted (이미 허용) → 완료
    ├─ undetermined (미결정) → 시스템 권한 다이얼로그 표시
    └─ denied (거부됨) → 설정 앱으로 이동 안내
```

---

### 구현 코드

```typescript
// src/utils/notification.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";

/**
 * Android 알림 채널 설정
 * Android 8.0 (API 26) 이상에서는 알림 채널이 필수
 */
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

/**
 * 권한 거부 시 설정 앱으로 이동 안내
 */
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

/**
 * 푸시 알림 권한 요청
 * @returns 권한 허용 여부 (true: 허용, false: 거부/취소)
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  // 1. 물리 디바이스 확인 (시뮤레이터는 푸시 알림 미지원)
  if (!Device.isDevice) {
    console.log("시뮤레이터에서는 푸시 알림이 지원되지 않습니다.");
    return true;  // 개발 편의를 위해 true 반환
  }

  // 2. Android 채널 설정
  await setupAndroidNotificationChannel();

  // 3. 현재 권한 상태 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // 4. 이미 허용됨
  if (existingStatus === "granted") {
    return true;
  }

  // 5. 미결정 상태 → 권한 요청 다이얼로그 표시
  if (existingStatus === "undetermined") {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  // 6. 거부됨 → 설정 앱 이동 안내
  showPermissionDeniedAlert();
  return false;
};

/**
 * 현재 알림 권한 상태 확인 (앱 어디서든 사용 가능)
 */
export const getNotificationPermissionStatus = async (): Promise<string> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;  // "granted" | "denied" | "undetermined"
};
```

---

### 컴포넌트에서 사용

```typescript
// Step4AlarmScreen.tsx
import { requestNotificationPermission } from "../../../utils/notification";

const Step4AlarmScreen = () => {
  const handleAllowAlarm = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      console.log("알림 권한 허용됨");
    } else {
      console.log("알림 권한 거부됨");
    }
    
    // 권한 허용 여부와 관계없이 다음 단계로 진행
    navigation.navigate("Step5Complete");
  };

  const handleSkip = () => {
    // 권한 요청 없이 다음 단계로
    navigation.navigate("Step5Complete");
  };

  return (
    <View>
      <Text>푸시 알림을 받아보세요</Text>
      <Button title="알람 허용" onPress={handleAllowAlarm} />
      <Button title="나중에 설정하기" onPress={handleSkip} />
    </View>
  );
};
```

---

### 권한 상태 종류

| 상태 | 설명 | 대응 방법 |
| --- | --- | --- |
| granted | 이미 허용됨 | 바로 알림 사용 가능 |
| undetermined | 아직 결정 안함 (찫 요청) | requestPermissionsAsync() 호출 |
| denied | 거부됨 | 설정 앱으로 안내 (Linking.openSettings()) |

---

### iOS vs Android 차이점

| 항목 | iOS | Android |
| --- | --- | --- |
| 권한 필요 시점 | 항상 필요 | 13+ 버전부터 필요 |
| 알림 채널 | 불필요 | 8.0+ 버전 필수 |
| 시뮤레이터 | 푸시 알림 미지원 | 에뮤레이터에서 지원 |

---

### Android 알림 채널 옵션

```typescript
await Notifications.setNotificationChannelAsync("default", {
  name: "기본 알림",                              // 사용자에게 표시되는 이름
  importance: Notifications.AndroidImportance.MAX, // 중요도 (소리, 팝업 등)
  vibrationPattern: [0, 250, 250, 250],           // 진동 패턴
  lightColor: "#769fcd",                          // LED 색상
  sound: "default",                               // 알림 소리
});
```

#### importance 옵션

| 값 | 설명 |
| --- | --- |
| MAX | 소리 + 팝업 알림 |
| HIGH | 소리 + 알림 |
| DEFAULT | 소리 |
| LOW | 소리 없음 |
| MIN | 소리 없음 + 상태바에만 표시 |
