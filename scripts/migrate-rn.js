#!/usr/bin/env node
/**
 * React Native Notion 페이지들을 블로그 포스트로 변환 (기존 포스트 업데이트)
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

// Notion page ID → existing blog post mapping
const RN_PAGES = [
  {
    id: "307b508e-2f68-812e-9392-c915cad59130",
    title: "Expo 스플래시 스크린 설정 및 적용법",
    file: "2026-02-23-expo-splash-screen.md",
    slug: "expo-splash-screen",
    tags: ["react-native", "expo", "splash-screen"],
  },
  {
    id: "307b508e-2f68-8197-8983-f627db2401cc",
    title: "Expo 폰트 설정 (useFonts) 및 공통 Text 컴포넌트",
    file: "2026-02-24-expo-custom-fonts.md",
    slug: "expo-custom-fonts",
    tags: ["react-native", "expo", "fonts", "custom-component"],
  },
  {
    id: "307b508e-2f68-81f3-a2e4-dc3be6a76921",
    title: "PagerView — 스와이프 페이지 컨테이너",
    file: "2026-02-14-react-native-pager-view.md",
    slug: "react-native-pager-view",
    tags: ["react-native", "pager-view", "swipe", "ui"],
  },
  {
    id: "307b508e-2f68-8194-a786-e21a470a99c3",
    title: "Expo 환경 변수 설정 방법",
    file: "2026-02-14-expo-environment-variables.md",
    slug: "expo-environment-variables",
    tags: ["react-native", "expo", "env", "configuration"],
  },
  {
    id: "307b508e-2f68-815d-a336-ee5dbf1f80ff",
    title: "Zustand + persist 미들웨어로 상태 관리",
    file: "2026-02-15-zustand-persist-middleware.md",
    slug: "zustand-persist-middleware",
    tags: ["react-native", "zustand", "state-management", "persist"],
    isNew: true,
  },
  {
    id: "308b508e-2f68-81bf-af9e-c9a12a9e22a6",
    title: "Zustand 상태관리 + AsyncStorage Persist",
    file: "2026-02-15-zustand-asyncstorage-persist.md",
    slug: "zustand-asyncstorage-persist",
    tags: ["react-native", "zustand", "async-storage", "persist"],
  },
  {
    id: "308b508e-2f68-8147-8b2f-d7e4ffa87769",
    title: "이미지 선택 + 압축 + Base64 변환 (expo-image-picker)",
    file: "2026-02-15-expo-image-picker-manipulation.md",
    slug: "expo-image-picker-manipulation",
    tags: ["react-native", "expo", "image-picker", "compression"],
  },
  {
    id: "308b508e-2f68-8139-9147-d8f9ed4a4112",
    title: "푸시 알림 권한 요청 (expo-notifications)",
    file: "2026-02-15-expo-push-notifications.md",
    slug: "expo-push-notifications",
    tags: ["react-native", "expo", "push-notifications"],
  },
  {
    id: "308b508e-2f68-8102-9cc0-caf34a28c8ba",
    title: "React Navigation 기초 (@react-navigation)",
    file: "2026-02-15-react-navigation-basics.md",
    slug: "react-navigation-basics",
    tags: ["react-native", "react-navigation", "routing"],
  },
  {
    id: "308b508e-2f68-81a8-811d-f9fb35579b45",
    title: "카카오 로그인 연동 (@react-native-seoul/kakao-login)",
    file: "2026-02-15-kakao-login-react-native.md",
    slug: "kakao-login-react-native",
    tags: ["react-native", "kakao", "oauth", "login"],
  },
  {
    id: "308b508e-2f68-8183-a38a-daeaff8bab3a",
    title: "토스트 알림 (react-native-alert-notification)",
    file: "2026-02-15-react-native-toast-notification.md",
    slug: "react-native-toast-notification",
    tags: ["react-native", "toast", "notification", "ui"],
  },
  {
    id: "308b508e-2f68-8105-91d8-c3961f6449e4",
    title: "Axios 인터셉터 + 토큰 자동 갱신",
    file: "2026-02-15-axios-interceptor-token-refresh.md",
    slug: "axios-interceptor-token-refresh",
    tags: ["react-native", "axios", "interceptor", "token-refresh"],
  },
  {
    id: "309b508e-2f68-8174-abf9-cc59bdd4043e",
    title: "React Native UI 핵심 패턴 (웹 React 비교)",
    file: "2026-02-16-react-native-ui-patterns.md",
    slug: "react-native-ui-patterns",
    tags: ["react-native", "ui", "patterns", "web-comparison"],
  },
  {
    id: "30bb508e-2f68-81cf-a567-e5eb75ca371b",
    title: "Animated API — 모달 & 피커 애니메이션 (웹 CSS 비교)",
    file: "2026-02-18-react-native-animated-api.md",
    slug: "react-native-animated-api",
    tags: ["react-native", "animation", "animated-api", "web-comparison"],
  },
  {
    id: "30bb508e-2f68-81d4-a6f7-dc08eecc27ab",
    title: "VirtualizedList 중첩 경고 및 해결 패턴",
    file: "2026-02-18-virtualizedlist-nesting-warning.md",
    slug: "virtualizedlist-nesting-warning",
    tags: ["react-native", "virtualizedlist", "flatlist", "performance"],
  },
  {
    id: "30bb508e-2f68-8156-9120-f350afde645a",
    title: "React Native Modal 패턴 (웹 Portal 비교)",
    file: "2026-02-18-react-native-modal-pattern.md",
    slug: "react-native-modal-pattern",
    tags: ["react-native", "modal", "portal", "web-comparison"],
  },
  {
    id: "30bb508e-2f68-8121-b179-c7808c5625b1",
    title: "WheelPicker — iOS 스타일 휠 피커 컴포넌트",
    file: "2026-02-18-react-native-wheel-picker.md",
    slug: "react-native-wheel-picker",
    tags: ["react-native", "wheel-picker", "ios", "custom-component"],
  },
  {
    id: "30fb508e-2f68-8196-954a-fa11e3aa8bbd",
    title: "월간캘린더 컴포넌트 구조 (MonthlyCalendar)",
    file: "2026-02-22-react-native-monthly-calendar.md",
    slug: "react-native-monthly-calendar",
    tags: ["react-native", "calendar", "custom-component", "ui"],
  },
  {
    id: "319b508e-2f68-8118-b832-d3e397fbde38",
    title: "BottomSheetModal — PanResponder 스와이프 닫기 구현",
    file: "2026-03-04-bottom-sheet-pan-responder.md",
    slug: "bottom-sheet-pan-responder",
    tags: ["react-native", "pan-responder", "gesture", "bottom-sheet"],
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
        if (
          block.has_children &&
          block.type !== "child_page" &&
          block.type !== "child_database"
        ) {
          await fetchChildren(block.id, depth + 1);
        }
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
  }
  await fetchChildren(pageId);
  return allBlocks;
}

async function blocksToMarkdown(blocksWithDepth) {
  let md = "";
  let images = [];
  let inTable = false;
  let tableHeaderDone = false;
  let tableCols = 0;

  for (const { block, depth } of blocksWithDepth) {
    const type = block.type;

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

    switch (type) {
      case "paragraph":
        md += richTextToMd(block.paragraph.rich_text) + "\n\n";
        break;
      case "heading_1":
        md += `## ${richTextToMd(block.heading_1.rich_text)}\n\n`;
        break;
      case "heading_2":
        md += `### ${richTextToMd(block.heading_2.rich_text)}\n\n`;
        break;
      case "heading_3":
        md += `#### ${richTextToMd(block.heading_3.rich_text)}\n\n`;
        break;
      case "bulleted_list_item": {
        const indent = depth > 1 ? "  ".repeat(depth - 1) : "";
        md += `${indent}- ${richTextToMd(block.bulleted_list_item.rich_text)}\n`;
        break;
      }
      case "numbered_list_item": {
        const indent = depth > 1 ? "  ".repeat(depth - 1) : "";
        md += `${indent}1. ${richTextToMd(block.numbered_list_item.rich_text)}\n`;
        break;
      }
      case "to_do": {
        const checked = block.to_do.checked ? "x" : " ";
        md += `- [${checked}] ${richTextToMd(block.to_do.rich_text)}\n`;
        break;
      }
      case "toggle":
        // Skip toggle wrapper (kramdown doesn't support <details> well)
        // Just output the toggle title as bold text
        md += `**${richTextToMd(block.toggle.rich_text)}**\n\n`;
        break;
      case "code": {
        const lang =
          block.code.language === "plain text"
            ? ""
            : block.code.language || "";
        const code = richTextToMd(block.code.rich_text);
        md += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
        break;
      }
      case "quote":
        md += `> ${richTextToMd(block.quote.rich_text)}\n\n`;
        break;
      case "callout": {
        const icon = block.callout.icon?.emoji || "💡";
        md += `> ${icon} ${richTextToMd(block.callout.rich_text)}\n\n`;
        break;
      }
      case "divider":
        md += "---\n\n";
        break;
      case "image": {
        const img = block.image;
        const url = img.type === "file" ? img.file.url : img.external?.url;
        const caption =
          img.caption?.map((c) => c.plain_text).join("") || "";
        if (url) {
          images.push({
            url,
            caption,
            placeholder: `__IMG_${images.length}__`,
          });
          md += `![${caption}](__IMG_${images.length - 1}__)\n\n`;
        }
        break;
      }
      case "bookmark":
        md += `[${block.bookmark.url}](${block.bookmark.url})\n\n`;
        break;
      case "equation":
        md += `$$${block.equation?.expression || ""}$$\n\n`;
        break;
      case "column_list":
      case "column":
        break;
      default:
        break;
    }
  }

  return { markdown: md.trim(), images };
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

function escapeLiquid(markdown) {
  return markdown.replace(/(\{\{.*?\}\}|\{%.*?%\})/g, (match) => {
    return `{% raw %}${match}{% endraw %}`;
  });
}

function cleanMarkdown(md) {
  // Remove Notion special characters
  md = md.replace(/[▪︎▫︎◊]/g, "");
  // Fix double bold patterns
  md = md.replace(/\*\*\*\*(\w)/g, "** **$1");
  // Ensure blank line before headings
  md = md.replace(/([^\n])\n(#{2,} )/g, "$1\n\n$2");
  // Clean multiple blank lines
  md = md.replace(/\n{3,}/g, "\n\n");
  // Remove trailing 학습정리 sections
  md = md.replace(/\n*> 💡.*학습정리[\s\S]*$/m, "");
  return md.trim();
}

async function migrateOne(pageInfo, index, total) {
  const { id, title, file, slug, tags, isNew } = pageInfo;

  console.log(`[${index}/${total}] 📝 ${title}`);

  // Extract date from filename
  const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : "2026-02-15";

  // Fetch blocks from Notion
  const blocksWithDepth = await getPageBlocks(id);
  let { markdown, images } = await blocksToMarkdown(blocksWithDepth);

  // Download images
  if (images.length > 0) {
    const imageDir = path.join(IMAGES_BASE, slug);
    await fs.ensureDir(imageDir);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const urlPath = new URL(img.url).pathname;
        const ext = path.extname(urlPath).split("?")[0] || ".png";
        const filename = `${slug}-${i + 1}${ext}`;
        const filepath = path.join(imageDir, filename);
        await downloadImage(img.url, filepath);
        const localPath = `/assets/images/posts/${slug}/${filename}`;
        markdown = markdown.replace(img.placeholder, localPath);
        console.log(`   📷 ${filename}`);
      } catch (err) {
        console.log(`   ⚠️ 이미지 ${i + 1} 실패: ${err.message}`);
        markdown = markdown.replace(
          new RegExp(`!\\[.*?\\]\\(${img.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\n*`),
          ""
        );
      }
    }
  }

  // Clean up and escape
  markdown = cleanMarkdown(markdown);
  markdown = escapeLiquid(markdown);

  // Generate front matter
  const frontMatter = [
    "---",
    `title: "${title}"`,
    `date: ${date}`,
    `categories: [Frontend]`,
    `subcategory: ReactNative`,
    `tags: [${tags.join(", ")}]`,
    `toc: true`,
    `toc_sticky: true`,
    "---",
  ].join("\n");

  const content = `${frontMatter}\n\n${markdown}\n`;
  const filepath = path.join(POSTS_DIR, file);

  await fs.writeFile(filepath, content, "utf-8");
  console.log(
    `   ✅ ${file} (${images.length} images, ${isNew ? "NEW" : "updated"})`
  );

  return file;
}

async function main() {
  console.log("React Native 포스트 마이그레이션 시작\n");

  const results = [];
  for (let i = 0; i < RN_PAGES.length; i++) {
    const result = await migrateOne(RN_PAGES[i], i + 1, RN_PAGES.length);
    if (result) results.push(result);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`완료: ${results.length}개 포스트 업데이트`);
  results.forEach((r) => console.log(`  - ${r}`));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
