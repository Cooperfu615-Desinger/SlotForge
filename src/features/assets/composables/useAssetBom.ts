import { computed } from 'vue'
import { useManifestStore } from '../../../stores/manifest'
import { extractAssetId, resolveAssetSlotNaming } from '../utils/assetNaming'

export interface AssetBomEntry {
  id: string
  legacyId: string
  slotKey: string
  specWidth: number
  specHeight: number
}

const REQUIRED_SYMBOL_IDS = [
  'sym_scatter',
  'sym_wild',
  'sym_h1',
  'sym_h2',
  'sym_h3',
  'sym_h4',
  'sym_l1',
  'sym_l2',
  'sym_l3',
  'sym_l4',
]

const REQUIRED_WIN_IDS = ['win_small', 'win_big', 'win_mega', 'win_super', 'win_epic']
const getSortRank = (id: string) => {
  if (id.startsWith('win_')) return 0
  if (id.startsWith('sym_h')) return 1
  if (id.startsWith('sym_l')) return 2
  if (id === 'sym_scatter') return 3
  if (id === 'sym_wild') return 4
  return 5
}

export const useAssetBom = () => {
  const manifestStore = useManifestStore()

  const assetBOM = computed<AssetBomEntry[]>(() => {
    const uniqueAssets = new Map<string, AssetBomEntry>()

    manifestStore.manifest.layout_elements.forEach((element) => {
      if (!element.asset_src) return

      const assetId = extractAssetId(element.asset_src)
      if (!assetId || uniqueAssets.has(assetId)) return
      const naming = resolveAssetSlotNaming(assetId)

      uniqueAssets.set(assetId, {
        id: naming.slotKey,
        legacyId: naming.legacyId,
        slotKey: naming.slotKey,
        specWidth: element.rect_landscape.w,
        specHeight: element.rect_landscape.h,
      })
    })

    const referenceSymbol =
      Array.from(uniqueAssets.values()).find((asset) => asset.id.startsWith('sym_')) ?? {
        id: 'symbol_default',
        legacyId: 'sym_default',
        slotKey: 'symbol_default',
        specWidth: 120,
        specHeight: 120,
      }

    REQUIRED_SYMBOL_IDS.forEach((id) => {
      if (!uniqueAssets.has(id)) {
        const naming = resolveAssetSlotNaming(id)
        uniqueAssets.set(id, {
          id: naming.slotKey,
          legacyId: naming.legacyId,
          slotKey: naming.slotKey,
          specWidth: referenceSymbol.specWidth,
          specHeight: referenceSymbol.specHeight,
        })
      }
    })

    REQUIRED_WIN_IDS.forEach((id) => {
      if (!uniqueAssets.has(id)) {
        const naming = resolveAssetSlotNaming(id)
        uniqueAssets.set(id, {
          id: naming.slotKey,
          legacyId: naming.legacyId,
          slotKey: naming.slotKey,
          specWidth: 600,
          specHeight: 300,
        })
      }
    })

    return Array.from(uniqueAssets.values()).sort((a, b) => {
      const rankDiff = getSortRank(a.id) - getSortRank(b.id)
      return rankDiff !== 0 ? rankDiff : a.id.localeCompare(b.id)
    })
  })

  return {
    assetBOM,
  }
}
