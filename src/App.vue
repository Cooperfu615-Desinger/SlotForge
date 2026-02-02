<script setup lang="ts">
import StageContainer from '@/components/Renderer/StageContainer.vue'
import JsonEditor from '@/components/Editor/JsonEditor.vue'
// Data is pre-loaded in main.ts, no need to load here

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
