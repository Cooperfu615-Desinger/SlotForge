<script setup lang="ts">
import { onMounted } from 'vue'
import { useForgeStore } from '@/stores/forge'
import normal5x3 from '@/mocks/normal_5x3.json'

const forgeStore = useForgeStore()

onMounted(() => {
  // Load default manifest on mount
  forgeStore.loadManifest(normal5x3)
})
</script>

<template>
  <div class="app-container">
    <div class="header">
      <h1>SlotForge</h1>
      <p>Visual Slot Spec Viewer - Phase 0 Setup Complete</p>
    </div>
    
    <div class="content">
      <div class="info-panel">
        <h2>Project Info</h2>
        <div v-if="forgeStore.manifest">
          <p><strong>Project:</strong> {{ forgeStore.manifest.meta.project_name }}</p>
          <p><strong>Version:</strong> {{ forgeStore.manifest.meta.version }}</p>
          <p><strong>Resolution:</strong> {{ forgeStore.manifest.meta.base_resolution.w }} x {{ forgeStore.manifest.meta.base_resolution.h }}</p>
          <p><strong>Orientation:</strong> {{ forgeStore.manifest.meta.orientation }}</p>
          <p><strong>Elements:</strong> {{ forgeStore.manifest.layout_elements.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  color: #a1a1aa;
  margin: 0;
}

.content {
  flex: 1;
  display: flex;
  gap: 2rem;
}

.info-panel {
  background: #27272a;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #3f3f46;
}

.info-panel h2 {
  margin-top: 0;
  color: #e4e4e7;
  font-size: 1.25rem;
}

.info-panel p {
  margin: 0.5rem 0;
  color: #d4d4d8;
}

.info-panel strong {
  color: #a1a1aa;
  margin-right: 0.5rem;
}
</style>
