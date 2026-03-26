#!/usr/bin/env node
/**
 * AWS Cloud Practitioner Certification 페이지들을 블로그 포스트로 변환
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

// CLF pages from Notion (exclude 00. index and 덤프 문제 오답노트)
const CLF_PAGES = [
  { id: "257b508e-2f68-808d-97ce-ff0c042d5b1b", title: "[AWS] Computing" },
  { id: "257b508e-2f68-80cc-848f-ece6fcbaeb8b", title: "[AWS] Elastic Compute Cloud (EC2)" },
  { id: "257b508e-2f68-80dd-9113-eb5ce519338d", title: "[AWS] IAM" },
  { id: "257b508e-2f68-807e-99ac-ecff2178a81a", title: "[AWS] Simple Storage Service(S3)" },
  { id: "257b508e-2f68-80bf-9d2a-e71b108a1e86", title: "[AWS] DataBase" },
  { id: "257b508e-2f68-80e1-8b1d-d9b437e769dc", title: "[AWS] Load Balancer&Auto Scaling Group" },
  { id: "258b508e-2f68-8064-a155-dd2d944e86a0", title: "[AWS] Deployments & Global Infra" },
  { id: "258b508e-2f68-809b-b5a1-e02fd908b88a", title: "[AWS] Integration" },
  { id: "258b508e-2f68-8016-b7d7-ecece4ef0afd", title: "[AWS] Data Analytics" },
  { id: "262b508e-2f68-806a-b3d7-de1d5f60e49a", title: "[AWS] AWS 인공지능(AI) & 머신러닝(ML) 서비스" },
  { id: "262b508e-2f68-8033-9095-e71c217f6e9e", title: "[AWS] AWS 보안 서비스 총정리" },
  { id: "262b508e-2f68-80fa-8247-ff976704ec2a", title: "[AWS] AWS Well-Architected Framework" },
  { id: "262b508e-2f68-801b-a55d-e810c8ed826d", title: "[AWS] AWS 클라우드 도입 프레임워크 (CAF)" },
  { id: "262b508e-2f68-8087-ab25-edf9fe488bd0", title: "덤프 문제 오답노트지" },
  { id: "263b508e-2f68-80be-8c08-f504378e2ca9", title: "[AWS] AWS 비용 관리 3대 도구" },
  { id: "267b508e-2f68-8068-bec3-de8b44c79d18", title: "[AWS] AWS Billing Console" },
  { id: "262b508e-2f68-80f0-8cf2-ff616eb884f8", title: "[AWS] AWS Support Plan" },
];

// Skip these
const SKIP_TITLES = ["00.", "덤프 문제 오답노트지"];

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
        if (block.has_children && block.type !== "child_page" && block.type !== "child_database") {
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
      case "bulleted_list_item":
        md += `- ${richTextToMd(block.bulleted_list_item.rich_text)}\n`;
        break;
      case "numbered_list_item":
        md += `1. ${richTextToMd(block.numbered_list_item.rich_text)}\n`;
        break;
      case "to_do": {
        const checked = block.to_do.checked ? "x" : " ";
        md += `- [${checked}] ${richTextToMd(block.to_do.rich_text)}\n`;
        break;
      }
      case "toggle":
        md += `<details><summary>${richTextToMd(block.toggle.rich_text)}</summary>\n\n`;
        // children already included via recursion
        if (block.has_children) {
          // close will be added after children
        }
        break;
      case "code": {
        const lang = block.code.language === "plain text" ? "" : block.code.language || "";
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
        const caption = img.caption?.map((c) => c.plain_text).join("") || "";
        if (url) {
          images.push({ url, caption, placeholder: `__IMG_${images.length}__` });
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

function makeSlug(title) {
  return title
    .replace(/^\[AWS\]\s*/i, "aws-clf-")
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on("finish", () => { stream.close(); resolve(); });
        stream.on("error", reject);
      })
      .on("error", reject);
  });
}

function escapeLiquid(markdown) {
  // Wrap {{ }} and {% %} in code blocks with raw tags
  return markdown.replace(/(\{\{.*?\}\}|\{%.*?%\})/g, (match) => {
    return `{% raw %}${match}{% endraw %}`;
  });
}

