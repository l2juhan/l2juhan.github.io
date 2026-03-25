#!/usr/bin/env node

/**
 * Notion → Jekyll 마이그레이션 스크립트
 *
 * 사용법:
 *   1. .env 파일에 NOTION_API_KEY, NOTION_DATABASE_ID 설정
 *   2. npm run migrate
 *
 * Notion Integration 설정:
 *   1. https://www.notion.so/my-integrations 에서 새 Integration 생성
 *   2. 생성된 토큰을 .env의 NOTION_API_KEY에 입력
 *   3. Notion에서 Study archive 페이지 → ... → 연결 → 생성한 Integration 선택
 */

require("dotenv").config();
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs-extra");
const path = require("path");
const slugify = require("slugify");
const https = require("https");
const http = require("http");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

const POSTS_DIR = path.join(__dirname, "..", "_posts");
const IMAGES_DIR = path.join(__dirname, "..", "assets", "images", "posts");

// Notion 속성명 매핑 (한글/영문 모두 지원)
const PROPERTY_MAP = {
  title: ["제목", "Title", "이름", "Name"],
  category: ["카테고리", "Category", "Categories"],
  tags: ["태그", "Tags", "Tag"],
  date: ["날짜", "Date", "Created"],
  status: ["상태", "Status", "활성 상태"],
};

// 카테고리 매핑
const CATEGORY_MAP = {
  알고리즘: "Algorithm",
  오퍼레이팅시스템: "Operating-System",
  운영체제: "Operating-System",
  "컴퓨터 네트워크": "Computer-Network",
  컴퓨터네트워크: "Computer-Network",
  컴퓨터구조론: "Computer-Architecture",
  컴퓨터구조: "Computer-Architecture",
  데이터베이스: "Database",
  React: "Frontend",
  "React Native": "Frontend",
  "AWS Cloud Practitioner Certification": "Cloud",
  "AWS Certified Solutions Architect": "Cloud",
  리눅스마스터: "Linux",
  "리눅스마스터 2급": "Linux",
  Cloud: "Cloud",
  Frontend: "Frontend",
  SuperClaude: "Dev-Tools",
};

function getProperty(properties, keys) {
  for (const key of keys) {
    if (properties[key]) return properties[key];
  }
  return null;
}

function extractTitle(properties) {
  const prop = getProperty(properties, PROPERTY_MAP.title);
  if (!prop) return "Untitled";

  if (prop.type === "title" && prop.title) {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "Untitled";
}

function extractDate(properties, createdTime) {
  const prop = getProperty(properties, PROPERTY_MAP.date);
  if (prop && prop.type === "date" && prop.date) {
    return prop.date.start.split("T")[0];
  }
  return createdTime ? createdTime.split("T")[0] : new Date().toISOString().split("T")[0];
}

function extractCategory(properties) {
  const prop = getProperty(properties, PROPERTY_MAP.category);
  if (!prop) return ["Uncategorized"];

  if (prop.type === "select" && prop.select) {
    const name = prop.select.name;
    return [CATEGORY_MAP[name] || name];
  }
  if (prop.type === "multi_select" && prop.multi_select) {
    return prop.multi_select.map((s) => CATEGORY_MAP[s.name] || s.name);
  }
  return ["Uncategorized"];
}

function extractTags(properties) {
  const prop = getProperty(properties, PROPERTY_MAP.tags);
  if (!prop) return [];

  if (prop.type === "multi_select" && prop.multi_select) {
    return prop.multi_select.map((s) => s.name.toLowerCase());
  }
  return [];
}

function extractStatus(properties) {
  const prop = getProperty(properties, PROPERTY_MAP.status);
  if (!prop) return null;

  if (prop.type === "select" && prop.select) {
    return prop.select.name;
  }
  if (prop.type === "status" && prop.status) {
    return prop.status.name;
  }
  return null;
}

function makeSlug(title) {
  let slug = slugify(title, {
    lower: true,
    strict: true,
    locale: "ko",
  });
  if (!slug) {
    slug = title.replace(/[^a-zA-Z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  return slug || "untitled";
}

async function downloadImage(url, filename) {
  await fs.ensureDir(IMAGES_DIR);
  const filepath = path.join(IMAGES_DIR, filename);

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location, filename).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
          resolve(filepath);
        });
        stream.on("error", reject);
      })
      .on("error", reject);
  });
}

