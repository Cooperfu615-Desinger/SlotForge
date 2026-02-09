import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CustomAsset {
    url: string          // Blob URL from URL.createObjectURL()
    width: number        // Original image width
    height: number       // Original image height
    filename: string     // Original filename
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
                    filename: file.name
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

    const getAsset = (assetId: string) => {
        return customAssets.value[assetId] || null
    }

    return {
        customAssets,
        uploadAsset,
        resetAssets,
        getAsset
    }
})
