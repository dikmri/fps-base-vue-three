# tsconfig.json.md

## 目的
- JavaScript + JSDoc の型チェックを有効にする。

## 設定
- `allowJs`, `checkJs`: JSの型検証を有効化。
- `moduleResolution: Bundler`: Vite 構成に合わせる。
- `types: ["node"]`: Node実行テスト向け型を有効化。
- `skipLibCheck`: 外部ライブラリ型定義の過剰エラーを回避。
- `include`: `src/game/**/*.js`, `tests/**/*.js`, `vite.config.js` を対象にする。
