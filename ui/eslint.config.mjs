import { FlatCompat } from '@eslint/eslintrc'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      '.next-phase1/**',
      'debug/**',
      'node_modules/**',
      'playwright-artifacts/**',
      'test-results/**',
      'tmp/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  skipFormatting,
  {
    rules: {
      'no-console': 'warn',
    },
  },
]

export default config
