---
title: "휠 픽커를 스와이프하면 부모(바텀시트/페이지)가 같이 움직임"
date: 2026-05-19
categories: [TroubleShooting]
subcategory: ReactNative
tags: [react-native, gesture-handler, bottom-sheet, troubleshooting]
toc: true
toc_sticky: true
---

> When2Go · issue #34 (TimeWheelPicker 실제 휠 스와이프 제스처) 실기기 검증 중 발견
> 대상 파일 `src/components/setup/TimeWheelPicker.tsx`

---

## 1. 증상

도착 시간 휠을 손가락으로 위·아래로 굴리면, 휠만 스크롤되는 게 아니라 휠을 감싼 부모까지 같이 끌려 움직였다. 두 화면에서 다른 모양으로 나타났다.

<figure class="post-video">
  <video src="/assets/images/posts/react-native-wheel-gesture-conflict/wheel-before.mp4"
         autoplay loop muted playsinline preload="metadata" width="360"></video>
  <figcaption>문제 화면 — 휠을 스와이프하면 바텀시트가 같이 끌려 움직인다.</figcaption>
</figure>

| 화면 | 부모 | 증상 |
|---|---|---|
| 반복예약 수정/생성 (`RepeatEditModal`) | `@gorhom/bottom-sheet` 바텀시트 | 휠을 위로 쓸면 바텀시트 전체가 위로 끌려 올라가고, 아래로 쓸면 시트가 내려가 닫히려 함 |
| 경로설정 (`app/setup.tsx`) | RN `ScrollView` 페이지 | 휠을 굴리면 페이지 전체가 같이 스크롤 |

시뮬레이터에서는 잘 안 잡히고 실기기에서만 또렷하게 재현됐다. 시뮬레이터 마우스 드래그는 한 지점에서 시작하는 깔끔한 제스처라 충돌이 약하게 보이지만, 실제 손가락은 미세하게 흔들려 제스처 중재기가 부모를 더 자주 선택한다.

---

## 2. 재현 시나리오

1. 반복예약 모달을 연다 → "도착 시간" 펼침 → 휠 노출.
2. 시(hour) 휠을 손가락으로 30~50px 위로 천천히 드래그.
3. 휠 값도 바뀌지만 바텀시트 자체가 같이 따라 올라옴 → 손을 떼면 시트 위치가 어긋나거나 닫힘 애니메이션이 끼어듦.
4. 경로설정 화면에서도 동일하게 시도 → 휠 대신/동시에 페이지가 스크롤.

---

## 3. 근본 원인 — "세로 스크롤 안의 세로 스크롤" 제스처 중재

휠은 내부적으로 세로 `ScrollView`다. 그런데 그 휠이 놓인 부모도 전부 세로로 스크롤/팬하는 컨테이너다.

```
[바텀시트 content pan]  ─┐
[BottomSheetScrollView] ─┼─ 전부 "세로" 제스처
[페이지 ScrollView]     ─┘
        └── [휠 ScrollView]   ← 같은 "세로" 제스처
```

`react-native-gesture-handler`의 기본 중재 규칙에서, 같은 축(세로)의 중첩 스크롤은 안쪽이 바깥쪽에게 제스처를 양보하는 쪽으로 동작하기 쉽다. 특히 gorhom 바텀시트는 "시트 안의 스크롤이 끝에 닿으면 시트 자체를 드래그"하는 동작을 위해 자식 스크롤과 제스처를 적극적으로 주고받는다. 그 결과:

- 휠을 드래그하면 제스처가 휠이 아니라 조상(시트 pan / 페이지 ScrollView)으로 넘어가
- 부모가 같이 움직인다.

즉 버그의 본질은 휠 코드 자체가 아니라 휠과 부모가 제스처를 누가 가질지 다투는 중재(arbitration) 문제다.

핵심: `TimeWheelPicker`는 반복예약·경로설정 두 화면이 공유하는 컴포넌트다. → 휠 한 곳만 고치면 두 화면이 동시에 해결된다.

---

## 4. 해결 — `NativeViewGestureHandler` + `disallowInterruption`로 휠이 터치를 독점

휠의 내부 `ScrollView`를 `NativeViewGestureHandler`로 감싸고 `disallowInterruption`을 켠다. 의미는 "이 스크롤이 제스처를 잡으면, 조상이 중간에 가로채지(interrupt) 못한다" — 휠이 터치를 끝까지 독점한다.

이건 gorhom 공식 트러블슈팅이 picker/wheel 류 충돌에 권장하는 바로 그 방식이다.

### 의존성 X / 재빌드 X

`NativeViewGestureHandler`는 이미 설치돼 네이티브 링크된 `react-native-gesture-handler`의 또 다른 export일 뿐이다. 새 패키지·네이티브 모듈이 없으므로 앱 재빌드 불필요, Metro 리로드만으로 적용된다. 전제 조건(`GestureHandlerRootView` + `BottomSheetModalProvider`)은 `app/_layout.tsx`에 이미 갖춰져 있었다.

### Before & After (`src/components/setup/TimeWheelPicker.tsx`)

Before — 휠 ScrollView가 그대로 노출돼 조상에게 제스처를 양보:

<details class="code-toggle" markdown="1">
<summary>Before 코드 보기</summary>

