---
name: image-extractor
description: PDF 또는 PPT 파일에서 특정 이미지만 선별 추출하는 서브 에이전트 스킬. blog-post-writer-file 등 메인 스킬이 필요한 이미지 목록을 결정한 뒤, 이 스킬을 통해 해당 이미지만 추출한다. 직접 호출하기보다 다른 스킬과 연계되어 자동으로 트리거되는 것을 전제로 설계됨.
context: fork
user-invocable: false
---

# Image Extractor — 강의자료 이미지 선별 추출

## 개요
PDF/PPT 파일에서 **메인 에이전트가 지정한 이미지만** 선별 추출하는 서브 에이전트 스킬이다.
`context: fork`로 실행되어, 메인 대화를 방해하지 않고 독립적으로 이미지 추출 작업을 수행한다.

## 입력
메인 에이전트로부터 다음 정보를 전달받는다:
- 파일 경로
- 출력 디렉토리
- 슬러그 (파일명 접두사)
- 추출할 이미지 목록 (페이지 번호 + 설명)

## 워크플로우

### Step 1: 환경 확인
PyMuPDF, python-pptx, Pillow가 전역 설치되어 있다는 전제로 동작한다.
없으면 에러를 출력하고 중단한다.
```bash
python3 -c "import fitz, pptx, PIL" || { echo "ERROR: 필요한 패키지가 설치되어 있지 않다. 'pip install PyMuPDF python-pptx Pillow'로 전역 설치 필요."; exit 1; }
```

### Step 2: 전체 이미지 인덱싱 (추출 전 메타데이터만)

#### PDF
```python
import fitz

doc = fitz.open(file_path)
index = []

for page_num in range(len(doc)):
    page = doc[page_num]
    for img_idx, img in enumerate(page.get_images(full=True)):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        area = pix.width * pix.height
        index.append({
            "page": page_num + 1,
            "img_idx": img_idx,
            "xref": xref,
            "width": pix.width,
            "height": pix.height,
            "category": "tiny" if area < 5000 else ("small" if area < 50000 else "content")
        })
        pix = None
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
                "content_type": shape.image.content_type,
                "width": w_px,
                "height": h_px,
                "category": "tiny" if area < 5000 else ("small" if area < 50000 else "content")
            })
```

### Step 3: 자동 필터링
- **tiny** (로고, 아이콘, 불릿): 기본 제외
- **중복 이미지**: 같은 xref 또는 동일 크기의 반복 이미지 제거
- **배경 이미지**: 슬라이드 전체를 덮는 이미지 제외

### Step 4: 요청 매칭 및 추출

메인 에이전트가 지정한 "페이지 N의 X 이미지"를 인덱스에서 매칭한다.

**매칭 우선순위:**
1. 페이지 번호 일치 + content 카테고리
2. 같은 페이지 내 등장 순서
3. 크기 기반 추정 (다이어그램 = 큰 이미지)

**PDF 추출:**
```python
def extract_pdf_image(doc, xref, output_path):
    pix = fitz.Pixmap(doc, xref)
    if pix.n >= 5:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    pix.save(output_path)
    pix = None
```

**PPT 추출:**
```python
def extract_ppt_image(shape, output_path):
    with open(output_path, "wb") as f:
        f.write(shape.image.blob)
```

**페이지 렌더링 폴백** (벡터 그래픽인 경우):
```python
def render_page(doc, page_num, output_path, dpi=200):
    page = doc[page_num - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi/72, dpi/72))
    pix.save(output_path)
    pix = None
```

### Step 5: 저장 및 결과 출력

**파일명 규칙:** `{slug}-{순번}.png` (1부터, 블로그 등장 순서)

**결과 리포트 (stdout JSON):**
```json
{
  "status": "success",
  "slug": "memory-hierarchy-and-cache",
  "images": [
    {
      "filename": "memory-hierarchy-and-cache-1.png",
      "source": "page 3, image 0",
      "description": "메모리 계층 구조 피라미드"
    }
  ],
  "skipped": ["page 1: 대학 로고 (tiny)"]
}
```

## 에러 처리
- **매칭 실패**: 해당 페이지의 이미지 목록과 함께 보고
- **벡터 그래픽**: 페이지 렌더링 폴백 사용
- **파일 읽기 실패**: 에러 메시지 + 가능한 부분까지 결과 리턴
