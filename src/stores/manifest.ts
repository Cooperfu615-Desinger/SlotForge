import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import tplClassic3x3 from '../assets/templates/tpl_classic_3x3.json'
import tplStandard3x5 from '../assets/templates/tpl_standard_3x5.json'
import tplWay3x5 from '../assets/templates/tpl_way_3x5.json'
import tplExtended4x5 from '../assets/templates/tpl_extended_4x5.json'
import tplPayAnywhere6x5 from '../assets/templates/tpl_pay_anywhere_6x5.json'
import tplCluster7x7 from '../assets/templates/tpl_cluster_7x7.json'
import tplMegaways6 from '../assets/templates/tpl_megaways_6.json'

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

interface TemplateConfig {
    grid: {
        rows: number;
        cols: number;
        cell_w: number;
        cell_h: number;
        gap: number;      // Legacy/Fallback shared gap
        gap_x?: number;   // Horizontal gap (between reels)
        gap_y?: number;   // Vertical gap (between symbols)
    };
    reel_area_rect: Rect;
    panel_reels_rect?: Rect; // Optional: Override automatic background positioning
    clipping_rect?: Rect; // Optional: Visual clipping mask (hides symbols outside this area)
}

const TEMPLATES: Record<string, TemplateConfig> = {
    'classic_3x3': tplClassic3x3,
    'standard_3x5': tplStandard3x5,
    'way_3x5': tplWay3x5,
    'extended_4x5': tplExtended4x5,
    'pay_anywhere_6x5': tplPayAnywhere6x5,
    'cluster_7x7': tplCluster7x7,
    'megaways_6': tplMegaways6
}

// Default used for type safety or fallback
const DEFAULT_CONFIG = tplStandard3x5

// --------------------------------------------------------
// Store Definition
// --------------------------------------------------------