async function processImages(markdown, slug) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let result = markdown;
  let imgIndex = 0;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [fullMatch, alt, url] = match;
    if (url.startsWith("/") || url.startsWith("assets/")) continue;

    try {
      const ext = path.extname(new URL(url).pathname).split("?")[0] || ".png";
      const filename = `${slug}-${imgIndex}${ext}`;
      await downloadImage(url, filename);
      result = result.replace(fullMatch, `![${alt}](/assets/images/posts/${filename})`);
      imgIndex++;
      console.log(`  📷 이미지 다운로드: ${filename}`);
    } catch (err) {
      console.warn(`  ⚠️ 이미지 다운로드 실패: ${url} - ${err.message}`);
    }
  }

  return result;
}

function postProcessMarkdown(markdown) {
  let result = markdown;

  // 토글 → <details>
  result = result.replace(
    /^- (.*)\n((?:  .*\n)*)/gm,
    (match, summary, content) => {
      if (!content.trim()) return match;
      const inner = content.replace(/^  /gm, "");
      return `<details><summary>${summary}</summary>\n\n${inner}\n</details>\n\n`;
    }
  );

  // 콜아웃 → blockquote
  result = result.replace(
    /^> (⚠️|💡|📌|ℹ️|✅|❗|🔥|📝|⭐) (.*)/gm,
    "> **$2**"
  );

  // 수식 (인라인)
  result = result.replace(/\$([^$]+)\$/g, "$$$1$$");

  // 불필요한 빈 줄 정리
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}

function generateFrontMatter(title, date, categories, tags) {
  return [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `categories: [${categories.join(", ")}]`,
    `tags: [${tags.join(", ")}]`,
    "toc: true",
    "toc_sticky: true",
    "---",
  ].join("\n");
}

async function fetchAllPages() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    console.error("❌ NOTION_DATABASE_ID가 설정되지 않았습니다.");
    process.exit(1);
  }

  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function migratePages() {
  console.log("🚀 Notion → Jekyll 마이그레이션 시작\n");

  await fs.ensureDir(POSTS_DIR);
  const pages = await fetchAllPages();
  console.log(`📄 총 ${pages.length}개 페이지 발견\n`);

  const migrated = [];

  for (const page of pages) {
    const title = extractTitle(page.properties);
    const date = extractDate(page.properties, page.created_time);
    const categories = extractCategory(page.properties);
    const tags = extractTags(page.properties);
    const status = extractStatus(page.properties);

    // Published/활성 상태만 마이그레이션
    if (status && !["Published", "활성", "Done", "완료"].includes(status)) {
      console.log(`⏭ 건너뜀 (상태: ${status}): ${title}`);
      continue;
    }

    console.log(`📝 변환 중: ${title}`);

    try {
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      let markdown = n2m.toMarkdownString(mdBlocks).parent;

      const slug = makeSlug(title);
      markdown = await processImages(markdown, slug);
      markdown = postProcessMarkdown(markdown);

      const frontMatter = generateFrontMatter(title, date, categories, tags);
      const content = `${frontMatter}\n\n${markdown}\n`;
      const filename = `${date}-${slug}.md`;
      const filepath = path.join(POSTS_DIR, filename);

      await fs.writeFile(filepath, content, "utf-8");
      migrated.push({ title, filename, categories, tags });
      console.log(`  ✅ 저장: ${filename}\n`);
    } catch (err) {
      console.error(`  ❌ 변환 실패: ${title} - ${err.message}\n`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ 마이그레이션 완료: ${migrated.length}/${pages.length}개`);
  console.log("=".repeat(50));
  migrated.forEach((m) => {
    console.log(`  - [${m.categories.join(", ")}] ${m.title}`);
  });
  console.log("\n💡 로컬 확인: bundle exec jekyll serve");
}

migratePages().catch((err) => {
  console.error("❌ 마이그레이션 오류:", err.message);
  process.exit(1);
});
