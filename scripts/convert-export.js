#!/usr/bin/env node

/**
 * Notion Export → Jekyll 변환 스크립트 (수동 마이그레이션용)
 *
 * 사용법:
 *   1. Notion에서 "Export as Markdown & CSV"로 내보내기
 *   2. 내보낸 파일들을 _notion_export/ 디렉토리에 넣기
 *   3. npm run convert
 *
 * 지원 구조:
 *   _notion_export/
 *     ├── 글제목1 abc123.md
 *     ├── 글제목2 def456.md
 *     └── 글제목1 abc123/      (이미지 폴더)
 *         └── image.png
 */

const fs = require("fs-extra");
const path = require("path");
const slugify = require("slugify");

const EXPORT_DIR = path.join(__dirname, "..", "_notion_export");
const POSTS_DIR = path.join(__dirname, "..", "_posts");
const IMAGES_DIR = path.join(__dirname, "..", "assets", "images", "posts");

// 카테고리 매핑 (폴더명 또는 파일명에서 추론)
const CATEGORY_KEYWORDS = {
  알고리즘: "Algorithm",
  algorithm: "Algorithm",
  운영체제: "Operating-System",
  오퍼레이팅: "Operating-System",
  os: "Operating-System",
  네트워크: "Computer-Network",
  network: "Computer-Network",
  컴퓨터구조: "Computer-Architecture",
  architecture: "Computer-Architecture",
  데이터베이스: "Database",
  database: "Database",
  db: "Database",
  react: "Frontend",
  frontend: "Frontend",
  aws: "Cloud",
  cloud: "Cloud",
  리눅스: "Linux",
  linux: "Linux",
  superclaude: "Dev-Tools",
};

function inferCategory(title, parentFolder) {
  const text = `${title} ${parentFolder}`.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) {
      return category;
    }
  }
  return "Uncategorized";
}

function makeSlug(title) {
  // Notion export 파일명에서 해시 제거: "제목 abc123def456" → "제목"
  const cleaned = title.replace(/\s+[a-f0-9]{20,}$/i, "").trim();

  let slug = slugify(cleaned, {
    lower: true,
    strict: true,
    locale: "ko",
  });
  if (!slug) {
    slug = cleaned
      .replace(/[^a-zA-Z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  return slug || "untitled";
}

function extractDateFromFile(filepath) {
  const stat = fs.statSync(filepath);
  return stat.mtime.toISOString().split("T")[0];
}

async function processExportedFile(filepath, parentFolder) {
  const basename = path.basename(filepath, ".md");
  const title = basename.replace(/\s+[a-f0-9]{20,}$/i, "").trim();
  const slug = makeSlug(basename);
  const date = extractDateFromFile(filepath);
  const category = inferCategory(title, parentFolder);

  let content = await fs.readFile(filepath, "utf-8");

  // 첫 줄이 # 제목이면 제거 (front matter의 title로 대체)
  content = content.replace(/^#\s+.*\n+/, "");

  // 이미지 경로 변환
  const imageFolder = path.join(path.dirname(filepath), basename);
  if (await fs.pathExists(imageFolder)) {
    const images = await fs.readdir(imageFolder);
    await fs.ensureDir(IMAGES_DIR);

    for (const img of images) {
      const imgSlug = `${slug}-${path.basename(img, path.extname(img))}${path.extname(img)}`;
      await fs.copy(path.join(imageFolder, img), path.join(IMAGES_DIR, imgSlug));

      // Markdown 내 상대 경로를 절대 경로로 교체
      const relPath = `${basename}/${img}`;
      const newPath = `/assets/images/posts/${imgSlug}`;
      content = content.split(relPath).join(newPath);
      content = content.split(encodeURIComponent(relPath)).join(newPath);
      console.log(`  📷 이미지 복사: ${imgSlug}`);
    }
  }

  // 수식 변환
  content = content.replace(/\$\$([^$]+)\$\$/g, "\n$$\n$1\n$$\n");

  // 불필요한 빈 줄 정리
  content = content.replace(/\n{3,}/g, "\n\n").trim();

  const frontMatter = [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `categories: [${category}]`,
    "tags: []",
    "toc: true",
    "toc_sticky: true",
    "---",
  ].join("\n");

  const finalContent = `${frontMatter}\n\n${content}\n`;
  const filename = `${date}-${slug}.md`;
  const destPath = path.join(POSTS_DIR, filename);

  await fs.writeFile(destPath, finalContent, "utf-8");
  return { title, filename, category };
}

async function convertAll() {
  console.log("🚀 Notion Export → Jekyll 변환 시작\n");

  if (!(await fs.pathExists(EXPORT_DIR))) {
    console.error("❌ _notion_export/ 디렉토리가 없습니다.");
    console.log("   Notion에서 Markdown으로 내보낸 파일들을 _notion_export/에 넣어주세요.");
    process.exit(1);
  }

  await fs.ensureDir(POSTS_DIR);

  const files = await fs.readdir(EXPORT_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  if (mdFiles.length === 0) {
    console.log("⚠️ _notion_export/에 .md 파일이 없습니다.");
    process.exit(0);
  }

  console.log(`📄 총 ${mdFiles.length}개 파일 발견\n`);

  const converted = [];
  for (const file of mdFiles) {
    const filepath = path.join(EXPORT_DIR, file);
    console.log(`📝 변환 중: ${file}`);
    try {
      const result = await processExportedFile(filepath, "");
      converted.push(result);
      console.log(`  ✅ 저장: ${result.filename}\n`);
    } catch (err) {
      console.error(`  ❌ 변환 실패: ${file} - ${err.message}\n`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ 변환 완료: ${converted.length}/${mdFiles.length}개`);
  console.log("=".repeat(50));
  converted.forEach((c) => {
    console.log(`  - [${c.category}] ${c.title}`);
  });
  console.log("\n💡 로컬 확인: bundle exec jekyll serve");
}

convertAll().catch((err) => {
  console.error("❌ 변환 오류:", err.message);
  process.exit(1);
});
