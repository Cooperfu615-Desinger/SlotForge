import { ref } from 'vue'

export type WorkbenchWindowKey = 'templates' | 'inspector' | 'sequencer'

const DEFAULT_Z_INDEX = 50

export const useWindowLayerManager = () => {
  const zIndices = ref<Record<WorkbenchWindowKey, number>>({
    templates: DEFAULT_Z_INDEX,
    inspector: DEFAULT_Z_INDEX,
    sequencer: DEFAULT_Z_INDEX,
  })

  const bringToFront = (key: WorkbenchWindowKey) => {
    const maxZIndex = Math.max(
      zIndices.value.templates,
      zIndices.value.inspector,
      zIndices.value.sequencer
    )

    zIndices.value[key] = maxZIndex + 1
  }

  return {
    zIndices,
    bringToFront,
  }
}