function generateTags(title) {
  const tags = ["aws", "clf", "cloud-practitioner"];
  const lower = title.toLowerCase();
  if (lower.includes("ec2") || lower.includes("computing")) tags.push("ec2");
  if (lower.includes("s3") || lower.includes("storage")) tags.push("s3");
  if (lower.includes("iam")) tags.push("iam");
  if (lower.includes("database") || lower.includes("db")) tags.push("database");
  if (lower.includes("load balancer") || lower.includes("auto scaling")) tags.push("elb", "auto-scaling");
  if (lower.includes("deploy") || lower.includes("global")) tags.push("deployment");
  if (lower.includes("integration")) tags.push("sqs", "sns");
  if (lower.includes("analytics")) tags.push("analytics");
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("머신러닝")) tags.push("ai", "ml");
  if (lower.includes("보안") || lower.includes("security")) tags.push("security");
  if (lower.includes("well-architected")) tags.push("well-architected");
  if (lower.includes("caf") || lower.includes("도입 프레임워크")) tags.push("caf");
  if (lower.includes("비용") || lower.includes("billing") || lower.includes("cost")) tags.push("cost-management");
  if (lower.includes("support")) tags.push("support-plan");
  return [...new Set(tags)];
}

async function migrateOne(pageInfo, index, total) {
  const { id, title } = pageInfo;

  if (SKIP_TITLES.some((s) => title.startsWith(s))) {
    console.log(`[${index}/${total}] ⏭ 건너뜀: ${title}`);
    return null;
  }

  console.log(`[${index}/${total}] 📝 ${title}`);

  const slug = makeSlug(title);
  const date = new Date().toISOString().split("T")[0];
  const tags = generateTags(title);

  // Clean title for blog
  const blogTitle = title
    .replace(/^\[AWS\]\s*/, "")
    .replace(/\s+$/, "")
    .trim();

  // Fetch blocks
  const blocksWithDepth = await getPageBlocks(id);
  let { markdown, images } = await blocksToMarkdown(blocksWithDepth);

  // Download images
  if (images.length > 0) {
    const imageDir = path.join(IMAGES_BASE, slug);
    await fs.ensureDir(imageDir);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const ext = path.extname(new URL(img.url).pathname).split("?")[0] || ".png";
        const filename = `${slug}-${i + 1}${ext}`;
        const filepath = path.join(imageDir, filename);
        await downloadImage(img.url, filepath);
        const localPath = `/assets/images/posts/${slug}/${filename}`;
        markdown = markdown.replace(img.placeholder, localPath);
        console.log(`   📷 ${filename}`);
      } catch (err) {
        console.log(`   ⚠️ 이미지 ${i + 1} 실패: ${err.message}`);
        markdown = markdown.replace(`![${img.caption}](${img.placeholder})`, "");
      }
    }
  }

  // Escape Liquid syntax
  markdown = escapeLiquid(markdown);

  // Clean up multiple blank lines
  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  // Generate front matter
  const frontMatter = [
    "---",
    `title: "AWS CLF — ${blogTitle}"`,
    `date: ${date}`,
    `categories: [Cloud]`,
    `subcategory: AWS-CLF`,
    `tags: [${tags.join(", ")}]`,
    `toc: true`,
    `toc_sticky: true`,
    "---",
  ].join("\n");

  const content = `${frontMatter}\n\n${markdown}\n`;
  const filename = `${date}-${slug}.md`;
  const filepath = path.join(POSTS_DIR, filename);

  await fs.writeFile(filepath, content, "utf-8");
  console.log(`   ✅ ${filename}`);

  return filename;
}

async function main() {
  console.log("AWS CLF 포스트 마이그레이션 시작\n");

  const results = [];
  for (let i = 0; i < CLF_PAGES.length; i++) {
    const result = await migrateOne(CLF_PAGES[i], i + 1, CLF_PAGES.length);
    if (result) results.push(result);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`완료: ${results.length}개 포스트 생성`);
  results.forEach((r) => console.log(`  - ${r}`));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
