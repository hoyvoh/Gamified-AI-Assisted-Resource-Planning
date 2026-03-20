'use strict'

const path = require('path')

/**
 * lint-staged config for monorepo.
 *
 * UI  (ui/**) — oxfmt → oxlint → eslint
 * BE  (be/**) — ruff format → ruff check
 *
 * File paths passed by lint-staged are absolute; we convert to paths
 * relative to each sub-project so the tools find their configs.
 */
module.exports = {
  // ── Frontend (Next.js) ──────────────────────────────────────────────────
  'ui/**/*.{ts,tsx}': (files) => {
    const uiRoot = path.resolve(__dirname, 'ui')
    const rel = files.map((f) => path.relative(uiRoot, f).replace(/\\/g, '/'))
    return [
      `pnpm --prefix ui exec oxfmt ${rel.join(' ')}`,
      `pnpm --prefix ui exec oxlint --fix ${rel.join(' ')}`,
      `pnpm --prefix ui exec eslint --fix --cache ${rel.join(' ')}`,
    ]
  },

  'ui/**/*.{js,jsx,mjs,cjs}': (files) => {
    const uiRoot = path.resolve(__dirname, 'ui')
    const rel = files.map((f) => path.relative(uiRoot, f).replace(/\\/g, '/'))
    return [`pnpm --prefix ui exec oxlint --fix ${rel.join(' ')}`]
  },

  // ── Backend (FastAPI / Python) ──────────────────────────────────────────
  'be/**/*.py': (files) => {
    const beRoot = path.resolve(__dirname, 'be')
    const rel = files.map((f) => path.relative(beRoot, f).replace(/\\/g, '/'))
    return [
      `uv run --directory be ruff format ${rel.join(' ')}`,
      `uv run --directory be ruff check --fix ${rel.join(' ')}`,
    ]
  },
}
