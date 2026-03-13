export type SpeedMode = 'fast' | 'normal' | 'slow' | 'instant'

export interface SpeedPreset {
  name: SpeedMode
  spinDuration: number
  decelerateDuration: number
  alignDuration: number
  settleDuration: number
  intervalBetweenReels: number
  spinSymbolCount: number
  decelerateSymbolCount: number
  overshootSymbols: number
  bounceStrength: number
}

export const DEFAULT_SPEED_PRESETS: Record<SpeedMode, SpeedPreset> = {
  instant: {
    name: 'instant',
    spinDuration: 500,
    decelerateDuration: 0,
    alignDuration: 0,
    settleDuration: 0,
    intervalBetweenReels: 50,
    spinSymbolCount: 0,
    decelerateSymbolCount: 0,
    overshootSymbols: 0,
    bounceStrength: 0.6,
  },
  fast: {
    name: 'fast',
    spinDuration: 1000,
    decelerateDuration: 500,
    alignDuration: 200,
    settleDuration: 100,
    intervalBetweenReels: 100,
    spinSymbolCount: 30,
    decelerateSymbolCount: 8,
    overshootSymbols: 0,
    bounceStrength: 0.6,
  },
  normal: {
    name: 'normal',
    spinDuration: 2000,
    decelerateDuration: 1000,
    alignDuration: 300,
    settleDuration: 200,
    intervalBetweenReels: 200,
    spinSymbolCount: 40,
    decelerateSymbolCount: 10,
    overshootSymbols: 0.5,
    bounceStrength: 1.2,
  },
  slow: {
    name: 'slow',
    spinDuration: 3000,
    decelerateDuration: 1500,
    alignDuration: 400,
    settleDuration: 300,
    intervalBetweenReels: 300,
    spinSymbolCount: 50,
    decelerateSymbolCount: 15,
    overshootSymbols: 1,
    bounceStrength: 1.5,
  },
}

export const cloneSpeedPresets = () =>
  Object.fromEntries(
    Object.entries(DEFAULT_SPEED_PRESETS).map(([mode, preset]) => [mode, { ...preset }])
  ) as Record<SpeedMode, SpeedPreset>
