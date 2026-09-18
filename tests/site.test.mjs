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
      ["/assets/ai-health-mark.svg", ["assets/ai-health-mark.svg", "image/svg+xml"]],
      ["/assets/max-type-mark.png", ["assets/max-type-mark.png", "image/png"]],
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
  assert.match(page, /<h3>TG-Type<\/h3>[\s\S]*?<ul class="project__points">[\s\S]*?畫面上的字[\s\S]*?常用詞庫/);
  assert.match(page, /<div class="project__title"><h3>TG-Type<\/h3><span class="project__mark"><img src="assets\/tg-type-mark\.svg"[^>]*alt="TG-Type 標誌"/);
  assert.doesNotMatch(page, /Quartz HID/);
  assert.match(page, /<h3>OMP<\/h3>[\s\S]*?harness[\s\S]*?我的分身[\s\S]*?靠關卡/);
  assert.doesNotMatch(page, /omp-home|cmux-console|omp-memory|D1–D8|每 4 秒|59 個|一千多次/);
  assert.match(page, /<h3>Kodama<\/h3>[\s\S]*?Discord[\s\S]*?同一份記憶[\s\S]*?我自己定的/);
  assert.doesNotMatch(page, /BM25|身份代理/);
  assert.match(page, /<h3>AI 123<\/h3><span class="project__mark"><img src="assets\/ai-123-mark\.svg"[^>]*alt="AI 123 標誌"/);
  assert.match(page, /個人 Jarvis[\s\S]*?切換 App[\s\S]*?螢幕上的內容/);
  assert.doesNotMatch(page, /眼動追蹤|24kHz/);
  assert.match(page, /<h3>AI Health<\/h3><span class="project__mark"><img src="assets\/ai-health-mark\.svg"[^>]*alt="AI Health 標誌"/);
  assert.match(page, /個人健身教練[\s\S]*?衛福部的食品營養成分資料庫[\s\S]*?基礎代謝[\s\S]*?找附近有什麼能吃/);
  assert.doesNotMatch(page, /條碼|智慧戒指|抽血報告/);
  assert.match(page, /<h3>max-type<\/h3><span class="project__mark"><img src="assets\/max-type-mark\.png"[^>]*alt="max-type 標誌"/);
  assert.match(page, /中英文不用切換[\s\S]*?只打聲母[\s\S]*?越用越準/);
  assert.doesNotMatch(page, /InputMethodKit|假設|音節約束/);

  const maxTypeMark = await fetch(`http://127.0.0.1:${port}/assets/max-type-mark.png`);
  assert.equal(maxTypeMark.status, 200);
  assert.equal(maxTypeMark.headers.get("content-type"), "image/png");
  assert.ok((await maxTypeMark.arrayBuffer()).byteLength > 10_000);

  const wordmark = await fetch(`http://127.0.0.1:${port}/assets/max-wordmark.png`);
  assert.equal(wordmark.status, 200);
  assert.equal(wordmark.headers.get("content-type"), "image/png");
  assert.ok((await wordmark.arrayBuffer()).byteLength > 10_000);

  const mark = await fetch(`http://127.0.0.1:${port}/assets/tg-type-mark.svg`);
  assert.equal(mark.status, 200);
  assert.match(await mark.text(), /<svg[\s\S]*<\/svg>/);
});
