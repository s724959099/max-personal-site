import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

async function servePortfolio() {
  const server = createServer(async (request, response) => {
    if (request.url !== "/") {
      response.writeHead(404).end();
      return;
    }

    try {
      const page = await readFile("index.html");
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page);
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
  assert.match(page, /aria-label="Max Wang 水墨倒影字標"/);
  assert.match(page, /https:\/\/www\.cake\.me\/resumes\/s724959099/);
  assert.match(page, /https:\/\/github\.com\/s724959099/);
  assert.match(page, /https:\/\/www\.instagram\.com\/583_maxwang\//);
  assert.match(page, /TransglobalUS/);
  assert.match(page, /Experience index/);
  assert.match(page, /Side projects index/);
});
