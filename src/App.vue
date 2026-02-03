<script setup lang="ts">
import WorldContainer from '@/components/Renderer/WorldContainer.vue'
import TopNavigationBar from '@/components/Layout/TopNavigationBar.vue'
import EditorPanel from '@/components/Layout/EditorPanel.vue'
import PlayerBar from '@/components/Layout/PlayerBar.vue'
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-[#F3F4F6] relative font-sans text-slate-800">
    
    <!-- World Layer: Fixed at bottom -->
    <WorldContainer class="absolute inset-0 z-0" />

    <!-- HUD Layer: Fixed on top, Flex layout for positioning -->
    <div class="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6">
      
      <!-- Top: Navbar -->
      <div class="pointer-events-auto self-center">
        <TopNavigationBar /> 
      </div>

      <!-- Middle: Inspector (Right aligned) -->
      <div class="flex-1 flex flex-row relative mt-4 mb-4">
         <div class="pointer-events-auto absolute right-0 top-0 bottom-0 w-[420px] overflow-y-auto rounded-2xl shadow-xl">
            <EditorPanel /> 
         </div>
      </div>

      <!-- Bottom: Timeline -->
      <div class="pointer-events-auto w-full max-w-5xl self-center">
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
