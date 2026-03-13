import type { SpeedPreset } from '../../reels/config/speedPresets'
import type { TimelineBlock } from '../../../stores/timelineStore'

export const buildTimelineBlocksFromPreset = (preset: SpeedPreset, reelCount = 5): TimelineBlock[] => {
  const blocks: TimelineBlock[] = []
  const baseId = `seq-${Date.now()}`

  for (let reelIndex = 0; reelIndex < reelCount; reelIndex++) {
    const reelNum = reelIndex + 1
    const trackId = `reel${reelNum}`
    const staggerOffset = reelIndex * preset.intervalBetweenReels

    let currentTimeOffset = staggerOffset

    blocks.push({
      id: `${baseId}-r${reelNum}-spin`,
      trackId,
      start: currentTimeOffset,
      duration: preset.spinDuration,
      label: 'SPIN',
      color: '#4b5563',
      phase: 'spin',
    })
    currentTimeOffset += preset.spinDuration

    blocks.push({
      id: `${baseId}-r${reelNum}-dec`,
      trackId,
      start: currentTimeOffset,
      duration: preset.decelerateDuration,
      label: 'DEC',
      color: '#6b7280',
      phase: 'decelerate',
    })
    currentTimeOffset += preset.decelerateDuration

    blocks.push({
      id: `${baseId}-r${reelNum}-aln`,
      trackId,
      start: currentTimeOffset,
      duration: preset.alignDuration,
      label: 'ALN',
      color: '#9ca3af',
      phase: 'align',
    })
    currentTimeOffset += preset.alignDuration

    blocks.push({
      id: `${baseId}-r${reelNum}-set`,
      trackId,
      start: currentTimeOffset,
      duration: preset.settleDuration,
      label: 'SET',
      color: '#d1d5db',
      textColor: '#374151',
      phase: 'settle',
    })
  }

  return blocks
}

export const getTimelineTotalDuration = (preset: SpeedPreset, reelCount = 5) => {
  const totalPhaseDuration =
    preset.spinDuration +
    preset.decelerateDuration +
    preset.alignDuration +
    preset.settleDuration

  const totalStagger = (reelCount - 1) * preset.intervalBetweenReels
  return Math.max(5000, totalStagger + totalPhaseDuration + 1000)
}
