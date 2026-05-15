import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 이모지(유니코드 또는 :alias:)가 앞에 올 수 있는 헤더 패턴
      // 예: "✨ feat: 기능 추가", "feat: 기능 추가" 모두 허용
      headerPattern:
        /^(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s)?(\w+)(?:\((\w+)\))?: (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'ci',
        'build',
        'wip',
      ],
    ],
    'header-max-length': [2, 'always', 120],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    // 한국어 커밋 subject 허용
    'subject-case': [0],
    // type 대소문자 허용
    'type-case': [0],
  },
}

export default config
