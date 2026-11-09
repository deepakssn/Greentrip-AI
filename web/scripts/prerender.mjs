import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const { render } = await import(pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href);
const htmlPath = resolve(root, "dist/index.html");
let html = readFileSync(htmlPath, "utf8");
const rendered = render("/");
const preloads = [...rendered.matchAll(/<link rel="preload"[^>]*>/g)].map((match) => match[0]);
const appHtml = rendered.replace(/<link rel="preload"[^>]*>/g, "");
const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  throw new Error("prerender: root marker missing from dist/index.html");
}
if (preloads.length) {
  html = html.replace("</head>", `    ${preloads.join("\n    ")}\n  </head>`);
}
const cssName = readdirSync(resolve(root, "dist/assets")).find((name) => name.endsWith(".css"));
if (!cssName) throw new Error("prerender: built CSS not found");
const css = readFileSync(resolve(root, "dist/assets", cssName), "utf8").replace(/<\/style/gi, "<\\/style");
if (!html.includes('rel="stylesheet"')) throw new Error("prerender: stylesheet link missing");
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
writeFileSync(htmlPath, html.replace(marker, `<div id="root">${appHtml}</div>`));
console.log("prerendered / into dist/index.html");
