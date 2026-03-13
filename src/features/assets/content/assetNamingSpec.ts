export const assetNamingRules = [
  '小寫英文 + 底線分隔',
  '可使用數字編號',
  '不使用駝峰、連字號、空格',
  '英文拼字需正確',
]

export const assetNamingCategories = [
  'symbol_',
  'background_',
  'button_',
  'icon_',
  'frame_',
  'decorate_',
  'effect_',
  'ui_',
  'wheel_',
  'reel_',
  'win_',
  'bonus_',
  'free_spin_',
  'scatter_',
  'wild_',
]

export const assetNamingExamples = {
  correct: ['symbol_a.png', 'background_main.png', 'button_spin_normal.png', 'ui_win_label_background.png'],
  incorrect: ['Symbol_A.png', 'symbolA.png', 'button-spin-normal.png', 'button spin normal.png'],
}
