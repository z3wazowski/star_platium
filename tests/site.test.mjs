import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(projectRoot, "assets/styles/main.css"), "utf8");

test("landing page wires local assets and key sections", () => {
  assert.match(html, /assets\/styles\/main\.css/);
  assert.match(html, /assets\/scripts\/main\.js/);
  assert.match(html, /assets\/media\/hero-background\.mp4/);
  assert.match(html, /assets\/media\/operations-background\.mp4/);
  assert.match(html, /id="technology"/);
  assert.match(html, /id="cases"/);
  assert.match(html, /data-contact-form/);
  assert.match(html, /dialog/);
  assert.match(html, /2700\+ 回線実績/);
  assert.match(html, /全自動遠隔保守/);
  assert.match(html, /企業向け配線構成/);
});

test("css defines tokens and reduced-motion support", () => {
  assert.match(css, /--ink-950/);
  assert.match(css, /--signal-cyan/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /scroll-padding-top/);
  assert.match(css, /\.network-stage__video/);
  assert.match(css, /\.section--dark__video/);
  assert.match(css, /\.stack-lane/);
  assert.match(css, /\.signal-card__badge/);
});

test("video assets exist in the project", () => {
  assert.equal(fs.existsSync(path.join(projectRoot, "assets/media/hero-background.mp4")), true);
  assert.equal(fs.existsSync(path.join(projectRoot, "assets/media/operations-background.mp4")), true);
});

test("validation helpers handle happy path and error path", async () => {
  globalThis.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    documentElement: { scrollHeight: 0 },
  };
  globalThis.window = {
    innerHeight: 0,
    scrollY: 0,
    matchMedia: () => ({ matches: true }),
    addEventListener: () => {},
  };

  const moduleUrl = pathToFileURL(path.join(projectRoot, "assets/scripts/main.js")).href;
  const { getFieldError, validateEntries } = await import(moduleUrl);

  assert.equal(
    getFieldError({
      name: "メールアドレス",
      value: "owner@example.com",
      required: true,
      type: "email",
    }),
    "",
  );

  assert.equal(
    getFieldError({
      name: "メールアドレス",
      value: "owner.example.com",
      required: true,
      type: "email",
    }),
    "メールアドレスの形式を確認してください。",
  );

  const results = validateEntries([
    { name: "会社名", value: "", required: true, type: "text" },
    { name: "相談内容", value: "既存物件の改修を相談したい", required: true, type: "text" },
  ]);

  assert.equal(results[0].error, "会社名を入力してください。");
  assert.equal(results[1].error, "");
});
