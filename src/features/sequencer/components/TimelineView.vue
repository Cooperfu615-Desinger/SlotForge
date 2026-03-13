<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTimelineStore } from '../../../stores/timelineStore'
import { useGameStore } from '../../../stores/gameStore'

const store = useTimelineStore()
const gameStore = useGameStore()

const visibleTracks = computed(() => store.tracks.filter((track) => track.id.startsWith('reel')))

const ticks = computed(() => {
  const totalMs = store.totalDuration
  const tickInterval = 500
  const count = Math.ceil(totalMs / tickInterval)

  return Array.from({ length: count + 1 }, (_, i) => {
    const time = i * tickInterval
    return {
      time,
      label: `${(time / 1000).toFixed(1)}s`,
      left: time * store.pxPerMs,
    }
  })
})

const getBlockStyle = (block: any) => {
  const left = block.start * store.pxPerMs
  const width = block.duration * store.pxPerMs
  return {
    left: `${left}px`,
    width: `${width}px`,
    backgroundColor: block.color,
  }
}

const playheadLeft = computed(() => `${store.currentTime * store.pxPerMs}px`)

const isDragging = ref(false)
const rulerRef = ref<HTMLElement | null>(null)

const updatePlayheadPosition = (event: MouseEvent) => {
  if (!rulerRef.value) return

  const rect = rulerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const newTime = x / store.pxPerMs

  store.setTime(newTime)
  gameStore.seekTo(newTime)
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  updatePlayheadPosition(event)
}

const stopDrag = () => {
  isDragging.value = false
  gameStore.stopSeeking()
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  gameStore.isSeeking = true
  updatePlayheadPosition(event)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const resizingBlockId = ref<string | null>(null)
const resizeStartX = ref(0)
const resizeStartDuration = ref(0)

const onResize = (event: MouseEvent) => {
  if (!resizingBlockId.value) return

  const deltaX = event.clientX - resizeStartX.value
  const deltaTime = deltaX / store.pxPerMs
  const newDuration = resizeStartDuration.value + deltaTime
  store.updateBlockDuration(resizingBlockId.value, newDuration)
}

const stopResize = () => {
  resizingBlockId.value = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const startResize = (event: MouseEvent, blockId: string, currentDuration: number) => {
  event.stopPropagation()
  resizingBlockId.value = blockId
  resizeStartX.value = event.clientX
  resizeStartDuration.value = currentDuration
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}
</script>

<template>
  <div class="timeline-view flex flex-col h-full bg-gray-50 select-none">
    <div class="ruler h-6 border-b border-gray-200 flex bg-white z-20">
      <div class="w-32 flex-shrink-0 border-r border-gray-200 h-full bg-white"></div>

      <div
        ref="rulerRef"
        class="flex-1 h-full relative cursor-pointer"
        :style="{ width: store.totalDuration * store.pxPerMs + 'px' }"
        @mousedown="startDrag"
      >
        <div
          v-for="tick in ticks"
          :key="tick.time"
          class="absolute top-0 h-full border-l border-gray-300 pl-1 text-[9px] text-gray-400 select-none pointer-events-none"
          :style="{ left: tick.left + 'px' }"
        >
          {{ tick.label }}
        </div>

        <div class="absolute top-0 w-3 h-3 -ml-1.5 z-20 pointer-events-none transition-transform duration-75" :style="{ left: playheadLeft }">
          <svg viewBox="0 0 10 10" class="fill-red-500 drop-shadow-sm">
            <path d="M0 0 L10 0 L5 8 Z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-auto relative">
      <div class="absolute top-0 bottom-0 right-0 pointer-events-none z-30" style="left: 128px;">
        <div class="absolute top-0 bottom-0 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" :style="{ left: playheadLeft }"></div>
      </div>

      <div
        v-for="track in visibleTracks"
        :key="track.id"
        class="track-row h-8 border-b border-gray-200 relative flex items-center bg-gray-50/50 hover:bg-white transition-colors"
      >
        <div class="w-32 flex-shrink-0 border-r border-gray-200 h-full flex items-center px-3 text-xs font-medium text-gray-500 bg-white z-10 sticky left-0">
          {{ track.label }}
        </div>

        <div class="flex-1 h-full relative" :style="{ width: store.totalDuration * store.pxPerMs + 'px' }">
          <div
            v-for="tick in ticks"
            :key="`grid-${tick.time}`"
            class="absolute top-0 bottom-0 border-l border-gray-100 h-full pointer-events-none"
            :style="{ left: tick.left + 'px' }"
          ></div>

          <div
            v-for="block in store.blocks.filter((b) => b.trackId === track.id)"
            :key="block.id"
            class="absolute top-1 bottom-1 rounded-sm flex items-center px-2 text-[10px] font-bold shadow-sm overflow-visible whitespace-nowrap group"
            :style="{ ...getBlockStyle(block), color: block.textColor || 'white' }"
          >
            {{ block.label }}

            <div
              class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/30 hover:bg-white/50"
              @mousedown="startResize($event, block.id, block.duration)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-view ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.timeline-view ::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-view ::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.timeline-view ::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
