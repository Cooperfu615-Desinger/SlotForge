import { computed, ref } from 'vue'

export const useCanvasPanZoom = () => {
  const previewScale = ref(1)
  const isPanning = ref(false)
  const isMouseDown = ref(false)
  const panOffset = ref({ x: 0, y: 0 })
  const dragStart = ref({ x: 0, y: 0 })

  const handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('.draggable-window') || target.closest('.zoom-slider')) {
      return
    }

    isMouseDown.value = true
    dragStart.value = {
      x: event.clientX - panOffset.value.x,
      y: event.clientY - panOffset.value.y,
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown.value) return

    if (!isPanning.value) {
      const currentPanX = event.clientX - dragStart.value.x
      const currentPanY = event.clientY - dragStart.value.y
      const dx = currentPanX - panOffset.value.x
      const dy = currentPanY - panOffset.value.y

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isPanning.value = true
      }
    }

    if (isPanning.value) {
      panOffset.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y,
      }
    }
  }

  const stopPanning = () => {
    isMouseDown.value = false
    window.setTimeout(() => {
      isPanning.value = false
    }, 0)
  }

  const deviceTransformStyle = computed(() => ({
    transform: `translate(${panOffset.value.x}px, ${panOffset.value.y}px) scale(${previewScale.value})`,
    transition: isPanning.value ? 'none' : 'transform 0.1s ease-out',
    pointerEvents: isPanning.value ? 'none' : 'auto',
  }))

  return {
    previewScale,
    isPanning,
    panOffset,
    handleMouseDown,
    handleMouseMove,
    stopPanning,
    deviceTransformStyle,
  }
}
