import { ref } from 'vue'

export interface ReelStripConfig {
    reelId: number
    stripLength?: number  // 輪帶長度，預設 30
}

/**
 * Reel Strip Composable
 * 管理單一 Reel 的符號輪帶（虛擬滾輪）
 */
export const useReelStrip = (config: ReelStripConfig) => {
    const stripLength = config.stripLength || 30
    const strip = ref<string[]>([])

    // 符號池（8 種符號）
    const symbolPool = ['H1', 'H2', 'H3', 'H4', 'A', 'K', 'Q', 'J']

    /**
     * 生成隨機輪帶
     * 輪帶是一個循環陣列，包含 30 個隨機符號
     */
    const generateStrip = () => {
        strip.value = Array.from({ length: stripLength }, (): string => {
            const randomIndex = Math.floor(Math.random() * symbolPool.length)
            return symbolPool[randomIndex]!
        })
        console.log(`[ReelStrip ${config.reelId}] Generated:`, strip.value.slice(0, 10).join(', '), '...')
    }

    /**
     * 取得特定索引位置的符號
     * 使用 modulus 實現循環（輪帶是無限的）
     */
    const getSymbolAt = (index: number): string => {
        const normalizedIndex = ((index % stripLength) + stripLength) % stripLength
        return strip.value[normalizedIndex] || 'A'  // 提供 fallback
    }

    /**
     * 取得符號的資源路徑
     */
    const getSymbolAsset = (symbolId: string): string => {
        // 映射到實際檔案
        const mapping: Record<string, string> = {
            'H1': 'h1', 'H2': 'h2', 'H3': 'h3', 'H4': 'h4',
            'A': 'l1', 'K': 'l2', 'Q': 'l3', 'J': 'l4'
        }

        const fileName = mapping[symbolId] || 'l1'
        return `assets/symbols/sym_${fileName}.png`
    }

    return {
        strip,
        stripLength,
        generateStrip,
        getSymbolAt,
        getSymbolAsset
    }
}
