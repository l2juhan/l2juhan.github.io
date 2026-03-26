#!/usr/bin/env node
/**
 * 오픈소스응용프로그래밍 Notion 페이지들을 블로그 포스트로 변환
 */
require("dotenv").config({ quiet: true });
const { Client } = require("@notionhq/client");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const http = require("http");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const POSTS_DIR = path.join(__dirname, "..", "_posts");
const IMAGES_BASE = path.join(__dirname, "..", "assets", "images", "posts");

// Notion page ID → blog post mapping
const OSS_PAGES = [
  {
    id: "28ab508e-2f68-802b-944c-dc09ef313aae",
    title: "오픈소스SW 개요 및 라이선스",
    file: "2025-10-12-open-source-sw-license.md",
    slug: "open-source-sw-license",
    date: "2025-10-12",
    tags: ["open-source", "license", "gpl", "mit"],
  },
  {
    id: "28ab508e-2f68-8047-a181-d988916da766",
    title: "Git 소개 및 버전 관리",
    file: "2025-10-12-git-intro-version-control.md",
    slug: "git-intro-version-control",
    date: "2025-10-12",
    tags: ["git", "version-control", "vcs"],
  },
  {
    id: "28bb508e-2f68-8090-9d26-e9b26b36eca9",
    title: "Git 브랜치 및 GitHub",
    file: "2025-10-13-git-branch-github.md",
    slug: "git-branch-github",
    date: "2025-10-13",
    tags: ["git", "branch", "github", "merge"],
  },
  {
    id: "28bb508e-2f68-8013-9f0d-cb734b576413",
    title: "Docker 소개 및 개발환경 설정",
    file: "2025-10-13-docker-intro-dev-env.md",
    slug: "docker-intro-dev-env",
    date: "2025-10-13",
    tags: ["docker", "container", "dev-environment"],
  },
  {
    id: "28bb508e-2f68-803d-9168-c0f3a98acc9f",
    title: "Docker 아키텍처와 이미지 명령어",
    file: "2025-10-13-docker-architecture-image.md",
    slug: "docker-architecture-image",
    date: "2025-10-13",
    tags: ["docker", "image", "architecture", "registry"],
  },
  {
    id: "28bb508e-2f68-806e-87b3-dbdd3b31aef8",
    title: "Docker 컨테이너 명령어와 볼륨",
    file: "2025-10-13-docker-container-volume.md",
    slug: "docker-container-volume",
    date: "2025-10-13",
    tags: ["docker", "container", "volume", "mount"],
  },
  {
    id: "28bb508e-2f68-80d7-a376-ddb3aa210f65",
    title: "Dockerfile과 GitHub를 이용한 파일 공유",
    file: "2025-10-13-dockerfile-github-sharing.md",
    slug: "dockerfile-github-sharing",
    date: "2025-10-13",
    tags: ["docker", "dockerfile", "github", "image-build"],
  },
  {
    id: "295b508e-2f68-80b4-8c99-f669782cb45f",
    title: "소프트웨어 정의 및 이해",
    file: "2025-10-23-software-definition.md",
    slug: "software-definition",
    date: "2025-10-23",
    tags: ["software-engineering", "software-definition", "crisis"],
  },
  {
    id: "295b508e-2f68-80b1-9d42-f7d3106796b7",
    title: "소프트웨어 공학 및 개발론 개요",
    file: "2025-10-23-software-engineering-overview.md",
    slug: "software-engineering-overview",
    date: "2025-10-23",
    tags: ["software-engineering", "sdlc", "agile", "waterfall"],
  },
  {
    id: "295b508e-2f68-8067-b602-fadc0a7316f1",
    title: "코딩 스타일가이드",
    file: "2025-10-23-coding-style-guide.md",
    slug: "coding-style-guide",
    date: "2025-10-23",
    tags: ["style-guide", "coding-convention", "clean-code"],
  },
  {
    id: "295b508e-2f68-80f5-b5d5-d60c0a9939c0",
    title: "코드 리뷰",
    file: "2025-10-23-code-review.md",
    slug: "code-review",
    date: "2025-10-23",
    tags: ["code-review", "best-practices", "collaboration"],
  },
  {
    id: "2c6b508e-2f68-8022-9365-f2b3c8956c43",
    title: "UML과 클래스 다이어그램",
    file: "2025-12-11-uml-class-diagram.md",
    slug: "uml-class-diagram",
    date: "2025-12-11",
    tags: ["uml", "class-diagram", "modeling"],
  },
  {
    id: "2c6b508e-2f68-8067-b163-cc3d5678266b",
    title: "디자인 패턴 개요 및 객체지향 설계 원칙",
    file: "2025-12-11-design-pattern-intro-oop.md",
    slug: "design-pattern-intro-oop",
    date: "2025-12-11",
    tags: ["design-pattern", "oop", "solid", "object-oriented"],
  },
  {
    id: "2c6b508e-2f68-8022-9348-c9401117f4f6",
    title: "디자인 패턴 종류 — 행위, 구조, 생성 패턴",
    file: "2025-12-11-design-pattern-types.md",
    slug: "design-pattern-types",
    date: "2025-12-11",
    tags: ["design-pattern", "behavioral", "structural", "creational"],
  },
  {
    id: "2c7b508e-2f68-80fe-932c-f5d9d64719a4",
    title: "소프트웨어 테스팅 개요",
    file: "2025-12-12-software-testing-overview.md",
    slug: "software-testing-overview",
    date: "2025-12-12",
    tags: ["testing", "black-box", "white-box", "qa"],
  },
  {
    id: "2c7b508e-2f68-80d8-ac68-ce71d7fe6787",
    title: "구글 테스트 프레임워크",
    file: "2025-12-12-google-test-framework.md",
    slug: "google-test-framework",
    date: "2025-12-12",
    tags: ["testing", "google-test", "gtest", "unit-test"],
  },
];

