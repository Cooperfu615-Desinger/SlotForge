# SlotForge Data Contract: SlotManifest Specification (V2.0)

> **Version**: 2.0 (Asset-Based Edition)
> **Changes**: Added asset_src, sequence support, and removal of pure drawing specs.

---

## 1. 核心資料結構 (Core Schema)

```typescript
interface SlotManifest {
  meta: {
    project_name: string;
    version: string;
    // 邏輯解析度，程式以此為座標基準，通常為 1280x720
    base_resolution: { w: number; h: number }; 
    orientation: 'landscape' | 'portrait';
  };

  // 美術規格 (已簡化，主要依賴 layout_elements)
  art_spec: {
    grid_gap: { x: number; y: number };
  };

  // 佈局定義 (Scene Graph)
  layout_elements: LayoutElement[];

  // 時序定義 (Timeline)
  rhythm_spec: RhythmSpec;
}

interface LayoutElement {
  id: string;
  type: 'reel' | 'symbol' | 'button' | 'bg' | 'effect';
  name: string;
  z_index: number;
  
  // 座標與錨點
  anchor: 'top-left' | 'center';
  rect_landscape: Rect; 
  rect_portrait: Rect; // 支援響應式切換
  
  // [關鍵新增] 資產定義
  // 若為空，則使用 Fallback 渲染
  asset_src?: string; 
  
  // [關鍵新增] 序列圖定義 (用於大獎或動態)
  // 若有值，則覆蓋 asset_src，依序播放
  frame_sequence?: string[]; 
  frame_rate?: number; // FPS, default 12
}

interface Rect { x: number; y: number; w: number; h: number; }

interface RhythmSpec {
  // 定義 Spin 過程的時間點 (ms)
  events: {
    spin_start: number;      // e.g., 0
    reel_stop_1: number;     // e.g., 2000
    reel_stop_2: number;     // e.g., 2300
    reel_stop_3: number;     // e.g., 2600
    reel_stop_4: number;     // e.g., 2900
    reel_stop_5: number;     // e.g., 3200
    win_show_start: number;  // e.g., 3500
  };
}