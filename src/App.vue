<script setup lang="ts">
import { onMounted } from 'vue'
import { useForgeStore } from '@/stores/forge'
import StageContainer from '@/components/Renderer/StageContainer.vue'
import JsonEditor from '@/components/Editor/JsonEditor.vue'
import normal5x3Data from '@/mocks/normal_5x3.json'
import type { SlotManifest } from '@/types/manifest'

const forgeStore = useForgeStore()

onMounted(() => {
  // Load default manifest on mount with type assertion
  forgeStore.loadManifest(normal5x3Data as SlotManifest)
})
</script>

<template>
  <div class="app-container">
    <div class="split-layout">
      <!-- Left: Renderer -->
      <div class="left-panel">
        <StageContainer />
      </div>
      
      <!-- Right: Editor -->
      <div class="right-panel">
        <JsonEditor />
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
}
</style>
