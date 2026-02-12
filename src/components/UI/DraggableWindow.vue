<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    title: string
    initialX: number
    initialY: number
    width?: string
    zIndex?: number
    resizable?: boolean // Optional: enable resize functionality
    initiallyCollapsed?: boolean // Optional: default collapsed state
}>()

const emit = defineEmits<{
    (e: 'update:position', x: number, y: number): void
    (e: 'focus'): void
}>()

// State
const isCollapsed = ref(props.initiallyCollapsed || false)
const position = ref({ x: props.initialX, y: props.initialY })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const initialPos = ref({ x: 0, y: 0 })
const windowRef = ref<HTMLElement | null>(null)

// Boundary Logic
const PADDING = 20

const clampPosition = () => {
    if (!windowRef.value) return

    const rect = windowRef.value.getBoundingClientRect()
    const winW = window.innerWidth
    const winH = window.innerHeight
    
    // Width/Height might change if collapsed
    const w = rect.width
    const h = rect.height

    let newX = position.value.x
    let newY = position.value.y

    // Clamp X
    // min: PADDING
    // max: winW - w - PADDING
    if (newX < PADDING) newX = PADDING
    if (newX > winW - w - PADDING) newX = Math.max(PADDING, winW - w - PADDING)

    // Clamp Y
    // min: PADDING
    // max: winH - h - PADDING
    if (newY < PADDING) newY = PADDING
    if (newY > winH - h - PADDING) newY = Math.max(PADDING, winH - h - PADDING)

    position.value = { x: newX, y: newY }
    emit('update:position', newX, newY)
}

const onResize = () => {
    clampPosition()
}

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
    
    // Raw position
    position.value = {
        x: initialPos.value.x + dx,
        y: initialPos.value.y + dy
    }
    
    // Clamp immediately
    // Note: Clamping during drag can feel "sticky" but ensures safety.
    // Ideally we clamp the *target* position. 
    // Let's rely on clampPosition logic but applied to current calc.
    // Actually calling clampPosition() here is fine.
    clampPosition()
}

const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
}

const handleFocus = () => {
    emit('focus')
}

onMounted(() => {
    window.addEventListener('resize', onResize)
    // Initial clamp after mount to ensure safety
    // Use timeout to allow rendering
    setTimeout(clampPosition, 0)
})

onUnmounted(() => {
    window.removeEventListener('resize', onResize)
})

</script>

<template>
    <div 
    ref="windowRef"
    class="draggable-window"
    :class="{ collapsed: isCollapsed, resizable: props.resizable }"
    :style="{ 
        left: position.x + 'px', 
        top: position.y + 'px',
        width: isCollapsed ? 'auto' : (props.width || '300px'),
        zIndex: props.zIndex || 50
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

/* Resize functionality - only applied when resizable prop is true */
.draggable-window.resizable {
    overflow: auto;
    resize: both;
    min-width: 600px;
    min-height: 300px;
}

/* Remove min constraints when collapsed to allow auto-sizing */
.draggable-window.resizable.collapsed {
    min-width: 0;
    min-height: 0;
    resize: none;
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

/* Resize handle visual indicator - only shown when resizable */
.draggable-window.resizable::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, transparent 50%, #9ca3af 50%);
    cursor: nwse-resize;
    pointer-events: none;
}
</style>
