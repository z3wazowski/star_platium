# Star Platinum Landing Site

Star Platinum の営業用 landing page を、単一 HTML 草稿から保守しやすい静的プロジェクトとして整理した版です。

## Structure

- `index.html`: 語義化済みマークアップ
- `assets/styles/main.css`: design token、layout、responsive、motion
- `assets/scripts/main.js`: mobile nav、scroll progress、reveal animation、form validation
- `tests/site.test.mjs`: Node 組み込み test による smoke / validation check

## Usage

```bash
npm start
```

`http://localhost:4173` で確認できます。

## Verification

```bash
npm run check:js
npm test
```
