export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface LayoutElement {
  id: string
  type: 'reel' | 'symbol' | 'button' | 'bg' | 'effect' | 'ui' | 'overlay'
  name: string
  z_index: number
  anchor: 'top-left' | 'center'
  rect_landscape: Rect
  rect_portrait: Rect
  asset_src?: string
  listening?: boolean
  frame_sequence?: string[]
  frame_rate?: number
}

export interface SlotManifest {
  meta: {
    project_name: string
    version?: string
    base_resolution: { w: number; h: number }
    orientation: 'landscape' | 'portrait'
  }
  layout_elements: LayoutElement[]
}

export interface TemplateGridConfig {
  rows: number
  cols: number
  cell_w: number
  cell_h: number
  gap: number
  gap_x?: number
  gap_y?: number
}

export interface TemplateConfig {
  grid: TemplateGridConfig
  reel_area_rect: Rect
  panel_reels_rect?: Rect
  clipping_rect?: Rect
}
