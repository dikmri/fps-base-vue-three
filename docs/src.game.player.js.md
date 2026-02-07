# src/game/player.js.md

## 目的
- プレイヤー移動、ジャンプ、カメラ姿勢を管理する。

## 主処理
- WASD 移動（Three.js カメラ前方と同期、壁衝突あり）。
- Space ジャンプ（重力適用）。
- マウス視点（yaw/pitch）。
- `applyToCamera` で Three カメラへ反映。

## 改修メモ
- `computeForwardVector` / `computeRightVector` / `computeWishVelocity` を追加し、入力方向計算を明示化。
- 移動処理をサブステップ分割し、壁角での食い込みに起因する見た目ワープを抑制。
