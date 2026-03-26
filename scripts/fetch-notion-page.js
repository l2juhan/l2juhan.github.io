#!/usr/bin/env node
/**
 * Notion 페이지를 Markdown으로 변환하여 출력합니다.
 *
 * Usage:
 *   node scripts/fetch-notion-page.js <page-id-or-title>
 *   node scripts/fetch-notion-page.js --list <parent-page-id>
 *
 * Output: JSON { title, markdown, images: [{url, caption, position}] }
 */
require("dotenv").config();
const { Client } = require("@notionhq/client");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const http = require("http");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

let lastReq = 0;
async function rateLimited(fn) {
  const now = Date.now();
  const wait = Math.max(0, 350 - (now - lastReq));
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

async function blockToMarkdown(block, indent = "") {
  const type = block.type;
  let md = "";
  let images = [];

  switch (type) {
    case "paragraph":
      md = indent + richTextToMd(block.paragraph.rich_text);
      break;
    case "heading_1":
      md = `## ${richTextToMd(block.heading_1.rich_text)}`;
      break;
    case "heading_2":
      md = `### ${richTextToMd(block.heading_2.rich_text)}`;
      break;
    case "heading_3":
      md = `#### ${richTextToMd(block.heading_3.rich_text)}`;
      break;
    case "bulleted_list_item":
      md = `${indent}- ${richTextToMd(block.bulleted_list_item.rich_text)}`;
      break;
    case "numbered_list_item":
      md = `${indent}1. ${richTextToMd(block.numbered_list_item.rich_text)}`;
      break;
    case "to_do":
      const checked = block.to_do.checked ? "x" : " ";
      md = `${indent}- [${checked}] ${richTextToMd(block.to_do.rich_text)}`;
      break;
    case "toggle":
      md = `<details><summary>${richTextToMd(block.toggle.rich_text)}</summary>\n`;
      break;
    case "code":
      const lang = block.code.language || "";
      const code = richTextToMd(block.code.rich_text);
      md = `\`\`\`${lang}\n${code}\n\`\`\``;
      break;
    case "quote":
      md = `> ${richTextToMd(block.quote.rich_text)}`;
      break;
    case "callout":
      const icon = block.callout.icon?.emoji || "💡";
      md = `> ${icon} ${richTextToMd(block.callout.rich_text)}`;
      break;
    case "divider":
      md = "---";
      break;
    case "image": {
      const img = block.image;
      const url = img.type === "file" ? img.file.url : img.external?.url;
      const caption = img.caption?.map((c) => c.plain_text).join("") || "";
      if (url) {
        images.push({ url, caption });
        md = `![${caption}](${url})`;
      }
      break;
    }
    case "table": {
      // Will be handled with children
      md = ""; // placeholder, filled by children
      break;
    }
    case "table_row": {
      const cells = block.table_row.cells.map((cell) =>
        cell.map((c) => c.plain_text).join("")
      );
      md = `| ${cells.join(" | ")} |`;
      break;
    }
    case "bookmark":
      const bmUrl = block.bookmark.url || "";
      md = `[${bmUrl}](${bmUrl})`;
      break;
    case "embed":
      md = block.embed?.url ? `[Embed](${block.embed.url})` : "";
      break;
    case "equation":
      md = `$$${block.equation?.expression || ""}$$`;
      break;
    case "column_list":
    case "column":
      // Just process children
      break;
    default:
      // Skip unsupported block types
      break;
  }

  return { md, images };
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

async function pageToMarkdown(pageId) {
  const blocksWithDepth = await getPageBlocks(pageId);

  let markdown = "";
  let images = [];
  let inTable = false;
  let tableHeaderDone = false;
  let tableCols = 0;

  for (const { block, depth } of blocksWithDepth) {
    const indent = "  ".repeat(Math.max(0, depth - (block.type.includes("list") ? 0 : 0)));

    // Handle table rows
    if (block.type === "table") {
      inTable = true;
      tableHeaderDone = false;
      tableCols = block.table?.table_width || 0;
      continue;
    }

    if (block.type === "table_row") {
      const { md } = await blockToMarkdown(block, indent);
      markdown += md + "\n";
      if (inTable && !tableHeaderDone) {
        markdown += `| ${Array(tableCols).fill("---").join(" | ")} |\n`;
        tableHeaderDone = true;
      }
      continue;
    } else {
      inTable = false;
    }

    const { md, images: blockImages } = await blockToMarkdown(block, indent);
    images.push(...blockImages);

    if (md) {
      markdown += md + "\n\n";
    }

    // Handle toggle close
    if (block.type === "toggle" && block.has_children) {
      // Children are already processed recursively
      markdown += "</details>\n\n";
    }
  }

  return { markdown: markdown.trim(), images };
}

function extractTitle(properties) {
  for (const key of ["제목", "Title", "이름", "Name"]) {
    const prop = properties[key];
    if (prop && prop.type === "title" && prop.title) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  return "Untitled";
}

async function findPageByTitle(title) {
  const res = await rateLimited(() =>
    notion.search({
      query: title,
      filter: { property: "object", value: "page" },
      page_size: 5,
    })
  );
  for (const page of res.results) {
    const pageTitle = extractTitle(page.properties);
    if (pageTitle.includes(title) || title.includes(pageTitle)) {
      return page;
    }
  }
  return res.results[0] || null;
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

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--list") {
    // List child pages of a parent
    const parentId = args[1];
    const blocks = await rateLimited(() =>
      notion.blocks.children.list({ block_id: parentId, page_size: 100 })
    );
    for (const block of blocks.results) {
      if (block.type === "child_page") {
        console.log(`${block.id} | ${block.child_page.title}`);
      }
      if (block.type === "child_database") {
        console.log(`[DB] ${block.id} | ${block.child_database.title}`);
      }
    }
    return;
  }

  if (args.length === 0) {
    console.error("Usage: node fetch-notion-page.js <page-id-or-title> [--slug slug] [--download]");
    process.exit(1);
  }

  const input = args[0];
  const slugArg = args.indexOf("--slug") !== -1 ? args[args.indexOf("--slug") + 1] : null;
  const shouldDownload = args.includes("--download");

  // Find page
  let page;
  if (input.match(/^[a-f0-9-]{32,36}$/)) {
    page = await rateLimited(() => notion.pages.retrieve({ page_id: input }));
  } else {
    page = await findPageByTitle(input);
  }

  if (!page) {
    console.error("Page not found:", input);
    process.exit(1);
  }

  const title = extractTitle(page.properties);
  console.error(`Found: ${title} (${page.id})`);

  // Convert to markdown
  const { markdown, images } = await pageToMarkdown(page.id);

  // Download images if requested
  if (shouldDownload && images.length > 0) {
    const slug = slugArg || title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().replace(/-+/g, "-").replace(/^-|-$/g, "");
    const imageDir = path.join(__dirname, "..", "assets", "images", "posts", slug);
    await fs.ensureDir(imageDir);

    let processed = markdown;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = path.extname(new URL(img.url).pathname).split("?")[0] || ".png";
      const filename = `${slug}-${i + 1}${ext}`;
      const filepath = path.join(imageDir, filename);

      try {
        await downloadImage(img.url, filepath);
        const localPath = `/assets/images/posts/${slug}/${filename}`;
        processed = processed.replace(
          `![${img.caption}](${img.url})`,
          `![${img.caption || title}](${localPath})`
        );
        console.error(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download image ${i + 1}: ${err.message}`);
      }
    }

    // Output the processed markdown with local image paths
    console.log(JSON.stringify({ title, markdown: processed, imageCount: images.length }));
  } else {
    console.log(JSON.stringify({ title, markdown, imageCount: images.length }));
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
