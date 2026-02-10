import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CustomAsset {
    url: string          // Blob URL from URL.createObjectURL()
    width: number        // Original image width
    height: number       // Original image height
    filename: string     // Original filename
    displayW?: number    // Custom display width (optional override)
    displayH?: number    // Custom display height (optional override)
    offsetX?: number     // Custom offset X (optional override)
    offsetY?: number     // Custom offset Y (optional override)
}

export const useForgeStore = defineStore('forge', () => {
    const customAssets = ref<Record<string, CustomAsset>>({})

    const uploadAsset = async (assetId: string, file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const blobUrl = URL.createObjectURL(file)
            const img = new Image()

            img.onload = () => {
                customAssets.value[assetId] = {
                    url: blobUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    filename: file.name,
                    displayW: undefined,
                    displayH: undefined,
                    offsetX: undefined,
                    offsetY: undefined
                }
                console.log(`[ForgeStore] Asset uploaded: ${assetId} (${img.naturalWidth}x${img.naturalHeight})`)
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

    const updateAssetSize = (assetId: string, width: number, height: number) => {
        if (customAssets.value[assetId]) {
            customAssets.value[assetId].displayW = width
            customAssets.value[assetId].displayH = height
        }
    }

    const resetAssetSize = (assetId: string) => {
        if (customAssets.value[assetId]) {
            customAssets.value[assetId].displayW = undefined
            customAssets.value[assetId].displayH = undefined
        }
    }

    const updateAssetOffset = (assetId: string, x: number, y: number) => {
        if (customAssets.value[assetId]) {
            customAssets.value[assetId].offsetX = x
            customAssets.value[assetId].offsetY = y
        }
    }

    const resetAssetOffset = (assetId: string) => {
        if (customAssets.value[assetId]) {
            customAssets.value[assetId].offsetX = undefined
            customAssets.value[assetId].offsetY = undefined
        }
    }

    const getAsset = (assetId: string) => {
        return customAssets.value[assetId] || null
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
