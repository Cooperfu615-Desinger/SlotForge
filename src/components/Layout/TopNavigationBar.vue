<script setup lang="ts">
import { useForgeStore } from '@/stores/forge'
import { computed } from 'vue'

const forgeStore = useForgeStore()

function toggleOrientation() {
  const newO = forgeStore.orientation === 'landscape' ? 'portrait' : 'landscape'
  forgeStore.setOrientation(newO)
}

const zoomPercentage = computed({
  get: () => forgeStore.manualZoom === null ? 100 : Math.round(forgeStore.manualZoom * 100),
  set: (value: number) => {
    if (value === 100) {
      forgeStore.setManualZoom(null) // Auto-fit
    } else {
      forgeStore.setManualZoom(value / 100)
    }
  }
})

function resetZoom() {
  forgeStore.setManualZoom(null)
}
</script>

<template>
  <div class="top-nav-bar">
    <!-- Template Info Display -->
    <div class="template-info">
      <span class="template-name">3x5 Reels / 50 Lines</span>
    </div>
    
    <!-- Zoom Control -->
    <div class="zoom-control">
      <label class="zoom-label">Zoom: {{ zoomPercentage }}%</label>
      <input 
        type="range" 
        class="zoom-slider" 
        min="50" 
        max="200" 
        step="10" 
        v-model.number="zoomPercentage"
      />
      <button 
        class="reset-btn" 
        @click="resetZoom"
        title="Reset to Auto-Fit"
      >
        ↻
      </button>
    </div>
    
    <!-- Utility Buttons -->
    <div class="nav-actions">
      <button class="icon-btn" @click="toggleOrientation" title="切換方向">
        <span class="rotate-icon" :class="{ portrait: forgeStore.orientation === 'portrait' }">📱</span>
      </button>
      <button class="icon-btn" title="匯出">
        <span>📤</span>
      </button>
      <button class="icon-btn" title="設定">
        <span>⚙️</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.top-nav-bar {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px; /* Pill shape */
  
  z-index: 100;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-name {
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.rotate-icon {
  display: inline-block;
  transition: transform 0.3s;
}

.rotate-icon.portrait {
  transform: rotate(90deg);
}

/* Zoom Control */
.zoom-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.zoom-label {
  color: #a1a1aa;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.zoom-slider {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #a78bfa;
}

.zoom-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  background: #a78bfa;
}

.reset-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

</style>
