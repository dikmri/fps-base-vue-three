# src/game/player.js.md

## 目的
- プレイヤー移動、ジャンプ、カメラ姿勢を管理する。

## 主処理
- WASD 移動（壁衝突あり）。
- Space ジャンプ（重力適用）。
- マウス視点（yaw/pitch）。
- `applyToCamera` で Three カメラへ反映。
