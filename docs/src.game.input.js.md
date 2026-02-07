# src/game/input.js.md

## 目的
- キー/マウス/ポインタロック入力を管理する。

## 主処理
- `attach`/`detach` でイベント管理。
- `consumePressed` と `consumeLookDelta` でフレーム消費型入力を提供。
