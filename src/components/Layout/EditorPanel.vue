<script setup lang="ts">
import { useForgeStore } from '@/stores/forge'
import CoordinateInspector from '@/components/Inspector/CoordinateInspector.vue'
import JsonEditor from '@/components/Editor/JsonEditor.vue'

const forgeStore = useForgeStore()
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="flex-none p-4">
      <h2 class="text-lg font-bold text-gray-800">Inspector</h2>
    </div>
    
    <!-- Inspector (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
      
      <!-- Coordinate Algebra (New Web vs Creator) -->
      <section class="bg-gray-50 p-3 rounded-lg border border-gray-100">
         <div class="flex justify-between items-center mb-2">
             <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordinates</div>
         </div>
         <div class="grid grid-cols-2 gap-4">
            <div>
               <div class="text-[10px] text-gray-400 mb-1">CREATOR (COCOS)</div>
               <div class="font-mono text-sm font-bold text-gray-700">0, 0</div>
            </div>
            <div>
               <div class="text-[10px] text-gray-400 mb-1">WEB (KONVA)</div>
               <div class="font-mono text-sm font-bold text-blue-600">640, 360</div>
            </div>
         </div>
         <div class="mt-2 pt-2 border-t border-gray-200 text-[10px] font-mono text-gray-400">
            x_web = x_cocos + 1280/2<br>
            y_web = 720/2 - y_cocos
         </div>
      </section>

      <!-- Basic Info -->
      <section>
        <h3 class="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider">Object Properties</h3>
        <div class="space-y-2 text-sm">
           <!-- Mock Fields for visual match -->
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-gray-400 font-medium">ID</label>
             <div class="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between items-center text-gray-600">
               <span>R1_C1</span>
               <span>📋</span>
             </div>
           </div>
           
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-gray-400 font-medium">Name</label>
             <div class="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between items-center text-gray-600">
               <span>Symbol R1-C1</span>
               <span>📋</span>
             </div>
           </div>

           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-gray-400 font-medium">Type</label>
             <div class="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between items-center text-gray-600">
               <span>symbol</span>
               <span>📋</span>
             </div>
           </div>
           
            <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-gray-400 font-medium">Anchor</label>
             <div class="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between items-center text-gray-600">
               <span>top-left</span>
               <span>📋</span>
             </div>
           </div>

           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-gray-400 font-medium">Z-Index</label>
             <div class="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between items-center text-gray-600">
               <span>10</span>
               <span>📋</span>
             </div>
           </div>
        </div>
      </section>

      <!-- Coordinate Inspector (Actual Component Reuse) -->
      <section>
         <h3 class="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider">Transform</h3>
         <CoordinateInspector 
          :selected-element="forgeStore.selectedElement"
        />
      </section>
      
    </div>
    
    <!-- JSON Editor (Fixed Height at Bottom) -->
    <div class="h-1/3 border-t border-gray-100 bg-gray-50 flex flex-col">
       <div class="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-100">
         <span class="font-bold text-gray-700 text-xs uppercase tracking-wider">Manifest JSON</span>
         <span class="text-[10px] text-gray-500">READ ONLY</span>
       </div>
       <div class="flex-1 overflow-hidden relative">
         <JsonEditor />
       </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
