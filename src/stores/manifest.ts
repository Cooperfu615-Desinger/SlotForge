import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Rect { x: number; y: number; w: number; h: number; }

export interface LayoutElement {
    id: string;
    type: 'reel' | 'symbol' | 'button' | 'bg' | 'effect' | 'ui' | 'overlay';
    name: string;
    z_index: number;
    anchor: 'top-left' | 'center';
    rect_landscape: Rect;
    rect_portrait: Rect;
    asset_src?: string;
    listening?: boolean; // New prop for click-through
    frame_sequence?: string[];
    frame_rate?: number;
}

export interface SlotManifest {
    meta: {
        project_name: string;
        version?: string;
        base_resolution: { w: number; h: number };
        orientation: 'landscape' | 'portrait';
    };
    layout_elements: LayoutElement[];
}

// --------------------------------------------------------
// Grid Generation Helper
// --------------------------------------------------------
// Reel Area: 900x540 at (190, 90)
// 5 Cols, 3 Rows.
const REEL_AREA = { x: 190, y: 90, w: 900, h: 540 }
const COLS = 5
const ROWS = 3
const GAP = 10
// Derived sizes:
// Total Gap Width = (5-1)*10 = 40. Avail Width = 900 - 40 = 860. Cell W = 172.
// Total Gap Height = (3-1)*10 = 20. Avail Height = 540 - 20 = 520. Cell H = 173.33 -> Round to 173
const CELL_W = 172
const CELL_H = 173

const generateSymbolGrid = (): LayoutElement[] => {
    const symbols: LayoutElement[] = []

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            const x = REEL_AREA.x + c * (CELL_W + GAP)
            const y = REEL_AREA.y + r * (CELL_H + GAP)

            // Random symbol asset for wireframe variety
            const randomId = Math.floor(Math.random() * 8) + 1 // 1-8 (l1-l4, h1-h4)
            // Map to sym_l1... or sym_h1... roughly
            const typePrefix = randomId > 4 ? 'h' : 'l'
            const typeNum = randomId > 4 ? randomId - 4 : randomId
            const asset = `assets/symbols/sym_${typePrefix}${typeNum}.png`

            symbols.push({
                id: `sym_c${c + 1}_r${r + 1}`,
                type: 'symbol',
                name: `Symbol C${c + 1}R${r + 1}`,
                z_index: 10,
                anchor: 'top-left', // Symbols usually top-left for grid
                rect_landscape: { x, y, w: CELL_W, h: CELL_H },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 }, // TODO
                asset_src: asset,
                listening: true
            })
        }
    }
    return symbols
}

// --------------------------------------------------------
// Store Definition
// --------------------------------------------------------

export const useManifestStore = defineStore('manifest', () => {

    const selectedElementId = ref<string | null>(null)

    const manifest = ref<SlotManifest>({
        "meta": {
            "project_name": "SlotForge_V2_Assembly",
            "base_resolution": { "w": 1280, "h": 720 },
            "orientation": "landscape"
        },
        "layout_elements": [
            // ----------------------------------------------------
            // Layer 0: Base
            // ----------------------------------------------------
            {
                id: "bg_main",
                type: "bg",
                name: "Main Background",
                z_index: 0,
                anchor: "top-left",
                rect_landscape: { x: 0, y: 0, w: 1280, h: 720 },
                rect_portrait: { x: 0, y: 0, w: 720, h: 1280 },
                asset_src: "assets/bg/bg_main.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 5: Reel Panel
            // ----------------------------------------------------
            {
                id: "panel_reels",
                type: "bg",
                name: "Reel Background",
                z_index: 5,
                anchor: "top-left",
                rect_landscape: { x: 190, y: 90, w: 900, h: 540 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_reels_bg.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 10: Symbols (Generated)
            // ----------------------------------------------------
            ...generateSymbolGrid(),

            // ----------------------------------------------------
            // Layer 20: UI Layer (Top & Bottom Bars)
            // ----------------------------------------------------
            // Top
            {
                id: "logo_game",
                type: "ui",
                name: "Game Logo",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 20, y: 10, w: 200, h: 80 }, // Est size
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/logo_game.png",
                listening: true
            },
            {
                id: "panel_jackpot",
                type: "ui",
                name: "Jackpot Panel",
                z_index: 20,
                // Centered roughly: 1280/2 = 640. Width est 600?
                anchor: "top-left",
                rect_landscape: { x: 340, y: 0, w: 600, h: 80 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_jackpot.png",
                listening: true
            },
            // Bottom
            {
                id: "panel_marquee",
                type: "ui",
                name: "Marquee",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 290, y: 580, w: 700, h: 40 }, // Est
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_marquee.png",
                listening: true
            },
            {
                id: "field_win",
                type: "ui",
                name: "Win Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 540, y: 650, w: 200, h: 50 }, // Centered X=640-100
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_win.png",
                listening: true
            },
            {
                id: "field_balance",
                type: "ui",
                name: "Balance Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 20, y: 650, w: 200, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_balance.png",
                listening: true
            },
            {
                id: "field_bet",
                type: "ui",
                name: "Bet Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 900, y: 650, w: 200, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_bet.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 25: Interactive Buttons
            // ----------------------------------------------------
            {
                id: "btn_spin",
                type: "button",
                name: "Spin Button",
                z_index: 25,
                anchor: "center", // Center Anchor for rotation/scale effects
                rect_landscape: { x: 1180, y: 360, w: 130, h: 130 }, // Right Vertical Center
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_spin.png",
                listening: true
            },
            {
                id: "btn_auto",
                type: "button",
                name: "Auto Button",
                z_index: 25,
                anchor: "center",
                rect_landscape: { x: 1180, y: 260, w: 80, h: 80 }, // Above Spin
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_auto.png",
                listening: true
            },
            {
                id: "btn_turbo",
                type: "button",
                name: "Turbo Button",
                z_index: 25,
                anchor: "center",
                rect_landscape: { x: 1180, y: 460, w: 80, h: 80 }, // Below Spin
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_turbo.png",
                listening: true
            },
            {
                id: "btn_menu",
                type: "button",
                name: "Menu Button",
                z_index: 25,
                anchor: "center",
                rect_landscape: { x: 50, y: 680, w: 60, h: 60 }, // Bottom Left corner
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_menu.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 50: Overlay (The Phone Frame)
            // ----------------------------------------------------
            {
                id: "overlay_frame",
                type: "overlay",
                name: "Phone Frame",
                z_index: 50,
                anchor: "top-left",
                rect_landscape: { x: 0, y: 0, w: 1280, h: 720 },
                rect_portrait: { x: 0, y: 0, w: 720, h: 1280 },
                asset_src: "assets/ui/overlay_frame.png",
                listening: false // Click-through enabled
            },
            {
                id: "overlay_notch",
                type: "overlay",
                name: "Dynamic Island",
                z_index: 51,
                anchor: "top-left",
                rect_landscape: { x: 0, y: 0, w: 1280, h: 720 }, // Assuming full screen overlay with transparency
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/overlay_notch.png",
                listening: false
            }
        ]
    })

    // Actions
    const setSelected = (id: string | null) => {
        selectedElementId.value = id
    }

    return {
        manifest,
        selectedElementId,
        setSelected
    }
})
