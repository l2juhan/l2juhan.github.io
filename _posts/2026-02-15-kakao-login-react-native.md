---
title: "카카오 로그인 연동 (@react-native-seoul/kakao-login)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, kakao, oauth, login]
toc: true
toc_sticky: true
---

### 개요

React Native에서 카카오 로그인을 구현하는 방법입니다. 카카오 SDK를 통해 토큰을 받고, 백엔드에 전송하여 JWT를 발급받는 플로우입니다.

---

### 설치

```bash
npm install @react-native-seoul/kakao-login
```

> **주의**: 네이티브 모듈이므로 Development Build 재빌드 필요

---

### 사전 설정

#### 1. 카카오 개발자 콘솔 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
1. 애플리케이션 추가 → 네이티브 앱 키 발급
1. 플랫폼 등록 (iOS: 번들 ID, Android: 패키지명 + 키 해시)

#### 2. iOS 설정 (app.json)

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["kakao{NATIVE_APP_KEY}"]
          }
        ],
        "LSApplicationQueriesSchemes": [
          "kakaokompassauth",
          "kakaolink"
        ]
      }
    }
  }
}
```

#### 3. Android 설정 (app.json)

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "kakao{NATIVE_APP_KEY}",
              "host": "oauth"
            }
          ],
          "category": ["DEFAULT", "BROWSABLE"]
        }
      ]
    }
  }
}
```

---

### 인증 플로우

```javascript
[카카오 로그인 버튼 클릭]
    ↓
카카오 SDK 호출 → kakaoAccessToken 획득
    ↓
백엔드 POST /api/auth/kakao/login { kakaoAccessToken }
    ↓
├─ 200 OK (기존 회원) → JWT 발급 → 메인 화면
└─ 404 (신규 회원) → 회원가입 화면으로 이동
```

---

### 구현 코드

#### 1. 카카오 로그인 함수

```typescript
// src/api/authApi.ts
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import api from "./axios";

// 카카오 SDK로 토큰 받기
export const getKakaoToken = async (): Promise<string | null> => {
  try {
    const result = await kakaoLogin();
    return result.accessToken;
  } catch (error) {
    console.error("카카오 로그인 실패:", error);
    return null;
  }
};

// 백엔드로 토큰 전송하여 로그인
export const kakaoLoginWithToken = async (kakaoAccessToken: string) => {
  const response = await api.post("/api/auth/kakao/login", {
    kakaoAccessToken,
  });
  return response.data;
};
```

#### 2. 로그인 화면에서 사용

```typescript
// WelcomeScreen.tsx
import { getKakaoToken, kakaoLoginWithToken } from "../api/authApi";
import { useAuthStore } from "../stores/authStore";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const authLogin = useAuthStore((state) => state.login);

  const handleKakaoLogin = async () => {
    // 1. 카카오 SDK로 토큰 받기
    const kakaoToken = await getKakaoToken();
    if (!kakaoToken) {
      showError("로그인 실패", "카카오 로그인에 실패했습니다.");
      return;
    }

    try {
      // 2. 백엔드로 토큰 전송
      const response = await kakaoLoginWithToken(kakaoToken);

      if (response.success) {
        // 3. 기존 회원 → JWT 저장 후 메인으로
        authLogin(response.data.accessToken, response.data.userInfo);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      }
    } catch (error) {
      if (error.status === 404) {
        // 4. 신규 회원 → 회원가입으로
        navigation.navigate("SignUp");
      }
    }
  };

  return (
    <TouchableOpacity onPress={handleKakaoLogin}>
      <Image source={require("../assets/kakao-login.png")} />
    </TouchableOpacity>
  );
};
```

---

### 카카오 SDK 주요 함수

| 함수 | 설명 | 반환값 |
| --- | --- | --- |
| login() | 카카오 로그인 | { accessToken, refreshToken, ... } |
| logout() | 카카오 로그아웃 | - |
| getProfile() | 사용자 프로필 조회 | { id, nickname, email, ... } |
| unlink() | 카카오 연결 해제 | - |

---

### 토큰 관리 플로우

```javascript
[카카오 토큰]
  │
  └→ 백엔드 전송 → 백엔드에서 카카오 API로 검증
                            ↓
                     자체 JWT 발급
                       ├─ accessToken (30분)
                       └─ refreshToken (14일, 쿠키)
                            ↓
                     클라이언트에서 저장 (Zustand + AsyncStorage)
```

> **참고**: 카카오 토큰은 로그인 시에만 사용하고, 이후 API 요청은 백엔드에서 발급한 JWT를 사용합니다.
