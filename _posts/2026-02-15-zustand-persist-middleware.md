---
title: "Zustand + persist 미들웨어로 상태 관리"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, zustand, state-management, persist]
toc: true
toc_sticky: true
---

## 개요

Zustand의 **persist 미들웨어**를 사용하여 상태를 AsyncStorage에 **자동으로 저장/복원**하는 방법을 정리합니다.

---

## 1. persist란?

Zustand의 **미들웨어**로, 상태를 **자동으로 저장하고 복원**해주는 기능입니다.

```
┌─────────────────────────────────────────────┐
│                Zustand Store                │
│                                             │
│ 상태 변경 → persist가 자동으로 AsyncStorage에 저장 │
│                                             │
│앱 재시작 → persist가 자동으로 AsyncStorage에서 복원 │
└─────────────────────────────────────────────┘
```

---

## 2. 설치

```bash
npm install zustand
```

> Zustand에 persist 미들웨어가 내장되어 있어 별도 설치 불필요

---

## 3. 기본 사용법

### persist 없이 (수동)

```typescript
// 저장할 때마다 직접 AsyncStorage 호출
const setToken = async (token: string) => {
    set({ accessToken: token });
    await AsyncStorage.setItem("token", token);  // 수동
};

// 앱 시작 시 직접 복원
useEffect(() => {
    const loadToken = async () => {
        const token = await AsyncStorage.getItem("token");  // 수동
        if (token) setToken(token);
    };
    loadToken();
}, []);
```

### persist 사용 (자동)

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAuthStore = create(
    persist(
        (set) => ({
            accessToken: null,
            setToken: (token) => set({ accessToken: token }),
            // AsyncStorage 저장/복원은 persist가 자동 처리
        }),
        {
            name: "auth-storage",  // AsyncStorage 키
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
```

---

## 4. 실제 예시 (authStore)

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserInfo } from "../types/api.types";

interface AuthState {
    // 상태
    accessToken: string | null;
    userInfo: UserInfo | null;
    isLoggedIn: boolean;
    isHydrated: boolean;

    // 액션
    setAccessToken: (token: string) => void;
    setUserInfo: (info: UserInfo) => void;
    login: (token: string, userInfo: UserInfo) => void;
    logout: () => void;
    setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // 초기 상태
            accessToken: null,
            userInfo: null,
            isLoggedIn: false,
            isHydrated: false,

            // 액션
            setAccessToken: (token) =>
                set({ accessToken: token, isLoggedIn: true }),

            setUserInfo: (info) => set({ userInfo: info }),

            login: (token, userInfo) =>
                set({
                    accessToken: token,
                    userInfo,
                    isLoggedIn: true,
                }),

            logout: () =>
                set({
                    accessToken: null,
                    userInfo: null,
                    isLoggedIn: false,
                }),

            setHydrated: (hydrated) => set({ isHydrated: hydrated }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            // isHydrated는 persist하지 않음
            partialize: (state) => ({
                accessToken: state.accessToken,
                userInfo: state.userInfo,
                isLoggedIn: state.isLoggedIn,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);

// 스토어 외부에서 상태 접근용 (axios 인터셉터 등)
export const getAuthState = () => useAuthStore.getState();
```

---

## 5. persist 옵션

| 옵션 | 설명 |
| --- | --- |
| name | AsyncStorage에 저장될 키 이름 |
| storage | 저장소 (AsyncStorage, localStorage 등) |
| partialize | 저장할 상태만 선택 (일부 제외 가능) |
| onRehydrateStorage | 복원 완료 시 호출되는 콜백 |

---

## 6. Hydration (복원) 처리

앱 시작 시 AsyncStorage에서 데이터를 복원하는 데 시간이 걸립니다. 이를 **Hydration**이라고 합니다.

```typescript
// 컴포넌트에서 hydration 완료 대기
const isHydrated = useAuthStore((state) => state.isHydrated);

useEffect(() => {
    if (!isHydrated) {
        return;  // 아직 복원 중
    }
    // hydration 완료 후 로직 실행
}, [isHydrated]);
```

---

## 7. 컴포넌트에서 사용

```typescript
import { useAuthStore } from "../stores/authStore";

const MyComponent = () => {
    // 상태 읽기 (동기적)
    const { isLoggedIn, userInfo, accessToken } = useAuthStore();

    // 액션 호출 (자동으로 AsyncStorage에도 저장됨)
    const { login, logout } = useAuthStore();

    const handleLogin = () => {
        login("token123", { userId: 1, userName: "홍길동", userType: "WORKER" });
    };

    return (
        <View>
            {isLoggedIn ? (
                <Text>환영합니다, {userInfo?.userName}님!</Text>
            ) : (
                <Button onPress={handleLogin} title="로그인" />
            )}
        </View>
    );
};
```

---

## 8. 컴포넌트 외부에서 사용 (axios 인터셉터)

```typescript
// src/api/axios.ts
import { getAuthState } from "../stores/authStore";

// 요청 인터셉터: 토큰 자동 첨부 (동기적)
api.interceptors.request.use((config) => {
    const { accessToken } = getAuthState();  // 동기 접근!
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
```

> **핵심**: `getAuthState()`로 동기적으로 상태 접근 가능 (AsyncStorage는 비동기)

---

## 9. 기존 코드 vs Zustand + persist

| 항목 | 기존 (AsyncStorage 직접) | Zustand + persist |
| --- | --- | --- |
| 읽기 | await AsyncStorage.getItem() | useAuthStore().accessToken |
| 쓰기 | await AsyncStorage.setItem() | setAccessToken(token) |
| 동기/비동기 | 비동기 | 동기 (persist는 백그라운드) |
| 리렌더링 | 수동 처리 필요 | 자동 |
| 코드 간결성 | 길고 복잡 | 간결 |

---

## 핵심 포인트

- **persist** = Zustand 상태를 스토리지에 자동 저장/복원하는 미들웨어
- **Hydration** = 앱 시작 시 AsyncStorage에서 복원하는 과정, 완료 대기 필요
- **getAuthState()** = 컴포넌트 외부에서 동기적으로 상태 접근
- **partialize** = 저장할 상태만 선택 (isHydrated 같은 런타임 상태 제외)
