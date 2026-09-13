import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

async function servePortfolio() {
  const server = createServer(async (request, response) => {
    const paths = new Map([
      ["/", ["index.html", "text/html; charset=utf-8"]],
      ["/assets/max-wordmark.png", ["assets/max-wordmark.png", "image/png"]],
      ["/assets/tg-type-mark.svg", ["assets/tg-type-mark.svg", "image/svg+xml"]],
      ["/assets/ai-123-mark.svg", ["assets/ai-123-mark.svg", "image/svg+xml"]],
    ]);
    const entry = paths.get(request.url);
    if (!entry) {
      response.writeHead(404).end();
      return;
    }

    try {
      const file = await readFile(entry[0]);
      response.writeHead(200, { "content-type": entry[1] }).end(file);
    } catch {
      response.writeHead(404).end();
    }
  });

  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return server;
}

test("serves Max's Chinese portfolio landing page", async t => {
  const server = await servePortfolio();
  t.after(() => server.close());
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/`);
  const page = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  assert.match(page, /<img src="assets\/max-wordmark\.png"[^>]*alt="Max Wang 水墨倒影字標"/);
  assert.match(page, /https:\/\/www\.cake\.me\/resumes\/s724959099/);
  assert.match(page, /https:\/\/github\.com\/s724959099/);
  assert.match(page, /https:\/\/www\.instagram\.com\/583_maxwang\//);
  assert.match(page, /TransglobalUS/);
  assert.match(page, /<h2 id="experience-title">Experience<\/h2>/);
  assert.match(page, /<h2 id="projects-title">Side projects<\/h2>/);
  assert.doesNotMatch(page, /latest first|authored systems|six groups/);
  assert.doesNotMatch(page, /輔英科技大學/);
  assert.doesNotMatch(page, /為什麼拆開/);
  assert.doesNotMatch(page, /Principal Engineer \/ Tech Lead/);
  assert.match(page, /<h1 id="about-title">王博生 Max Wang<\/h1>/);
  assert.doesNotMatch(page, /Proof ·/);
  assert.match(page, /<h3>TG-Type<\/h3>[\s\S]*?<ul class="project__points">[\s\S]*?macOS Vision[\s\S]*?每 6 小時掃一次/);
  assert.match(page, /<div class="project__title"><h3>TG-Type<\/h3><span class="project__mark"><img src="assets\/tg-type-mark\.svg"[^>]*alt="TG-Type 標誌"/);
  assert.doesNotMatch(page, /Quartz HID/);
  assert.match(page, /<h3>OMP<\/h3>[\s\S]*?omp-home[\s\S]*?cmux-console[\s\S]*?omp-memory/);
  assert.doesNotMatch(page, /D1–D8|subagent 覆蓋矩陣|每 12 小時/);
  assert.match(page, /<h3>Kodama<\/h3>[\s\S]*?身份代理[\s\S]*?專案記憶/);
  assert.match(page, /<h3>AI 123<\/h3><span class="project__mark"><img src="assets\/ai-123-mark\.svg"[^>]*alt="AI 123 標誌"/);
  assert.match(page, /個人 Jarvis/);
  assert.doesNotMatch(page, /眼動追蹤/);

  const wordmark = await fetch(`http://127.0.0.1:${port}/assets/max-wordmark.png`);
  assert.equal(wordmark.status, 200);
  assert.equal(wordmark.headers.get("content-type"), "image/png");
  assert.ok((await wordmark.arrayBuffer()).byteLength > 10_000);

  const mark = await fetch(`http://127.0.0.1:${port}/assets/tg-type-mark.svg`);
  assert.equal(mark.status, 200);
  assert.match(await mark.text(), /<svg[\s\S]*<\/svg>/);
});
