import gsap from 'gsap'
import { ref } from 'vue'

export interface ReelConfig {
    reelId: number           // 0-4 (for 5 reels)
    symbolHeight: number     // Height of each symbol (e.g., 120px)
    spinDuration: number     // Total spin duration (ms)
    stopDelay: number        // Delay before this reel stops (ms)
}

export const useReelController = (config: ReelConfig, onAllReelsStopped?: () => void) => {
    // Current Y offset for this reel
    const offsetY = ref(0)

    // GSAP Timeline instance
    let timeline: gsap.core.Timeline | null = null

    /**
     * Start the reel spin animation
     * Uses a 4-phase animation:
     * 1. Spin (fast downward scroll)
     * 2. Sustain (continuous loop)
     * 3. Stop (deceleration - continue downward)
     * 4. Bounce (elastic settle)
     */
    const spin = () => {
        if (timeline) {
            timeline.kill() // Clean up any existing timeline
        }

        timeline = gsap.timeline()

        const cycleHeight = config.symbolHeight * 5 // 5 symbols in the loop buffer

        // Phase 1 & 2: Spin (Continuous downward scroll with infinite loop illusion)
        timeline.to(offsetY, {
            value: 9999,  // Large value to simulate continuous scroll
            duration: config.spinDuration / 1000,  // Convert ms to seconds
            ease: 'linear',  // Constant speed for seamless loop
            modifiers: {
                // Modulus reset: create infinite scroll illusion
                value: (value) => {
                    return parseFloat(value) % cycleHeight
                }
            }
        })

        // Phase 3 & 4: Stop with Bounce (Continue downward then settle)
        timeline.to(offsetY, {
            value: () => {
                // Get current position after spin phase
                const current = offsetY.value

                // Calculate next aligned position (next multiple of symbolHeight)
                const alignedPosition = Math.ceil(current / config.symbolHeight) * config.symbolHeight

                // Add overshoot (continue falling 2-3 more symbols for dramatic effect)
                const overshoot = config.symbolHeight * 2.5
                const targetPosition = alignedPosition + overshoot

                // Use modulus to keep within cycle range
                return targetPosition % cycleHeight
            },
            duration: 0.8,  // 800ms deceleration
            delay: config.stopDelay / 1000,  // Delay before stopping (for sequential effect)
            ease: 'back.out(1.7)',  // Elastic bounce effect
            onComplete: () => {
                console.log(`[Reel ${config.reelId}] Stopped at offsetY: ${offsetY.value}`)
                // Notify parent if this is the last reel (reel 4)
                if (config.reelId === 4 && onAllReelsStopped) {
                    onAllReelsStopped()
                }
            }
        })
    }

    /**
     * Force stop the reel animation
     */
    const stop = () => {
        if (timeline) {
            timeline.kill()
            timeline = null
        }
        offsetY.value = 0
    }

    return {
        offsetY,
        spin,
        stop
    }
}
