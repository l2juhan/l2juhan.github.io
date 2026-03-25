---
title: "React Native UI 핵심 패턴 (웹 React 비교)"
date: 2026-02-16
categories: [Frontend]
tags: [react-native, ui, styling, web-comparison]
toc: true
toc_sticky: true
---
{% raw %}

React 웹 경험이 있는 개발자가 React Native에서 UI를 구현할 때 알아야 할 핵심 차이점을 정리합니다.

## 1. TouchableOpacity + onPress

```typescript
// 웹: <button onClick={handleClick}>
// RN:
<TouchableOpacity onPress={() => onPressToggle?.(work)} activeOpacity={0.7}>
  <Text>터치하기</Text>
</TouchableOpacity>
```

| 항목 | 웹 React | React Native |
|---|---|---|
| 이벤트 | `onClick` | `onPress` |
| 피드백 | CSS `:active` | `activeOpacity` prop |
| 컴포넌트 | `<button>`, `<div>` | `<TouchableOpacity>`, `<Pressable>` |

## 2. 조건부 스타일 — 배열 문법

```typescript
// 웹: className={`card ${isActive ? 'active' : ''}`}
// RN:
<View style={[
  styles.dayCard,
  isToday && styles.dayCardToday,
  hasScheduled && styles.dayCardScheduled,
]}>
```

> 조건이 `false`이면 해당 스타일이 무시됩니다.

## 3. Shadow와 Elevation

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

두 속성을 모두 선언하면 각 플랫폼이 해당 속성만 인식합니다.

## 4. SafeAreaView — 노치 대응

웹에는 없는 개념입니다. iPhone X 이상의 노치, Dynamic Island 등으로 콘텐츠가 가려지는 것을 방지합니다.

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

const Screen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <Header />
    <ScrollView>{/* 컨텐츠 */}</ScrollView>
  </SafeAreaView>
);
```

> `react-native`가 아닌 `react-native-safe-area-context`의 것을 사용해야 Android에서도 동작합니다.

## 5. ScrollView — style vs contentContainerStyle

```typescript
<ScrollView
  style={styles.scrollView}                    // ScrollView 자체 크기
  contentContainerStyle={styles.scrollContent}  // 내부 컨텐츠 스타일
  showsVerticalScrollIndicator={false}
>
```

| 속성 | 역할 | 주로 사용하는 스타일 |
|---|---|---|
| `style` | ScrollView 컨테이너 자체 | `flex`, `backgroundColor` |
| `contentContainerStyle` | 내부 컨텐츠 영역 | `padding`, `gap`, `alignItems` |

## 6. flexDirection 기본값 차이

| 항목 | 웹 CSS | React Native |
|---|---|---|
| 기본 flexDirection | `row` (가로) | `column` (세로) |
| 가로 배치 | 기본값 | `flexDirection: "row"` 명시 필요 |

## 7. numberOfLines — 텍스트 줄 제한

```typescript
// 웹: display: -webkit-box; -webkit-line-clamp: 2; ...
// RN: prop 하나로 끝
<Text numberOfLines={2}>긴 텍스트가 2줄까지만 표시...</Text>
```

## 8. Image + require()

```typescript
// 로컬 이미지
<Image source={require("../assets/images/icon.png")} style={{ width: 40, height: 40 }} />

// URL 이미지
<Image source={{ uri: "https://example.com/logo.png" }} style={{ width: 100, height: 100 }} />
```

## 빠른 참조 테이블

| 항목 | 웹 React | React Native |
|---|---|---|
| 클릭/터치 | `onClick` | `onPress` |
| 가로 스크롤 | `overflow-x: auto` | `ScrollView horizontal` |
| 그림자 | `box-shadow` | `shadowColor` + `elevation` |
| 텍스트 제한 | `line-clamp` | `numberOfLines` |
| flex 기본방향 | row (가로) | column (세로) |
| 이미지 | `<img src>` | `<Image source>` |
| 아이콘 | `react-icons` | `@expo/vector-icons` |
| 노치 대응 | 해당 없음 | `SafeAreaView` |

{% endraw %}
