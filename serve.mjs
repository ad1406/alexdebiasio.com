// Preview server: node serve.mjs (or npm run serve) serves dist/ at http://localhost:8080.
// Plain Node, so it works the same on Windows, macOS and Linux.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT) || 8080;
const types = {
	".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
	".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
	".pdf": "application/pdf", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
};

http
	.createServer((req, res) => {
		let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
		let file = path.join(dist, p);
		if (!file.startsWith(dist)) return res.writeHead(403).end();
		if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
		if (!fs.existsSync(file)) return res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
		res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
		fs.createReadStream(file).pipe(res);
	})
	.listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
