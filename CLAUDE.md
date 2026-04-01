# CLAUDE.md

## Git 규칙

- commit+push는 사용자가 명시적으로 요청하지 않는 한, 실행 전에 반드시 확인을 받는다.

## 정적 자산 규칙

- CSS/JS 파일을 참조할 때 반드시 cache busting 쿼리스트링을 붙인다: `?v={{ site.time | date: '%s' }}`
- 새로운 CSS/JS 파일을 추가할 경우에도 동일하게 적용한다.
- 이 규칙은 `_includes/vscode/head.html`과 `_layouts/default.html`에 이미 적용되어 있다.
