import type { LayoutElement, Rect, SlotManifest, TemplateConfig, TemplateGridConfig } from '../types'

const PRIORITY_ICONS = ['wild', 'scatter', 'h1', 'h2', 'h3', 'h4', 'l1', 'l2', 'l3', 'l4']
const STANDARD_ICONS = ['h1', 'h2', 'h3', 'h4', 'l1', 'l2', 'l3', 'l4']

export const buildSymbolGrid = (config: TemplateGridConfig, area: Rect): LayoutElement[] => {
  const symbols: LayoutElement[] = []
  const gapX = config.gap_x ?? config.gap
  const gapY = config.gap_y ?? config.gap
  const totalSlots = config.cols * config.rows

  let deck: string[] = []

  if (totalSlots === 9) {
    deck = PRIORITY_ICONS.filter((id) => id !== 'l4')
  } else {
    deck = [...PRIORITY_ICONS]

    const remaining = totalSlots - PRIORITY_ICONS.length
    for (let i = 0; i < remaining; i++) {
      const randomId = STANDARD_ICONS[Math.floor(Math.random() * STANDARD_ICONS.length)]!
      deck.push(randomId)
    }
  }

  let deckIndex = 0

  for (let c = 0; c < config.cols; c++) {
    for (let r = 0; r < config.rows; r++) {
      const x = area.x + c * (config.cell_w + gapX)
      const y = area.y + r * (config.cell_h + gapY)
      const iconId = deck[deckIndex] || 'l1'
      deckIndex++

      symbols.push({
        id: `sym_c${c + 1}_r${r + 1}`,
        type: 'symbol',
        name: `Symbol C${c + 1}R${r + 1}`,
        z_index: 10,
        anchor: 'top-left',
        rect_landscape: { x, y, w: config.cell_w, h: config.cell_h },
        rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
        asset_src: `assets/symbols/sym_${iconId}.png`,
        listening: true,
      })
    }
  }

  return symbols
}

export const baseSceneElements: LayoutElement[] = [
  {
    id: 'bg_main',
    type: 'bg',
    name: 'Main Background',
    z_index: 0,
    anchor: 'top-left',
    rect_landscape: { x: 0, y: 0, w: 1280, h: 720 },
    rect_portrait: { x: 0, y: 0, w: 720, h: 1280 },
    asset_src: 'assets/bg/bg_main.png',
    listening: true,
  },
  {
    id: 'btn_buy_feature',
    type: 'button',
    name: 'Buy Feature',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 40, y: 40, w: 225, h: 132 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/btn_buy_feature.png',
    listening: true,
  },
  {
    id: 'panel_jackpot',
    type: 'ui',
    name: 'Jackpot Panel',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 330, y: 40, w: 620, h: 95 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/panel_jackpot.png',
    listening: true,
  },
  {
    id: 'logo_game',
    type: 'ui',
    name: 'Game Logo',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 1015, y: 40, w: 225, h: 132 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/logo_game.png',
    listening: true,
  },
  {
    id: 'panel_marquee',
    type: 'ui',
    name: 'Marquee',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 330, y: 540, w: 620, h: 67 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/panel_marquee.png',
    listening: true,
  },
  {
    id: 'btn_menu',
    type: 'button',
    name: 'Menu Button',
    z_index: 25,
    anchor: 'top-left',
    rect_landscape: { x: 40, y: 615, w: 75, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/btn_menu.png',
    listening: true,
  },
  {
    id: 'field_balance',
    type: 'ui',
    name: 'Balance Field',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 230, y: 615, w: 265, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/field_balance.png',
    listening: true,
  },
  {
    id: 'field_win',
    type: 'ui',
    name: 'Win Field',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 500, y: 615, w: 265, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/field_win.png',
    listening: true,
  },
  {
    id: 'field_bet',
    type: 'ui',
    name: 'Bet Field',
    z_index: 20,
    anchor: 'top-left',
    rect_landscape: { x: 770, y: 615, w: 265, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/field_bet.png',
    listening: true,
  },
  {
    id: 'btn_spin',
    type: 'button',
    name: 'Spin Button',
    z_index: 25,
    anchor: 'top-left',
    rect_landscape: { x: 1058, y: 448, w: 160, h: 160 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/btn_spin.png',
    listening: true,
  },
  {
    id: 'btn_auto',
    type: 'button',
    name: 'Auto Button',
    z_index: 25,
    anchor: 'top-left',
    rect_landscape: { x: 1150, y: 615, w: 75, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/btn_auto.png',
    listening: true,
  },
  {
    id: 'btn_turbo',
    type: 'button',
    name: 'Turbo Button',
    z_index: 25,
    anchor: 'top-left',
    rect_landscape: { x: 1050, y: 615, w: 75, h: 75 },
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/btn_turbo.png',
    listening: true,
  },
]

export const buildPanelReels = (template: TemplateConfig, reelAreaRect: Rect): LayoutElement => {
  const panelRect = template.panel_reels_rect || {
    x: reelAreaRect.x - 20,
    y: reelAreaRect.y - 20,
    w: reelAreaRect.w + 40,
    h: reelAreaRect.h + 40,
  }

  return {
    id: 'panel_reels',
    type: 'bg',
    name: 'Reel Background',
    z_index: 5,
    anchor: 'top-left',
    rect_landscape: panelRect,
    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
    asset_src: 'assets/ui/panel_reels_bg.png',
    listening: true,
  }
}

export const buildManifest = (template: TemplateConfig): SlotManifest => {
  const reelArea = template.reel_area_rect
  const symbols = buildSymbolGrid(template.grid, reelArea)
  const panelReels = buildPanelReels(template, reelArea)

  return {
    meta: {
      project_name: 'SlotForge_V2_Layout_Update',
      base_resolution: { w: 1280, h: 720 },
      orientation: 'landscape',
    },
    layout_elements: [...baseSceneElements, panelReels, ...symbols],
  }
}
