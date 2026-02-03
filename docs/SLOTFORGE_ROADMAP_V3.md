# SlotForge Development Roadmap (V3.0)

> **Project**: SlotForge Asset-Driven Viewer
> **Status**: Group CTO Approved (Asset-Based Edition)
> **Architecture**: Workbench Layout + GSAP + Asset Pipeline
> **Objective**: Building a High-Fidelity Slot Prototyping Tool

---

## Phase 0: 工作台地基 (The Workbench Foundation)
**目標**：建立應用程式骨架與「四分格佈局」，確保自適應容器運作正常。

### 1. 任務拆解
* **專案腳手架**：初始化 Vue 3 + TS + Naive UI (Dark Mode) + Tailwind。
* **Workbench 佈局實作**：
    * **Top**: 實作版型切換按鈕 (Mock Data Loader)。
    * **Center**: 實作 `DeviceContainer`，包含 CSS `transform: scale()` 自適應邏輯與 `1280x720` 鎖定機制。
    * **Right**: 實作基礎 Inspector 面板 (UI 骨架)。
    * **Bottom**: 實作 Sequencer 面板 (UI 骨架)。
* **Store 架構**：建立 `useManifestStore`，支援讀取 `asset_src` 欄位。

### 2. 驗收標準
* **響應式測試**：縮放瀏覽器視窗時，Center Stage 的手機框必須等比縮放，且不破版。
* **版型切換**：點擊 50Lines / 1024Ways 按鈕，Console 能印出對應的 JSON 載入成功訊息。

---

## Phase 1: 資產渲染引擎 (The Asset Renderer)
**目標**：讓靜態 PNG 圖片能正確顯示在畫布上，並處理缺圖狀況。

### 1. 任務拆解
* **GameElement 實作**：
    * 開發支援 `Konva.Image` 的通用組件。
    * **Smart Fallback**：實作 `v-if` 邏輯，當圖片 404 時自動降級為「白底黑框 + 文字 ID」。
* **層級管理 (Layering)**：
    * 實作 `BackgroundLayer` (Z=0), `GameLayer` (Z=10), `OverlayLayer` (Z=20)。
    * 讀取 Mock JSON，將背景圖、滾輪底圖、符號圖正確渲染至對應層級。
* **Inspector 連動**：
    * 點擊畫布上的 PNG，右側面板顯示該圖片的 `id`, `asset_src` 與 `x, y` 座標。
    * **公式顯示**：實作 Web 轉 Cocos 的座標公式計算與顯示。

### 2. 驗收標準
* **視覺還原**：畫面看起來必須與 Mockup 的 PNG 佈局一致。
* **Fallback 測試**：故意將 JSON 圖片路徑改壞，畫面對應位置必須顯示白色方塊，程式不可崩潰。

---

## Phase 2: 時序與動效 (The GSAP Sequencer)
**目標**：透過 GSAP 驅動滾輪與大獎演出，驗證時間秒數。

### 1. 任務拆解
* **GSAP 整合**：引入 GSAP，建立全域 Timeline 物件。
* **Spin 動畫邏輯**：
    * 讀取 `rhythm_spec`。
    * 實作滾輪 (Reel Group) 的 Y 軸位移動畫 (不需 Blur)。
    * 確保 5 輪停止時間點與 JSON 設定精確匹配。
* **Win Show 序列圖**：
    * 實作 `SequencePlayer` 組件。
    * 讀取 JSON 中的 `frame_sequence` 陣列，依序切換 PNG (模擬 Big Win 動畫)。
* **播放器控制**：實作 Play / Pause / Stop / Speed (1x, 2x) 按鈕功能。

### 2. 驗收標準
* **時序精準度**：使用螢幕錄影檢查，設定 2.0s 停輪，視覺誤差需小於 0.1s。
* **序列流暢度**：大獎 PNG 序列播放流暢，無閃爍。

---

## Phase 3: 互動與素材替換 (Interaction & Swap)
**目標**：讓企劃能透過拖拉更換素材，完成原型製作閉環。

### 1. 任務拆解
* **Drag & Drop Pipeline**：
    * 監聽 `drop` 事件。
    * 使用 `URL.createObjectURL` 建立本地預覽連結。
    * 更新 Store 中的 `asset_src`，觸發畫布即時重繪。
* **數值複製**：在 Inspector 實作「複製座標」、「複製設定」功能。

### 2. 驗收標準
* **換圖測試**：從桌面拖入一張新圖片到背景，背景必須在 100ms 內更新為新圖。
* **無後端驗證**：確認 Network Tab 無任何上傳請求產生。