let lastReq = 0;
async function rateLimited(fn) {
  const now = Date.now();
  const wait = Math.max(0, 400 - (now - lastReq));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastReq = Date.now();
  return fn();
}

function richTextToMd(richTexts) {
  if (!richTexts) return "";
  return richTexts
    .map((rt) => {
      let text = rt.plain_text;
      if (rt.annotations?.bold) text = `**${text}**`;
      if (rt.annotations?.italic) text = `*${text}*`;
      if (rt.annotations?.strikethrough) text = `~~${text}~~`;
      if (rt.annotations?.code) text = `\`${text}\``;
      if (rt.href) text = `[${text}](${rt.href})`;
      return text;
    })
    .join("");
}

async function getPageBlocks(pageId) {
  const allBlocks = [];
  async function fetchChildren(blockId, depth = 0) {
    let cursor;
    do {
      const res = await rateLimited(() =>
        notion.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: 100,
        })
      );
      for (const block of res.results) {
        allBlocks.push({ block, depth });
        if (block.has_children) {
          await fetchChildren(block.id, depth + 1);
        }
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
  }
  await fetchChildren(pageId);
  return allBlocks;
}

function blocksToMarkdown(blocksWithDepth) {
  let md = "";
  let images = [];
  let inTable = false;
  let tableHeaderDone = false;
  let tableCols = 0;

  for (const { block, depth } of blocksWithDepth) {
    const type = block.type;

    // Table handling
    if (type === "table") {
      inTable = true;
      tableHeaderDone = false;
      tableCols = block.table?.table_width || 0;
      continue;
    }

    if (type === "table_row") {
      const cells = block.table_row.cells.map((cell) =>
        cell.map((c) => c.plain_text).join("")
      );
      md += `| ${cells.join(" | ")} |\n`;
      if (inTable && !tableHeaderDone) {
        md += `| ${Array(tableCols).fill("---").join(" | ")} |\n`;
        tableHeaderDone = true;
      }
      continue;
    } else if (inTable) {
      inTable = false;
      md += "\n";
    }

    let line = "";
    switch (type) {
      case "paragraph":
        line = richTextToMd(block.paragraph?.rich_text);
        break;
      case "heading_1":
        line = `## ${richTextToMd(block.heading_1?.rich_text)}`;
        break;
      case "heading_2":
        line = `### ${richTextToMd(block.heading_2?.rich_text)}`;
        break;
      case "heading_3":
        line = `#### ${richTextToMd(block.heading_3?.rich_text)}`;
        break;
      case "bulleted_list_item": {
        const indent = "  ".repeat(Math.max(0, depth - 1));
        line = `${indent}- ${richTextToMd(block.bulleted_list_item?.rich_text)}`;
        break;
      }
      case "numbered_list_item": {
        const indent = "  ".repeat(Math.max(0, depth - 1));
        line = `${indent}1. ${richTextToMd(block.numbered_list_item?.rich_text)}`;
        break;
      }
      case "to_do": {
        const checked = block.to_do?.checked ? "x" : " ";
        line = `- [${checked}] ${richTextToMd(block.to_do?.rich_text)}`;
        break;
      }
      case "toggle":
        // Convert toggle to bold text (kramdown doesn't support markdown inside HTML)
        line = `**${richTextToMd(block.toggle?.rich_text)}**`;
        break;
      case "code": {
        const lang = block.code?.language || "";
        const code = richTextToMd(block.code?.rich_text);
        line = `\`\`\`${lang}\n${code}\n\`\`\``;
        break;
      }
      case "quote":
        line = `> ${richTextToMd(block.quote?.rich_text)}`;
        break;
      case "callout": {
        const icon = block.callout?.icon?.emoji || "💡";
        line = `> ${icon} ${richTextToMd(block.callout?.rich_text)}`;
        break;
      }
      case "divider":
        line = "---";
        break;
      case "image": {
        const img = block.image;
        const url =
          img?.type === "file" ? img.file?.url : img?.external?.url;
        const caption =
          img?.caption?.map((c) => c.plain_text).join("") || "";
        if (url) {
          images.push({ url, caption });
          line = `![${caption}](${url})`;
        }
        break;
      }
      case "bookmark":
        line = block.bookmark?.url
          ? `[${block.bookmark.url}](${block.bookmark.url})`
          : "";
        break;
      case "equation":
        line = `$$${block.equation?.expression || ""}$$`;
        break;
      case "column_list":
      case "column":
        break;
      default:
        break;
    }

    if (line) {
      md += line + "\n\n";
    }
  }

  return { markdown: md.trim(), images };
}

