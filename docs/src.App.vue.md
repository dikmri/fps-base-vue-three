# src/App.vue.md

## 目的
- Options API で HUD とゲーム表示領域を管理する。

## 主処理
- `mounted`: `FpsGame` を作成して開始。
- `beforeUnmount`: ゲームループとイベントを解放。
- `lockPointer`: クリックでポインタロックを要求。

## 表示
- 固定クロスヘア（カメラ中心）。
- HP と敵残数表示。
