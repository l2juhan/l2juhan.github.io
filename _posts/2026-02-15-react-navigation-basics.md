---
title: "React Navigation 기초 (@react-navigation)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, react-navigation, routing]
toc: true
toc_sticky: true
---

### 개요

React Navigation은 React Native에서 화면 이동을 처리하는 표준 라이브러리입니다. 웹의 React Router와 비슷한 역할을 합니다.

---

### 설치

```bash
# 코어 패키지
npm install @react-navigation/native

# Stack Navigator
npm install @react-navigation/native-stack

# Expo 필수 의존성
npx expo install react-native-screens react-native-safe-area-context
```

---

### 기본 설정

#### 1. NavigationContainer 감싸기

앱의 최상위에서 `NavigationContainer`로 감싸야 합니다.

```typescript
// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

#### 2. Stack Navigator 생성

```typescript
// src/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import DetailScreen from "../screens/DetailScreen";

// 1. 타입 정의 (TypeScript)
export type RootStackParamList = {
  Home: undefined;                    // 파라미터 없음
  Detail: { itemId: number };         // 파라미터 있음
  Profile: { userId: string } | undefined;  // 파라미터 선택적
};

// 2. Navigator 생성
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"  // 초기 화면
      screenOptions={% raw %}{{
        headerShown: false,    // 기본 헤더 숨기기
      }}{% endraw %}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
```

---

### 네비게이션 메서드

#### 1. navigate() - 화면 이동

```typescript
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const goToDetail = () => {
    // 파라미터 없이 이동
    navigation.navigate("Profile");
    
    // 파라미터와 함께 이동
    navigation.navigate("Detail", { itemId: 123 });
  };

  return (
    <Button title="상세 보기" onPress={goToDetail} />
  );
};
```

#### 2. goBack() - 뒤로가기

```typescript
const DetailScreen = () => {
  const navigation = useNavigation();

  return (
    <Button title="뒤로" onPress={() => navigation.goBack()} />
  );
};
```

#### 3. CommonActions.reset() - 스택 초기화

뒤로가기를 방지하고 싶을 때 사용합니다. (로그인 후, 회원가입 완료 후 등)

```typescript
import { CommonActions } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    // 스택을 완전히 초기화하고 Home으로 이동
    // 뒤로가기 불가능
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <Button title="로그인" onPress={handleLoginSuccess} />
  );
};
```

---

### navigate() vs reset() 비교

| 메서드 | 동작 | 뒤로가기 | 사용 예시 |
| --- | --- | --- | --- |
| navigate() | 스택에 화면 추가 | 가능 | 일반적인 화면 이동 |
| reset() | 스택 완전 초기화 | 불가능 | 로그인/회원가입 완료 후 |

---

### 파라미터 받기

#### useRoute 사용

```typescript
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";

type DetailRouteProp = RouteProp<RootStackParamList, "Detail">;

const DetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { itemId } = route.params;

  return (
    <Text>아이템 ID: {itemId}</Text>
  );
};
```

---

### 조건부 초기 화면 결정

로그인 상태에 따라 다른 화면을 보여주는 패턴입니다.

```typescript
// src/navigation/RootNavigator.tsx
import { useAuthStore } from "../stores/authStore";

const RootNavigator = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userType = useAuthStore((state) => state.userInfo?.userType);

  // 초기 화면 결정
  const getInitialRoute = () => {
    if (!isLoggedIn) {
      return "Welcome";  // 로그인 필요
    }
    if (userType === "WORKER") {
      return "WorkerHome";
    }
    return "EmployerHome";
  };

  return (
    <Stack.Navigator initialRouteName={getInitialRoute()}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="WorkerHome" component={WorkerHomeScreen} />
      <Stack.Screen name="EmployerHome" component={EmployerHomeScreen} />
    </Stack.Navigator>
  );
};
```

---

### 중첩 Navigator (Nested Navigation)

회원가입처럼 여러 단계로 나뉘어진 플로우를 별도 Navigator로 분리할 수 있습니다.

```typescript
// src/navigation/SignUpNavigator.tsx
export type SignUpStackParamList = {
  Step1UserType: undefined;
  Step2Profile: undefined;
  Step3BasicInfo: undefined;
  Step4Alarm: undefined;
  Step5Complete: undefined;
};

const Stack = createNativeStackNavigator<SignUpStackParamList>();

const SignUpNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Step1UserType"
      screenOptions={% raw %}{{ headerShown: false }}{% endraw %}
    >
      <Stack.Screen name="Step1UserType" component={Step1Screen} />
      <Stack.Screen name="Step2Profile" component={Step2Screen} />
      <Stack.Screen name="Step3BasicInfo" component={Step3Screen} />
      <Stack.Screen name="Step4Alarm" component={Step4Screen} />
      <Stack.Screen name="Step5Complete" component={Step5Screen} />
    </Stack.Navigator>
  );
};
```

```typescript
// RootNavigator에서 SignUpNavigator 사용
<Stack.Screen name="SignUp" component={SignUpNavigator} />
```

---

### TypeScript 타입 정리

| 타입 | 설명 | 사용처 |
| --- | --- | --- |
| ParamList | 화면별 파라미터 정의 | Navigator 생성 시 |
| NativeStackNavigationProp | navigation 객체 타입 | useNavigation 훅 |
| RouteProp | route 객체 타입 | useRoute 훅 |

```typescript
// 타입 정의 예시
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

// ParamList 정의
export type RootStackParamList = {
  Home: undefined;
  Detail: { itemId: number };
};

// Navigation 타입 (특정 화면에서 사용)
type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// Route 타입 (파라미터 받는 화면에서 사용)
type DetailRouteProp = RouteProp<RootStackParamList, "Detail">;
```

---

### React Router (웹) vs React Navigation (모바일) 비교

| 항목 | React Router (웹) | React Navigation (RN) |
| --- | --- | --- |
| 라우팅 | URL 기반 | 스택 기반 |
| 이동 | <Link>, navigate() | navigation.navigate() |
| 뒤로가기 | 브라우저 뒤로가기 | navigation.goBack() |
| 파라미터 | URL params, state | route.params |
| 스택 초기화 | replace() | CommonActions.reset() |
