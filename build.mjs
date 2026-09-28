// Static site generator for alexdebiasio.com
// Reads Markdown pages from content/pages/, renders them with markdown-it (+ KaTeX),
// and writes a static site to dist/. The only client-side JS is a tiny theme toggle.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import texmath from "markdown-it-texmath";
import katex from "katex";

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.join(root, "dist");

/* ----------------------------------------------------------------- config */

const site = {
	title: "Alex De Biasio",
	subtitle: "Mathematics & Computer Science, Williams College",
	url: "https://alexdebiasio.com",
	description:
		"Alex De Biasio, a mathematics and computer science student at Williams College and a pianist.",
	// Main navigation. `id` matches the `nav:` front-matter field of a page.
	nav: [
		{ id: "technical", label: "Technical Work", href: "/technical/" },
		{ id: "mathematics", label: "Mathematics", href: "/mathematics/" },
		{ id: "music", label: "Music", href: "/music/" },
		{ id: "cv", label: "CV", href: "/cv/" },
		{ id: "now", label: "Now", href: "/now/" },
	],
	// Footer links. The email is shown as text so it can be copied.
	email: "ad28@williams.edu",
	social: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/alex-d-32337a183/" }],
};

/* --------------------------------------------------------------- markdown */

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
	.use(anchor, { level: [2, 3] })
	.use(texmath, {
		engine: katex,
		delimiters: "dollars",
		katexOptions: { throwOnError: false },
	});

// Open external links in the same tab but mark them for assistive tech / styling.
const defaultLinkOpen =
	md.renderer.rules.link_open || ((tokens, i, opts, env, self) => self.renderToken(tokens, i, opts));
md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
	const href = tokens[i].attrGet("href") || "";
	if (/^https?:\/\//.test(href) && !href.startsWith(site.url)) tokens[i].attrSet("rel", "noreferrer");
	return defaultLinkOpen(tokens, i, opts, env, self);
};

// Sidenotes: write ^[a note] anywhere in a paragraph. It becomes a numbered note that
// sits in the right margin on wide screens; on phones, tapping the number shows it.
// Brackets inside the note (for links) are fine as long as they are balanced.
function sidenotes(src, page) {
	let out = "";
	let count = 0;
	let i = 0;
	while (i < src.length) {
		const start = src.indexOf("^[", i);
		if (start === -1) break;
		let depth = 0;
		let end = -1;
		for (let j = start + 1; j < src.length; j++) {
			if (src[j] === "[") depth++;
			else if (src[j] === "]" && --depth === 0) {
				end = j;
				break;
			}
			if (src[j] === "\n" && src[j + 1] === "\n") break; // notes stay inside one paragraph
		}
		if (end === -1) {
			out += src.slice(i, start + 2);
			i = start + 2;
			continue;
		}
		const inner = src.slice(start + 2, end).trim();
		const id = `sn-${page}-${++count}`;
		out +=
			src.slice(i, start) +
			`<label for="${id}" class="sn-ref"></label><input type="checkbox" id="${id}" class="sn-toggle"><span class="sidenote">${inner}</span>`;
		i = end + 1;
	}
	return out + src.slice(i);
}

/* ------------------------------------------------------------- templates  */

// The header mark is the times-2 table drawn on a circle: join each point k to 2k (mod n).
// The chords outline a cardioid (see the Mathematics page).
function timesTable(n, m) {
	const pt = (k) => {
		const a = (2 * Math.PI * k) / n - Math.PI / 2;
		return [(50 + 47 * Math.cos(a)).toFixed(2), (50 + 47 * Math.sin(a)).toFixed(2)];
	};
	let lines = "";
	for (let k = 0; k < n; k++) {
		const j = (m * k) % n;
		if (j === k) continue;
		const [x1, y1] = pt(k), [x2, y2] = pt(j);
		lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
	}
	return lines;
}
const MARK = timesTable(60, 2);

// Margin figures: {{circle 100 21 | caption}} draws G(100, 21) in the margin with a caption.
function circleFigures(src) {
	return src.replace(/\{\{circle\s+(\d+)\s+(\d+)\s*\|\s*([^}]*)\}\}/g, (_, n, k, caption) => {
		const width = Number(n) > 150 ? 0.25 : 0.4;
		return `<span class="marginnote figure"><svg viewBox="-2 -2 104 104" width="170" height="170" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" role="img" aria-label="Modular multiplication circle with n = ${n}, k = ${k}"><circle cx="50" cy="50" r="47" stroke-width="0.6"/>${timesTable(Number(n), Number(k))}</svg>${caption.trim()}</span>`;
	});
}
const cardioidMark = (size) =>
	`<svg class="mark" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" aria-hidden="true"><circle cx="50" cy="50" r="47"/>${MARK}</svg>`;

const esc = (s = "") =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONTS =
	"https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&display=swap";

