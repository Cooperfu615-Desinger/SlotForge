<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'
import GanttChart from '@/components/Timeline/GanttChart.vue'

const forgeStore = useForgeStore()
const isPlaying = computed(() => forgeStore.isPlaying)

function togglePlay() {
  forgeStore.togglePlayback()
}
</script>

<template>
  <div class="player-bar">
    <!-- FAB Play Button -->
    <button class="fab-play" @click="togglePlay" :class="{ playing: isPlaying }">
      <span v-if="!isPlaying">▶</span>
      <span v-else>⏸</span>
    </button>
    
    <!-- Timeline -->
    <div class="timeline-container">
      <GanttChart />
    </div>
  </div>
</template>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  height: 180px;
  
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  
  z-index: 50;
}

.fab-play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(167, 139, 250, 0.4);
  transition: all 0.3s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-play:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 24px rgba(167, 139, 250, 0.6);
}

.fab-play.playing {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.timeline-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
}
</style>
