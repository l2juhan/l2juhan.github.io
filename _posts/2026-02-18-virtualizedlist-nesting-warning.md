---
title: "VirtualizedList 중첩 경고 및 해결 패턴"
date: 2026-02-18
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, virtualizedlist, flatlist, performance]
toc: true
toc_sticky: true
---

## 개요

React Native에서 가장 자주 마주치는 경고 중 하나인 **"VirtualizedLists should never be nested inside plain ScrollViews"** 경고의 원인과 해결법을 정리합니다.

---

## 1. 왜 발생하는가?

### 경고 메시지

```javascript
VirtualizedLists should never be nested inside plain ScrollViews
with the same orientation because it can break windowing and
other functionality - use another VirtualizedList-backed
container instead.
```

### 원인

`FlatList`(또는 `SectionList`)는 내부적으로 `VirtualizedList`를 사용합니다. 화면에 보이는 항목만 렌더링하는 **가상화(windowing)** 기법으로 성능을 최적화합니다.

그런데 `ScrollView` 안에 `FlatList`를 넣으면:

1. `ScrollView`가 자식의 전체 높이를 계산하기 위해 **모든 아이템을 한꺼번에 렌더링**
1. `FlatList`의 가상화 기능이 **무력화**됨
1. 아이템이 많으면 **메모리 폭발 + 성능 저하**
```typescript
// ❌ 이렇게 하면 경고 발생
<ScrollView>
  <Text>헤더</Text>
  <FlatList data={items} renderItem={...} />  {/* FlatList 가상화 무력화 */}
  <Text>푸터</Text>
</ScrollView>
```

---

## 2. 실제 발생 사례 (BottomSheetModal + WheelPicker)

### 문제 상황

```typescript
// ❌ Modal 안에서 ScrollView로 폼을 감쌌는데,
// WheelPicker 내부에 Animated.FlatList가 있어서 경고 발생
<BottomSheetModal>
  <ScrollView>                    {/* ScrollView */}
    <FormField />
    <WheelPicker items={...} />   {/* 내부에 Animated.FlatList 사용 */}
  </ScrollView>
</BottomSheetModal>
```

### 해결

```typescript
// ✅ ScrollView → View로 변경
<BottomSheetModal>
  <View>                          {/* View는 스크롤 안 함 → 충돌 없음 */}
    <FormField />
    <WheelPicker items={...} />
  </View>
</BottomSheetModal>
```

> 모달 내부 컨텐츠가 화면을 넘지 않는다면 `ScrollView` 대신 `View`로 충분

---

## 3. 해결 패턴 모음

### 패턴 1: ScrollView → View 변경 (가장 간단)

컨텐츠가 화면을 넘지 않을 때 사용.

```typescript
// Before
<ScrollView>{children}</ScrollView>

// After
<View>{children}</View>
```

### 패턴 2: FlatList의 ListHeaderComponent / ListFooterComponent 활용

헤더/푸터가 필요한 리스트에서 사용.

```typescript
// ❌ ScrollView 안에 FlatList
<ScrollView>
  <Header />
  <FlatList data={items} />
  <Footer />
</ScrollView>

// ✅ FlatList에 헤더/푸터를 포함
<FlatList
  data={items}
  renderItem={...}
  ListHeaderComponent={<Header />}
  ListFooterComponent={<Footer />}
/>
```

### 패턴 3: FlatList 대신 map() 사용

아이템 수가 적어서 가상화가 불필요할 때.

```typescript
// FlatList 대신 직접 map
<ScrollView>
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</ScrollView>
```

### 패턴 4: nestedScrollEnabled (Android 한정)

정말 중첩이 필요하다면 Android에서만 동작하는 옵션.

```typescript
<FlatList nestedScrollEnabled={true} />
```

> **주의**: iOS에서는 효과 없음. 근본 해결이 아닌 임시 방편

---

## 4. 판단 기준

| 상황 | 해결 방법 |
| --- | --- |
| 컨텐츠가 화면을 넘지 않음 | ScrollView → View 변경 |
| 리스트 위/아래에 고정 UI가 필요 | ListHeaderComponent / ListFooterComponent |
| 아이템 수가 적음 (20개 미만) | FlatList → map()으로 교체 |
| 복잡한 중첩 레이아웃 | SectionList 사용 검토 |

---

## 핵심 요약

> **FlatList/SectionList는 ScrollView 안에 넣지 않는다.** 가상화가 무력화되어 성능이 나빠진다. 대신 View로 교체하거나, FlatList의 Header/Footer를 활용하거나, 아이템이 적으면 map()을 쓴다.
