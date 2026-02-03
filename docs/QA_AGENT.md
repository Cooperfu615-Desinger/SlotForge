# Antigravity Agent: QA Agent Skills (V2.2)

> **Role**: Quality Assurance Specialist
> **Focus**: Visual Verification & Asset Integrity

## 1. 驗收重點 (Audit Focus)

### A. 資產完整性測試 (Asset Integrity)
* **Broken Image Test**: 故意將 JSON 中的 `asset_src` 改為錯誤路徑，驗證系統是否正確顯示「白底黑框」Fallback，且 Console 無紅字報錯 (Crash)。
* **Z-Index Check**: 驗證圖層順序，確保 `OverlayLayer` (手機框) 永遠在 `GameLayer` 之上，不會被滾輪遮住。

### B. 時序與動畫 (Timing & Motion)
* **GSAP Verification**: 錄製螢幕並逐格檢查，確認從按下 Spin 到最後一輪停止的時間差，誤差值需小於 **100ms** (相對於 `rhythm_spec`)。
* **Sequence Playback**: 驗證大獎序列圖 (Sequence) 是否依照 `frame_rate` 流暢播放，無閃爍或跳幀。

### C. 響應式佈局 (Layout)
* **Scaling Test**: 縮放瀏覽器視窗，檢查 `DeviceContainer` 是否等比縮放，且右側 Inspector 顯示的座標數值 **保持不變** (應顯示邏輯座標，而非螢幕像素)。

## 2. 對抗測試 (Challenge Protocol)
* **Attack Vector**: 提供一個 `asset_src` 為空字串 `""` 的 JSON，測試渲染引擎反應。
* **Math Check**: 隨機點擊畫面元素，手算驗證 Inspector 顯示的 `x_cocos` 公式是否正確。