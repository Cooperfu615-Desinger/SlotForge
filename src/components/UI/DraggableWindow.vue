<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    title: string
    initialX: number
    initialY: number
    width?: string
    zIndex?: number
}>()

const emit = defineEmits<{
    (e: 'update:position', x: number, y: number): void
    (e: 'focus'): void
}>()

// State
const isCollapsed = ref(false)
const position = ref({ x: props.initialX, y: props.initialY })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const initialPos = ref({ x: 0, y: 0 })

// Z-Index Handling (Simple local override, parent should manage true stacking context if needed)
// But for now we rely on standard z-index and click-to-front logic if parent provides it.
// Default z-index for windows is 40. Active is 50.

// Drag Logic
const startDrag = (e: MouseEvent) => {
    // Only drag from header
    if ((e.target as HTMLElement).closest('.minimize-btn')) return;

    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    initialPos.value = { ...position.value }
    
    emit('focus')
    
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
    emit('update:position', position.value.x, position.value.y)
}

const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
}

const handleFocus = () => {
    emit('focus')
}

</script>

<template>
  <div 
    class="draggable-window"
    :class="{ collapsed: isCollapsed }"
    :style="{ 
        left: position.x + 'px', 
        top: position.y + 'px',
        width: isCollapsed ? '200px' : (props.width || '300px'),
        zIndex: props.zIndex || 40
    }"
    @mousedown="handleFocus"
  >
    <!-- Header -->
    <div class="window-header" @mousedown="startDrag">
        <span class="title">{{ props.title }}</span>
        <button class="minimize-btn" @click.stop="isCollapsed = !isCollapsed">
            {{ isCollapsed ? '+' : '_' }}
        </button>
    </div>

    <!-- Body -->
    <div class="window-body" v-show="!isCollapsed">
        <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.draggable-window {
    position: fixed;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px; /* Slightly smaller radius for desktop feel */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); /* shadow-xl */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.2s, height 0.2s, box-shadow 0.2s;
}

.draggable-window:active {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-2xl */
}

.window-header {
    height: 32px;
    background-color: #374151; /* gray-700 */
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}

.title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.minimize-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-weight: bold;
    padding: 0 4px;
    font-size: 14px;
}

.minimize-btn:hover {
    color: white;
}

.window-body {
    flex: 1;
    overflow: auto;
    background-color: #ffffff;
    /* Optional: max-height limit needed? Parent can control or slot content controls */
    max-height: 80vh;
}

/* Custom Scrollbar for body */
.window-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.window-body::-webkit-scrollbar-track {
    background: transparent;
}
.window-body::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 3px;
}
</style>
