<template>
  <!-- Carousel Container (Transparent background) -->
  <div class="w-[800px] h-16 flex items-center justify-between gap-4 pointer-events-auto">
    
    <!-- Left Navigation Arrow -->
    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>

    <!-- Cards Scroll Area -->
    <div class="flex-1 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2">
       
       <!-- Card 1: Line Game 1 Lines -->
       <div class="flex-none w-32 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors relative group">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Line Game</div>
          <div class="text-sm font-black text-slate-800">1 Lines</div>
          <div class="text-[9px] text-slate-400 font-medium">1x3 Reels</div>
       </div>

       <!-- Card 2: Line Game 50 Lines (Active) -->
       <div class="flex-none w-32 h-14 bg-white rounded-xl shadow-md border-b-2 border-b-blue-500 flex flex-col items-center justify-center cursor-pointer relative transform -translate-y-0.5">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Line Game</div>
          <div class="text-sm font-black text-slate-800">50 Lines</div>
          <div class="text-[9px] text-slate-400 font-medium">3x5 Reels</div>
       </div>

       <!-- Card 3: Way Game 243 Ways -->
       <div class="flex-none w-32 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Way Game</div>
          <div class="text-sm font-black text-slate-800">243 Ways</div>
          <div class="text-[9px] text-slate-400 font-medium">3x5 Reels</div>
       </div>

       <!-- Card 4: Way Game 1024 Ways -->
       <div class="flex-none w-32 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Way Game</div>
          <div class="text-sm font-black text-slate-800">1024 Ways</div>
          <div class="text-[9px] text-slate-400 font-medium">4x5 Reels</div>
       </div>

       <!-- Card 5: MegaWays -->
       <div class="flex-none w-32 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">MegaWays</div>
          <div class="text-sm font-black text-slate-800">Cascading</div>
          <div class="text-[9px] text-slate-400 font-medium">4x6 Reels</div>
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
