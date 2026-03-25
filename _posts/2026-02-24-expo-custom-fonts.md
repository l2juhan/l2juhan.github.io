---
title: "Expo 폰트 설정 (useFonts) 및 공통 Text 컴포넌트"
date: 2026-02-24
categories: [Frontend]
tags: [react-native, expo, fonts, typescript]
toc: true
toc_sticky: true
---

Expo 앱에서 커스텀 폰트를 로드하고, 공통 Text 컴포넌트로 전역 적용하는 방법을 정리합니다.

## useFonts 훅

`useFonts`는 **expo-font** 라이브러리에서 제공하는 React Hook으로, 커스텀 폰트를 앱에 로드합니다.

```bash
npx expo install expo-font
```

```typescript
import { useFonts } from "expo-font";

const [fontsLoaded, fontError] = useFonts({
    "Pretendard-Regular": require("./src/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("./src/assets/fonts/Pretendard-Bold.otf"),
});
```

> `useFonts`는 폰트를 **"사용 가능하게 등록"**할 뿐, 자동으로 모든 텍스트에 적용되지 않습니다. 각 컴포넌트에서 `fontFamily`를 명시적으로 지정해야 합니다.

## 공통 Text 컴포넌트

매번 `fontFamily`를 지정하는 것은 번거롭습니다. 공통 Text 컴포넌트를 만들어 해결합니다.

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

export function Text({ weight = "Regular", style, children, ...props }: AppTextProps) {
    return (
        <RNText style={[{ fontFamily: `Pretendard-${weight}` }, style]} {...props}>
            {children}
        </RNText>
    );
}
```

### weight 옵션

| weight | 폰트 | 용도 |
|---|---|---|
| `Regular` | Pretendard-Regular | 기본 본문 (기본값) |
| `Medium` | Pretendard-Medium | 일반 본문, 플레이스홀더 |
| `SemiBold` | Pretendard-SemiBold | 서브타이틀, 설명 텍스트 |
| `Bold` | Pretendard-Bold | 메인 타이틀, 버튼 텍스트 |
| `ExtraBold` | Pretendard-ExtraBold | 온보딩 강조 타이틀 |

## 사용 예시

### Before (하드코딩)

```typescript
import { Text } from "react-native";

<Text style={{ fontFamily: "Pretendard-Bold", fontSize: 28 }}>제목</Text>
```

### After (공통 컴포넌트)

```typescript
import { Text } from "../components/common/Text";

<Text weight="Bold" style={{ fontSize: 28 }}>제목</Text>
<Text weight="Medium" style={{ fontSize: 14 }}>본문</Text>
<Text>기본(Regular) 텍스트</Text>
```

## 장점

| 항목 | 하드코딩 | 공통 컴포넌트 |
|---|---|---|
| 폰트명 오타 | 발생 가능 | 타입 체크로 방지 |
| 폰트 변경 | 모든 파일 수정 | 한 곳만 수정 |
| 코드 가독성 | 길고 반복적 | 간결하고 직관적 |
| 유지보수 | 어려움 | 쉬움 |
