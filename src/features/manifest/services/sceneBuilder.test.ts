import { describe, expect, it } from 'vitest'
import { buildManifest } from './sceneBuilder'
import { DEFAULT_CONFIG, TEMPLATES } from '../templateRegistry'

describe('buildManifest', () => {
  it('builds a manifest that includes reel background and generated symbols', () => {
    const manifest = buildManifest(DEFAULT_CONFIG)
    const panelReels = manifest.layout_elements.find((element) => element.id === 'panel_reels')
    const symbolElements = manifest.layout_elements.filter((element) => element.type === 'symbol')

    expect(manifest.meta.base_resolution).toEqual({ w: 1280, h: 720 })
    expect(panelReels).toBeTruthy()
    expect(symbolElements).toHaveLength(DEFAULT_CONFIG.grid.cols * DEFAULT_CONFIG.grid.rows)
  })

  it('supports every registered template with unique symbol ids', () => {
    Object.values(TEMPLATES).forEach((template) => {
      const manifest = buildManifest(template)
      const symbolIds = manifest.layout_elements
        .filter((element) => element.type === 'symbol')
        .map((element) => element.id)

      expect(new Set(symbolIds).size).toBe(symbolIds.length)
    })
  })
})
