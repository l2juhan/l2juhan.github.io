---
title: "PagerView — 스와이프 페이지 컨테이너"
date: 2026-02-14
categories: [Frontend]
tags: [react-native, pager-view, swipe, ui]
toc: true
toc_sticky: true
---

`react-native-pager-view`는 좌우 스와이프로 페이지를 전환하는 네이티브 컴포넌트입니다. 온보딩, 이미지 갤러리, 탭 뷰 등에 활용됩니다.

## 설치

```bash
npx expo install react-native-pager-view
```

## 기본 사용법

```typescript
import PagerView from "react-native-pager-view";

<PagerView style={{ flex: 1 }} initialPage={0}>
    <View key="0"><Text>첫 번째 페이지</Text></View>
    <View key="1"><Text>두 번째 페이지</Text></View>
    <View key="2"><Text>세 번째 페이지</Text></View>
</PagerView>
```

## 주요 Props

| Props | 타입 | 설명 |
|---|---|---|
| `initialPage` | number | 시작 페이지 인덱스 |
| `onPageSelected` | function | 페이지 전환 완료 시 호출 |
| `onPageScroll` | function | 스크롤 중 호출 |
| `scrollEnabled` | boolean | 스와이프 가능 여부 |
| `orientation` | string | 스와이프 방향 (horizontal/vertical) |

## 페이지 전환 감지 — onPageSelected

`onPageSelected`는 PagerView의 내장 props로, 페이지 전환이 완료되면 자동으로 호출됩니다.

```typescript
const handlePageSelected = (e: any) => {
    const pageIndex = e.nativeEvent.position; // 0, 1, 2...
    setCurrentPage(pageIndex);
};
```

이것은 **이벤트 기반 콜백 패턴**으로, React의 `onClick`, `onChange`와 같은 방식입니다.

- **PagerView**: "페이지 바뀌면 알려줄게" (이벤트 감지)
- **handlePageSelected**: "알려주면 인디케이터 업데이트할게" (동작 정의)

## 실제 사용 예시 — 온보딩 화면

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
                <View key="0"><Text>임금송금 소개</Text></View>
                <View key="1"><Text>공지게시판 소개</Text></View>
                <View key="2"><Text>일정조정 소개</Text></View>
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

## ScrollView와 비교

| 항목 | PagerView | ScrollView (horizontal) |
|---|---|---|
| 페이지 단위 | 한 페이지씩 스냅 | 자유 스크롤 |
| 성능 | 최적화됨 | 많은 페이지 시 느림 |
| 네이티브 | 네이티브 구현 | JS 기반 |
| 용도 | 온보딩, 갤러리 | 긴 콘텐츠 스크롤 |
