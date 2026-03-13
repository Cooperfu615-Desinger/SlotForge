# SlotForge

SlotForge is an asset-driven slot game prototyping workbench built with Vue 3, TypeScript, and Konva.
SlotForge 是一個以素材驅動為核心、使用 Vue 3、TypeScript 與 Konva 建構的老虎機原型工作台。

It is designed for quickly assembling slot game mockups from template configs and PNG assets, previewing reel layouts and win presentations, and validating timing behavior before handing specs to production teams.
它的目標是讓團隊能夠透過版型設定與 PNG 素材，快速組裝老虎機原型、預覽滾輪版面與贏分演出，並在交付正式開發前先驗證節奏與時序。

## Overview
## 專案概述

SlotForge focuses on a WYSIWYG workflow for slot game layout prototyping:
SlotForge 聚焦在老虎機版面原型的 WYSIWYG 工作流程：

- Switch between multiple slot templates such as `3x3`, `3x5`, `243 Ways`, `Megaways`, and cluster-style layouts
- 切換多種老虎機版型，例如 `3x3`、`3x5`、`243 Ways`、`Megaways` 與 cluster 類型配置
- Preview a fixed logical stage inside a scalable device viewport
- 在可縮放裝置視窗中預覽固定邏輯解析度的舞台
- Inspect interactive elements and asset bindings
- 檢視互動元素與素材綁定資訊
- Test reel timing presets and win presentation flows
- 測試滾輪節奏預設與贏分演出流程
- Export prototype timing/spec data for downstream engineering use
- 匯出原型時序與規格資料，供後續工程串接使用

The current application is structured like a creative workbench:
目前應用介面被設計成一個創作型工作台：

- `Templates`: choose the slot math/layout style
- `Templates`：選擇老虎機數學模型與版型類型
- `Center Stage`: render the slot scene and reel area
- `Center Stage`：渲染主要場景與滾輪區域
- `Inspector`: review selected object properties and guide content
- `Inspector`：查看被選取物件的屬性與說明內容
- `Director Console`: control playback, timing presets, FX tests, and exports
- `Director Console`：控制播放、節奏預設、特效測試與匯出功能

## Core Features
## 核心功能

### Template-driven slot layouts
### 版型驅動的老虎機配置

SlotForge ships with several built-in layout templates under `src/assets/templates/`, including:
SlotForge 目前已在 `src/assets/templates/` 內建多種版型模板，包括：

- Classic `3x3`
- 經典 `3x3`
- Standard `3x5`
- 標準 `3x5`
- Ways `3x5`
- Ways `3x5`
- Extended `4x5`
- 擴展 `4x5`
- Pay Anywhere `6x5`
- Pay Anywhere `6x5`
- Cluster `7x7`
- Cluster `7x7`
- Megaways `6`
- Megaways `6`

These templates define reel-area geometry, cell sizing, spacing, and clipping zones used to generate the preview scene.
這些模板會定義滾輪區域幾何、格子尺寸、間距與裁切範圍，並據此生成預覽畫面。

### Asset-based rendering
### 素材驅動渲染

The renderer is built on top of `Konva` through `vue-konva` and treats the scene as a composition of positioned assets:
渲染器基於 `vue-konva` 與 `Konva` 建立，將整個畫面視為由定位素材組成的場景：

- background
- 背景
- UI panels
- UI 面板
- buttons
- 按鈕
- reel symbols
- 滾輪符號
- overlays and effects
- 覆蓋層與特效

The application is intended to reflect final layout intent through images and coordinates rather than abstract placeholders alone.
這個專案的設計理念，是用圖片與座標直接反映最終佈局，而不是只靠抽象 placeholder。

### Timing and sequencing
### 時序與演出控制

The project includes a sequencing panel for testing runtime behavior:
專案內建 sequencer 面板，用於測試實際執行時的節奏表現：

- reel speed presets
- 滾輪速度預設
- staggered reel-stop timing
- 分段停輪節奏
- win demo tiers
- 不同贏分等級演出
- line / way FX preview
- line / way 特效預覽
- zoomable timeline visualization
- 可縮放 timeline 視覺化

This makes SlotForge useful not only for static layout review, but also for prototyping presentation rhythm.
因此 SlotForge 不只是靜態版面檢視器，也是一個可以驗證演出節奏的原型工具。

### Export pipeline
### 匯出流程

The Director Console currently supports export to:
目前 Director Console 已支援匯出：

- Markdown spec documents
- Markdown 規格書
- Cocos Creator oriented JSON configuration
- 面向 Cocos Creator 的 JSON 設定檔

This helps bridge prototype decisions into implementation-facing documentation.
這能幫助團隊把原型階段的決策轉換成工程可用的文件與設定。

## Tech Stack
## 技術棧

- Vue 3
- TypeScript
- Vite
- Pinia
- Naive UI
- Tailwind CSS
- GSAP
- Konva / vue-konva

## Project Structure
## 專案結構

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
  assets/
