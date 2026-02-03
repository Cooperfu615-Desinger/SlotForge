# Antigravity Project: SlotForge Technical Specification (V2.0)

> **Project**: SlotForge (Rapid Prototyping & Asset Assembly Tool)
> **Role**: Group CTO Office
> **Architecture**: Asset-Based / Config-Driven / Workbench Layout
> **Date**: 2026-02-03

---

## 1. 專案核心定位 (Project Mission)
SlotForge 是一個「資產驅動 (Asset-Driven)」的老虎機原型開發環境。
它的核心價值在於讓企劃與美術能透過「拖拉素材」與「JSON 配置」，快速組裝出可運行的遊戲原型，並驗證視覺動態與時序。

* **Input**: JSON 設定檔 (SlotManifest) + **PNG 資產 (Assets)**。
* **Output**: 高保真動態預覽 (High-Fidelity Preview) 與精確時序數據。
* **Philosophy**: **WYSIWYG** (所見即所得)。網頁上看到的 PNG 排列，即為遊戲引擎中的最終規格。

---

## 2. 技術堆疊 (Tech Stack)

* **Core**: Vue 3 (Composition API) + TypeScript (Strict Mode).
* **UI Framework**: **Naive UI** (Light Mode) + Tailwind CSS.
* **Rendering Engine**: **Konva.js** (Vue-Konva).
    * **關鍵變更**: 主要使用 `Konva.Image` 進行貼圖渲染，而非 `Konva.Rect` 繪圖。
* **Animation Core**: **GSAP (GreenSock)**.
    * **用途**: 負責精確的 Timeline 控制 (Spin, Win Show)，取代 Konva 內建的簡單 Tween。
* **State Mgmt**: Pinia (Manifest Store & Player Store).

---

## 3. 系統架構設計 (System Architecture)

### 3.1 工作台佈局 (The Workbench Layout)
廢棄舊版左右分割，採用專業工具的「四分格佈局」：

1.  **Top Bar (Global Nav)**: 
    * 負責全域設定（如切換 3x5 / 4x5 版型、直橫式切換）。
2.  **Center Stage (Viewport)**: 
    * **DeviceContainer**: 使用 CSS `transform: scale()` 實作自適應容器，內部鎖定 **1280x720 (Landscape)** 或 **720x1280 (Portrait)** 邏輯解析度。
    * **Layering Strategy (三層漢堡)**:
        * `BackgroundLayer` (Z=0): 底圖 PNG。
        * `GameLayer` (Z=10): 滾輪、符號、按鈕 (Konva 可互動區)。
        * `OverlayLayer` (Z=20): 手機外框、瀏海遮罩、大獎特效 (PNG 序列)。
3.  **Right Panel (Inspector)**: 
    * 唯讀或雙向綁定的參數檢視器，顯示當前選中 PNG 的座標與檔名。
4.  **Bottom Panel (Sequencer)**: 
    * 基於 GSAP Timeline 的播放控制器 (Play/Pause/Seek)。

### 3.2 資產管線 (Asset Pipeline)
* **Local Preview**: 支援 Drag & Drop 本地圖片，透過 `URL.createObjectURL` 預覽，不涉後端。
* **Smart Fallback**: 當 JSON 指定的圖片路徑讀取失敗 (404) 時，渲染引擎必須自動降級為「白底黑框 + 文字」，確保編輯器不崩潰。

---

## 4. 開發階段規劃 (Development Phases)

**Phase 1: The Viewer (檢視器)**
* 實作 Workbench 佈局。
* 實作 PNG 渲染與 Fallback 機制。
* 實作 GSAP 基礎 Spin 動畫 (位移)。

**Phase 2: The Editor (編輯器)**
* 實作 Drag & Drop 換圖功能。
* 實作座標拖拉修改並回寫 JSON。

---

## 5. QA 驗收標準 (Acceptance Criteria)
1.  **Asset Logic**: 圖片讀取失敗時，絕對不可導致白屏，必須顯示 Fallback 方塊。
2.  **Timing Precision**: GSAP 設定 2.0s 停止，視覺上必須在 2.0s 準時停輪。
3.  **Responsive**: 視窗縮放時，DeviceContainer 必須等比縮放，且內部邏輯座標 (1280x720) 保持不變。