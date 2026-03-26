---
title: "Expo 폰트 설정 (useFonts) 및 공통 Text 컴포넌트"
date: 2026-02-24
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, fonts, custom-component]
toc: true
toc_sticky: true
---

## 개요

Expo 앱에서 커스텀 폰트를 로드하고, 공통 Text 컴포넌트로 전역 적용하는 방법을 정리합니다.

---

## 1. useFonts 훅

### useFonts란?

`useFonts`는 **expo-font** 라이브러리에서 제공하는 React Hook입니다. 커스텀 폰트를 앱에 로드하는 역할을 합니다.

### 설치

```bash
npx expo install expo-font
```

### 기본 사용법

```typescript
import { useFonts } from "expo-font";

const [fontsLoaded, fontError] = useFonts({
    "Pretendard-Regular": require("./src/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("./src/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("./src/assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("./src/assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-ExtraBold": require("./src/assets/fonts/Pretendard-ExtraBold.otf"),
});
```

### 반환값

| 반환값 | 타입 | 설명 |
| --- | --- | --- |
| fontsLoaded | boolean | 폰트 로딩 완료 여부 |
| fontError | Error \| null | 로딩 중 발생한 에러 |

### App.tsx 적용 예시

```typescript
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        "Pretendard-Regular": require("./src/assets/fonts/Pretendard-Regular.otf"),
        "Pretendard-Bold": require("./src/assets/fonts/Pretendard-Bold.otf"),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return <RootNavigator />;
}
```

---

## 2. 폰트 적용 방식

### 중요 포인트

> `useFonts`는 폰트를 **"사용 가능하게 등록"**할 뿐, **자동으로 모든 텍스트에 적용되지 않습니다.**

실제로 폰트를 적용하려면 각 컴포넌트에서 명시적으로 지정해야 합니다:

```typescript
// 각 컴포넌트에서 직접 지정 필요
<Text style={% raw %}{{ fontFamily: "Pretendard-Regular" }}{% endraw %}>텍스트</Text>
```

---

## 3. 공통 Text 컴포넌트

매번 `fontFamily`를 지정하는 것은 번거롭고 오타가 발생할 수 있습니다. **공통 Text 컴포넌트**를 만들어 해결합니다.

### 컴포넌트 코드

```typescript
// src/components/common/Text.tsx
import React from "react";
import { Text as RNText, TextStyle, StyleProp, TextProps } from "react-native";

type FontWeight = "Regular" | "Medium" | "SemiBold" | "Bold" | "ExtraBold";

interface AppTextProps extends TextProps {
    weight?: FontWeight;
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

export function Text({
    weight = "Regular",
    style,
    children,
    ...props
}: AppTextProps) {
    return (
        <RNText
            style={[{ fontFamily: `Pretendard-${weight}` }, style]}
            {...props}
        >
            {children}
        </RNText>
    );
})

export default Text;
```

### weight Props

| weight | 폰트 | 용도 |
| --- | --- | --- |
| Regular | Pretendard-Regular | 기본 본문 (기본값) |
| Medium | Pretendard-Medium | 일반 본문, 플레이스홀더 |
| SemiBold | Pretendard-SemiBold | 서브타이틀, 설명 텍스트 |
| Bold | Pretendard-Bold | 메인 타이틀, 버튼 텍스트 |
| ExtraBold | Pretendard-ExtraBold | 온보딩 강조 타이틀 |

---

## 4. 사용 예시

### Before (하드코딩)

```typescript
import { Text } from "react-native";

<Text style={% raw %}{{ fontFamily: "Pretendard-Bold", fontSize: 28 }}{% endraw %}>제목</Text>
<Text style={% raw %}{{ fontFamily: "Pretendard-Medium", fontSize: 14 }}{% endraw %}>본문</Text>
```

### After (공통 컴포넌트)

```typescript
import { Text } from "../components/common/Text";

<Text weight="Bold" style={% raw %}{{ fontSize: 28 }}{% endraw %}>제목</Text>
<Text weight="Medium" style={% raw %}{{ fontSize: 14 }}{% endraw %}>본문</Text>
<Text>기본(Regular) 텍스트</Text>
```

---

## 5. 스타일 적용 예시

### 스크린 컴포넌트

```typescript
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../components/common/Text";

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text weight="Bold" style={styles.title}>PayCheck</Text>
            <Text weight="Medium" style={styles.subtitle}>
                근로자와 고용주의 거래와 소통을 원활하게
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 40,
        color: "#000000",
    },
    subtitle: {
        fontSize: 13,
        color: "#848484",
    },
});
```

> **주의**: `fontFamily`를 스타일에서 제거하고 `weight` props로 대체합니다.

---

## 6. 장점

| 항목 | 하드코딩 | 공통 컴포넌트 |
| --- | --- | --- |
| 폰트명 오타 | 발생 가능 | 타입 체크로 방지 |
| 폰트 변경 | 모든 파일 수정 | 한 곳만 수정 |
| 코드 가독성 | 길고 반복적 | 간결하고 직관적 |
| 유지보수 | 어려움 | 쉬움 |

---

## 핵심 포인트

- `useFonts`는 폰트를 **로드**할 뿐, 자동 적용되지 않음
- 새로운 스크린 작성 시 `react-native`의 `Text`가 아닌 **공통 Text 컴포넌트**를 import
- `weight` props로 폰트 굵기 지정, 기본값은 `Regular`
- 스타일에서 `fontFamily` 제거하고 `weight`로 대체
