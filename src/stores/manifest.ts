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
    listening?: boolean;
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
// Adjusted for tighter layout (matching new design)
const COLS = 5
const ROWS = 3
const GAP = 5          // Reduced from 10px to 5px
const CELL_W = 120     // Reduced from 172px to 120px
const CELL_H = 120     // Reduced from 173px to 120px (square)

// Calculated Reel Area:
// Width: 5 × (120 + 5) - 5 = 620px
// Height: 3 × (120 + 5) - 5 = 370px
// Centered: x = (1280 - 620) / 2 = 330, y = 175 (adjusted for top/bottom bars)
const REEL_AREA = { x: 330, y: 175, w: 620, h: 370 }

const generateSymbolGrid = (): LayoutElement[] => {
    const symbols: LayoutElement[] = []
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            const x = REEL_AREA.x + c * (CELL_W + GAP)
            const y = REEL_AREA.y + r * (CELL_H + GAP)
            const randomId = Math.floor(Math.random() * 8) + 1
            const typePrefix = randomId > 4 ? 'h' : 'l'
            const typeNum = randomId > 4 ? randomId - 4 : randomId
            const asset = `assets/symbols/sym_${typePrefix}${typeNum}.png`

            symbols.push({
                id: `sym_c${c + 1}_r${r + 1}`,
                type: 'symbol',
                name: `Symbol C${c + 1}R${r + 1}`,
                z_index: 10,
                anchor: 'top-left',
                rect_landscape: { x, y, w: CELL_W, h: CELL_H },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
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
    const isEditMode = ref(false)
    const snapToGrid = ref(true)

    const manifest = ref<SlotManifest>({
        "meta": {
            "project_name": "SlotForge_V2_Layout_Update",
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
                rect_landscape: { x: 330, y: 175, w: 620, h: 370 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_reels_bg.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 10: Symbols
            // ----------------------------------------------------
            ...generateSymbolGrid(),

            // ----------------------------------------------------
            // Layer 20: UI Layer (Top)
            // ----------------------------------------------------
            {
                id: "btn_buy_feature",
                type: "button",
                name: "Buy Feature",
                z_index: 20,
                anchor: "center",
                rect_landscape: { x: 120, y: 80, w: 140, h: 80 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_buy_feature.png",
                listening: true
            },
            {
                id: "panel_jackpot",
                type: "ui",
                name: "Jackpot Panel",
                z_index: 20,
                // Centered Top: 1280/2 = 640
                anchor: "top-left",
                rect_landscape: { x: 340, y: 15, w: 600, h: 70 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_jackpot.png",
                listening: true
            },
            {
                id: "logo_game",
                type: "ui",
                name: "Game Logo",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 1050, y: 20, w: 180, h: 80 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/logo_game.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 20: UI Layer (Bottom)
            // ----------------------------------------------------
            {
                id: "panel_marquee",
                type: "ui",
                name: "Marquee",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 325, y: 568, w: 629, h: 67 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/panel_marquee.png",
                listening: true
            },

            // Bottom Row: Menu | Balance | Win | Bet | Spin
            {
                id: "btn_menu",
                type: "button",
                name: "Menu Button",
                z_index: 25,
                anchor: "center",
                rect_landscape: { x: 20, y: 635, w: 75, h: 75 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_menu.png",
                listening: true
            },
            {
                id: "field_balance",
                type: "ui",
                name: "Balance Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 110, y: 635, w: 265, h: 75 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_balance.png",
                listening: true
            },
            {
                id: "field_win",
                type: "ui",
                name: "Win Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 390, y: 635, w: 265, h: 75 }, // Next to Balance
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_win.png",
                listening: true
            },
            {
                id: "field_bet",
                type: "ui",
                name: "Bet Field",
                z_index: 20,
                anchor: "top-left",
                rect_landscape: { x: 670, y: 635, w: 265, h: 75 }, // Next to Win
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/field_bet.png",
                listening: true
            },

            // ----------------------------------------------------
            // Layer 25: Spin Cluster (Bottom Right)
            // ----------------------------------------------------
            {
                id: "btn_spin",
                type: "button",
                name: "Spin Button",
                z_index: 25,
                anchor: "center",
                rect_landscape: { x: 1112, y: 552, w: 158, h: 158 },
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
                // Left of Auto
                rect_landscape: { x: 1032, y: 635, w: 75, h: 75 },
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
                // Left of Auto? Or above? User image shows them clustered.
                rect_landscape: { x: 952, y: 635, w: 75, h: 75 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "assets/ui/btn_turbo.png",
                listening: true
            },



            // ----------------------------------------------------
            // DEBUG MARKERS (To be removed)
            // ----------------------------------------------------
            {
                id: "debug_tl",
                type: "ui",
                name: "Debug TL",
                z_index: 999,
                anchor: "top-left",
                rect_landscape: { x: 0, y: 0, w: 50, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "", // No asset, will likely render as placeholder or need specific handling? 
                // Actually, let's use a known asset like 'btn_menu.png' to be safe and visible
                listening: false
            },
            {
                id: "debug_tr",
                type: "ui",
                name: "Debug TR",
                z_index: 999,
                anchor: "top-left",
                rect_landscape: { x: 1230, y: 0, w: 50, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "",
                listening: false
            },
            {
                id: "debug_bl",
                type: "ui",
                name: "Debug BL",
                z_index: 999,
                anchor: "top-left",
                rect_landscape: { x: 0, y: 670, w: 50, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "",
                listening: false
            },
            {
                id: "debug_br",
                type: "ui",
                name: "Debug BR",
                z_index: 999,
                anchor: "top-left",
                rect_landscape: { x: 1230, y: 670, w: 50, h: 50 },
                rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                asset_src: "",
                listening: false
            },
        ]
    })

    // Actions
    const setSelected = (id: string | null) => {
        selectedElementId.value = id
    }

    const toggleEditMode = () => {
        isEditMode.value = !isEditMode.value
        console.log('Edit Mode:', isEditMode.value)
    }

    const toggleSnapToGrid = () => {
        snapToGrid.value = !snapToGrid.value
        console.log('Snap to Grid:', snapToGrid.value)
    }

    const updateElementPosition = (id: string, x: number, y: number) => {
        const element = manifest.value.layout_elements.find(el => el.id === id)
        if (element) {
            // Apply snap to grid if enabled
            if (snapToGrid.value) {
                x = Math.round(x / 10) * 10
                y = Math.round(y / 10) * 10
            }
            element.rect_landscape.x = x
            element.rect_landscape.y = y
            console.log(`Updated ${id} position to (${x}, ${y})`)
        }
    }

    return {
        manifest,
        selectedElementId,
        isEditMode,
        snapToGrid,
        setSelected,
        toggleEditMode,
        toggleSnapToGrid,
        updateElementPosition
    }
})
