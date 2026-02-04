import gsap from 'gsap'
import { ref } from 'vue'

export interface ReelConfig {
    reelId: number           // 0-4 (for 5 reels)
    symbolHeight: number     // Height of each symbol (e.g., 120px)
    spinDuration: number     // Total spin duration (ms)
    stopDelay: number        // Delay before this reel stops (ms)
}

export const useReelController = (config: ReelConfig, onAllReelsStopped?: () => void) => {
    // Current Y offset for this reel (累積位移量)
    const offsetY = ref(0)

    // GSAP Timeline instance
    let timeline: gsap.core.Timeline | null = null

    /**
     * Start the reel spin animation
     * 修正後的邏輯：
     * - offsetY 持續增加 = 符號往下掉落
     * - 新符號從上方出現（透過 modulus 循環）
     */
    const spin = () => {
        if (timeline) {
            timeline.kill()
        }

        timeline = gsap.timeline()

        // Phase 1: Spin (高速滾動)
        // 使用相對位移 '+=' 確保持續累加
        timeline.to(offsetY, {
            value: `+=${config.symbolHeight * 40}`,  // 滾動 40 個符號的距離
            duration: config.spinDuration / 1000,
            ease: 'linear',
            onUpdate: () => {
                // 每次更新時輸出當前位移（除錯用）
                if (Math.floor(offsetY.value) % 100 === 0) {
                    console.log(`[Reel ${config.reelId}] offsetY: ${Math.floor(offsetY.value)}`)
                }
            }
        })

        // Phase 2: Stop with Bounce
        // 計算最終停止位置（對齊到符號高度的倍數）
        timeline.to(offsetY, {
            value: () => {
                const current = offsetY.value
                // 找到下一個對齊點
                const nextAligned = Math.ceil(current / config.symbolHeight) * config.symbolHeight
                // 多滾 2.5 個符號增加戲劇性
                return nextAligned + config.symbolHeight * 2.5
            },
            duration: 0.8,
            delay: config.stopDelay / 1000,
            ease: 'back.out(1.7)',
            onComplete: () => {
                console.log(`[Reel ${config.reelId}] Stopped at offsetY: ${Math.floor(offsetY.value)}`)
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
    }

    return {
        offsetY,
        spin,
        stop
    }
}
