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
    
    <!-- 0. Background Layer: World (Fixed at Z-0) -->
    <div class="fixed inset-0 z-0">
      <WorldContainer>
         <StageContainer />
      </WorldContainer>
    </div>

    <!-- 1. Top Bar (Fixed at Z-50) -->
    <!-- Position: Top-4, Centered horizontally -->
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
       <div class="pointer-events-auto">
         <TopNavigationBar />
       </div>
    </div>

    <!-- 2. Inspector Panel (Fixed at Z-50) -->
    <!-- Position: Right-6, Top-24, Bottom-32, Fixed Width 400px -->
    <div class="fixed top-24 right-6 bottom-32 w-[400px] z-50 pointer-events-none flex flex-col items-end">
       <div class="pointer-events-auto w-full h-full"> 
          <EditorPanel />
       </div>
    </div>

    <!-- 3. Player Bar (Fixed at Z-50) -->
    <!-- Position: Bottom-6, Left-6, Right-6 (Span width minus margins, or centered) -->
    <!-- CTO requested fixed bottom-6 left-6 right-6, which makes it full width minus margin. -->
    <!-- But our PlayerBar component might be designed as a centered bar. Let's wrap it to allow its internal sizing or force it. -->
    <!-- Let's follow the CTO's "fixed bottom-6 left-6 right-6" instruction literally for the container. -->
    <div class="fixed bottom-6 left-6 right-6 z-50 pointer-events-none flex justify-center">
       <div class="pointer-events-auto"> 
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
