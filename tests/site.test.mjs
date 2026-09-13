import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

async function servePortfolio() {
  const server = createServer(async (request, response) => {
    const paths = new Map([
      ["/", ["index.html", "text/html; charset=utf-8"]],
      ["/assets/max-wordmark.png", ["assets/max-wordmark.png", "image/png"]],
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
  assert.match(page, /<h3>TG-Type<\/h3>[\s\S]*?<ul class="project__points">[\s\S]*?MLX Whisper/);

  const wordmark = await fetch(`http://127.0.0.1:${port}/assets/max-wordmark.png`);
  assert.equal(wordmark.status, 200);
  assert.equal(wordmark.headers.get("content-type"), "image/png");
  assert.ok((await wordmark.arrayBuffer()).byteLength > 10_000);
});
