# CLAUDE.md

## Git 규칙

- commit+push는 사용자가 명시적으로 요청하지 않는 한, 실행 전에 반드시 확인을 받는다.

## 새 포스트 작성 규칙

- 새 포스트(또는 새 정적 자산)를 추가한 뒤에는 **반드시 `bundle exec jekyll build`를 실행**하여 `_site`에 결과물이 생성되는지 확인한다. 빌드하지 않으면 로컬 서버(`jekyll serve`)가 새 파일을 자동으로 반영하지 못해 `localhost:4000`에서 Not found가 뜬다.
- 빌드 후 생성된 실제 경로를 확인한다: `find _site -path "*<slug>*"`. 그 경로가 사용자에게 안내할 URL이다.
- 카테고리는 frontmatter에 PascalCase(예: `Operating-System`)로 적되, **URL에서는 Jekyll이 자동으로 소문자로 slugify**한다. 따라서 최종 URL은 `/operating-system/YYYY/MM/DD/<slug>/` 형태가 된다. frontmatter 카테고리 표기와 실제 URL의 대소문자가 다른 것은 정상이다.
- 사용자가 로컬에서 확인하려면 `jekyll serve`를 재시작해야 할 수 있음을 안내한다.

## 정적 자산 규칙

- CSS/JS 파일을 참조할 때 반드시 cache busting 쿼리스트링을 붙인다: `?v={{ site.time | date: '%s' }}`
- 새로운 CSS/JS 파일을 추가할 경우에도 동일하게 적용한다.
- 이 규칙은 `_includes/vscode/head.html`과 `_layouts/default.html`에 이미 적용되어 있다.