function escapeLiquid(content) {
  // Escape {{ }} inside code blocks for Jekyll/Liquid
  return content.replace(
    /(```[\s\S]*?```)/g,
    (codeBlock) => {
      if (codeBlock.includes("{{") || codeBlock.includes("{%")) {
        const lines = codeBlock.split("\n");
        const first = lines[0];
        const last = lines[lines.length - 1];
        const inner = lines.slice(1, -1).join("\n");
        if (inner.includes("{{") || inner.includes("{%")) {
          return first + "\n{% raw %}\n" + inner + "\n{% endraw %}\n" + last;
        }
      }
      return codeBlock;
    }
  );
}

function cleanMarkdown(md) {
  return (
    md
      // Remove Notion special characters
      .replace(/[▪︎▫︎◊]/g, "")
      // Fix double bold
      .replace(/\*\*\*\*(.*?)\*\*\*\*/g, "**$1**")
      // Ensure blank line before headings
      .replace(/([^\n])\n(#{2,4} )/g, "$1\n\n$2")
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, "")
      // Collapse 3+ blank lines to 2
      .replace(/\n{4,}/g, "\n\n\n")
      // Remove emoji prefix from Notion titles (📚)
      .replace(/^📚\s*/gm, "")
      .trim()
  );
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          downloadImage(res.headers.location, filepath)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
          resolve();
        });
        stream.on("error", reject);
      })
      .on("error", reject);
  });
}

async function migratePage(pageInfo) {
  const { id, title, file, slug, date, tags } = pageInfo;

  console.log(`\n📄 Fetching: ${title}`);

  // Fetch all blocks
  const blocks = await getPageBlocks(id);
  console.log(`   Blocks: ${blocks.length}`);

  // Convert to markdown
  let { markdown, images } = blocksToMarkdown(blocks);

  // Clean up
  markdown = cleanMarkdown(markdown);
  markdown = escapeLiquid(markdown);

  // Download images
  let imageCount = 0;
  if (images.length > 0) {
    const imageDir = path.join(IMAGES_BASE, slug);
    await fs.ensureDir(imageDir);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const ext =
          path.extname(new URL(img.url).pathname).split("?")[0] || ".png";
        const filename = `${slug}-${i + 1}${ext}`;
        const filepath = path.join(imageDir, filename);
        await downloadImage(img.url, filepath);
        const localPath = `/assets/images/posts/${slug}/${filename}`;
        markdown = markdown.replace(
          `![${img.caption}](${img.url})`,
          `![${img.caption || title}](${localPath})`
        );
        imageCount++;
        console.log(`   📷 Downloaded: ${filename}`);
      } catch (err) {
        console.log(`   ⚠️  Image ${i + 1} failed: ${err.message}`);
      }
    }
  }

  // Build front matter
  const frontMatter = [
    "---",
    `title: "${title}"`,
    `date: ${date}`,
    `categories: [Software-Engineering]`,
    `subcategory: OpenSource`,
    `tags: [${tags.join(", ")}]`,
    `toc: true`,
    `toc_sticky: true`,
    "---",
  ].join("\n");

  // Write file
  const filePath = path.join(POSTS_DIR, file);
  const content = frontMatter + "\n\n" + markdown + "\n";
  await fs.writeFile(filePath, content, "utf8");

  console.log(
    `   ✅ Written: ${file} (${blocks.length} blocks, ${imageCount} images)`
  );
  return { blocks: blocks.length, images: imageCount };
}

async function main() {
  console.log("=== 오픈소스응용프로그래밍 Notion → Blog Migration ===\n");
  console.log(`Total pages: ${OSS_PAGES.length}`);

  let totalBlocks = 0;
  let totalImages = 0;

  for (const page of OSS_PAGES) {
    try {
      const result = await migratePage(page);
      totalBlocks += result.blocks;
      totalImages += result.images;
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Pages: ${OSS_PAGES.length}`);
  console.log(`Total blocks: ${totalBlocks}`);
  console.log(`Total images: ${totalImages}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
