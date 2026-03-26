---
title: "Axios 인터셉터 + 토큰 자동 갱신"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, axios, interceptor, token-refresh]
toc: true
toc_sticky: true
---

### 개요

Axios 인터셉터를 사용하여 모든 API 요청에 토큰을 자동으로 첨부하고, 401 에러 시 토큰을 자동 갱신하는 방법입니다.

---

### 설치

```bash
npm install axios
```

---

### 인터셉터란?

요청/응답을 가로채서 공통 로직을 적용할 수 있는 기능입니다.

```javascript
[요청] → [Request 인터셉터] → [서버] → [Response 인터셉터] → [응답]
```

---

### 구현 코드

```typescript
// src/api/axios.ts
import axios from "axios";
import Constants from "expo-constants";
import { getAuthState } from "../stores/authStore";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.backendApiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  // 쿠키 전송 허용 (refreshToken)
});

// 토큰 갱신 중복 방지 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// 새 토큰 대기 큐에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// ==========================================
// Request 인터셉터: 토큰 자동 첨부
// ==========================================
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthState();
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// Response 인터셉터: 401 에러 시 토큰 갱신
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고, 재시도한 적 없는 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 갱신 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청 (refreshToken은 쿠키로 자동 전송)
        const response = await api.post("/api/auth/refresh");
        const newAccessToken = response.data.data.accessToken;

        // 새 토큰 저장
        const { login, userInfo } = getAuthState();
        if (userInfo) {
          login(newAccessToken, userInfo);
        }

        // 대기 중인 요청들 처리
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // 갱신 실패 → 로그아웃
        isRefreshing = false;
        const { logout } = getAuthState();
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

### API 함수에서 사용

```typescript
// src/api/userApi.ts
import api from "./axios";

export const getUserProfile = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfileDto) => {
  const response = await api.patch("/api/users/me", data);
  return response.data;
};
```

> **포인트**: `api` 인스턴스를 사용하면 토큰이 자동 첨부됩니다.

---

### 토큰 갱신 플로우

```javascript
[API 요청]
    ↓
Request 인터셉터: Authorization 헤더 첨부
    ↓
[서버]
    ↓
├─ 200 OK → 정상 응답
│
└─ 401 Unauthorized
        ↓
    Response 인터셉터에서 감지
        ↓
    POST /api/auth/refresh (쿠키의 refreshToken 사용)
        │
        ├─ 성공 → 새 accessToken 저장 → 원래 요청 재시도
        │
        └─ 실패 → 로그아웃 → 로그인 화면으로
```

---

### 주요 포인트

#### 1. withCredentials: true

쿠키를 자동으로 전송하려면 필수입니다.

```typescript
const api = axios.create({
  withCredentials: true,  // 쿠키 전송 허용
});
```

#### 2. 중복 갱신 방지

여러 요청이 동시에 401을 받으면 토큰 갱신이 여러 번 일어날 수 있습니다.

`isRefreshing` 플래그와 `refreshSubscribers` 배열로 방지합니다.

#### 3. 컴포넌트 외부에서 Store 접근

인터셉터는 컴포넌트가 아니므로 `useAuthStore` 훅을 사용할 수 없습니다.

`getState()`를 사용합니다.

```typescript
// ❌ 사용 불가 (훅은 컴포넌트 내부에서만)
const token = useAuthStore((state) => state.accessToken);

// ✅ 사용 가능
const { accessToken } = getAuthState();
```

---

### 웹 vs React Native 차이점

| 항목 | 웹 | React Native |
| --- | --- | --- |
| 쿠키 저장 | 브라우저 자동 | @react-native-cookies/cookies 필요 |
| 토큰 저장 | localStorage | AsyncStorage (Zustand persist) |
| CORS | 브라우저 제한 | 제한 없음 |
