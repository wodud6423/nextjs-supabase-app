import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'

// ESLint가 검사하지 않을 경로
const IGNORE_PATTERNS = [
  '.next/**',
  'node_modules/**',
  'public/**',
  'out/**',
  'build/**',
  '*.config.js',
  'commitlint.config.ts',
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // 검사 제외 경로
  { ignores: IGNORE_PATTERNS },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // prettier와 충돌하는 ESLint 포맷 규칙 비활성화 (반드시 마지막)
  ...compat.extends('prettier'),

  {
    rules: {
      // ── TypeScript ──────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error', // any 타입 금지
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ── React ───────────────────────────────────────────────
      'react/self-closing-comp': 'error', // 빈 JSX 태그 자기닫기
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

      // ── Import 정렬 ─────────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // ── 일반 코드 품질 ──────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log 경고
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  {
    // 설정 파일 자체는 any 허용
    files: ['*.config.{js,ts,mjs}', 'postcss.config.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    // shadcn/ui 자동생성 컴포넌트는 규칙 완화
    files: ['components/ui/**/*.tsx'],
    rules: {
      'react/jsx-curly-brace-presence': 'off',
    },
  },
]

export default eslintConfig
