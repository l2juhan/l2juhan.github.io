---
title: "PagerView — 스와이프 페이지 컨테이너"
date: 2026-02-14
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, pager-view, swipe, ui]
toc: true
toc_sticky: true
---

## 개요

`react-native-pager-view` 라이브러리에서 제공하는 **스와이프 가능한 페이지 컨테이너**입니다.

---

## 1. PagerView란?

**한 번에 하나의 페이지만 보여주고, 좌우 스와이프로 페이지 전환**하는 컴포넌트입니다.

```javascript
┌─────────────────────────────────────────┐
│                                         │
│  ← 스와이프 →                              │
│                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Page 0  │ →  │ Page 1  │ →  │ Page 2  │   │
│  │         │ ←  │         │ ←  │         │   │
│  └─────────┘    └─────────┘    └─────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. 설치

```bash
npx expo install react-native-pager-view
```

---

## 3. 기본 사용법

```typescript
import PagerView from "react-native-pager-view";

<PagerView style={% raw %}{{ flex: 1 }}{% endraw %} initialPage={0}>
    <View key="0">
        <Text>첫 번째 페이지</Text>
    </View>
    <View key="1">
        <Text>두 번째 페이지</Text>
    </View>
    <View key="2">
        <Text>세 번째 페이지</Text>
    </View>
</PagerView>
```

---

## 4. 주요 Props

| Props | 타입 | 설명 |
| --- | --- | --- |
| initialPage | number | 시작 페이지 인덱스 |
| onPageSelected | function | 페이지 전환 완료 시 호출 |
| onPageScroll | function | 스크롤 중 호출 |
| scrollEnabled | boolean | 스와이프 가능 여부 |
| orientation | string | 스와이프 방향 (horizontal/vertical) |

---

## 5. 페이지 전환 감지 (onPageSelected)

### onPageSelected란?

`onPageSelected`는 PagerView에 **내장된 props**입니다. 페이지 전환이 완료되면 자동으로 호출됩니다.

```typescript
<PagerView
    onPageSelected={handlePageSelected}  // 페이지 전환 시 호출
>
```

### 콜백 함수 정의

```typescript
const handlePageSelected = (e: any) => {
    const pageIndex = e.nativeEvent.position;  // 0, 1, 2...
    setCurrentPage(pageIndex);
};
```

| 속성 | 설명 |
| --- | --- |
| e.nativeEvent.position | 현재 페이지 인덱스 (0부터 시작) |

---

## 6. 내장 기능 + 콜백 패턴

### 역할 분담

| 구분 | 담당 | 역할 |
| --- | --- | --- |
| onPageSelected | PagerView (내장) | 언제 호출할지 결정 |
| handlePageSelected | 우리가 작성 | 무엇을 할지 정의 |

### 동작 흐름

```javascript
PagerView 내부:
  "페이지 전환됐다!"
       ↓
  onPageSelected에 등록된 함수 호출
       ↓
  handlePageSelected(e) 실행
       ↓
  setCurrentPage(e.nativeEvent.position)
```

### 비유

> **PagerView**: "페이지 바뀌면 너한테 알려줄게" (이벤트 감지)

> 

> **handlePageSelected**: "알려주면 나는 인디케이터 업데이트할게" (동작 정의)

이런 패턴을 **이벤트 기반 콜백 패턴**이라고 합니다. React에서 `onClick`, `onChange` 등도 같은 방식입니다.

---

## 7. 실제 사용 예시 (온보딩)

```typescript
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";

const OnboardingStack = () => {
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageSelected = (e: any) => {
        setCurrentPage(e.nativeEvent.position);
    };

    return (
        <View style={styles.container}>
            <PagerView
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={handlePageSelected}
            >
                <View key="0">
                    <Text>임금송금 소개</Text>
                </View>
                <View key="1">
                    <Text>공지게시판 소개</Text>
                </View>
                <View key="2">
                    <Text>일정조정 소개</Text>
                </View>
            </PagerView>
            
            {/* 인디케이터 */}
            <View style={styles.indicatorContainer}>
                {[0, 1, 2].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentPage === index && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};
```

---

## 8. ScrollView와 차이점

| 항목 | PagerView | ScrollView (horizontal) |
| --- | --- | --- |
| 페이지 단위 | 한 페이지씩 스냅 | 자유 스크롤 |
| 성능 | 최적화됨 | 많은 페이지 시 느림 |
| 네이티브 | 네이티브 구현 | JS 기반 |
| 용도 | 온보딩, 갤러리 | 긴 콘텐츠 스크롤 |

---

## 9. 일반적인 사용 사례

| 사용 사례 | 설명 |
| --- | --- |
| 온보딩 화면 | 앱 소개 슬라이드 |
| 이미지 갤러리 | 사진 스와이프 |
| 탭 콘텐츠 | 스와이프 가능한 탭 뷰 |
| 튜토리얼 | 단계별 가이드 |

---

## 핵심 포인트

- `PagerView`는 **좌우 스와이프로 페이지를 넘기는 컨테이너**
- `onPageSelected`는 PagerView의 **내장 props** (페이지 전환 감지)
- 콜백 함수를 전달해서 "언제 호출할지"는 PagerView가, "무엇을 할지"는 우리가 결정
- 이 패턴은 `onClick`, `onChange`와 같은 **이벤트 기반 콜백 패턴**
