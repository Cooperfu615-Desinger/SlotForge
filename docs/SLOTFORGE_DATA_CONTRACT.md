# SlotForge Data Contract: SlotManifest Specification (V1.2)

> **Project**: SlotForge Visualization Tool
> **Role**: Data Definition & Validation Contract
> **Version**: 1.2 (Includes Full Schema, Anchor Math & Multi-Mock)

---

## 1. 核心資料結構定義 (Core Schema)
所有數據必須嚴格符合以下 TypeScript 介面定義。這是系統的 Single Source of Truth。

```typescript
// 核心規格書介面
interface SlotManifest {
  meta: {
    project_name: string;
    version: string;
    base_resolution: { w: number; h: number }; // e.g., 1920x1080
    orientation: 'landscape' | 'portrait';
  };

  // 美術規格 - 用於繪製紅線與安全框
  art_spec: {
    symbol_size: { w: number; h: number }; // 基礎圖塊尺寸
    grid_gap: { x: number; y: number };    // 滾輪間距
    safe_area_margin: number;              // UI 安全邊距
    background_bleed: number;              // 背景出血尺寸
  };

  // 佈局定義 - 定義場景中所有物件的位置
  layout_elements: LayoutElement[];

  // 節奏與時序 - 定義速度與演出流程
  rhythm_spec?: RhythmSpec; // Phase 0 可選
}

interface LayoutElement {
  id: string;
  type: 'reel_group' | 'symbol' | 'button' | 'panel' | 'effect';
  name: string;
  z_index: number;
  
  // [關鍵屬性] 錨點定義，決定座標計算方式
  // 'top-left' = (0, 0), 'center' = (0.5, 0.5)
  anchor: 'top-left' | 'center'; 
  
  // 響應式佈局定義
  rect_landscape: Rect; 
  rect_portrait: Rect;
  
  asset_url?: string; 
  parent_id?: string; 
}

interface Rect { 
  x: number; 
  y: number; 
  w: number; 
  h: number; 
}

interface RhythmSpec {
  profiles: {
    normal: SpeedProfile;
    fast: SpeedProfile;
  };
  stop_pattern: 'sequential' | 'slam' | 'anticipation';
  events: any[]; 
}

interface SpeedProfile {
  spin_duration: number;
  reel_stop_interval: number;
  bounce_strength: number;
}
```

---

## 2. 座標系統與轉換公式 (Coordinate System Standards)
Dev Agent 必須在 `coordinate.ts` 中實作以下數學真理，不得偏差：

* **Web 座標系 ($P_{web}$)**: 
    * 原點：左上角 (Top-Left, 0, 0)
    * 方向：$X$ 軸向右，$Y$ 軸向下
* **Cocos 座標系 ($P_{cocos}$)**: 
    * 原點：畫布中心 (Center, 0, 0)
    * 方向：$X$ 軸向右，$Y$ 軸向上

### 轉換公式 (Translation Formula)

```text
x_cocos = (x_web - W_base / 2) + (Anchor_x * w)
y_cocos = (H_base / 2 - y_web) - (Anchor_y * h)
```

> **參數說明**:
> * `W_base`, `H_base`: 畫布解析度 (如 1920, 1080)
> * `w`, `h`: 元件自身的寬高
> * `Anchor`: 若 `anchor: 'top-left'` 則值為 0；若 `anchor: 'center'` 則值為 0.5

---

## 3. 數據驗證約束 (Validation Constraints)
* **Anchor 限制**: `anchor` 欄位僅接受字串 `'top-left'` 或 `'center'`，不接受數值輸入。
* **尺寸正值**: 所有 `Rect` 內的 `w` (寬) 與 `h` (高) 必須大於 0。
* **解析度一致性**: `meta.base_resolution` 必須與 `art_spec` 內的計算邏輯匹配。
* **響應效能**: 任何 `SlotManifest` 的修改，必須在 100ms 內觸發渲染更新。

---

## 4. Mock 數據實體範例 (Full Mock Examples)
以下 JSON 必須直接用於 `src/mocks/` 下的檔案建立。

### 範例 A：標準 5x3 (50 Lines)
*建議檔名: `src/mocks/normal_5x3.json`*

```json
{
  "meta": {
    "project_name": "Antigravity_5x3",
    "version": "1.0.0",
    "base_resolution": { "w": 1920, "h": 1080 },
    "orientation": "landscape"
  },
  "art_spec": {
    "symbol_size": { "w": 200, "h": 200 },
    "grid_gap": { "x": 20, "y": 20 },
    "safe_area_margin": 40,
    "background_bleed": 100
  },
  "layout_elements": [
    {
      "id": "reel_frame",
      "type": "panel",
      "name": "Main Reel Frame",
      "z_index": 1,
      "anchor": "top-left",
      "rect_landscape": { "x": 420, "y": 220, "w": 1080, "h": 640 },
      "rect_portrait": { "x": 0, "y": 0, "w": 1080, "h": 640 }
    },
    {
      "id": "reel_1_symbol_1",
      "type": "symbol",
      "name": "R1-C1 Symbol",
      "z_index": 10,
      "anchor": "top-left",
      "rect_landscape": { "x": 440, "y": 240, "w": 200, "h": 200 },
      "rect_portrait": { "x": 20, "y": 20, "w": 200, "h": 200 },
      "parent_id": "reel_frame"
    }
  ]
}
```

### 範例 B：特殊 243 Ways (3-4-5-4-3 排佈)
*建議檔名: `src/mocks/ways_243.json`*

```json
{
  "meta": {
    "project_name": "Antigravity_Ways",
    "version": "1.0.0",
    "base_resolution": { "w": 1920, "h": 1080 },
    "orientation": "landscape"
  },
  "art_spec": {
    "symbol_size": { "w": 180, "h": 180 },
    "grid_gap": { "x": 10, "y": 10 },
    "safe_area_margin": 60,
    "background_bleed": 120
  },
  "layout_elements": [
    {
      "id": "center_reel_group",
      "type": "reel_group",
      "name": "Center Reel (5 Rows)",
      "z_index": 5,
      "anchor": "center",
      "rect_landscape": { "x": 860, "y": 90, "w": 200, "h": 900 },
      "rect_portrait": { "x": 0, "y": 0, "w": 200, "h": 900 }
    }
  ]
}
```