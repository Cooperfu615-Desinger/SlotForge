// SlotForge Core Type Definitions
// Based on SLOTFORGE_DATA_CONTRACT.md V1.2

export type Orientation = 'landscape' | 'portrait';
export type CoordinateSystem = 'web' | 'cocos';
export type AnchorType = 'top-left' | 'center';
export type ElementType = 'reel_group' | 'symbol' | 'button' | 'panel' | 'effect';
export type StopPattern = 'sequential' | 'slam' | 'anticipation';

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Resolution {
    w: number;
    h: number;
}

export interface MetaInfo {
    project_name: string;
    version: string;
    base_resolution: Resolution;
    orientation: Orientation;
}

export interface ArtSpec {
    symbol_size: Resolution;
    grid_gap: { x: number; y: number };
    safe_area_margin: number;
    background_bleed: number;
}

export interface LayoutElement {
    id: string;
    type: ElementType;
    name: string;
    z_index: number;
    anchor: AnchorType;
    rect_landscape: Rect;
    rect_portrait: Rect;
    asset_url?: string;
    parent_id?: string;
}

export interface SpeedProfile {
    spin_duration: number;
    reel_stop_interval: number;
    bounce_strength: number;
}

export interface RhythmSpec {
    profiles: {
        normal: SpeedProfile;
        fast: SpeedProfile;
    };
    stop_pattern: StopPattern;
    events: any[];
}

export interface SlotManifest {
    meta: MetaInfo;
    art_spec: ArtSpec;
    layout_elements: LayoutElement[];
    rhythm_spec?: RhythmSpec;
}
