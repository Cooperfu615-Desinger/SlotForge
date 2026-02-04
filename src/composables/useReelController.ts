import gsap from 'gsap'
import { ref } from 'vue'
import type { SpeedPreset } from '../stores/gameStore'

export interface ReelConfig {
    reelId: number           // 0-4 (for 5 reels)
    symbolHeight: number     // Height of each symbol (e.g., 125px)
}

/**
 * 4-Phase Reel Animation Controller
 * 
 * Phase 1: Spin - 高速線性滾動
 * Phase 2: Decelerate - 減速
 * Phase 3: Align - 對齊格線
 * Phase 4: Settle - 選配微彈
 */
export const useReelController = (config: ReelConfig, onAllReelsStopped?: () => void) => {
    // Current Y offset for this reel (累積位移量)
    const offsetY = ref(0)

    // GSAP Timeline instance
    let timeline: gsap.core.Timeline | null = null

    /**
     * Start the 4-phase reel spin animation
     */
    const spin = (preset: SpeedPreset) => {
        if (timeline) {
            timeline.kill()
        }

        const stopDelay = config.reelId * preset.intervalBetweenReels

        timeline = gsap.timeline()

        // ═══════════════════════════════════════════════════════════
        // Phase 1: Spin (高速線性滾動)
        // ═══════════════════════════════════════════════════════════
        timeline.to(offsetY, {
            value: `+=${config.symbolHeight * preset.spinSymbolCount}`,
            duration: preset.spinDuration / 1000,
            ease: 'linear'
        })

        // ═══════════════════════════════════════════════════════════
        // Phase 2: Decelerate (減速)
        // ═══════════════════════════════════════════════════════════
        timeline.to(offsetY, {
            value: `+=${config.symbolHeight * preset.decelerateSymbolCount}`,
            duration: preset.decelerateDuration / 1000,
            ease: 'power2.out'  // 平滑減速
        })

        // ═══════════════════════════════════════════════════════════
        // Phase 3: Align (對齊格線) - 依序停止
        // ═══════════════════════════════════════════════════════════
        timeline.to(offsetY, {
            value: () => {
                const current = offsetY.value
                // 找到下一個對齊點
                const aligned = Math.ceil(current / config.symbolHeight) * config.symbolHeight
                // 加上過衝量
                return aligned + config.symbolHeight * preset.overshootSymbols
            },
            duration: preset.alignDuration / 1000,
            delay: stopDelay / 1000,  // 依序停止的延遲
            ease: 'power3.out'
        })

        // ═══════════════════════════════════════════════════════════
        // Phase 4: Settle (選配微彈)
        // ═══════════════════════════════════════════════════════════
        if (preset.bounceStrength > 0 && preset.overshootSymbols > 0) {
            timeline.to(offsetY, {
                value: () => {
                    const current = offsetY.value
                    return Math.round(current / config.symbolHeight) * config.symbolHeight
                },
                duration: preset.settleDuration / 1000,
                ease: `back.out(${preset.bounceStrength})`,
                onComplete: () => {
                    console.log(`[Reel ${config.reelId}] Stopped at offsetY: ${Math.floor(offsetY.value)}`)
                    if (config.reelId === 4 && onAllReelsStopped) {
                        onAllReelsStopped()
                    }
                }
            })
        } else {
            // 無回彈時，Phase 3 完成後直接回調
            timeline.call(() => {
                console.log(`[Reel ${config.reelId}] Stopped at offsetY: ${Math.floor(offsetY.value)}`)
                if (config.reelId === 4 && onAllReelsStopped) {
                    onAllReelsStopped()
                }
            })
        }
    }

    /**
     * Force stop the reel animation
     */
    const stop = () => {
        if (timeline) {
            timeline.kill()
            timeline = null
        }
    }

    /**
     * Reset offset to 0
     */
    const reset = () => {
        stop()
        offsetY.value = 0
    }

    return {
        offsetY,
        spin,
        stop,
        reset
    }
}

