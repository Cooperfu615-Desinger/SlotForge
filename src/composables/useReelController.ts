import gsap from 'gsap'
import { ref, onUnmounted } from 'vue'
import type { SpeedPreset } from '../stores/gameStore'

export interface ReelConfig {
    reelId: number
    symbolHeight: number
}

export type ReelStatus = 'IDLE' | 'ACCELERATING' | 'SPINNING' | 'STOPPING' | 'COMPLETED'

/**
 * Physics-based Reel Controller
 * 
 * Uses a velocity-based approach driven by gsap.ticker for continuous simulation.
 * Position increases monotonically effectively representing "distance traveled down".
 */
export const useReelController = (config: ReelConfig, onAllReelsStopped?: () => void) => {
    const status = ref<ReelStatus>('IDLE')

    // Physics State
    // position: Total pixels traveled (Logic: Moving Down)
    // speed: Pixels per second
    const position = ref(0)
    const speed = ref(0)

    // Animation Handles
    let activePreset: SpeedPreset | null = null
    let speedTween: gsap.core.Tween | null = null
    let positionTween: gsap.core.Tween | null = null

    // Constants
    const MAX_SPEED = 2500 // px/sec target speed for normal spin

    // Ticker Loop for Physics
    const updatePhysics = (_time: number, deltaTime: number) => {
        // DeltaTime is in ms
        if (status.value === 'ACCELERATING' || status.value === 'SPINNING') {
            // distance = speed * (delta / 1000)
            position.value += speed.value * (deltaTime / 1000)
        }
    }

    // Bind Ticker
    gsap.ticker.add(updatePhysics)

    onUnmounted(() => {
        gsap.ticker.remove(updatePhysics)
        killTweens()
    })

    const killTweens = () => {
        if (speedTween) {
            speedTween.kill()
            speedTween = null
        }
        if (positionTween) {
            positionTween.kill()
            positionTween = null
        }
    }

    /**
     * Start Spin
     */
    const spin = (preset: SpeedPreset) => {
        killTweens()
        status.value = 'ACCELERATING'
        activePreset = preset

        // Only use instant snap if duration is strictly 0
        const isInstant = preset.spinDuration === 0

        if (isInstant) {
            instantStop()
            return
        }

        // Calculate Delay
        const delay = (config.reelId * (preset.intervalBetweenReels || 200)) / 1000

        // Accelerate
        // Use a fraction of spinDuration or fixed 0.5s.
        // For Turbo (500ms), 0.5s is exactly the whole duration, which is fine.
        speedTween = gsap.to(speed, {
            value: MAX_SPEED,
            duration: 0.5,
            delay: delay,
            ease: 'power1.in',
            onStart: () => {
                // status handles
            },
            onComplete: () => {
                status.value = 'SPINNING'
            }
        })
    }

    /**
     * Stop at alignments
     */
    const stop = () => {
        if (status.value === 'IDLE' || status.value === 'COMPLETED' || status.value === 'STOPPING') return

        status.value = 'STOPPING'

        // Important: kill speed tween so we don't keep accelerating if we called stop early.
        if (speedTween) {
            speedTween.kill()
            speedTween = null
        }

        // Calculate Target Position
        // Land on a multiple of H
        // position is increasing via ticker.
        const currentPos = position.value
        const h = config.symbolHeight

        // Ensure we roll at least a bit more so we don't snap back instant if we just passed a line.
        const SAFETY_DISTANCE = h * 3
        const rawTarget = currentPos + SAFETY_DISTANCE
        const targetPosition = Math.ceil(rawTarget / h) * h

        // Decelerate & Snap
        // We use GSAP to tween 'position' to target.
        // We must ensure 'updatePhysics' doesn't conflict. 
        // updatePhysics checks for ACCELERATING/SPINNING logic only updates position if so.
        // STOPPING state means ticker ignores position.

        // Determine Duration
        // Use preset.spinDuration if available (convert ms to s), else default 2.0
        const stopDuration = activePreset && activePreset.spinDuration > 0
            ? activePreset.spinDuration / 1000
            : 2.0

        positionTween = gsap.to(position, {
            value: targetPosition,
            duration: stopDuration,
            ease: 'back.out(0.6)',
            onComplete: () => {
                status.value = 'COMPLETED'
                speed.value = 0
                position.value = targetPosition
                console.log(`[Reel ${config.reelId}] Stopped at ${targetPosition}`)
                onAllReelsStopped?.()
            }
        })
    }

    /**
     * Instant Stop
     */
    const instantStop = () => {
        killTweens()

        const h = config.symbolHeight
        const target = Math.ceil(position.value / h) * h

        position.value = target
        speed.value = 0
        status.value = 'COMPLETED'

        onAllReelsStopped?.()
    }

    /**
     * Reset
     */
    const reset = () => {
        killTweens()
        status.value = 'IDLE'
        position.value = 0
        speed.value = 0
    }

    return {
        status,
        position,
        offsetY: position, // Alias for legacy/external use
        speed,
        spin,
        stop,
        instantStop,
        reset
    }
}