function layout({ title, current, math = false, body, description, pagePath }) {
	const navHtml = site.nav
		.map(
			(n) =>
				`<a href="${n.href}"${n.id === current ? ' class="here" aria-current="page"' : ""}>${n.label}</a>`
		)
		.join("\n\t\t\t");
	const canonical = site.url + pagePath;
	const head = [
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1">',
		`<title>${esc(title)}</title>`,
		`<meta name="description" content="${esc(description || site.description)}">`,
		`<link rel="canonical" href="${canonical}">`,
		`<meta property="og:title" content="${esc(title)}">`,
		`<meta property="og:description" content="${esc(description || site.description)}">`,
		`<meta property="og:url" content="${canonical}">`,
		`<meta property="og:image" content="${site.url}/images/profile.jpg">`,
		'<meta property="og:type" content="website">',
		'<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
		'<link rel="preconnect" href="https://fonts.googleapis.com">',
		'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
		`<link rel="stylesheet" href="${FONTS}">`,
		'<link rel="stylesheet" href="/styles.css">',
		math ? '<link rel="stylesheet" href="/assets/katex/katex.min.css">' : "",
		// Set the theme before the page paints, so dark mode doesn't flash white.
		`<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})()</script>`,
	]
		.filter(Boolean)
		.join("\n\t");

	return `<!doctype html>
<html lang="en" data-theme="light">
<head>
	${head}
</head>
<body>
<div class="page">
	<header class="top">
		<a class="brand" href="/" aria-label="Alex De Biasio, home">
			${cardioidMark(50)}
			<span class="brand-text">
				<span class="nm">${site.title}</span>
				<span class="sub">${esc(site.subtitle)}</span>
			</span>
		</a>
		<button id="theme-toggle" type="button" aria-label="Switch between light and dark mode">
			<svg class="i-moon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
			<svg class="i-sun" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.1"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
		</button>
	</header>

	<nav class="primary" aria-label="Main">
			${navHtml}
	</nav>

	<main>
${body}
	</main>

	<footer>
		<span>${esc(site.email)}</span>
		${site.social.map((s) => `<a href="${s.href}" rel="noreferrer">${s.label}</a>`).join("\n\t\t")}
		<span>&copy; ${new Date().getFullYear()} Alex De Biasio</span>
	</footer>
</div>
<script>
document.getElementById('theme-toggle').addEventListener('click', function () {
	var r = document.documentElement, t = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
	r.setAttribute('data-theme', t);
	try { localStorage.setItem('theme', t); } catch (e) {}
});
</script>
</body>
</html>
`;
}

/* --------------------------------------------------------------- helpers  */

function write(rel, content) {
	const file = path.join(OUT, rel);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}
function copyDir(src, dest) {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const s = path.join(src, entry.name), d = path.join(dest, entry.name);
		if (entry.isDirectory()) copyDir(s, d);
		else fs.copyFileSync(s, d);
	}
}

/* ----------------------------------------------------------------- build  */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Every Markdown file in content/pages/ becomes one page. The URL comes from the
// `path:` front-matter field, or else from the filename (music.md -> /music/).
const pagesDir = path.join(root, "content/pages");
const pages = fs
	.readdirSync(pagesDir)
	.filter((f) => f.endsWith(".md"))
	.map((f) => {
		const { data, content } = matter(fs.readFileSync(path.join(pagesDir, f), "utf8"));
		const slug = f.replace(/\.md$/, "");
		const pagePath = data.path || (slug === "home" ? "/" : `/${slug}/`);
		return { file: f, data, pagePath, html: md.render(circleFigures(sidenotes(content, slug))) };
	});

for (const p of pages) {
	const isHome = p.pagePath === "/";
	const title = isHome ? `${site.title}` : `${p.data.title} — ${site.title}`;
	const body = `\t<article class="prose${isHome ? " home" : ""}">
${p.html}
	</article>`;
	const rel = p.pagePath === "/" ? "index.html" : path.join(p.pagePath, "index.html");
	write(
		rel,
		layout({
			title,
			current: p.data.nav || null,
			math: !!p.data.math,
			body,
			description: p.data.description,
			pagePath: p.pagePath,
		})
	);
}

// Static assets → dist root
copyDir(path.join(root, "assets"), OUT);

// KaTeX stylesheet + fonts, only needed by pages with `math: true`
const katexDist = path.join(root, "node_modules/katex/dist");
if (pages.some((p) => p.data.math) && fs.existsSync(katexDist)) {
	fs.mkdirSync(path.join(OUT, "assets/katex"), { recursive: true });
	fs.copyFileSync(path.join(katexDist, "katex.min.css"), path.join(OUT, "assets/katex/katex.min.css"));
	copyDir(path.join(katexDist, "fonts"), path.join(OUT, "assets/katex/fonts"));
}

console.log(`Built ${pages.length} pages -> ${path.relative(root, OUT) || OUT}`);
