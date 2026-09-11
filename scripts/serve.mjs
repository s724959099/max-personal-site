import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";

const port = Number(process.env.PORT ?? 4173);
const root = process.cwd();
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const path = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);

  if (!path.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const file = await stat(path);
    if (!file.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "content-type": contentTypes.get(extname(path)) ?? "application/octet-stream" });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}/`);
});
