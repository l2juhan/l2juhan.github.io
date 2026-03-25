---
title: "Zustand + AsyncStorage Persist — React Native 상태 관리"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, zustand, state-management, asyncstorage]
toc: true
toc_sticky: true
---

Zustand는 React/React Native에서 사용하는 경량 상태관리 라이브러리입니다. Redux보다 보일러플레이트가 적고, Context API보다 성능이 좋습니다. persist 미들웨어를 사용하면 상태를 AsyncStorage에 자동으로 저장/복원할 수 있습니다.

## 설치

```bash
npm install zustand
npm install @react-native-async-storage/async-storage
```

## 기본 사용법

### 스토어 생성

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
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### 컴포넌트에서 사용

```typescript
import { useCounterStore } from "../stores/counterStore";

const CounterComponent = () => {
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

## AsyncStorage Persist — 앱 종료 후에도 상태 유지

웹에서는 `localStorage`를 사용하지만, React Native에서는 `AsyncStorage`를 사용합니다.

```typescript
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
      login: (token) => set({ accessToken: token, isLoggedIn: true }),
      logout: () => set({ accessToken: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## persist 옵션

| 옵션 | 설명 |
|---|---|
| `name` | AsyncStorage에 저장될 키 이름 |
| `storage` | 저장소 (AsyncStorage, localStorage 등) |
| `partialize` | 저장할 상태만 선택 (일부 제외 가능) |
| `onRehydrateStorage` | 복원 완료 시 호출되는 콜백 |

### partialize — 특정 상태만 저장

`isHydrated` 같은 런타임 전용 상태는 저장하지 않으려면 `partialize`를 사용합니다.

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: "auth-storage",
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      accessToken: state.accessToken,
      userInfo: state.userInfo,
      isLoggedIn: state.isLoggedIn,
      // isHydrated는 제외
    }),
  }
)
```

## Hydration — 복원 처리

앱 시작 시 AsyncStorage에서 데이터를 복원하는 과정을 **Hydration**이라고 합니다.

```typescript
const isHydrated = useAuthStore((state) => state.isHydrated);

useEffect(() => {
  if (!isHydrated) return; // 아직 복원 중
  // hydration 완료 후 로직 실행
}, [isHydrated]);
```

## 컴포넌트 외부에서 상태 접근

Axios 인터셉터 등 컴포넌트 외부에서 상태에 접근해야 할 때 `getState()`를 사용합니다.

```typescript
// src/stores/authStore.ts
export const getAuthState = () => useAuthStore.getState();

// src/api/axios.ts
import { getAuthState } from "../stores/authStore";

api.interceptors.request.use((config) => {
  const { accessToken } = getAuthState(); // 동기 접근!
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

## 셀렉터 최적화

```typescript
// ❌ 안티패턴: 전체 스토어 구독 → 어떤 값 변경이든 리렌더링
const { count, increment } = useCounterStore();

// ✅ 권장: 개별 셀렉터 → 해당 값 변경 시에만 리렌더링
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
```

## 웹(localStorage) vs React Native(AsyncStorage)

| 항목 | 웹 | React Native |
|---|---|---|
| 저장소 | localStorage | AsyncStorage |
| 동기/비동기 | 동기 | 비동기 |
| 설정 | 기본 제공 | createJSONStorage 필요 |