export const useManifestStore = defineStore('manifest', () => {

    const selectedElementId = ref<string | null>(null)
    const currentGrid = ref<string>('standard_3x5') // Default

    // Reactive Grid Configuration
    const gridConfig = computed<TemplateConfig['grid']>(() => {
        const t = TEMPLATES[currentGrid.value]
        return t ? t.grid : DEFAULT_CONFIG.grid
    })
    const reelAreaRect = computed(() => {
        const t = TEMPLATES[currentGrid.value]
        return t ? t.reel_area_rect : DEFAULT_CONFIG.reel_area_rect
    })
    const clippingRect = computed(() => {
        const t = TEMPLATES[currentGrid.value]
        return t?.clipping_rect || t?.reel_area_rect || DEFAULT_CONFIG.reel_area_rect
    })

    // Dynamic Symbol Generator
    const generateSymbolGrid = (config: TemplateConfig['grid'], area: Rect): LayoutElement[] => {
        const symbols: LayoutElement[] = []

        // Gap resolution
        const gapX = config.gap_x ?? config.gap;
        const gapY = config.gap_y ?? config.gap;

        for (let c = 0; c < config.cols; c++) {
            for (let r = 0; r < config.rows; r++) {
                const x = area.x + c * (config.cell_w + gapX)
                const y = area.y + r * (config.cell_h + gapY)

                // Fallback / Asset logic
                // Using different asset sets based on grid type could be here
                // For now reusing same symbols but they will scale
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
                    rect_landscape: { x, y, w: config.cell_w, h: config.cell_h },
                    rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
                    asset_src: asset,
                    listening: true
                })
            }
        }
        return symbols
    }

    // Base Manifest Elements (Static parts)
    const baseElements: LayoutElement[] = [
        // Layer 0: Base
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
        // Layer 20: UI Layer (Top)
        {
            id: "btn_buy_feature",
            type: "button",
            name: "Buy Feature",
            z_index: 20,
            anchor: "top-left",
            rect_landscape: { x: 40, y: 40, w: 225, h: 132 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/btn_buy_feature.png",
            listening: true
        },
        {
            id: "panel_jackpot",
            type: "ui",
            name: "Jackpot Panel",
            z_index: 20,
            anchor: "top-left",
            rect_landscape: { x: 330, y: 40, w: 620, h: 95 },
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
            rect_landscape: { x: 1015, y: 40, w: 225, h: 132 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/logo_game.png",
            listening: true
        },
        // Layer 20: UI Layer (Bottom)
        {
            id: "panel_marquee",
            type: "ui",
            name: "Marquee",
            z_index: 20,
            anchor: "top-left",
            rect_landscape: { x: 330, y: 540, w: 620, h: 67 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/panel_marquee.png",
            listening: true
        },
        // Bottom Row
        {
            id: "btn_menu",
            type: "button",
            name: "Menu Button",
            z_index: 25,
            anchor: "top-left",
            rect_landscape: { x: 40, y: 615, w: 75, h: 75 },
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
            rect_landscape: { x: 230, y: 615, w: 265, h: 75 },
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
            rect_landscape: { x: 500, y: 615, w: 265, h: 75 },
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
            rect_landscape: { x: 770, y: 615, w: 265, h: 75 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/field_bet.png",
            listening: true
        },
        // Spin Cluster
        {
            id: "btn_spin",
            type: "button",
            name: "Spin Button",
            z_index: 25,
            anchor: "top-left",
            rect_landscape: { x: 1058, y: 448, w: 160, h: 160 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/btn_spin.png",
            listening: true
        },
        {
            id: "btn_auto",
            type: "button",
            name: "Auto Button",
            z_index: 25,
            anchor: "top-left",
            rect_landscape: { x: 1150, y: 615, w: 75, h: 75 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/btn_auto.png",
            listening: true
        },
        {
            id: "btn_turbo",
            type: "button",
            name: "Turbo Button",
            z_index: 25,
            anchor: "top-left",
            rect_landscape: { x: 1050, y: 615, w: 75, h: 75 },
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/btn_turbo.png",
            listening: true
        }
    ]

    // Construct the full manifest primarily based on 'currentGrid'
    const manifest = computed<SlotManifest>(() => {
        const config = gridConfig.value
        const area = reelAreaRect.value

        // Regenerate variable elements
        const symbols = generateSymbolGrid(config, area)

        // Panel Reels (Background for reels): use template override or auto-calculate
        const tConfig = TEMPLATES[currentGrid.value]
        const panelRect = tConfig?.panel_reels_rect || {
            x: area.x - 20,
            y: area.y - 20,
            w: area.w + 40,
            h: area.h + 40
        }

        const panelReels: LayoutElement = {
            id: "panel_reels",
            type: "bg",
            name: "Reel Background",
            z_index: 5,
            anchor: "top-left",
            rect_landscape: panelRect,
            rect_portrait: { x: 0, y: 0, w: 0, h: 0 },
            asset_src: "assets/ui/panel_reels_bg.png",
            listening: true
        }

        return {
            "meta": {
                "project_name": "SlotForge_V2_Layout_Update",
                "base_resolution": { "w": 1280, "h": 720 },
                "orientation": "landscape"
            },
            "layout_elements": [
                ...baseElements,
                panelReels,
                ...symbols
            ]
        }
    })

    // Actions
    const setSelected = (id: string | null) => {
        selectedElementId.value = id
    }

    const loadTemplate = (gridType: string) => {
        if (TEMPLATES[gridType]) {
            currentGrid.value = gridType
            console.log(`[Manifest] Loaded template: ${gridType}`)
        } else {
            console.warn(`[Manifest] Template not found: ${gridType}`)
        }
    }

    return {
        manifest,
        selectedElementId,
        setSelected,
        loadTemplate,
        currentGrid,    // Export for TopNavBar template tracking
        gridConfig,     // Export for ReelArea
        reelAreaRect,   // Export for ReelArea
        clippingRect,   // Export for ReelArea (visual clipping mask)
        reelCount: computed(() => gridConfig.value.cols) // Export total reel count
    }
})
