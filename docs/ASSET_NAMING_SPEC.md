# SlotForge Asset Naming Specification

## Purpose

This document defines the official asset naming convention used by SlotForge.

SlotForge is intended to serve as a visual production reference for planners, artists, frontend engineers, and game implementation teams. For that reason, the project should follow the frontend / Creator-side naming standard as its canonical internal rule.

這份文件定義 SlotForge 的正式資源命名規範。

由於 SlotForge 的定位是提供企劃、美術、前端與遊戲實作者共同參考的開發規範依據，因此本專案內部應以前端 / Creator 規範作為唯一的標準命名語言。

---

## Core Principle

### Canonical internal naming

Inside SlotForge, all asset slots, references, and exported naming should follow one canonical format:

```text
{category}_{usage_or_suffix_or_index}.{ext}
```

### User upload naming is not required to match

Users do not need to rename files before uploading.

SlotForge should allow arbitrary upload filenames, then internally map the uploaded file to the correct canonical asset slot.

這代表：

- 使用者上傳時可以使用任何檔名
- 系統內部仍然只使用標準命名
- 顯示、匯出、規範文件與資源槽位都以 canonical naming 為準

---

## Naming Rules

1. Use lowercase English letters only
2. Use underscores `_` as separators
3. Numbers are allowed when needed
4. Do not use camelCase
5. Do not use hyphens `-`
6. Do not use spaces
7. English spelling must be correct

命名規則：

1. 一律使用小寫英文
2. 一律使用底線 `_` 分隔
3. 可使用數字編號
4. 不使用駝峰命名
5. 不使用連字號 `-`
6. 不使用空格
7. 英文字必須拼寫正確

---

## Canonical Categories

These prefixes are allowed as SlotForge standard categories:

```text
symbol_       # 符號圖
background_   # 背景圖
button_       # 按鈕
icon_         # 圖示
frame_        # 框架
decorate_     # 裝飾
effect_       # 特效
ui_           # UI 元素
wheel_        # 輪盤
reel_         # 滾輪
win_          # 獲勝相關
bonus_        # 紅利相關
free_spin_    # 免費旋轉
scatter_      # 分散符號
wild_         # 百搭符號
```

---

## Recommended Format Patterns

### Single semantic target

```text
symbol_a.png
background_main.png
button_spin.png
```

### State-based naming

```text
button_spin_normal.png
button_spin_pressed.png
button_spin_disabled.png
```

### Indexed sequences

```text
wheel_frame_0.png
wheel_frame_1.png
effect_particle_gold_0.png
effect_particle_gold_1.png
```

### Multi-part semantic naming

```text
ui_win_label_background.png
background_main_decorate_left.png
bonus_free_spin_entry_background.png
```

---

## Correct Examples

```text
symbol_a.png
symbol_k.png
symbol_q.png
background_main.png
background_bonus.png
button_spin_normal.png
button_spin_pressed.png
wheel_frame_0.png
wheel_frame_1.png
ui_win_label_background.png
effect_particle_gold.png
scatter_symbol_0.png
```

## Incorrect Examples

```text
Symbol_A.png
symbolA.png
symbol-a.png
backgroundMain.png
button spin normal.png
wheel_fram_0.png
```

### Why they are wrong

- `Symbol_A.png`: uses uppercase letters
- `symbolA.png`: missing underscore separator
- `symbol-a.png`: uses hyphen
- `backgroundMain.png`: uses camelCase
- `button spin normal.png`: contains spaces
- `wheel_fram_0.png`: misspells `frame`

---

## SlotForge Canonical Asset Slot Rule

In SlotForge, the important identifier is not the uploaded filename itself.

The important identifier is the asset slot name used by the project.

For example:

- `button_spin_normal`
- `background_main`
- `symbol_a`
- `ui_win_label_background`

This means SlotForge should store asset overrides by slot key, not by original upload filename.

### Recommended behavior

When a user uploads a file:

1. The user selects a target slot in the UI
2. The uploaded file can have any filename
3. SlotForge binds that file to the selected canonical slot
4. The original filename may be preserved as metadata only

建議行為：

1. 使用者先選擇要替換的資源槽位
2. 上傳檔名不需要符合規範
3. 系統將該檔案綁定到對應的 canonical slot
4. 原始檔名只作為 metadata 保留，不作為系統命名依據

---

## SlotForge Transition Rule

The current project still contains some historical naming such as:

```text
sym_h1
bg_main
btn_spin
```

These should be treated as legacy internal names.

SlotForge should gradually migrate them toward Creator-aligned canonical names such as:

```text
symbol_h1
background_main
button_spin
```

### Migration principle

1. New naming follows the Creator-aligned SlotForge standard
2. Existing references may remain temporarily during migration
3. Internal mapping layers may be used during transition
4. New features should not introduce additional legacy naming prefixes

---

## Category Mapping For Current Project

Recommended mapping for the current SlotForge codebase:

| Legacy Prefix | Canonical Prefix |
|---|---|
| `sym_` | `symbol_` |
| `bg_` | `background_` |
| `btn_` | `button_` |
| `panel_` | `ui_` or `frame_` depending on meaning |
| `field_` | `ui_` |
| `win_` | `win_` |

### Notes

- `panel_*` should be reviewed case by case:
  - if it is structural decoration, prefer `frame_`
  - if it is interface display content, prefer `ui_`
- `field_balance`, `field_win`, `field_bet` should likely become:
  - `ui_balance_field`
  - `ui_win_field`
  - `ui_bet_field`

---

## Naming Validation Guidance

Eventually SlotForge should provide an automated validation layer that checks:

- lowercase only
- underscore only
- no spaces
- no hyphens
- valid category prefix
- no obvious spelling mistakes in allowed category terms

This validation can be used in:

- asset import tooling
- export validation
- CI scripts
- editor warnings

---

## UI Integration Recommendation

SlotForge should expose this specification directly in the product UI.

Recommended entry points:

1. Add a `資源命名規範` section inside the Guide panel
2. Or add a dedicated `Naming Spec` button that opens a modal / draggable window

This keeps the naming rule available to planners and artists without requiring them to open repository docs manually.

---

## Final Rule

SlotForge should be strict internally and flexible for users externally.

### Internal

- Use Creator-aligned canonical naming only
- Use slot-based asset identity
- Use standardized prefixes and spelling

### External

- Allow arbitrary uploaded filenames
- Map uploads to canonical slot names automatically
- Preserve original filename only as metadata

This is the intended long-term asset naming model for SlotForge.
