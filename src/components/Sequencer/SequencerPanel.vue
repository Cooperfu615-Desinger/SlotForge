<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore, type SpeedMode } from '../../stores/gameStore'

const gameStore = useGameStore()

// --- UI State ---
const isCollapsed = ref(false)
const panelRef = ref<HTMLElement | null>(null)

// Dragging Logic
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 }) // Transform offset
const dragStart = ref({ x: 0, y: 0 })
const initialPos = ref({ x: 0, y: 0 })

const startDrag = (e: MouseEvent) => {
    if (isCollapsed.value && e.target instanceof Element && e.target.closest('.minimize-btn')) return
    
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    initialPos.value = { ...position.value }
    
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
    if (!isDragging.value) return
    const dx = e.clientX - dragStart.value.x
    const dy = e.clientY - dragStart.value.y
    position.value = {
        x: initialPos.value.x + dx,
        y: initialPos.value.y + dy
    }
}

const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
}

// --- Actions (Mock & Real) ---

const setSpeed = (mode: SpeedMode) => {
  gameStore.setSpeed(mode)
  console.log(`Trigger: Set Speed ${mode}`)
}

const handleMainButton = () => {
  if (gameStore.isSpinning) {
    gameStore.stopSpin()
  } else {
    gameStore.startSpin()
  }
}

const triggerAction = (actionName: string) => {
  console.log(`Trigger: [${actionName}]`)
}

// --- Timeline Data ---
const tracks = ['Global', 'Reel 1', 'Reel 2', 'Reel 3', 'Reel 4', 'Reel 5', 'Audio/FX']

</script>

<template>
  <div 
    class="director-panel" 
    :class="{ collapsed: isCollapsed }"
    ref="panelRef"
    :style="{ transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)` }"
  >
    
    <!-- HEADER (Draggable Handle) -->
    <div class="panel-header" @mousedown="startDrag">
        <div class="header-title">Director Console</div>
        <button class="minimize-btn" @click.stop="isCollapsed = !isCollapsed">
            {{ isCollapsed ? '+' : '_' }}
        </button>
    </div>

    <!-- CONTENT (Collapsible) -->
    <div class="panel-content" v-show="!isCollapsed">
        
        <!-- TOOLBAR -->
        <div class="toolbar">
            <!-- Group A: Control -->
            <div class="tool-group">
                <div class="group-label">CONTROL</div>
                <div class="btn-row">
                    <div class="segmented-control">
                        <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'normal' }" @click="setSpeed('normal')">1x</button>
                        <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'fast' }" @click="setSpeed('fast')">2x</button>
                        <button class="btn" :class="{ active: gameStore.currentSpeedMode === 'instant' }" @click="setSpeed('instant')">3x</button>
                    </div>
                    <button class="btn action-btn text-bold" :class="{ active: gameStore.isSpinning }" @click="handleMainButton">
                        {{ gameStore.isSpinning ? 'STOP' : 'SPIN' }}
                    </button>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Group B: Win Demo -->
            <div class="tool-group">
                <div class="group-label">WIN DEMO</div>
                <div class="btn-row">
                    <button class="btn" @click="triggerAction('Small Win')">Small</button>
                    <button class="btn" @click="triggerAction('Big Win')">Big Win</button>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Group C: FX Test -->
            <div class="tool-group">
                <div class="group-label">FX TEST</div>
                <div class="btn-row">
                    <button class="btn" @click="triggerAction('Line FX')">Line</button>
                    <button class="btn" @click="triggerAction('Way FX')">Way</button>
                </div>
            </div>
        </div>

        <!-- TIMELINE -->
        <div class="timeline-container">
            <div class="track-headers">
                <div class="header-item placeholder"></div>
                <div v-for="track in tracks" :key="track" class="header-item">{{ track }}</div>
            </div>
            <div class="track-lanes">
                <div class="ruler">
                    <span v-for="i in 20" :key="i" class="tick" :style="{ left: (i * 50) + 'px' }">{{ (i * 0.5).toFixed(1) }}s</span>
                    <div class="playhead"></div>
                </div>
                <div v-for="track in tracks" :key="'lane-'+track" class="lane"></div>
            </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
/* --- ROOT PANEL --- */
.director-panel {
  position: fixed;
  bottom: 20px;
  left: 50%;
  /* transform is handled inline for drag logic */
  width: 90%;
  max-width: 1000px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height 0.3s ease;
}

.director-panel.collapsed {
    width: 200px; /* Shrink width when collapsed */
    height: auto;
}

/* --- HEADER --- */
.panel-header {
    height: 32px;
    background-color: #374151; /* gray-700 */
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    cursor: grab;
    user-select: none;
}

.panel-header:active {
    cursor: grabbing;
}

.header-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.minimize-btn {
    background: transparent;
    border: none;
    color: #e5e7eb;
    cursor: pointer;
    font-weight: bold;
    padding: 0 4px;
    font-size: 14px;
}

.minimize-btn:hover {
    color: white;
}

/* --- CONTENT --- */
.panel-content {
    display: flex;
    flex-direction: column;
    height: 250px; /* Fixed height for content area */
}

/* --- TOOLBAR --- */
.toolbar {
    height: 60px;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 20px;
}

.tool-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.group-label {
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af; /* gray-400 */
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

.divider {
    width: 1px;
    height: 32px;
    background-color: #e5e7eb;
}

/* --- BUTTONS (Gray/White Theme) --- */
.btn {
    height: 28px;
    padding: 0 12px;
    background-color: #f3f4f6; /* gray-100 */
    border: 1px solid #e5e7eb; /* gray-200 */
    color: #374151; /* gray-700 */
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.btn:hover {
    background-color: #e5e7eb; /* gray-200 */
    border-color: #d1d5db;
}

.btn:active {
    transform: translateY(1px);
}

.btn.active {
    background-color: #4b5563; /* gray-600 */
    color: #ffffff;
    border-color: #374151;
}

.segmented-control {
    display: flex;
    gap: 2px;
    background-color: #f3f4f6;
    padding: 2px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}

.segmented-control .btn {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    height: 24px;
    padding: 0 10px;
}

.segmented-control .btn:hover {
    background-color: rgba(0,0,0,0.05);
}

.segmented-control .btn.active {
    background-color: #ffffff;
    color: #111827;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.text-bold {
    font-weight: 600;
}

/* --- TIMELINE --- */
.timeline-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    background-color: #f9fafb; /* gray-50 */
}

.track-headers {
    width: 120px;
    border-right: 1px solid #e5e7eb;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
}

.header-item {
    height: 24px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-size: 11px;
    color: #6b7280; /* gray-500 */
    border-bottom: 1px solid #f3f4f6;
}

.header-item.placeholder {
    height: 20px;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

.track-lanes {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: auto;
}

.ruler {
    height: 20px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    min-width: 1000px;
}

.tick {
    position: absolute;
    top: 4px;
    font-size: 9px;
    color: #9ca3af;
    border-left: 1px solid #d1d5db;
    padding-left: 2px;
    height: 100%;
}

.playhead {
    position: absolute;
    left: 0;
    top: 0;
    height: 1000px;
    width: 1px;
    background-color: #ef4444; /* red-500 */
    z-index: 10;
}

.playhead::before {
    content: '▼';
    color: #ef4444;
    font-size: 8px;
    position: absolute;
    top: -6px;
    left: -3px;
}

.lane {
    height: 24px;
    border-bottom: 1px solid #e5e7eb;
    min-width: 1000px;
    background-image: linear-gradient(90deg, #f3f4f6 1px, transparent 1px);
    background-size: 50px 100%;
}
</style>
