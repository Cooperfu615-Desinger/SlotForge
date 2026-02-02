<script setup lang="ts">
import { ref } from 'vue'
import { useForgeStore } from '@/stores/forge'
import StageContainer from '@/components/Renderer/StageContainer.vue'
import JsonEditor from '@/components/Editor/JsonEditor.vue'
import CoordinateInspector from '@/components/Inspector/CoordinateInspector.vue'
// Data is pre-loaded in main.ts, no need to load here

const forgeStore = useForgeStore()

// Tab state
const activeTab = ref<'editor' | 'inspector'>('editor')
</script>

<template>
  <div class="app-container">
    <div class="split-layout">
      <!-- Left: Renderer -->
      <div class="left-panel">
        <StageContainer />
      </div>
      
      <!-- Right: Editor + Inspector with Tabs -->
      <div class="right-panel">
        <!-- Tab Header -->
        <div class="tab-header">
          <button 
            :class="['tab-button', { active: activeTab === 'editor' }]"
            @click="activeTab = 'editor'"
          >
            📝 Manifest Editor
          </button>
          <button 
            :class="['tab-button', { active: activeTab === 'inspector' }]"
            @click="activeTab = 'inspector'"
          >
            🔍 Inspector
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <JsonEditor v-show="activeTab === 'editor'" />
          <CoordinateInspector 
            v-show="activeTab === 'inspector'" 
            :selected-element="forgeStore.selectedElement"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.split-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-panel {
  flex: 0 0 60%;
  height: 100%;
  border-right: 2px solid #3f3f46;
}

.right-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.tab-header {
  display: flex;
  background: #18181c;
  border-bottom: 1px solid #27272a;
  padding: 0;
  flex-shrink: 0;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #71717a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  background: #27272a;
  color: #a1a1aa;
}

.tab-button.active {
  color: #e4e4e7;
  border-bottom-color: #3b82f6;
  background: #1e1e1e;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tab-content > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
