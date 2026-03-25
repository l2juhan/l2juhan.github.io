---
title: "VirtualizedList 중첩 경고 및 해결 패턴"
date: 2026-02-18
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, flatlist, scrollview, performance]
toc: true
toc_sticky: true
---

React Native에서 가장 자주 마주치는 경고인 "VirtualizedLists should never be nested inside plain ScrollViews"의 원인과 해결법을 정리합니다.

## 왜 발생하는가?

`FlatList`는 내부적으로 `VirtualizedList`를 사용하여 화면에 보이는 항목만 렌더링하는 **가상화** 기법으로 성능을 최적화합니다.

`ScrollView` 안에 `FlatList`를 넣으면 ScrollView가 전체 높이를 계산하기 위해 모든 아이템을 한꺼번에 렌더링하여 가상화가 무력화됩니다.

```typescript
// ❌ 경고 발생
<ScrollView>
  <Text>헤더</Text>
  <FlatList data={items} renderItem={...} />
  <Text>푸터</Text>
</ScrollView>
```

## 해결 패턴

### 패턴 1: ScrollView → View 변경

컨텐츠가 화면을 넘지 않을 때 가장 간단한 해결법입니다.

```typescript
// Before
<ScrollView>{children}</ScrollView>

// After
<View>{children}</View>
```

### 패턴 2: ListHeaderComponent / ListFooterComponent 활용

```typescript
// ❌
<ScrollView>
  <Header />
  <FlatList data={items} />
  <Footer />
</ScrollView>

// ✅
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
<ScrollView>
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</ScrollView>
```

## 판단 기준

| 상황 | 해결 방법 |
|---|---|
| 컨텐츠가 화면을 넘지 않음 | ScrollView → View 변경 |
| 리스트 위/아래에 고정 UI 필요 | ListHeaderComponent / ListFooterComponent |
| 아이템 수가 적음 (20개 미만) | FlatList → map()으로 교체 |
| 복잡한 중첩 레이아웃 | SectionList 사용 검토 |

> **핵심**: FlatList/SectionList는 ScrollView 안에 넣지 않는다.
