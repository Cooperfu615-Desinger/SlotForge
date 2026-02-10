<script setup lang="ts">
import { computed } from 'vue'
import { useManifestStore } from '../../stores/manifest'

const manifestStore = useManifestStore()

// Template Data Map
interface TemplateInfo {
  title: string
  grid: string
  specs: string
  desc: string
  features: string
  references: string
}

const TEMPLATE_INFO: Record<string, TemplateInfo> = {
  'classic_3x3': {
    title: '復古經典型',
    grid: '3軸 x 3列 (Fat Reels)',
    specs: '1, 3, 5 Lines',
    desc: '源自實體機台的經典玩法，通常搭配高波動性數值。連線規則為最左至右 (Left-to-Right)。',
    features: '符號巨大、沒有複雜折線、節奏明快。',
    references: 'Mega Joker (NetEnt), Fire Joker (Play\'n GO), 傳統水果盤。',
  },
  'standard_3x5': {
    title: '標準老虎機',
    grid: '5軸 x 3列',
    specs: '9, 15, 20, 25 Lines',
    desc: '現代 Video Slot 的黃金標準，平衡了中獎率與視覺豐富度。通常採最左至右 (Left-to-Right) 的賠付線規則。',
    features: '支援複雜折線、豐富的百搭 (Wild) 玩法。',
    references: 'Starburst (NetEnt), Book of Dead (Play\'n GO), Dead or Alive (NetEnt).',
  },
  'way_3x5': {
    title: '全路數 (Way Game)',
    grid: '5軸 x 3列',
    specs: '243 Ways',
    desc: '捨棄賠付線概念，採全路數規則 (All Ways)，由左至右相鄰即可，不限位置。',
    features: '符號通常較密集，適合連鎖反應玩法。',
    references: '88 Fortunes (Light & Wonder), Dancing Drums (Shuffle Master).',
  },
  'extended_4x5': {
    title: '堆疊加高型',
    grid: '5軸 x 4列',
    specs: '50 Lines / 1024 Ways',
    desc: '為了容納堆疊符號 (Stacked Symbols) 而加高的版面。採最左至右 (Left-to-Right) 規則，支援更多連線或路數。',
    features: '滿版擴展 Wild、更華麗的直式視覺。',
    references: 'Wolf Gold (Pragmatic Play), Buffalo (Aristocrat).',
  },
  'pay_anywhere_6x5': {
    title: '隨處支付 (Gates Style)',
    grid: '6軸 x 5列',
    specs: 'Scatter Pays (無連線限制)',
    desc: 'Pragmatic Play 定義的新主流。採隨處支付規則 (Scatter Pays)，畫面出現 8+ 顆相同符號即得分，通常搭配消除 (Tumble)。',
    features: '掉落式動態、累積倍率乘數。',
    references: 'Gates of Olympus (Pragmatic Play), Starlight Princess (Pragmatic Play).',
  },
  'cluster_7x7': {
    title: '消除矩陣 (Grid Slot)',
    grid: '7軸 x 7列',
    specs: 'Cluster Pays (相鄰消除)',
    desc: '類似 Candy Crush 的玩法，採集式消除規則 (Cluster Pays)，水平或垂直相連 5+ 顆即得分。',
    features: '能量條收集、區域引爆、符號轉換。',
    references: 'Sugar Rush (Pragmatic Play), Gemix (Play\'n GO), Moon Princess (Play\'n GO).',
  },
  'megaways_6': {
    title: '動態滾輪 (MegaWays)',
    grid: '6軸 (列數動態 2~7)',
    specs: 'Up to 117,649 Ways',
    desc: 'BTG 專利授權機制。採最左至右 (Left-to-Right) 路數規則，每一局的軸高度都會改變，創造極高變數。',
    features: '頂部橫向滾輪、不規則版面、連鎖消除。',
    references: 'Bonanza (BTG), Great Rhino Megaways (Pragmatic Play).',
  },
}

const currentInfo = computed(() => {
  const gridKey = manifestStore.currentGrid
  return TEMPLATE_INFO[gridKey] || {
    title: '未知模板',
    grid: '-',
    specs: '-',
    desc: '尚未定義此模板的說明資訊。',
    features: '-',
    references: '-'
  }
})
</script>

<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
      <h3 class="text-lg font-bold text-gray-800">{{ currentInfo.title }}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
          {{ currentInfo.grid }}
        </span>
        <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
          {{ currentInfo.specs }}
        </span>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Description -->
      <section>
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">簡介</h4>
        <p class="text-sm text-gray-600 leading-relaxed">
          {{ currentInfo.desc }}
        </p>
      </section>

      <!-- Features -->
      <section>
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">特色</h4>
        <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
          {{ currentInfo.features }}
        </div>
      </section>

      <!-- References -->
      <section>
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">市場參考</h4>
        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li v-for="ref in currentInfo.references.split(', ')" :key="ref">
            {{ ref }}
          </li>
        </ul>
      </section>

    </div>
  </div>
</template>
