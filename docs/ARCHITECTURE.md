# SlotForge Architecture

## Purpose

This document describes the current application structure after the feature modularization refactor.

SlotForge is organized around a small number of product-facing feature areas instead of keeping all components, stores, and composables in flat shared folders.

## Top-Level Structure

```text
src/
  features/
    assets/
    inspector/
    manifest/
    reels/
    sequencer/
    workbench/
  components/
  composables/
  stores/
  utils/
```

## Current Responsibility Map

### `features/manifest`

Owns template definitions and scene construction.

- `types.ts`: manifest and template types
- `templateRegistry.ts`: available template configs
- `services/sceneBuilder.ts`: transforms templates into renderable scene data
- `stores/editorStore.ts`: selected element and active template

### `features/reels`

Owns reel runtime behavior and reel-related domain config.

- `config/speedPresets.ts`: mutable runtime preset source cloned from defaults
- `composables/useReelEngine.ts`: orchestration for spin, stop, seek, image prep, and visible symbol calculation

Low-level reel motion still uses:

- `src/composables/useReelController.ts`
- `src/composables/useReelStrip.ts`

These are now support primitives, while `useReelEngine` is the preferred integration layer.

### `features/sequencer`

Owns timeline UI and preset-to-timeline mapping.

- `components/SequencerPanel.vue`: top-level sequencer UI
- `components/TimelineView.vue`: timeline interaction and block editing
- `services/timelineMapper.ts`: converts reel presets into timeline blocks

### `features/assets`

Owns asset replacement and asset bill-of-material support.

- `components/AssetManagerPanel.vue`
- `composables/useAssetBom.ts`

### `features/inspector`

Owns contextual editing and template guidance UI.

- `components/Sidebar.vue`
- `components/InspectorPanel.vue`
- `components/GuidePanel.vue`

### `features/workbench`

Owns shell-level interaction state.

- `composables/useCanvasPanZoom.ts`
- `composables/useWindowLayerManager.ts`

## Shared Runtime Stores

Some stores still live under `src/stores/` because they coordinate multiple features:

- `manifest.ts`: compatibility facade that composes editor state and scene building
- `gameStore.ts`: gameplay-facing runtime state, win demo state, seek state
- `timelineStore.ts`: timeline editing state and block state
- `forgeStore.ts`: uploaded asset overrides

## Current Design Principle

Use this rule when placing new code:

- If logic belongs to one product feature, place it under `src/features/<feature>/`
- If logic is a cross-feature compatibility facade, shared runtime store, or generic utility, keep it in `src/stores/`, `src/utils/`, or `src/components/`

## Known Transitional Areas

The following areas are improved, but not fully finalized:

- `gameStore.ts` still mixes game runtime, win presentation, and seek state
- `timelineStore.ts` still lives in `src/stores/` even though it mainly serves the sequencer
- `src/components/` still contains some rendering-layer components that may later move into features

These are acceptable transitional points and should be moved only when the next concrete feature requires it.
