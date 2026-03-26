---
title: "React Native UI 핵심 패턴 (웹 React 비교)"
date: 2026-02-16
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, ui, patterns, web-comparison]
toc: true
toc_sticky: true
---

## 개요

React 웹 경험이 있는 개발자가 React Native에서 UI를 구현할 때 알아야 할 핵심 차이점을 정리합니다.

주간 캘린더 UI 구현 과정에서 사용한 실제 코드 예시 포함.

---

## 1. TouchableOpacity + onPress (터치 이벤트)

### 웹 React

```javascript
<button onClick={() => handleClick()} style={% raw %}{{ opacity: 1 }}{% endraw %}>
  클릭하기
</button>
```

### React Native

```typescript
import { TouchableOpacity } from "react-native";

<TouchableOpacity
  onPress={() => onPressToggle?.(work)}  // onClick 대신 onPress
  activeOpacity={0.7}                    // 누를 때 투명도 자동 변경
>
  <Text>터치하기</Text>
</TouchableOpacity>
```

### 핵심 차이

| 항목 | 웹 React | React Native |
| --- | --- | --- |
| 이벤트 | onClick | onPress |
| 피드백 | CSS :active 상태 | activeOpacity prop |
| 컴포넌트 | <button>, <div> | <TouchableOpacity>, <Pressable> |

---

## 2. 조건부 스타일 적용 (배열 문법)

### 웹 React

```javascript
<div className={`card ${isActive ? 'card-active' : ''}`}>
```

### React Native

```typescript
<TouchableOpacity
  style={[
    styles.dayCard,                              // 기본 스타일
    isToday && styles.dayCardToday,              // 조건 1
    hasScheduled && styles.dayCardScheduled,     // 조건 2
    hasCompleted && styles.dayCardCompleted,     // 조건 3
  ]}
>
```

> **패턴**: `style={[기본스타일, 조건 && 조건부스타일]}` - 조건이 false면 무시됨

---

## 3. Shadow와 Elevation (iOS/Android 분리)

### 웹 React

```css
.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### React Native

```typescript
const styles = StyleSheet.create({
  card: {
    // iOS 전용
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Android 전용
    elevation: 2,
  },
});
```

### 핵심 포인트

- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` 4개 속성
- **Android**: `elevation` 하나로 처리 (0~24)
- **크로스 플랫폼**: 두 속성을 모두 선언하면 각 플랫폼이 해당 속성만 인식
---

## 4. SafeAreaView (노치 대응)

### 개념

iPhone X 이상의 노치, Dynamic Island, 하단 홈 인디케이터 등으로 인해 콘텐츠가 가려지는 것을 방지합니다.

> **웹에는 없는 개념** - 웹은 뷰포트가 전체 화면이지만, 모바일은 노치 등 물리적 장애물 고려 필요

### 사용법

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

const Screen = () => (
  <SafeAreaView style={% raw %}{{ flex: 1 }}{% endraw %}>
    <Header />
    <ScrollView>
      {/* 컨텐츠 */}
    </ScrollView>
  </SafeAreaView>
);
```

> **주의**: `react-native`의 SafeAreaView가 아닌 `react-native-safe-area-context`의 것을 사용해야 Android에서도 동작

---

## 5. ScrollView (style vs contentContainerStyle)

### 웹 React

```javascript
<div style={% raw %}{{ overflow: "auto", padding: "16px 20px" }}{% endraw %}>
  {/* 컨텐츠 */}
</div>
```

### React Native

```typescript
<ScrollView
  style={styles.scrollView}                    // ScrollView 자체 크기
  contentContainerStyle={styles.scrollContent}  // 내부 컨텐츠 스타일
  showsVerticalScrollIndicator={false}
>
  {/* 컨텐츠 */}
</ScrollView>

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,          // 화면 전체 차지
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,          // 각 섹션 간격
  },
});
```

### 두 가지 스타일의 차이

| 속성 | 역할 | 주로 사용하는 스타일 |
| --- | --- | --- |
| style | ScrollView 컨테이너 자체 | flex, backgroundColor |
| contentContainerStyle | 내부 컨텐츠 영역 | padding, gap, alignItems |

### 가로 스크롤

```typescript
// 웹: overflow-x: auto
// React Native: horizontal prop
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={% raw %}{{ gap: 10 }}{% endraw %}
>
  {items.map(item => <Card key={item.id} />)}
