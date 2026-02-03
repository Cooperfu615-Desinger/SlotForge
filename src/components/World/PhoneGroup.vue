<script setup lang="ts">
import { computed } from 'vue'
import { useForgeStore } from '@/stores/forge'

const forgeStore = useForgeStore()

// We use the base resolution from the store to update the stage size
const stageConfig = computed(() => {
    const { w, h } = forgeStore.baseResolution
    return {
        width: w,
        height: h
    }
})

// Scale the stage to fit inside the phone frame (approximate)
// Assuming the 1024x1024 frame has a screen area.
// If typical iPhone, the screen is maybe 90% of height?
// We will manually adjust this scale to look good.
// But wait, the prompt says "directly use CSS Absolute... to align to the screen hole".
// Let's assume the frame is 1024px wide. A 1920x1080 screen needs to be scaled down heavily to fit,
// OR the frame is scaled up.
// Better: We render the Stage at 1:1 (e.g. 1920x1080) and scale the Frame to fit?
// No, the prompt says "WorldLayer... Zoom/Pan".
// "PhoneGroup (Phone Shell + Konva Stage)".

// Let's stick to: Container is the "Physical Phone".
// We let the stage be its natural size (1920x1080), and we put the phone frame ON TOP,
// scaled to wrap it.
// OR we define a "Device logical size".

// Alternative: The user prompt says "CSS Absolute ... align to iphone_frame.png".
// This implies the png is the reference.
// Let's make the container 1024x1024 (size of frame).
// Center the stage in it.
// Scale the stage to fit the "hole".
// This requires knowing the hole size.
// Since I don't know, I will guess: Center, and we might need an adjustment prop.
// For now: Center.

// Mock screen area ratio for "Generic iPhone" inside a square frame?
// Let's assume the frame image is ALREADY centered and containing the phone.
// If it's 1024x1024, and the phone is vertical?
// If the store says "Orientation", we might need to rotate.
// forgeStore sets orientation.

const isLandscape = computed(() => forgeStore.orientation === 'landscape')

// Dynamic Island logic could go here, but let's just get the stage and frame up.

</script>

<template>
    <div class="phone-group relative" :style="{ width: '1024px', height: '1024px' }">
        <!-- 1. The Stage (Screen) -->
        <!-- We center it absolutely. The container is the 1024x1024 frame space. -->
        <!-- We assume the screen should be roughly 80-90% of the frame? -->
        <!-- Actually, if the stage is 1920x1080, we probably want to SCALED DOWN the stage to fit the frame,
             rather than scaling the frame to 2000px. -->
        <!-- Let's transform-scale the stage wrapper. -->
        
        <div class="screen-wrapper absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
             :class="{ 'rotate-90': !isLandscape }"
        >
             <!-- 
                SCALING STRATEGY: 
                If the frame image is 1024px, user likely expects it to be somewhat authoritative.
                We need to scale the stage (e.g. 1920x1080) to fit into the frame's screen area.
                Let's guess the screen area is roughly 900px wide (if landscape frame) or similar.
                For now, I'll leave scale as 1.0 (unscaled) and we might see a giant stage sticking out of a small phone.
                Wait, standard practice: Scale everything to a "unit".
                Let's just render the stage. 
                Users request: "Directly use CSS Absolute... to align".
             -->
            <v-stage :config="stageConfig" class="bg-black">
                <v-layer>
                    <!-- Content will go here (from other components) -->
                    <!-- For now just a placeholder text/rect to see it -->
                    <v-rect :config="{ x: 0, y: 0, width: stageConfig.width, height: stageConfig.height, fill: '#ffffff' }" />
                    <v-text :config="{ x: 50, y: 50, text: 'Stage ' + stageConfig.width + 'x' + stageConfig.height, fontSize: 40, fill: 'red' }" />
                </v-layer>
            </v-stage>
        </div>

        <!-- 2. The Phone Frame (Shell) -->
        <img src="@/assets/iphone_frame.png" 
             class="pointer-events-none absolute top-0 left-0 w-full h-full z-20 object-contain" 
             alt="Phone Frame"
        />
    </div>
</template>

<style scoped>
/* Adjust as needed for specific alignment */
</style>
