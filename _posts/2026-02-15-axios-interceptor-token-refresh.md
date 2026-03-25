---
title: "Axios 인터셉터 + 토큰 자동 갱신"
date: 2026-02-15
categories: [Frontend]
tags: [react-native, axios, jwt, authentication]
toc: true
toc_sticky: true
---

Axios 인터셉터를 사용하여 모든 API 요청에 토큰을 자동 첨부하고, 401 에러 시 토큰을 자동 갱신하는 방법을 정리합니다.

## 인터셉터란?

요청/응답을 가로채서 공통 로직을 적용할 수 있는 기능입니다.

```
[요청] → [Request 인터셉터] → [서버] → [Response 인터셉터] → [응답]
```

## 구현 코드

```typescript
// src/api/axios.ts
import axios from "axios";
import Constants from "expo-constants";
import { getAuthState } from "../stores/authStore";

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.backendApiUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // 쿠키 전송 허용 (refreshToken)
});

// 토큰 갱신 중복 방지
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Request 인터셉터: 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const { accessToken } = getAuthState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response 인터셉터: 401 에러 시 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/api/auth/refresh");
        const newAccessToken = response.data.data.accessToken;

        const { login, userInfo } = getAuthState();
        if (userInfo) login(newAccessToken, userInfo);

        onRefreshed(newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        getAuthState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 토큰 갱신 플로우

```
[API 요청]
    ↓
Request 인터셉터: Authorization 헤더 첨부
    ↓
[서버]
    ├─ 200 OK → 정상 응답
    └─ 401 Unauthorized
            ↓
        POST /api/auth/refresh (쿠키의 refreshToken 사용)
            ├─ 성공 → 새 accessToken 저장 → 원래 요청 재시도
            └─ 실패 → 로그아웃 → 로그인 화면으로
```

## 주요 포인트

- **withCredentials: true** — 쿠키 자동 전송에 필수
- **중복 갱신 방지** — `isRefreshing` 플래그와 `refreshSubscribers` 배열로 동시 401 처리
- **컴포넌트 외부 Store 접근** — 인터셉터는 컴포넌트가 아니므로 `getState()` 사용

## 웹 vs React Native 차이

| 항목 | 웹 | React Native |
|---|---|---|
| 쿠키 저장 | 브라우저 자동 | `@react-native-cookies/cookies` 필요 |
| 토큰 저장 | localStorage | AsyncStorage (Zustand persist) |
| CORS | 브라우저 제한 | 제한 없음 |