</ScrollView>
```

---

## 6. @expo/vector-icons (아이콘)

### 웹 React

```javascript
import { AiOutlineCalendar } from "react-icons/ai";
<AiOutlineCalendar size={22} />
```

### React Native (Expo)

```typescript
import { Feather, Ionicons } from "@expo/vector-icons";

<Feather name="calendar" size={22} color={colors.textPrimary} />
<Ionicons name="notifications-outline" size={28} color="#111" />
```

### 주요 아이콘 패밀리

| 패밀리 | 스타일 | 예시 |
| --- | --- | --- |
| Feather | 깔끔한 선 아이콘 | calendar, chevron-down, edit-2 |
| Ionicons | iOS 스타일 | notifications-outline, document-text-outline |
| MaterialCommunityIcons | Material Design | 다양한 아이콘 |
| FontAwesome | 클래식 | 다양한 아이콘 |

> **설치 불필요** - Expo 프로젝트에 기본 포함

---

## 7. numberOfLines (텍스트 줄 제한)

### 웹 React

```javascript
<div style={% raw %}{{
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}}{% endraw %}>
  긴 텍스트...
</div>
```

### React Native

```typescript
<Text numberOfLines={2}>
  긴 텍스트가 2줄까지만 표시되고 나머지는 말줄임표...
</Text>
```

> **훨씬 간단** - prop 하나로 끝. 웹의 복잡한 CSS line-clamp 불필요

---

## 8. flexDirection 기본값 차이

### 핵심 차이

| 항목 | 웹 CSS | React Native |
| --- | --- | --- |
| 기본 flexDirection | row (가로) | column (세로) |
| 가로 배치 | 기본값 | flexDirection: "row" 명시 필요 |
| 세로 배치 | flex-direction: column 명시 | 기본값 |

### 실제 사용 예시

```typescript
const styles = StyleSheet.create({
  // flexDirection 생략 → column (위에서 아래로 쌓임)
  card: {
    padding: 16,
    gap: 12,
  },
  // 가로 배치가 필요하면 명시
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
```

---

## 9. Image + require() (정적 이미지)

### 웹 React

```javascript
import logo from './logo.png';
<img src={logo} alt="logo" />
<img src="https://example.com/logo.png" alt="logo" />
```

### React Native

```typescript
import { Image } from "react-native";

// 로컬 이미지: require() 사용
<Image
  source={require("../assets/images/icon.png")}
  style={% raw %}{{ width: 40, height: 40 }}{% endraw %}
  resizeMode="contain"
/>

// URL 이미지: 객체로 감싸기
<Image
  source={% raw %}{{ uri: "https://example.com/logo.png" }}{% endraw %}
  style={% raw %}{{ width: 100, height: 100 }}{% endraw %}
/>
```

### resizeMode 옵션

| 값 | 설명 |
| --- | --- |
| cover | 비율 유지, 전체 채움 (일부 잘림 가능) |
| contain | 비율 유지, 전체 보임 (빈 공간 가능) |
| stretch | 비율 무시, 전체 채움 |
| center | 중앙 정렬, 크기 조정 없음 |

> **주의**: 로컬 이미지는 `require()`, URL 이미지는 `{ uri: "..." }` 형태

---

## 빠른 참조 테이블

| 항목 | 웹 React | React Native |
| --- | --- | --- |
| 클릭/터치 | onClick | onPress |
| 터치 피드백 | CSS :active | activeOpacity |
| 가로 스크롤 | overflow-x: auto | ScrollView horizontal |
| 세로 스크롤 | overflow-y: auto | ScrollView |
| 그림자 | box-shadow | shadowColor  • elevation |
| 텍스트 제한 | line-clamp | numberOfLines |
| flex 기본방향 | row (가로) | column (세로) |
| 이미지 | <img src> | <Image source> |
| 아이콘 | react-icons | @expo/vector-icons |
| 노치 대응 | 해당 없음 | SafeAreaView |
