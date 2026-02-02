# SlotForge Development Roadmap (V2.0)

> **Project**: SlotForge Visualization Tool
> **Status**: Group CTO Approved
> **Framework**: Vue 3 + Naive UI + Konva.js + Monaco Editor
> **Objective**: Building a Config-Driven Slot Spec Environment

---

## Phase 0: 環境建置與多維數據初始化 (Core & Multi-Mock Setup)
**目標**：建立底座並確保系統能同時處理標準與特殊規格的遊戲結構。

### 1. 任務拆解
* **專案腳手架**：初始化 Vite + Vue 3 (TS Strict Mode) 與 Naive UI (Dark Mode)。
* **多維 Mock 數據建置**：在 `src/mocks/` 實作兩組具備代表性的 `SlotManifest`：
    * **標準型 (5x3, 50 Lines)**：驗證基礎行列排列。
    * **特殊型 (243 Ways, 非對稱 Reel 排佈)**：驗證系統對於複雜滾輪排列的相容性。
* **Store 架構**：實作 `stores/forge.ts`，確保 manifest 數據能驅動後續的渲染與編輯模組。

### 2. 驗收標準
* **Schema 驗證**：兩組 Mock 數據必須完全通過 `SlotManifest` 的 TypeScript 型別檢查。
* **動態切換**：系統需具備切換不同數據源的功能，且 UI 元件需即時響應。

---

## Phase 1: 藍圖模式 - 雙向聯動監控 (The Blueprint)
**目標**：建立 JSON 修改與畫布標註的實時渲染機制。

### 1. 任務拆解
* **Monaco Hot Reload**：實作 Monaco Editor 的內容監聽，達成 100ms 內的渲染同步。
* **BlueprintLayer 繪製**：讀取 `art_spec` 數據，使用 Konva.Line 和 Konva.Text 自動繪製安全框與尺寸紅線。
* **網格自動計算**：根據 Manifest 中的 `symbol_size` 與 `grid_gap` 自動計算並繪製 Reel 區域。

### 2. 驗收標準
* **渲染效能**：在輸入大量 JSON 時，左側畫布重繪延遲需低於 100ms。
* **視覺準確度**：標註線顯示的數值必須與右側 JSON 內容完全匹配。

---

## Phase 2: 原型模式 - 錨點與坐標橋接 (The Prototype & Anchor)
**目標**：解決 Web 與 Cocos 引擎間的錨點 (Anchor) 偏移與坐標系差異。

### 1. 任務拆解
* **顯性錨點 (Anchor) 邏輯**：在 `coordinate.ts` 中實作坐標計算模組，需顯式支持兩種錨點切換：
    * **Web 模式**：Top-Left (0,0)。
    * **Cocos 模式**：Center (0.5, 0.5) 且 Y 軸反轉。
* **坐標翻譯面板**：當選中 `layout_elements` 元件時，Inspector 面板需同時顯示 Web 與 Cocos 的轉換數值。
* **資產拖拉 (Drag & Drop)**：實作本地圖片替換，使用 `URL.createObjectURL` 處理預覽，禁止上傳伺服器。

### 2. 驗收標準
* **坐標精確度測試**：隨機抽取元件，驗證其在切換 Anchor 模式時，顯示的坐標轉換數值符合預期公式。
* **響應式佈局**：切換 Landscape / Portrait 時，畫布比例與元件位置必須正確切換。

---

## Phase 3: 時序模式 - 交互式播放頭 (The Rhythm & Playhead)
**目標**：透過可交互的時間軸達成精確的動效與時序核對。

### 1. 任務拆解
* **交互式甘特圖**：開發 `GanttChart.vue`，視覺化 `rhythm_spec` 定義的事件時序。
* **播放頭 (Playhead) 功能**：實作一根可拖動的播放頭。
* **畫布狀態凍結 (State Freezing)**：當播放頭停在特定時間點（如 T+500ms）時，左側畫布必須凍結並顯示該時間點的滾輪、元件或 UI 狀態。
* **動畫預覽引擎**：實作 Konva.Tween 預覽功能，支援 Normal 與 Turbo 模式切換。

### 2. 驗收標準
* **時序連動流暢度**：播放頭拖動時畫布應實時響應且無明顯卡頓。
* **邊界穩健度測試**：測試 0 數值或極端大數值輸入時的渲染反應與錯誤處理。