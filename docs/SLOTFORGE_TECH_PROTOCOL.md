# Antigravity Project: SlotForge Technical Specification

> Project: SlotForge (The Visual Slot Spec Viewer)
> Role: Group CTO Office
> Version: 1.0.0 (Initial Architecture)
> Status: Approved for Development
> Date: 2026-01-28

---

## 1. 專案核心定位 (Project Mission)

SlotForge 是一個「配置驅動 (Config-Driven)」的老虎機規格開發環境。
它的目的不是「開發遊戲」，而是「定義遊戲」。它將抽象的數學與企劃需求，轉化為美術與前端可執行的精確視覺標準。

* Input: JSON 設定檔 (SlotManifest) + 美術圖檔 (Assets)。
* Output: 動態視覺化規格 (Wireframe, Redlines, Timing Preview)。
* Users: 企劃 (撰寫參數), 美術 (查看尺寸/安全框), 前端 (查看坐標/時序)。

---

## 2. 技術堆疊 (Tech Stack)

所有開發者必須嚴格遵守以下選型，不得擅自引入其他框架：

* Framework: Vue 3 (Composition API / script setup)
* Language: TypeScript (Strict Mode Enabled)
* Build Tool: Vite
* UI Library: Naive UI (Antigravity 標準 UI 庫，預設 Dark Mode)
* Styling: Tailwind CSS (用於佈局與排版)
* Rendering: Konva.js (核心 2D 引擎，負責 Wireframe, 標註, 拖拉)
* Code Editor: Monaco Editor (用於右側 JSON 編輯與高亮)
* State Mgmt: Pinia (負責 Manifest 與 View 的雙向綁定)
* Testing: Vitest (單元測試與邏輯驗證)

---

## 3. 資料結構協議 (The Data Contract)

核心資料結構為 SlotManifest。這是應用程式的 Single Source of Truth。
以下為 TypeScript 定義：

type Orientation = 'landscape' | 'portrait';
type CoordinateSystem = 'web' | 'cocos';

// 核心規格書介面
interface SlotManifest {
  meta: {
    project_name: string;
    version: string;
    base_resolution: { w: number; h: number }; // e.g., 1920x1080
    orientation: Orientation;
  };

  // 美術規格 (Blueprint Mode) - 用於繪製紅線與安全框
  art_spec: {
    symbol_size: { w: number; h: number }; // 基礎圖塊尺寸
    grid_gap: { x: number; y: number };    // 滾輪間距
    safe_area_margin: number;              // UI 安全邊距
    background_bleed: number;              // 背景出血尺寸
  };

  // 佈局定義 (Wireframe/Prototype Mode) - 定義場景中所有物件的位置
  layout_elements: LayoutElement[];

  // 節奏與時序 (Prototype Mode - Timeline) - 定義速度與演出流程
  rhythm_spec: RhythmSpec;
}

interface LayoutElement {
  id: string;
  type: 'reel_group' | 'symbol' | 'button' | 'panel' | 'effect';
  name: string; // 顯示名稱
  z_index: number;
  
  // 支援響應式佈局定義
  rect_landscape: Rect; 
  rect_portrait: Rect;
  
  // 視覺資產 (可為空，空值顯示 Wireframe)
  asset_url?: string; 
  
  // 父子階層 (用於顯示 Layer Tree)
  parent_id?: string; 
}

interface RhythmSpec {
  // 速度設定檔
  profiles: {
    normal: SpeedProfile;
    fast: SpeedProfile;   // Turbo
    instant: SpeedProfile;// Hyper/API Test
  };
  
  // 停止模式
  stop_pattern: 'sequential' | 'slam' | 'anticipation';
  
  // 關鍵事件時序 (相對於 Spin Start)
  events: TimelineEvent[];
}

interface SpeedProfile {
  spin_duration: number;      // 總旋轉時間 (ms)
  reel_stop_interval: number; // 輪與輪停止間隔 (ms)
  bounce_strength: number;    // 回彈係數 (0.0 - 2.0)
}

interface Rect { x: number; y: number; w: number; h: number; }

---

## 4. 系統架構設計 (System Architecture)

### 4.1 目錄結構 (Directory Structure)

