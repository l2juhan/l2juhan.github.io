---
title: "월간캘린더 컴포넌트 구조 (MonthlyCalendar)"
date: 2026-02-22
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, calendar, custom-component, ui]
toc: true
toc_sticky: true
---

PayCheck-mobile 근로자 월간캘린더 화면의 전체 컴포넌트 구조와 데이터 흐름을 정리한 문서입니다.

### 1. 파일 구조

- `src/screens/worker/WorkerMonthlyCalendarScreen.tsx` - 월간캘린더 전체 화면 (Screen)
- `src/components/common/MonthlyCalendar.tsx` - 캘린더 그리드 UI (공통 컴포넌트)
- `src/components/common/MonthlyCalendarNav.tsx` - 월 네비게이션 헤더
- `src/components/worker/monthlyCalendar/MonthlySalarySummary.tsx` - 월간 급여 요약
- `src/components/worker/monthlyCalendar/SelectedDateWorkList.tsx` - 선택 날짜 근무 리스트
- `src/components/worker/monthlyCalendar/WorkplaceSalarySummary.tsx` - 근무지별 급여 요약
- `src/components/worker/monthlyCalendar/WorkplaceSalaryCard.tsx` - 개별 근무지 급여 카드
- `src/hooks/worker/usePayments.ts` - 월별 급여 정보 조회 훅

### 2. 화면 구성 (UI 레이아웃)

Header (마이페이지 버튼)

  → MonthlyCalendarNav (← 월 →)

  → [점선 구분선]

  → MonthlyCalendar (캘린더 그리드)

  → SelectedDateWorkList (선택 날짜 근무)

  → MonthlySalarySummary (월간 급여 요약)

  → WorkplaceSalarySummary (근무지별 급여)

### 3. 컴포넌트별 Props

**MonthlyCalendar:**

- `year: number` - 연도
- `month: number` - 월 (0-indexed)
- `selectedDate: Date | null` - 선택된 날짜
- `onDateSelect: (date: Date) => void` - 날짜 선택 콜백
- `workDots?: { [dateKey: string]: { count: number; hasCorrectionRequest: boolean } }` - 날짜별 근무 점 데이터

**MonthlyCalendarNav:**

- `currentDate: Date` - 현재 표시 중인 월
- `onPrev: () => void` - 이전 월
- `onNext: () => void` - 다음 월

**MonthlySalarySummary:**

- `monthLabel: string` - "2월"
- `totalHours: number` - 총 근무시간
- `estimatedPay: number` - 예상 근무비

**SelectedDateWorkList:**

- `works: WorkItem[]` - 선택 날짜의 근무 목록
- `onPressAdd?: () => void` - 근무 추가 버튼
- `onPressCorrectionRequest?: (work: WorkItem) => void` - 정정 요청 콜백

**WorkplaceSalarySummary:**

- `workplaces: Array<{ workplaceName, baseSalary, deduction, maxSalary, status? }>` - 근무지별 급여
- `onPressDetail?: () => void` - 상세보기 버튼

**WorkplaceSalaryCard:**

- `workplaceName: string` - 근무지명
- `baseSalary: number` - 기본급여
- `deduction: number` - 공제
- `maxSalary: number` - 최대 예상액
- `status?: string` - "송금완료" | "송금 대기중" | "송금 실패"

### 4. 데이터 흐름

**WorkerMonthlyCalendarScreen**

  → useWorkRecords(startDate, endDate) → works: WorkItem[]

    → (1) workDots 생성 (날짜별 근무 개수 + 정정요청 여부)

      → MonthlyCalendar에 전달

    → (2) 선택된 날짜의 근무만 필터링

      → SelectedDateWorkList에 전달

    → (3) 월간 총 시간/급여 계산

      → MonthlySalarySummary에 전달

  → usePayments(year, month) → workplaces: WorkplaceSalaryItem[]

    → WorkplaceSalarySummary에 전달

### 5. workDots 생성 로직

works 배열을 순회하면서:

- 각 work의 `workDate`를 키로 사용
- `count`: 해당 날짜의 근무 개수
- `hasCorrectionRequest`: work.isModified가 true인 근무가 있으면 true
- 캘린더에서 최대 3개의 점으로 표시
- 첫 번째 점이 빨강이면 정정요청 있음, 나머지는 파랑

### 6. 캘린더 셀 스타일링

- 이전달/다음달 날짜: 회색 (비활성)
- 오늘: 파란 원형 배경 (`#0158CC`)
- 선택된 날짜: 하늘색 배경 (`#E8F1FC`)
- 토요일: 파란색 텍스트
- 일요일: 빨간색 텍스트
- 근무 점: 최대 3개, 파랑(일반) / 빨강(정정요청)

### 7. 월간 요약 계산

- `totalMinutes = works.reduce((sum, w) => sum + w.totalWorkMinutes, 0)`
- `totalHours = Math.round((totalMinutes / 60) * 10) / 10`
- `estimatedPay = works.reduce((sum, w) => sum + (w.totalSalary ?? 0), 0)`

### 8. 재사용 컴포넌트/훅

- **WorkCard**: 주간캘린더와 공유하는 근무 카드 컴포넌트
- **useWorkRecords**: 주간/월간캘린더에서 공유하는 근무 기록 조회 훅
- **useCorrectionRequest**: 근무 추가/정정 모달 관리 훅
- **BottomSheetModal**: 하단 모달 공통 컴포넌트

### 9. 모달 목록

- **AddWorkRequestModal**: 근무 추가 요청
- **WorkerCorrectionRequestModal**: 근무 정정 요청
- **MyPageDrawer**: 마이페이지 드로어
- **BottomSheetModal**: 계정 이용약관
