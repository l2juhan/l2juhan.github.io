---
name: image-extractor
description: PDF 또는 PPT 파일에서 특정 이미지만 선별 추출하는 서브 에이전트 스킬. blog-post-writer-file 등 메인 스킬이 필요한 이미지 목록을 결정한 뒤, 이 스킬을 통해 해당 이미지만 추출한다. 직접 호출하기보다 다른 스킬과 연계되어 자동으로 트리거되는 것을 전제로 설계됨.
context: fork
user-invocable: false
---

# Image Extractor — 강의자료 이미지 선별 추출

## 핵심 규칙

**페이지 전체를 이미지로 렌더링하지 않는다.**

두 가지 추출 모드를 지원한다:

| 모드 | 방식 | 사용 상황 |
|------|------|----------|
| `extract` | 임베딩 이미지 객체만 추출 | 이미지 단독으로 의미가 완성되는 경우 (사진, 독립 다이어그램) |
| `crop` | 이미지 + 주변 텍스트 영역을 잘라서 렌더링 | 이미지와 텍스트 라벨이 세트인 경우 (주소 라벨이 붙은 메모리 구조도, 수식이 붙은 그래프 등) |

메인 에이전트가 각 이미지에 대해 모드를 지정한다.
지정하지 않으면 기본값은 `extract`이다.

```
추출 요청 예시:
  - 페이지 3: 메모리 계층 피라미드 (mode: extract)
  - 페이지 5: 메모리 레이아웃 + 주소 라벨 (mode: crop)
  - 페이지 8: 캐시 구조 다이어그램 (mode: extract)
```

## 입력
메인 에이전트로부터 전달받는 정보:
- 파일 경로
- 출력 디렉토리
- 슬러그 (파일명 접두사)
- 추출할 이미지 목록 (페이지 번호 + 설명 + 모드)

## 워크플로우

### Step 1: 환경 확인
```bash
python3 -c "import fitz, pptx, PIL" || { echo "ERROR: 'pip install PyMuPDF python-pptx Pillow'로 전역 설치 필요."; exit 1; }
```

### Step 2: 이미지 인덱싱

#### PDF — 각 페이지의 임베딩 이미지 메타데이터 수집
```python
import fitz

doc = fitz.open(file_path)
index = []

for page_num in range(len(doc)):
    page = doc[page_num]
    images = page.get_images(full=True)
    for img_idx, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        width = base_image["width"]
        height = base_image["height"]
        area = width * height

        if area < 5000:
            category = "tiny"
        elif area < 50000:
            category = "small"
        else:
            category = "content"

        # 페이지 내 이미지 위치(bbox) 확인
        img_rects = page.get_image_rects(xref)
        bbox = img_rects[0] if img_rects else None

        index.append({
            "page": page_num + 1,
            "img_idx": img_idx,
            "xref": xref,
            "width": width,
            "height": height,
            "ext": base_image["ext"],
            "category": category,
            "bbox": bbox           # crop 모드에서 사용
        })
```

#### PPT
```python
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

prs = Presentation(file_path)
index = []

for slide_num, slide in enumerate(prs.slides, 1):
    for shape_idx, shape in enumerate(slide.shapes):
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            w_px = shape.width // 9525
            h_px = shape.height // 9525
            area = w_px * h_px
            index.append({
                "slide": slide_num,
                "shape_idx": shape_idx,
                "shape": shape,
                "width": w_px,
                "height": h_px,
                "category": "tiny" if area < 5000 else ("small" if area < 50000 else "content")
            })
```

### Step 3: 필터링
- **tiny**: 기본 제외 (로고, 아이콘, 불릿)
- **중복**: 같은 xref의 이미지 제거

### Step 4: 매칭 및 추출

#### 모드 1: `extract` — 임베딩 이미지 객체만 추출

이미지 단독으로 의미가 완성되는 경우에 사용한다.

```python
def extract_image_only(doc, xref, output_path):
    """
    PDF 내부에 저장된 이미지 바이너리 원본만 추출한다.
    텍스트, 배경, 레이아웃은 포함되지 않는다.
    """
    base_image = doc.extract_image(xref)
    image_bytes = base_image["image"]
    with open(output_path, "wb") as f:
        f.write(image_bytes)
```

#### 모드 2: `crop` — 이미지 영역 + 주변 텍스트를 함께 캡처

이미지와 텍스트 라벨이 세트인 경우에 사용한다.
예: 메모리 레이아웃 다이어그램 + `$sp → 7fff fffc_hex` 같은 주소 라벨

```python
def crop_image_region(doc, page_num, bbox, output_path, padding=30, dpi=200):
    """
    이미지의 bbox를 기준으로, padding만큼 확장한 영역만 렌더링한다.
    페이지 전체가 아닌, 이미지 + 주변 텍스트 영역만 잘라낸다.

    padding: bbox 주변으로 확장할 픽셀 수 (주변 라벨 포함 목적)
    """
    page = doc[page_num - 1]  # 0-indexed
    page_rect = page.rect

    # bbox 확장 (주변 텍스트 포함)
    clip = fitz.Rect(
        max(bbox.x0 - padding, page_rect.x0),
        max(bbox.y0 - padding, page_rect.y0),
        min(bbox.x1 + padding, page_rect.x1),
        min(bbox.y1 + padding, page_rect.y1)
    )

    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(output_path)
    pix = None
```

**crop 모드에서 padding 조절 기준:**
- 기본값 30: 일반적인 텍스트 라벨 포함
- 라벨이 멀리 있으면 50~80으로 확장
- 인접 이미지/텍스트가 잘려 들어오면 축소

#### PPT 추출 (모드 무관, 항상 이미지 객체 추출)
```python
def extract_image_from_ppt(shape, output_path):
    with open(output_path, "wb") as f:
        f.write(shape.image.blob)
```

### Step 5: 저장 및 결과 출력

**파일명 규칙:** `{slug}-{순번}.{ext}`

**결과 리포트 (stdout JSON):**
```json
{
  "status": "success",
  "slug": "memory-layout",
  "images": [
    {
      "filename": "memory-layout-1.png",
      "source": "page 3, xref 15",
      "description": "메모리 계층 구조 피라미드",
      "method": "extract"
    },
    {
      "filename": "memory-layout-2.png",
      "source": "page 5, region crop",
      "description": "MIPS 메모리 레이아웃 + 주소 라벨",
      "method": "crop",
      "padding": 30
    }
  ]
}
```

## 에러 처리
- **임베딩 이미지 없음**: "해당 페이지에 임베딩 이미지 없음" 보고. crop 모드 전환을 제안한다
- **bbox 획득 실패**: `get_image_rects()`가 빈 값을 반환하는 경우, 메인 에이전트에 보고한다
- **매칭 실패**: 해당 페이지의 이미지 목록(크기, 개수)을 함께 보고한다

## 절대 하지 않는 것
- `page.get_pixmap()`로 **페이지 전체**를 이미지화하지 않는다
- crop 모드에서도 반드시 `clip` 파라미터로 **영역을 제한**한다
- 요청받지 않은 이미지를 추출하지 않는다