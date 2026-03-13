export interface AssetSlotNaming {
  legacyId: string
  slotKey: string
}

const DIRECT_SLOT_MAP: Record<string, string> = {
  field_balance: 'ui_balance_field',
  field_win: 'ui_win_field',
  field_bet: 'ui_bet_field',
  panel_jackpot: 'ui_jackpot_panel',
  panel_marquee: 'ui_marquee_panel',
  panel_reels: 'frame_reels_panel',
  logo_game: 'ui_game_logo',
}

export const extractAssetId = (assetSrc: string) => {
  const match = assetSrc.match(/\/([^/]+)\.(png|jpg|jpeg|webp|svg)$/i)
  return match?.[1] ?? null
}

export const toCanonicalAssetSlot = (legacyId: string) => {
  if (DIRECT_SLOT_MAP[legacyId]) {
    return DIRECT_SLOT_MAP[legacyId]
  }

  if (legacyId.startsWith('sym_')) return legacyId.replace(/^sym_/, 'symbol_')
  if (legacyId.startsWith('bg_')) return legacyId.replace(/^bg_/, 'background_')
  if (legacyId.startsWith('btn_')) return legacyId.replace(/^btn_/, 'button_')
  if (legacyId.startsWith('panel_')) return legacyId.replace(/^panel_/, 'ui_')
  if (legacyId.startsWith('field_')) return legacyId.replace(/^field_/, 'ui_')

  return legacyId
}

export const resolveAssetSlotNaming = (legacyId: string): AssetSlotNaming => ({
  legacyId,
  slotKey: toCanonicalAssetSlot(legacyId),
})

export const normalizeAssetIdentifier = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[\s-]+/g, '_')

export const matchesAssetSlotUpload = (filename: string, naming: AssetSlotNaming) => {
  const normalized = normalizeAssetIdentifier(filename)
  return (
    normalized === normalizeAssetIdentifier(naming.legacyId) ||
    normalized === normalizeAssetIdentifier(naming.slotKey)
  )
}
