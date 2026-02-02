<script setup lang="ts">
import { ref } from 'vue'

const templates = [
  { id: '1x3', name: '1 Lines', sub: '1x3 Reels', active: false },
  { id: '3x5', name: '50 Lines', sub: '3x5 Reels', active: true }, // Default
  { id: '243', name: '243 Ways', sub: '3x5 Reels', active: false },
  { id: '1024', name: '1024 Ways', sub: '4x5 Reels', active: false },
  { id: 'mega', name: 'MegaWays', sub: '4x6 Reels', active: false },
  { id: 'cascade', name: 'CASCADING', sub: '5x6 Reels', active: false },
]

const scrollContainer = ref<HTMLElement | null>(null)

function scroll(direction: 'left' | 'right') {
  if (!scrollContainer.value) return
  const scrollAmount = 200
  if (direction === 'left') {
    scrollContainer.value.scrollLeft -= scrollAmount
  } else {
    scrollContainer.value.scrollLeft += scrollAmount
  }
}
</script>

<template>
  <div class="template-selector">
    <button class="nav-btn prev" @click="scroll('left')">◀</button>
    
    <div class="viewport" ref="scrollContainer">
      <div 
        v-for="tpl in templates" 
        :key="tpl.id"
        class="template-card"
        :class="{ active: tpl.active }"
      >
        <div class="line-type">Way game</div>
        <div class="main-title">{{ tpl.name }}</div>
        <div class="sub-title">{{ tpl.sub }}</div>
      </div>
    </div>

    <button class="nav-btn next" @click="scroll('right')">▶</button>
  </div>
</template>

<style scoped>
.template-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f4f4f5; /* Light gray from mockup */
  border-bottom: 1px solid #e4e4e7;
}

.viewport {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px;
  scrollbar-width: none; /* Hide scrollbar */
}
.viewport::-webkit-scrollbar {
  display: none;
}

.template-card {
  flex: 0 0 140px;
  height: 80px;
  background: white;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.template-card:hover {
  border-color: #a1a1aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.template-card.active {
  border: 2px solid #3b82f6; /* Blue active border */
  background: #eff6ff;
}

.line-type {
  font-size: 10px;
  color: #71717a;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.main-title {
  font-size: 14px;
  font-weight: 700;
  color: #18181b;
}

.sub-title {
  font-size: 11px;
  color: #52525b;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #a1a1aa;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.nav-btn:hover {
  background: #e4e4e7;
  color: #52525b;
}
</style>
