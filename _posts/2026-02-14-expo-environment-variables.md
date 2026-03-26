---
title: "Expo 환경 변수 설정 방법"
date: 2026-02-14
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, env, configuration]
toc: true
toc_sticky: true
---

## 개요

React 웹과 React Native(Expo)는 **환경 변수 접근 방식이 다릅니다.**

---

## React (웹) vs React Native (Expo)

### React (웹)

```typescript
// Vite
const API_URL = import.meta.env.VITE_API_URL;

// Create React App
const API_URL = process.env.REACT_APP_API_URL;
```

웹에서는 **빌드 시점**에 번들러(Vite, Webpack)가 환경 변수를 코드에 주입합니다.

### React Native (Expo)

```typescript
// ❌ 동작하지 않음
const API_URL = import.meta.env.EXPO_PUBLIC_API_URL;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ✅ Expo 방식
import Constants from "expo-constants";
const env = Constants.expoConfig?.extra || {};
const API_URL = env.backendApiUrl;
```

---

## 왜 다른가?

| 환경 | 번들러 | 환경 변수 접근 |
| --- | --- | --- |
| React (Vite) | Vite | import.meta.env |
| React (CRA) | Webpack | process.env |
| React Native (Expo) | Metro | Constants.expoConfig.extra |

React Native는 **Metro 번들러**를 사용하고, `import.meta.env`나 `process.env`를 네이티브 앱에서 그대로 지원하지 않습니다.

---

## Expo에서 환경 변수 설정 방법

### 1단계: `.env` 파일 생성

```javascript
EXPO_PUBLIC_BACKEND_API_URL=https://api.example.com
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=your_kakao_key
```

> **주의**: `EXPO_PUBLIC_` 접두사를 붙여야 합니다.

### 2단계: `app.config.ts`에서 읽기

```typescript
// app.config.ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'MyApp',
  slug: 'my-app',
  // ... 다른 설정
  extra: {
    backendApiUrl: process.env.EXPO_PUBLIC_BACKEND_API_URL,
    kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY,
  },
};

export default config;
```

> `process.env`는 **app.config.ts 내부**에서만 사용 가능합니다.

### 3단계: 코드에서 사용

```typescript
import Constants from "expo-constants";

const env = Constants.expoConfig?.extra || {};
const API_URL = env.backendApiUrl;
const KAKAO_KEY = env.kakaoAppKey;
```

---

## 데이터 흐름

```javascript
.env 파일
    ↓
app.config.ts (process.env로 읽기)
    ↓
extra 객체에 저장
    ↓
Constants.expoConfig.extra (런타임에서 접근)
```

---

## 실제 사용 예시

### axios.ts

```typescript
import axios from "axios";
import Constants from "expo-constants";

const env = Constants.expoConfig?.extra || {};
const API_BASE_URL = (env.backendApiUrl as string) || "http://localhost:8000";

export const api = axios.create({
    baseURL: API_BASE_URL,
});
```

---

## 요약

| 구분 | 설명 |
| --- | --- |
| process.env | Expo에서는 app.config.ts 내부에서만 사용 가능 |
| Constants.expoConfig.extra | 런타임에서 환경 변수 접근하는 Expo 공식 방식 |
| import.meta.env | React Native에서는 사용 불가 |

---

## 핵심 포인트

- React Native/Expo에서는 환경 변수가 `app.config.ts` → `Constants`를 통해 전달되는 구조
- `.env` 파일의 변수는 `EXPO_PUBLIC_` 접두사 필수
- 코드에서는 항상 `Constants.expoConfig?.extra`로 접근
