<script setup lang="ts">
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()

function toggleOrientation() {
  const newO = forgeStore.orientation === 'landscape' ? 'portrait' : 'landscape'
  forgeStore.setOrientation(newO)
}
</script>

<template>
  <div class="top-nav-bar">
    <!-- Template Info Display -->
    <div class="template-info">
      <span class="template-name">3x5 Reels / 50 Lines</span>
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
</style>
