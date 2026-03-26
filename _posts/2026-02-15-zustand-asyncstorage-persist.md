---
title: "Zustand 상태관리 + AsyncStorage Persist"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, zustand, async-storage, persist]
toc: true
toc_sticky: true
---

### 개요

Zustand는 React/React Native에서 사용하는 경량 상태관리 라이브러리입니다. Redux보다 보일러플레이트가 적고, Context API보다 성능이 좋습니다.

---

### 설치

```bash
npm install zustand
npm install @react-native-async-storage/async-storage
```

---

### 기본 사용법

#### 1. 스토어 생성

```typescript
// src/stores/counterStore.ts
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  // 상태
  count: 0,
  
  // 액션
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

#### 2. 컴포넌트에서 사용

```typescript
import { useCounterStore } from "../stores/counterStore";

const CounterComponent = () => {
  // 개별 셀렉터 사용 (권장)
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={increment} title="증가" />
    </View>
  );
};
```

---

### AsyncStorage Persist (앱 종료 후에도 상태 유지)

웹에서는 `localStorage`를 사용하지만, React Native에서는 `AsyncStorage`를 사용합니다.

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  accessToken: string | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isLoggedIn: false,
      
      login: (token) => set({ 
        accessToken: token, 
        isLoggedIn: true 
      }),
      
      logout: () => set({ 
        accessToken: null, 
        isLoggedIn: false 
      }),
    }),
    {
      name: "auth-storage",  // AsyncStorage 키 이름
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

### 컴포넌트 외부에서 상태 접근

Axios 인터셉터 등 컴포넌트 외부에서 상태에 접근해야 할 때 사용합니다.

```typescript
// src/stores/authStore.ts
export const useAuthStore = create<AuthState>()(/* ... */);

// 컴포넌트 외부용 헬퍼 함수
export const getAuthState = () => useAuthStore.getState();
```

```typescript
// src/api/axios.ts (인터셉터에서 사용)
import { getAuthState } from "../stores/authStore";

api.interceptors.request.use((config) => {
  const { accessToken } = getAuthState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

---

### 셀렉터 최적화

```typescript
// ❌ 안티패턴: 전체 스토어 구독
const { count, increment } = useCounterStore();
// → 스토어의 어떤 값이 변경되어도 리렌더링

// ✅ 권장: 개별 셀렉터
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
// → 해당 값이 변경될 때만 리렌더링
```

---

### 웹(localStorage) vs React Native(AsyncStorage) 비교

| 항목 | 웹 | React Native |
| --- | --- | --- |
| 저장소 | localStorage | AsyncStorage |
| 동기/비동기 | 동기 | 비동기 |
| 설정 | 기본 제공 | createJSONStorage 필요 |
