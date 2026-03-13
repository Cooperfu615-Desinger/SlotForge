# SlotForge Development Rules

## Goal

These rules keep the post-refactor structure stable as the project grows.

## File Placement

- Put feature-specific UI, composables, and services inside `src/features/<feature>/`
- Do not add new sidebar or sequencer files back into `src/components/Sidebar` or `src/components/Sequencer`
- Keep cross-feature stores in `src/stores/` only when they are truly shared
- Keep generic rendering primitives and reusable shell UI in `src/components/`

## State Ownership

- Template selection and element selection belong to editor-oriented state
- Scene construction belongs to manifest services, not UI components
- Reel spin, stop, seek, and visible symbol logic should go through `useReelEngine`
- Timeline blocks should be derived from preset data through sequencer services, not rebuilt ad hoc in components
- Asset BOM calculation should stay in asset composables/services, not inside view components

## Components

- Components should prefer composition over embedding domain logic directly
- Large components should not own timers, physics calculations, or data transformation if that logic can live in a composable or service
- If a component becomes responsible for both UI and domain orchestration, split it

## Stores

- Avoid mutating imported module constants as runtime state
- Prefer cloning defaults into store state when values can be edited at runtime
- Prefer explicit store APIs like `getPreset()` over directly importing shared mutable config into multiple stores

## Verification

Before pushing meaningful changes, run:

```bash
npm run verify
```

This runs:

- type checking
- linting
- smoke tests
- production build

## CI Expectation

Any change that breaks `npm run verify` should be considered incomplete.

## Documentation

When changing structure or ownership boundaries:

- update `README.md` if setup, scripts, or structure changed
- update `docs/ARCHITECTURE.md` if module ownership changed
- update this file if the project needs a new guardrail
