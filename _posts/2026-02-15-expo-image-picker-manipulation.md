---
title: "이미지 선택 + 압축 + Base64 변환 (expo-image-picker)"
date: 2026-02-15
categories: [Frontend]
subcategory: ReactNative
tags: [react-native, expo, image-picker, compression]
toc: true
toc_sticky: true
---

### 개요

사용자 갤러리에서 이미지를 선택하고, 서버 전송을 위해 리사이즈/압축/Base64 변환하는 방법입니다.

---

### 설치

```bash
npx expo install expo-image-picker expo-image-manipulator
```

> **주의**: 네이티브 모듈이므로 Development Build 재빌드 필요

---

### 전체 플로우

```javascript
갤러리 열기 → 이미지 선택 → 크롭(선택) → 리사이즈 → 압축 → Base64 인코딩 → 서버 전송
```

---

### 구현 코드

```typescript
// src/utils/image.ts
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

interface ImageResult {
  uri: string;
  base64: string;
}

/**
 * 프로필 이미지 선택 및 처리
 * 1. 갤러리에서 이미지 선택 (1:1 비율 크롭)
 * 2. 400x400으로 리사이즈
 * 3. 70% 품질로 압축
 * 4. Base64 인코딩
 */
export const pickProfileImage = async (): Promise<ImageResult | null> => {
  // 1. 갤러리 권한 요청 및 이미지 선택
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,  // 이미지만 선택
    allowsEditing: true,   // 편집(크롭) 허용
    aspect: [1, 1],        // 1:1 비율 (정사각형)
    quality: 1,            // 원본 품질로 가져오기
  });

  // 취소한 경우
  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const selectedImage = result.assets[0];

  // 2. 이미지 리사이즈 + 압축 + Base64 변환
  const manipulated = await ImageManipulator.manipulateAsync(
    selectedImage.uri,
    [{ resize: { width: 400, height: 400 } }],  // 리사이즈
    {
      compress: 0.7,                             // 70% 품질로 압축
      format: ImageManipulator.SaveFormat.JPEG,  // JPEG 포맷
      base64: true,                              // Base64 인코딩
    }
  );

  return {
    uri: manipulated.uri,      // 로컬 파일 경로 (미리보기용)
    base64: manipulated.base64 || "",  // Base64 문자열 (서버 전송용)
  };
};
```

---

### 컴포넌트에서 사용

```typescript
// Step2ProfileScreen.tsx
import { pickProfileImage } from "../../../utils/image";

const Step2ProfileScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImagePress = async () => {
    const result = await pickProfileImage();
    if (result) {
      setImageUri(result.uri);        // 미리보기용
      setImageBase64(result.base64);  // 서버 전송용
    }
  };

  return (
    <TouchableOpacity onPress={handleImagePress}>
      {imageUri ? (
        <Image source={% raw %}{{ uri: imageUri }}{% endraw %} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text>이미지 선택</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

---

### 주요 옵션 설명

#### ImagePicker.launchImageLibraryAsync 옵션

| 옵션 | 설명 | 예시 |
| --- | --- | --- |
| mediaTypes | 선택할 미디어 타입 | MediaType.Images, MediaType.Videos |
| allowsEditing | 크롭 편집 허용 | true / false |
| aspect | 크롭 비율 (allowsEditing=true일 때) | [1, 1], [4, 3], [16, 9] |
| quality | 이미지 품질 (0~1) | 1 (원본), 0.5 (50%) |

#### ImageManipulator.manipulateAsync 옵션

| 옵션 | 설명 | 예시 |
| --- | --- | --- |
| resize | 리사이즈 크기 | { width: 400, height: 400 } |
| compress | 압축 품질 (0~1) | 0.7 (70%) |
| format | 출력 포맷 | SaveFormat.JPEG, SaveFormat.PNG |
| base64 | Base64 인코딩 여부 | true / false |

---

### 권한 처리

iOS에서는 `Info.plist`에 권한 설명이 필요하지만, Expo에서는 `app.json`에서 설정합니다.

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "프로필 사진을 설정하기 위해 갤러리 접근이 필요합니다."
        }
      ]
    ]
  }
}
```
