<script setup lang="ts">
import WorldContainer from '@/components/Renderer/WorldContainer.vue'
import StageContainer from '@/components/Renderer/StageContainer.vue'
import TopNavigationBar from '@/components/Layout/TopNavigationBar.vue'
import EditorPanel from '@/components/Layout/EditorPanel.vue'
import PlayerBar from '@/components/Layout/PlayerBar.vue'
</script>

<template>
  <!-- Global Container: Logic Board Style (Zinc-100) -->
  <div class="h-screen w-screen bg-[#F3F4F6] overflow-hidden font-sans relative">
    
    <!-- 0. Infinite Canvas World -->
    <WorldContainer>
       <!-- The Panned/Zoomed Content: Phone Shell -->
       <StageContainer />
    </WorldContainer>

    <!-- 1. Floating Top Bar -->
    <!-- Centered Pill -->
    <div class="fixed top-4 left-0 right-0 z-40 flex justify-center pointer-events-none">
       <div class="pointer-events-auto shadow-sm rounded-full overflow-hidden">
         <TopNavigationBar />
       </div>
    </div>

    <!-- 2. Floating Right Inspector -->
    <div class="fixed top-24 right-6 bottom-24 w-[400px] z-40 pointer-events-none flex flex-col items-end">
       <div class="pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-100 h-full w-full overflow-hidden flex flex-col">
          <EditorPanel />
       </div>
    </div>

    <!-- 3. Floating Bottom Player Bar -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[800px] h-20 pointer-events-none">
       <div class="pointer-events-auto w-full h-full"> 
         <PlayerBar />
       </div>
    </div>

  </div>
</template>

<style>
/* Global styles can remain if needed, but Tailwind handles most */
body {
  margin: 0;
  overflow: hidden;
}
</style>
