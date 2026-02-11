import { computed } from 'vue'
import { useManifestStore } from '../stores/manifest'

export const useGridLayout = () => {
    const store = useManifestStore()

    const gridConfig = computed(() => store.gridConfig)
    const reelAreaRect = computed(() => store.reelAreaRect)

    // Calculate the center point (x, y) for a specific grid cell (col, row)
    // relative to the 1280x720 stage
    const getSymbolCenter = (colIndex: number, rowIndex: number) => {
        const { x: startX, y: startY } = reelAreaRect.value
        const { cell_w, cell_h, gap, gap_x, gap_y } = gridConfig.value

        const gapX = gap_x ?? gap ?? 0
        const gapY = gap_y ?? gap ?? 0

        const pitchX = cell_w + gapX
        const pitchY = cell_h + gapY // Symbol Height (Pitch)

        const centerX = startX + (colIndex * pitchX) + (cell_w / 2)
        const centerY = startY + (rowIndex * pitchY) + (pitchY / 2)

        return { x: centerX, y: centerY }
    }

    // Convert linear index (0..14) to {col, row}
    // Assumes standard left-to-right, top-to-bottom usually? 
    // Wait, slots usually index by Reel first or Row first?
    // Usually Reel 0 [0,1,2], Reel 1 [3,4,5]... 
    // Let's assume Column-Major order for standard slot machine indices if 0-14.
    // Index = col * rows + row
    const getCoordinatesFromIndex = (index: number) => {
        const rows = gridConfig.value.rows
        const col = Math.floor(index / rows)
        const row = index % rows
        return getSymbolCenter(col, row)
    }

    return {
        getSymbolCenter,
        getCoordinatesFromIndex
    }
}
