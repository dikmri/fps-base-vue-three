# FPSベースゲーム（Vue.js + Three.js）

## 概要
- Vue.js（Options API）と Three.js で実装したシンプルFPSベースです。
- 武器はマグナム1種です。
- ダメージ仕様は「頭=100、胴体=50、その他=20」です。

## 起動方法
1. 依存インストール
   - `npm.cmd install`
2. 開発サーバ起動
   - `npm.cmd run dev`
3. ブラウザで `http://localhost:5173` を開く

## 操作方法
- 移動: `W` `A` `S` `D`
- ジャンプ: `Space`
- 視点: マウス（ポインタロック中）
- 射撃: 左クリック
- ポインタロック: 画面クリック
- 解除: `Esc`

## テスト
- ロジックテスト: `npm.cmd test`
- 型チェック: `npm.cmd run typecheck`
