---
title: "Expo 스플래시 스크린 설정 및 적용법"
date: 2026-02-23
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, splash-screen]
toc: true
toc_sticky: true
---

## 개요

Expo 앱에서 스플래시 스크린을 설정하고 제어하는 방법을 정리합니다.

---

## 스플래시 스크린 구조

스플래시 스크린은 **두 가지 요소**로 구성됩니다:

| 구성 요소 | 역할 | 위치 |
| --- | --- | --- |
| app.json / app.config.ts | 스플래시 이미지/배경색 정의 | splash 객체 |
| expo-splash-screen 라이브러리 | 스플래시 표시/숨김 제어 | App.tsx |

---

## 1. 스플래시 이미지 설정 (app.config.ts)

`app.json` 또는 `app.config.ts`에서 스플래시 이미지를 설정합니다:

```typescript
// app.config.ts
splash: {
    image: './assets/splash-icon.png',  // 스플래시 이미지 경로
    resizeMode: 'contain',               // 이미지 크기 조절 방식
    backgroundColor: '#ffffff',          // 배경색
},
```

### resizeMode 옵션

| 옵션 | 설명 |
| --- | --- |
| contain | 이미지 비율 유지, 화면에 맞춤 |
| cover | 이미지 비율 유지, 화면을 꽉 채움 |
| native | 플랫폼 기본 동작 |

---

## 2. 스플래시 제어 (expo-splash-screen)

### 라이브러리 설치

```bash
npx expo install expo-splash-screen
```

### App.tsx에서 사용

```typescript
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";

// 스플래시 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        "Pretendard-Regular": require("./src/assets/fonts/Pretendard-Regular.otf"),
    });

    useEffect(() => {
        // 폰트 로딩 완료 시 스플래시 숨기기
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;  // 로딩 중에는 아무것도 렌더링하지 않음
    }

    return <App />;
}
```

---

## 3. 주요 API

| 메서드 | 설명 |
| --- | --- |
| preventAutoHideAsync() | 스플래시가 자동으로 사라지지 않도록 유지 |
| hideAsync() | 스플래시를 숨김 |

---

## 4. 실행 흐름

```
1. 앱 시작
   └─→ SplashScreen.preventAutoHideAsync() 호출
   
2. App 컴포넌트 마운트
   └─→ useFonts 시작 (비동기 폰트 로딩)
   └─→ fontsLoaded = false
   └─→ return null (스플래시 유지)
   
3. 폰트 로딩 완료
   └─→ fontsLoaded = true
   └─→ useEffect 실행 → SplashScreen.hideAsync()
   └─→ 실제 UI 렌더링
```

---

## 5. 폴더 구조

```javascript
ProjectRoot/
├── assets/              ← Expo 빌드 설정용 (스플래시, 아이콘)
│   ├── splash-icon.png  ← 스플래시 이미지
│   ├── icon.png
│   └── adaptive-icon.png
└── src/
    └── assets/          ← 앱 내부 리소스 (폰트, 이미지)
        ├── fonts/
        └── images/
```

> **주의**: `app.config.ts`의 경로는 **프로젝트 루트 기준**입니다.

---

## 6. 스플래시 이미지 변경

스플래시 이미지를 바꾸려면:

1. 새 이미지를 `./assets/splash-icon.png`로 저장 (또는 다른 파일명)
1. `app.config.ts`의 `splash.image` 경로 업데이트
1. 앱 다시 빌드
---

## 핵심 포인트

- `expo-splash-screen`은 스플래시를 **만드는 게 아니라 제어**하는 라이브러리
- 실제 스플래시 이미지는 `app.config.ts`에서 설정
- 폰트/데이터 로딩이 완료된 후 `hideAsync()`로 스플래시 숨기기
- 스플래시 제어 없이는 앱 시작 시 바로 사라져서 폰트가 깨져 보일 수 있음