src/
├── components/
│   ├── Editor/               # 右側編輯區
│   │   ├── JsonEditor.vue    # Monaco Wrapper
│   │   └── AssetManager.vue  # 圖片上傳與拖拉
│   ├── Renderer/             # 左側 Konva 渲染區
│   │   ├── StageContainer.vue
│   │   ├── Layers/
│   │   │   ├── BlueprintLayer.vue  # 繪製尺寸線/安全框
│   │   │   └── PrototypeLayer.vue  # 繪製圖片/動效
│   │   └── Transformer.vue   # 處理 Konva 變形框
│   ├── Timeline/             # 底部時間軸
│   │   ├── GanttChart.vue    # 視覺化時序
│   │   └── PlayerControls.vue# Play/Pause/Speed
│   └── Shared/               # 通用 UI (Naive UI Wrappers)
├── stores/
│   └── forge.ts              # 核心 Pinia Store (Manifest State)
├── logic/
│   ├── coordinate.ts         # Web <-> Cocos 坐標轉換演算法
│   └── sequencer.ts          # 處理 Spin/Stop 的時間計算邏輯
├── types/
│   └── manifest.ts           # 上述 Type 定義
└── App.vue                   # Split-Screen Layout (Left: Renderer, Right: Editor)


### 4.2 核心模組職責

**A. 渲染引擎 (Renderer) - Powered by Konva**
* BlueprintLayer: 
  - 讀取 art_spec。
  - 使用 Konva.Line 和 Konva.Text 繪製尺寸標註 (Dimensions)。
  - 必須實作「自動紅線」：當 JSON 改變，標註線自動重繪。
* PrototypeLayer: 
  - 讀取 layout_elements。
  - 支援 Drag & Drop：監聽原生的 drop 事件，將檔案轉為 Blob URL 並替換 Konva.Image 的 texture。

**B. 時序指揮官 (Sequencer)**
* 功能: 不依賴 setTimeout，而是建立一個虛擬的時間軸物件。
* 邏輯: 讀取 SpeedProfile (如 Normal Mode)，計算每個 Reel 的 startTime 與 endTime，供 GanttChart.vue 渲染，並供 Konva.Tween 執行預覽動畫。

**C. 坐標轉換器 (Coordinate Bridge)**
* 痛點解決: 前端使用 Cocos (Center Origin)，網頁使用 Top-Left。
* 實作: 撰寫 Web Rect 轉 Cocos Rect 的公式（Y 軸反轉、中心點校正）。在 Inspector 面板中，顯示轉換後的數值供前端複製。

---

## 5. 開發階段規劃 (Development Phases)

Tech Lead 請依此順序發派工單：

**Phase 0: Environment Setup**
* 初始化 Vue3 + Vite + Pinia + Naive UI。
* 配置 Tailwind CSS。
* 建立 SlotManifest 的 Mock Data (JSON)。

**Phase 1: The Blueprint (Mode 1)**
* 整合 Monaco Editor，讓右側可以顯示 JSON。
* 整合 Konva.js，讓左側能根據 JSON 畫出灰底方塊 (Reels)。
* 實作「紅線標註」功能 (Dimension Lines)。

**Phase 2: The Prototype (Mode 2 - Visuals)**
* 實作 Drag & Drop 圖片更換功能。
* 實作 Z-Index 圖層樹狀圖 (Layer Tree)。
* 實作 Web/Cocos 坐標數值轉換面板。

**Phase 3: The Rhythm (Mode 2 - Timing)**
* 實作 rhythm_spec 的資料結構。
* 開發底部 Gantt Chart 視覺化組件。
* 實作簡單的 Play/Spin 動畫預覽 (使用 Konva Tween)。

---

## 6. QA 驗收標準 (Acceptance Criteria)

QA Agent 需針對以下項目進行審查：

1. Type Safety: 所有 Component Props 必須有 TypeScript 定義，嚴禁使用 any。
2. Reactivity: 修改右側 JSON 的 width，左側 Konva 方塊必須在 100ms 內變更大小。
3. Asset Logic: 拖入圖片後，不可以上傳到伺服器，必須使用 URL.createObjectURL 處理。
4. Layout: 切換 landscape / portrait 參數時，畫布比例與元件位置必須正確切換。