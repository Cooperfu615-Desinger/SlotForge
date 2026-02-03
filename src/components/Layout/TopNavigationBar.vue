<template>
  <div class="w-[600px] h-12 flex items-center justify-between pl-1 pr-1 bg-white">
    <!-- Template Selector (Full Width) -->
    <div class="flex-1 overflow-hidden h-full">
      <TemplateSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import TemplateSelector from './TemplateSelector.vue'
</script>

<style scoped>
.icon-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-lg;
}
</style>
