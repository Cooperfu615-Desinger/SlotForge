<script setup lang="ts">
import { ref } from 'vue'
import { useForgeStore } from '@/stores/forge'
import CoordinateInspector from '@/components/Inspector/CoordinateInspector.vue'
import JsonEditor from '@/components/Editor/JsonEditor.vue'

const forgeStore = useForgeStore()
const activeTab = ref<'inspector' | 'editor'>('inspector')
</script>

<template>
  <div class="editor-panel">
    <!-- Tab Header -->
    <div class="panel-header">
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
    
    <!-- Content -->
    <div class="panel-content">
      <CoordinateInspector 
        v-if="activeTab === 'inspector'" 
        :selected-element="forgeStore.selectedElement"
      />
      <JsonEditor v-else />
    </div>
  </div>
</template>

<style scoped>
.editor-panel {
  position: fixed;
  right: 1.5rem;
  top: 6rem;
  bottom: 14rem;
  width: 450px;
  
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  z-index: 50;
}

.panel-header {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.panel-header button:hover {
  color: rgba(255, 255, 255, 0.9);
}

.panel-header button.active {
  color: #a78bfa; /* Antigravity purple */
  background: rgba(167, 139, 250, 0.1);
  border-bottom: 2px solid #a78bfa;
}

.panel-content {
  flex: 1;
  overflow: auto;
}
</style>
