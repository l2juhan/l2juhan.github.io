---
title: "월간캘린더 컴포넌트 구조 (MonthlyCalendar)"
date: 2026-02-22
categories: [Frontend]
tags: [react-native, calendar, component-architecture, paycheck]
toc: true
toc_sticky: true
---

PayCheck-mobile 근로자 월간캘린더 화면의 전체 컴포넌트 구조와 데이터 흐름을 정리합니다.

## 파일 구조

| 파일 | 역할 |
|---|---|
| `WorkerMonthlyCalendarScreen.tsx` | 월간캘린더 전체 화면 (Screen) |
| `MonthlyCalendar.tsx` | 캘린더 그리드 UI (공통 컴포넌트) |
| `MonthlyCalendarNav.tsx` | 월 네비게이션 헤더 |
| `MonthlySalarySummary.tsx` | 월간 급여 요약 |
| `SelectedDateWorkList.tsx` | 선택 날짜 근무 리스트 |
| `WorkplaceSalarySummary.tsx` | 근무지별 급여 요약 |
| `usePayments.ts` | 월별 급여 정보 조회 훅 |

## 데이터 흐름

```
WorkerMonthlyCalendarScreen
  → useWorkRecords(startDate, endDate) → works[]
    → (1) workDots 생성 → MonthlyCalendar
    → (2) 선택된 날짜 필터링 → SelectedDateWorkList
    → (3) 월간 총 시간/급여 계산 → MonthlySalarySummary
  → usePayments(year, month) → WorkplaceSalarySummary
```

## 캘린더 셀 스타일링

- 오늘: 파란 원형 배경 (`#0158CC`)
- 선택된 날짜: 하늘색 배경 (`#E8F1FC`)
- 토요일: 파란색 텍스트 / 일요일: 빨간색 텍스트
- 근무 점: 최대 3개, 파랑(일반) / 빨강(정정요청)

## workDots 생성 로직

works 배열을 순회하면서 각 `workDate`를 키로 사용하여 `count`(근무 개수)와 `hasCorrectionRequest`(정정요청 여부)를 생성합니다.

## 월간 요약 계산

```typescript
const totalMinutes = works.reduce((sum, w) => sum + w.totalWorkMinutes, 0);
const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
const estimatedPay = works.reduce((sum, w) => sum + (w.totalSalary ?? 0), 0);
```
