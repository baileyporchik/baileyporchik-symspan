# Symmetry Span Demo

This repository contains a small browser demo for the Symmetry Span utilities from the pasted JavaScript.

## Run locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Files

- `index.html` — page layout
- `app.js` — Symmetry Span logic and demo interactions
- `styles.css` — styling for the grid demo

This is intentionally a lightweight static app to make the code easy to test in a browser.

## Notes

The original code exposes `window.SymmetrySpan`, and this repo includes a working demo page that renders example symmetry and memory grids.

## Example usage

```js
const grid = SymmetrySpan.generateSymmetryGrid(true);
const html = SymmetrySpan.renderSymmetryGrid(grid);
console.log(html);
```

If you want, the next step can be turning this into a full interactive task game with button-based recall capture and scoring.

---

This project was created in the repository `baileyporchik/baileyporchik-symspan`.