{% raw %}
```tsx
return (
  <View className="flex-1" style={{ height: WHEEL_HEIGHT }}>
    <AnimatedScrollView
      ref={scrollRef}
      {...commonScrollProps}
      contentContainerStyle={{ paddingVertical: SPACER_HEIGHT }}
    >
      {options.map((value, index) => (
        <WheelItem /* ... */ />
      ))}
    </AnimatedScrollView>
  </View>
);
```
{% endraw %}

</details>

After — `NativeViewGestureHandler disallowInterruption`로 래핑:

<details class="code-toggle" markdown="1">
<summary>After 코드 보기</summary>

{% raw %}
```tsx
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

// ...

return (
  <View className="flex-1" style={{ height: WHEEL_HEIGHT }}>
    <NativeViewGestureHandler disallowInterruption>
      <AnimatedScrollView
        ref={scrollRef}
        {...commonScrollProps}
        contentContainerStyle={{ paddingVertical: SPACER_HEIGHT }}
      >
        {options.map((value, index) => (
          <WheelItem
            key={format(value)}
            label={format(value)}
            index={index}
            scrollY={scrollY}
            align={align}
            itemText={itemText}
            onPress={() => {
              programmaticIndexRef.current = index;
              scrollToIndex(index, true);
              if (index !== selectedIndexRef.current) {
                void Haptics.selectionAsync();
                onSelect(options[index]);
              }
            }}
          />
        ))}
      </AnimatedScrollView>
    </NativeViewGestureHandler>
  </View>
);
```
{% endraw %}

</details>

`WheelColumn`이 `period`/`hour`/`minute` 3열에 공통으로 쓰이므로, 이 한 군데 래핑으로 3열 모두 + 두 화면 모두 해결된다. `TimeWheelPicker`의 Props 6개와 두 사용처(`ArrivalTimePicker`, `RepeatEditModal`)는 무수정.

### 보조책 (이번엔 미적용 — 참고용)

1차 처방만으로 실기기 통과했다면 여기서 끝낸다. 만약 바텀시트 쪽 잔여 흔들림이 남으면, gorhom 시트에 한해 추가로 적용할 수 있는 2차 처방:

<details class="code-toggle" markdown="1">
<summary>2차 처방 코드 보기</summary>

{% raw %}
```tsx
// src/components/common/BottomSheetModal.tsx — RNBottomSheetModal 에
<RNBottomSheetModal
  enableContentPanningGesture={false}   // 시트 본문 영역의 pan-to-close 비활성
  /* ... */
/>
```
{% endraw %}

</details>

`enableContentPanningGesture={false}`는 시트 본문을 끌어서 시트를 닫는 제스처를 끈다(핸들 바 드래그는 유지). 휠 같은 인터랙티브 요소가 본문에 있을 때 충돌을 원천 차단하지만, 본문 어디서나 끌어 닫던 UX는 사라지므로 꼭 필요할 때만 보조로 쓴다. 이번 건은 1차만으로 해결돼 적용하지 않았다.

---

## 5. 검증 결과

<figure class="post-video">
  <video src="/assets/images/posts/react-native-wheel-gesture-conflict/wheel-after.mp4"
         autoplay loop muted playsinline preload="metadata" width="360"></video>
  <figcaption>수정 후 — 휠만 스크롤되고 바텀시트는 그대로 머문다.</figcaption>
</figure>

- 실기기(iOS) 재검증: 휠을 위·아래로 스와이프해도 바텀시트가 따라 움직이지 않음. 1차 처방만으로 통과.
- 경로설정 화면: 휠 스와이프 시 페이지가 같이 스크롤되지 않음 (공유 컴포넌트라 동시 해결).
- `tsc --noEmit`, `eslint` 클린. Props·사용처 불변이라 회귀 없음.

---

## 6. 일반화 — 같은 부류 버그를 만나면

> 증상 패턴: "스크롤되는/팬되는 부모 안에 들어간 인터랙티브 자식(휠·캐러셀·슬라이더·지도·드로어)을 조작하면 부모가 같이 움직인다."

체크 순서:

1. 자식과 부모의 제스처 축이 같은가? (둘 다 세로, 둘 다 가로) — 같으면 중재 충돌 1순위 의심.
2. 자식 스크롤/제스처를 `NativeViewGestureHandler disallowInterruption`로 감싼다. RNGH 기반 충돌의 가장 가벼운 1차 처방. (의존성·재빌드 0이면 우선 시도)
3. gorhom 바텀시트 특정 충돌이면 → `enableContentPanningGesture={false}` 또는 `BottomSheetScrollView`/`BottomSheetView` 올바른 컴포넌트 사용 점검.
4. 여전하면 → 명시적 제스처 관계(`simultaneousHandlers` / `waitFor`)로 누가 우선인지 선언.
5. 공유 컴포넌트라면 그 컴포넌트 안에서 고친다. 사용처마다 우회 코드를 흩뿌리지 말 것 — 한 곳 수정으로 전 사용처가 해결되고 회귀 위험이 최소화된다.
6. 시뮬레이터에서 안 잡혀도 실기기에서 재현될 수 있다. 제스처 중재 버그는 입력 노이즈(손가락 미세 흔들림)에 민감하므로 실기기 검증을 신뢰한다.

### 참고

- gorhom/bottom-sheet — Troubleshooting & Props (`enableContentPanningGesture`)
- react-native-gesture-handler — `NativeViewGestureHandler`, 중첩 스크롤/제스처 중재(`disallowInterruption`, `simultaneousHandlers`, `waitFor`)