docs/
.github/workflows/
```

Key files:
關鍵檔案：

- `src/App.vue`: workbench shell composition
- `src/App.vue`：工作台主框架組裝層
- `src/features/manifest/services/sceneBuilder.ts`: template-to-scene construction
- `src/features/manifest/services/sceneBuilder.ts`：模板到場景的建構邏輯
- `src/features/reels/composables/useReelEngine.ts`: reel runtime orchestration
- `src/features/reels/composables/useReelEngine.ts`：滾輪執行期控制核心
- `src/features/sequencer/components/SequencerPanel.vue`: sequencer interface
- `src/features/sequencer/components/SequencerPanel.vue`：時序控制面板
- `src/stores/gameStore.ts`: shared gameplay-facing runtime state
- `src/stores/gameStore.ts`：共享遊戲執行狀態
- `src/stores/timelineStore.ts`: shared timeline editing state
- `src/stores/timelineStore.ts`：共享時間軸編輯狀態
- `src/utils/exporter.ts`: Markdown and JSON export helpers
- `src/utils/exporter.ts`：Markdown 與 JSON 匯出工具

## Getting Started
## 快速開始

### Requirements
### 環境需求

- Node.js 20+ recommended
- 建議使用 Node.js 20+
- npm

### Install
### 安裝依賴

```bash
npm install
```

### Run locally
### 本機開發

```bash
npm run dev
```

### Build for production
### 建置正式版本

```bash
npm run build
```

### Run full verification
### 執行完整驗證

```bash
npm run verify
```

### Preview production build
### 預覽正式版本

```bash
npm run preview
```

## Available Scripts
## 可用指令

- `npm run dev`: start the Vite development server
- `npm run dev`：啟動 Vite 開發伺服器
- `npm run typecheck`: run TypeScript and Vue type checks
- `npm run typecheck`：執行 TypeScript 與 Vue 型別檢查
- `npm run lint`: run static lint checks with Oxlint
- `npm run lint`：使用 Oxlint 執行靜態檢查
- `npm run test:run`: run smoke tests with Vitest
- `npm run test:run`：使用 Vitest 執行 smoke tests
- `npm run build`: run type checking and create a production build
- `npm run build`：執行型別檢查並產生正式版建置
- `npm run preview`: preview the built app locally
- `npm run preview`：本機預覽建置結果
- `npm run verify`: run typecheck, lint, test, and build in sequence
- `npm run verify`：依序執行型別檢查、靜態檢查、測試與建置

## Documentation
## 文件

Additional project docs are available in [`docs/`](./docs):
更多專案文件位於 [`docs/`](./docs)：

- `SLOTFORGE_TECH_PROTOCOL.md`: technical positioning and architecture
- `SLOTFORGE_TECH_PROTOCOL.md`：技術定位與架構說明
- `SLOTFORGE_DATA_CONTRACT.md`: manifest and data contract design
- `SLOTFORGE_DATA_CONTRACT.md`：manifest 與資料契約設計
- `SLOTFORGE_ROADMAP_V3.md`: phased roadmap and acceptance targets
- `SLOTFORGE_ROADMAP_V3.md`：分階段 roadmap 與驗收目標
- `ARCHITECTURE.md`: current feature-oriented architecture map
- `ARCHITECTURE.md`：目前 feature-oriented 架構地圖
- `DEVELOPMENT_RULES.md`: development guardrails for future changes
- `DEVELOPMENT_RULES.md`：後續開發規範與守則
- `DEV_AGENT.md`: development agent notes
- `DEV_AGENT.md`：開發代理說明
- `QA_AGENT.md`: QA and review notes
- `QA_AGENT.md`：QA 與檢查說明

## Deployment
## 部署

This repository includes a GitHub Actions workflow for deploying the built app to GitHub Pages on pushes to `main`.
此倉庫已配置 GitHub Actions，會在推送到 `main` 後自動建置並部署到 GitHub Pages。

It also includes a CI workflow that runs verification checks on pull requests and pushes.
另外也已配置 CI workflow，會在 pull request 與 push 時執行驗證流程。

Workflow file:
流程檔案：

- `.github/workflows/deploy.yml`
- `.github/workflows/ci.yml`

## Current Status
## 目前狀態

SlotForge is already beyond a starter scaffold and functions as an early-stage internal prototyping tool. The current codebase strongly covers:
SlotForge 已經不只是 starter scaffold，而是具備明確方向的早期內部原型工具。目前程式已較完整覆蓋以下能力：

- workbench UI structure
- 工作台 UI 架構
- multi-template layout switching
- 多版型切換
- stage rendering architecture
- 舞台渲染架構
- asset-oriented scene composition
- 以素材為中心的場景組裝
- reel timing presets
- 滾輪節奏預設
- win demo playback
- 贏分演出播放
- export utilities
- 匯出工具

Areas still worth continuing to refine:
後續仍值得持續補強的方向：

- production README/docs polish
- 正式 README 與文件整理
- test coverage
- 測試覆蓋率
- asset packaging conventions
- 素材封裝與管理規範
- final export contract stability
- 最終匯出契約穩定性
- end-to-end build verification and deployment QA
- 端到端建置驗證與部署 QA

## Vision
## 專案願景

SlotForge aims to become a rapid prototyping environment for slot game teams, allowing designers, planners, and frontend/game engineers to collaborate around a single visual and timing-aware source of truth.
SlotForge 的目標，是成為老虎機團隊的快速原型環境，讓美術、企劃、前端與遊戲工程都能圍繞同一份具備視覺與時序語意的來源協作。
