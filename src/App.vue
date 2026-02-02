<script setup lang="ts">
import { ref } from 'vue'
import { useForgeStore } from '@/stores/forge'
import JsonEditor from '@/components/Editor/JsonEditor.vue'
import CoordinateInspector from '@/components/Inspector/CoordinateInspector.vue'
import StageContainer from '@/components/Renderer/StageContainer.vue'
import GanttChart from '@/components/Timeline/GanttChart.vue'
import TemplateSelector from '@/components/Layout/TemplateSelector.vue'

const forgeStore = useForgeStore()
const activeTab = ref<'editor' | 'inspector'>('inspector')

// Toggle orientation logic (placeholder for functionality)
function toggleOrientation() {
  const newO = forgeStore.orientation === 'landscape' ? 'portrait' : 'landscape'
  forgeStore.setOrientation(newO)
}
</script>

<template>
  <div class="app-container">
    <!-- 1. Top Section: Template Selector -->
    <TemplateSelector />

    <!-- 2. Middle Section: Stage & Inspector -->
    <div class="main-workspace">
      
      <!-- Center: Stage Area -->
      <div class="stage-area">
        <!-- Stage Header: Title + Orientation Toggle -->
        <div class="stage-header-bar">
          <h2 class="template-title">3x5 Reels / 50 Lines</h2>
          <button class="icon-btn" @click="toggleOrientation" title="Toggle Orientation">
             <span class="rotate-icon" :class="{ portrait: forgeStore.orientation === 'portrait' }">📱</span>
          </button>
        </div>

        <!-- Canvas Container -->
        <div class="canvas-box">
          <StageContainer />
        </div>
      </div>

      <!-- Right: Inspector (Card Style) -->
      <div class="right-sidebar">
        <div class="sidebar-card">
          <div class="card-header">
            <button 
              :class="{ active: activeTab === 'inspector' }"
              @click="activeTab = 'inspector'"
            >
              參數區
            </button>
            <button 
              :class="{ active: activeTab === 'editor' }"
              @click="activeTab = 'editor'"
            >
              JSON
            </button>
          </div>
          
          <div class="card-content">
            <CoordinateInspector 
              v-if="activeTab === 'inspector'" 
              :selected-element="forgeStore.selectedElement"
            />
            <JsonEditor v-else />
          </div>
        </div>
      </div>

    </div>
    
    <!-- 3. Bottom Section: Timeline Control -->
    <div class="bottom-control-bar">
      <div class="control-title">控制列</div>
      <div class="timeline-wrapper">
        <GanttChart />
      </div>
    </div>
  </div>
</template>

<style>
/* Global Reset for this Layout */
:root {
  --app-bg: #f4f4f5;
  --card-bg: #ffffff;
  --border-color: #d4d4d8;
  --text-primary: #18181b;
  --text-secondary: #71717a;
  --accent-color: #3b82f6;
}

body {
  margin: 0;
  background-color: var(--app-bg);
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

/* Middle Section */
.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px; /* Spacing */
  gap: 16px;
}

.stage-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0; /* Important for flex child shrinking */
}

.stage-header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
}

.template-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.icon-btn {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #e4e4e7;
}

.rotate-icon {
  display: inline-block;
  transition: transform 0.3s;
}

.rotate-icon.portrait {
  transform: rotate(90deg);
}

.canvas-box {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  /* StageContainer handles its own centering/sizing now */
}

/* Right Sidebar */
.right-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.sidebar-card {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  border-bottom: 1px solid #e4e4e7;
  background: #fafafa;
}

.card-header button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.card-header button:hover {
  color: var(--text-primary);
}

.card-header button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
  background: white;
}

.card-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.card-content > * {
  width: 100%;
  height: 100%;
}

/* Bottom Control */
.bottom-control-bar {
  height: 220px;
  background: var(--card-bg);
  margin: 0 16px 16px 16px; /* Margin from edges */
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-title {
  text-align: center;
  padding: 8px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid #f4f4f5;
  font-size: 14px;
  background: #fafafa;
}

.timeline-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>
