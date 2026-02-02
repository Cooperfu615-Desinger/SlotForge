/**
 * SlotForge Sequencer Engine
 * 
 * A pure function module that calculates the state of every element
 * at a specific point in time (t).
 */

import type { RhythmSpec, LayoutElement, Rect } from '@/types/manifest'

export interface FrameState {
    [elementId: string]: {
        offsetY: number;  // Vertical displacement
        blur: number;     // Motion blur amount
        scaleY: number;   // Stretch factor
        opacity: number;
    }
}

// Easing Functions
const easeInBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
}

const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

/**
 * Calculate the state of the machine at a given time.
 * 
 * @param currentTime Current timeline time in ms
 * @param rhythmSpec The rhythm specification
 * @param elements All layout elements
 * @returns A map of element IDs to their current transform state
 */
export function getFrameState(
    currentTime: number,
    rhythmSpec: RhythmSpec | undefined,
    elements: LayoutElement[]
): FrameState {
    const state: FrameState = {}

    // Default: Static state
    elements.forEach(el => {
        state[el.id] = { offsetY: 0, blur: 0, scaleY: 1, opacity: 1 }
    })

    if (!rhythmSpec || currentTime <= 0) {
        return state
    }

    const { spin_duration, reel_stop_interval, bounce_strength } = rhythmSpec.profiles.normal

    // In a real slot, we would group symbols by reel. 
    // Here, for the prototype, we assume the single "R1-C1 Symbol" (and any other symbols) 
    // simply behaves like Reel 1.

    elements.forEach(el => {
        if (el.type === 'symbol') {
            // Determine "Reel Index". For now, hardcode to 0 (Reel 1)
            // In full implementation, parse el.id or parent_id
            const reelIndex = 0

            const startTime = 0
            const stopTime = spin_duration + (reelIndex * reel_stop_interval)

            // --- Phase 1: Spin (0 -> stopTime) ---
            if (currentTime < stopTime) {
                // Accelerate 
                const accelDuration = 500

                if (currentTime < accelDuration) {
                    // Ease In
                    const progress = currentTime / accelDuration
                    const move = easeInBack(progress) * 100 // Backward anticipation
                    state[el.id].offsetY = move
                } else {
                    // Constant Spin
                    // Speed: pixels per ms
                    const speed = 2.5
                    const spinTime = currentTime - accelDuration

                    // Infinite scroll simulation: simply move down continuously
                    // For visualization, we wrap around or just keep going
                    // Let's just keep going down for the "Motion" effect
                    // In a real game, this would be (y % symbolHeight)
                    state[el.id].offsetY = speed * spinTime
                    state[el.id].blur = 10
                    state[el.id].scaleY = 1.1
                }
            }
            // --- Phase 2: Bounce / Stop (stopTime -> End) ---
            else {
                // The time since logic stop
                const timeSinceStop = currentTime - stopTime
                const bounceDuration = 400

                if (timeSinceStop < bounceDuration) {
                    // Elastic Bounce
                    const progress = timeSinceStop / bounceDuration
                    // We stopped at some Y. For visual continuity, let's snap to 0 but add bounce
                    // This is a "Virtual Stop". In real dev, we'd snap to the target symbol grid.
                    // Here we simulating snapping back to original position (0)

                    // Simulate coming from "above" (-bounce_strength)
                    const bounce = easeOutElastic(progress) // 0 -> 1

                    // Logic: We overshoot down, then bounce back up to 0
                    // Actually easeOutElastic goes 0->1. 
                    // Let's map it: Start at some offset, end at 0.

                    const landingImpact = bounce_strength // pixels
                    state[el.id].offsetY = landingImpact * Math.sin(progress * Math.PI) // Simple bump
                } else {
                    // Stopped completely
                    state[el.id].offsetY = 0
                    state[el.id].blur = 0
                    state[el.id].scaleY = 1
                }
            }
        }
    })

    return state
}
