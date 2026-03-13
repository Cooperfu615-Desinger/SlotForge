import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CustomAsset {
    url: string          // Blob URL from URL.createObjectURL()
    width: number        // Original image width
    height: number       // Original image height
    filename: string     // Original filename
    slotKey: string      // Canonical internal asset slot
    displayW?: number    // Custom display width (optional override)
    displayH?: number    // Custom display height (optional override)
    offsetX?: number     // Custom offset X (optional override)
    offsetY?: number     // Custom offset Y (optional override)
}

export const useForgeStore = defineStore('forge', () => {
    const customAssets = ref<Record<string, CustomAsset>>({})

    const uploadAsset = async (slotKey: string, file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const blobUrl = URL.createObjectURL(file)
            const img = new Image()

            img.onload = () => {
                customAssets.value[slotKey] = {
                    url: blobUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    filename: file.name,
                    slotKey,
                    displayW: undefined,
                    displayH: undefined,
                    offsetX: undefined,
                    offsetY: undefined
                }
                console.log(`[ForgeStore] Asset uploaded to slot: ${slotKey} (${img.naturalWidth}x${img.naturalHeight})`)
                resolve()
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = blobUrl
        })
    }

    const resetAssets = () => {
        // Revoke all Blob URLs to prevent memory leaks
        Object.values(customAssets.value).forEach(asset => {
            URL.revokeObjectURL(asset.url)
        })
        customAssets.value = {}
        console.log('[ForgeStore] All custom assets reset')
    }

    const updateAssetSize = (slotKey: string, width: number, height: number) => {
        if (customAssets.value[slotKey]) {
            customAssets.value[slotKey].displayW = width
            customAssets.value[slotKey].displayH = height
        }
    }

    const resetAssetSize = (slotKey: string) => {
        if (customAssets.value[slotKey]) {
            customAssets.value[slotKey].displayW = undefined
            customAssets.value[slotKey].displayH = undefined
        }
    }

    const updateAssetOffset = (slotKey: string, x: number, y: number) => {
        if (customAssets.value[slotKey]) {
            customAssets.value[slotKey].offsetX = x
            customAssets.value[slotKey].offsetY = y
        }
    }

    const resetAssetOffset = (slotKey: string) => {
        if (customAssets.value[slotKey]) {
            customAssets.value[slotKey].offsetX = undefined
            customAssets.value[slotKey].offsetY = undefined
        }
    }

    const getAsset = (slotKey: string) => {
        return customAssets.value[slotKey] || null
    }

    return {
        uploadAsset,
        resetAssets,
        getAsset,
        updateAssetSize,
        resetAssetSize,
        updateAssetOffset,
        resetAssetOffset
    }
})
