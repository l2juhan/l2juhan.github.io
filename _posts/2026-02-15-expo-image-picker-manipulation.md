---
title: "이미지 선택 + 압축 + Base64 변환 (expo-image-picker)"
date: 2026-02-15
categories: [Frontend]
tags: [react-native, expo, image-picker, image-manipulation]
toc: true
toc_sticky: true
---
{% raw %}

사용자 갤러리에서 이미지를 선택하고, 서버 전송을 위해 리사이즈/압축/Base64 변환하는 방법을 정리합니다.

## 설치

```bash
npx expo install expo-image-picker expo-image-manipulator
```

> 네이티브 모듈이므로 Development Build 재빌드가 필요합니다.

## 전체 플로우

```
갤러리 열기 → 이미지 선택 → 크롭 → 리사이즈 → 압축 → Base64 인코딩 → 서버 전송
```

## 구현 코드

```typescript
// src/utils/image.ts
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

interface ImageResult {
  uri: string;
  base64: string;
}

export const pickProfileImage = async (): Promise<ImageResult | null> => {
  // 1. 갤러리에서 이미지 선택
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],       // 정사각형 크롭
    quality: 1,           // 원본 품질
  });

  if (result.canceled || !result.assets[0]) return null;

  // 2. 리사이즈 + 압축 + Base64 변환
  const manipulated = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 400, height: 400 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  return {
    uri: manipulated.uri,
    base64: manipulated.base64 || "",
  };
};
```

## 컴포넌트에서 사용

```typescript
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
      <Image source={{ uri: imageUri }} style={styles.image} />
    ) : (
      <View style={styles.placeholder}><Text>이미지 선택</Text></View>
    )}
  </TouchableOpacity>
);
```

## ImagePicker 주요 옵션

| 옵션 | 설명 | 예시 |
|---|---|---|
| `mediaTypes` | 선택할 미디어 타입 | `MediaType.Images`, `MediaType.Videos` |
| `allowsEditing` | 크롭 편집 허용 | `true` / `false` |
| `aspect` | 크롭 비율 | `[1, 1]`, `[4, 3]`, `[16, 9]` |
| `quality` | 이미지 품질 (0~1) | `1` (원본), `0.5` (50%) |

## ImageManipulator 주요 옵션

| 옵션 | 설명 | 예시 |
|---|---|---|
| `resize` | 리사이즈 크기 | `{ width: 400, height: 400 }` |
| `compress` | 압축 품질 (0~1) | `0.7` (70%) |
| `format` | 출력 포맷 | `SaveFormat.JPEG`, `SaveFormat.PNG` |
| `base64` | Base64 인코딩 여부 | `true` / `false` |

## 권한 처리

iOS에서는 갤러리 접근 권한이 필요합니다. Expo에서는 `app.json`에서 설정합니다.

```json
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

{% endraw %}
