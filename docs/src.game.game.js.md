# src/game/game.js.md

## 目的
- ゲーム全体（初期化/更新/描画/破棄）を統括する。

## 主処理
- `start`: シーン準備、入力登録、ループ開始。
- `update`: プレイヤー更新、敵AI更新、射撃処理。
- `publishState`: HUD向け状態通知。
- `dispose`: イベント・レンダラー解放。
