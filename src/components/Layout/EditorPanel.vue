<script setup lang="ts">
// Simplified mock panel for visual matching
// import { useForgeStore } from '@/stores/forge'
// const forgeStore = useForgeStore()
</script>

<template>
  <div class="h-full flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-slate-800 font-sans">
    <!-- Header -->
    <div class="flex-none pt-6 px-6 pb-2">
      <h2 class="text-xl font-black tracking-wide text-slate-900">參數區</h2>
    </div>
    
    <!-- Inspector (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
      
      <!-- Basic Info Section -->
      <section>
        <h3 class="font-bold text-slate-900 mb-3 text-base">基本資訊</h3>
        <div class="space-y-3">
           <!-- Row: ID -->
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-slate-500 font-bold text-sm">ID :</label>
             <div class="group relative flex items-center">
                <input type="text" value="R1_C1" readonly class="w-full bg-gray-100/80 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 border border-transparent focus:bg-white focus:border-blue-400 transition-colors outline-none" />
                <span class="absolute right-2 text-slate-400 cursor-pointer hover:text-slate-600">📄</span>
             </div>
           </div>
           
           <!-- Row: Name -->
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-slate-500 font-bold text-sm">Name :</label>
             <div class="group relative flex items-center">
                <input type="text" value="Symbol R1-C1" readonly class="w-full bg-gray-100/80 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 border border-transparent focus:bg-white focus:border-blue-400 transition-colors outline-none" />
                <span class="absolute right-2 text-slate-400 cursor-pointer hover:text-slate-600">📄</span>
             </div>
           </div>

           <!-- Row: Type -->
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-slate-500 font-bold text-sm">Type :</label>
             <div class="group relative flex items-center">
                <input type="text" value="symbol" readonly class="w-full bg-gray-100/80 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 border border-transparent focus:bg-white focus:border-blue-400 transition-colors outline-none" />
                <span class="absolute right-2 text-slate-400 cursor-pointer hover:text-slate-600">📄</span>
             </div>
           </div>
           
           <!-- Row: Anchor -->
            <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-slate-500 font-bold text-sm">Anchor :</label>
             <div class="group relative flex items-center">
                <input type="text" value="top-left" readonly class="w-full bg-gray-100/80 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 border border-transparent focus:bg-white focus:border-blue-400 transition-colors outline-none" />
                <span class="absolute right-2 text-slate-400 cursor-pointer hover:text-slate-600">📄</span>
             </div>
           </div>

           <!-- Row: Z-Index -->
           <div class="grid grid-cols-[80px_1fr] items-center gap-2">
             <label class="text-slate-500 font-bold text-sm">Z-Index :</label>
             <div class="group relative flex items-center">
                <input type="text" value="10" readonly class="w-full bg-gray-100/80 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 border border-transparent focus:bg-white focus:border-blue-400 transition-colors outline-none" />
                <span class="absolute right-2 text-slate-400 cursor-pointer hover:text-slate-600">📄</span>
             </div>
           </div>
        </div>
      </section>

      <!-- Coordinates and Transform Section -->
      <section>
         <div class="grid grid-cols-2 gap-8 mb-2 border-b border-slate-100 pb-2">
             <h3 class="font-bold text-slate-900 text-sm">Creator 座標</h3>
             <h3 class="font-bold text-slate-900 text-sm">Web 座標</h3>
         </div>
         
         <!-- Mock tabular data for coordinates to match image -->
         <div class="grid grid-cols-2 gap-8 text-sm font-mono text-slate-600 mb-4">
            <div class="space-y-2">
                <div class="flex justify-between"><span>X :</span><span>-70.00</span></div>
                <div class="flex justify-between"><span>Y :</span><span>230.00</span></div>
                <div class="flex justify-between"><span>W :</span><span>160</span></div>
                <div class="flex justify-between"><span>H :</span><span>160</span></div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between"><span>X :</span><span>570px</span></div>
                <div class="flex justify-between"><span>Y :</span><span>130px</span></div>
                <div class="flex justify-between"><span>W :</span><span>160px</span></div>
                <div class="flex justify-between"><span>H :</span><span>160px</span></div>
            </div>
         </div>

         <!-- Formula Box -->
         <div class="bg-gray-200/50 p-3 rounded-lg text-xs font-mono text-slate-500 leading-relaxed">
            x_cocos = (570 - 1280/2) + (0 * 160) = -70<br>
            y_cocos = (720/2 - 130) - (0 * 160) = 230
         </div>
      </section>
      
    </div>
    
    <!-- JSON Editor (Fixed Height at Bottom) -->
    <div class="h-1/4 border-t border-slate-100 bg-white flex flex-col">
       <div class="px-6 py-3 border-b border-transparent flex justify-between items-center">
         <span class="font-bold text-slate-900">JSON</span>
       </div>
       <div class="flex-1 overflow-hidden relative mx-6 mb-6 bg-gray-200/50 rounded-xl p-4">
         <div class="text-xs font-mono text-slate-500 h-full overflow-hidden opacity-70">
            MANIFEST EDITOR<br>
            {<br>
            &nbsp;&nbsp;"meta": {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"project_name": "SlotForge",<br>
            &nbsp;&nbsp;&nbsp;&nbsp;...<br>
            &nbsp;&nbsp;}<br>
            }
         </div>
         <span class="absolute top-4 right-4 text-slate-400">📄</span>
       </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
