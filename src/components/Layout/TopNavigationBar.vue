<template>
  <!-- Carousel Container (Pill Style with Backdrop Blur) -->
  <div class="w-[800px] h-16 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 flex items-center justify-between gap-4 px-6 pointer-events-auto">
    
    <!-- Left Navigation Arrow -->
    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>

    <!-- Cards Scroll Area -->
    <div class="flex-1 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center h-full">
       
       <!-- Card 1: Line Game 1 Lines -->
       <div class="flex-none w-32 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors relative group">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Line Game</div>
          <div class="text-xs font-black text-slate-800">1 Lines</div>
       </div>

       <!-- Card 2: Line Game 50 Lines (Active) -->
       <div class="flex-none w-32 h-14 bg-white rounded-lg shadow-md border-b-2 border-b-blue-500 flex flex-col items-center justify-center cursor-pointer relative -translate-y-1">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Line Game</div>
          <div class="text-xs font-black text-slate-800">50 Lines</div>
       </div>

       <!-- Card 3: Way Game 243 Ways -->
       <div class="flex-none w-32 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Way Game</div>
          <div class="text-xs font-black text-slate-800">243 Ways</div>
       </div>

       <!-- Card 4: Way Game 1024 Ways -->
       <div class="flex-none w-32 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Way Game</div>
          <div class="text-xs font-black text-slate-800">1024 Ways</div>
       </div>
    </div>

    <!-- Right Navigation Arrow -->
    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
// Visual Mock for Phase 7
</script>

<style scoped>
.icon-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-lg;
}
</style>
