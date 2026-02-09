<script setup lang="ts">
import { ref } from 'vue'
import InspectorPanel from './InspectorPanel.vue'
import AssetManagerPanel from './AssetManagerPanel.vue'

type Tab = 'inspector' | 'assets'
const activeTab = ref<Tab>('inspector')
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Tab Navigation -->
    <div class="flex border-b border-gray-200 bg-gray-50">
      <button 
        @click="activeTab = 'inspector'"
        :class="[
          'flex-1 py-3 text-sm font-semibold transition-colors',
          activeTab === 'inspector' 
            ? 'text-cyan-600 border-b-2 border-cyan-600 bg-white' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        ]"
      >
        屬性
      </button>
      <button 
        @click="activeTab = 'assets'"
        :class="[
          'flex-1 py-3 text-sm font-semibold transition-colors',
          activeTab === 'assets' 
            ? 'text-cyan-600 border-b-2 border-cyan-600 bg-white' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        ]"
      >
        素材
      
      </button>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-hidden">
      <InspectorPanel v-if="activeTab === 'inspector'" />
      <AssetManagerPanel v-else-if="activeTab === 'assets'" />
    </div>
  </div>
</template>
