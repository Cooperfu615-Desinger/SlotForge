# Antigravity Agent: Dev Agent Skills (V2.2)

> **Role**: Senior Frontend Architect
> **Focus**: Asset Pipeline & GSAP Animation
> **Context**: SlotForge V2 (Asset-Based / Workbench Layout)

---

## 1. 核心實作技能 (Core Skills)

### A. Asset-First Rendering (資產優先渲染)
* **Smart Fallback 策略**: 必須實作 `GameElement.vue`。
    * **邏輯**: 使用 `v-if="imageLoaded"` 判斷。
    * **正常**: 渲染 `Konva.Image` (讀取 PNG)。
    * **異常**: 若圖片路徑 404 或未設定，自動降級渲染 `Konva.Rect` (白底黑框) + `Konva.Text` (顯示元件 ID)。
    * **目的**: 確保即使美術缺圖，開發者與企劃仍能看到版面佈局，程式不崩潰。
* **Device Scaling (自適應縮放)**: 實作 `DeviceContainer.vue`。
    * **原理**: 使用 CSS `transform-origin: top left` 與 `transform: scale(n)` 來適配使用者視窗。
    * **鐵律**: **嚴禁**修改 Konva 內部的 `Stage` 解析度 (必須鎖定為 `1280x720` 或 `720x1280`)，確保邏輯座標恆定。

### B. GSAP Animation (時序控制)
* **Timeline Management**: 放棄 Konva 內建 Tween，全面採用 `gsap.timeline()`。
* **Spin Logic (轉動模擬)**: 
    * 針對滾輪圖層執行 `y` 軸位移動畫。
    * **時序精準度**: 動畫的 `duration` 必須嚴格對應 `rhythm_spec` 中的毫秒數 (如 2000ms)，誤差不得超過 100ms。
    * **無模糊**: 不需實作動態模糊 (Motion Blur)，僅需清晰的快速位移。

### C. Asset Management (資產管理)
* **Local Drag & Drop**: 
    * 實作 `dragenter`, `drop` 事件監聽。
    * 使用 `URL.createObjectURL(file)` 生成瀏覽器本地暫存路徑 (`blob:...`)。
    * 將此路徑寫入 Pinia Store 的 `asset_src`，實現即時預覽。
* **Security Protocol**: **嚴禁**實作任何將圖片上傳至後端 API 的功能，所有預覽皆在本地記憶體中完成。

---

## 2. 開發規範 (Standards)

### A. 組件職責 (Component Responsibility)
* **Workbench Layout**: 嚴格遵守「四分格佈局」。
    * `TopBar`: 全域設定 (版型切換)。
    * `DeviceContainer`: 畫布容器。
    * `Inspector`: 參數顯示 (Web/Cocos 座標)。
    * `Sequencer`: 播放控制。
* **PNG 碎圖化**: 將 UI 拆解為獨立組件 (Spin Button, Auto Button, BG)，不要將所有按鈕寫死在一張大底圖上。

### B. 數據與互動 (Data & Interaction)
* **座標公式**: 在 Inspector 面板中，必須實作 Web 轉 Cocos 的公式顯示 (e.g., `x_cocos = x_web - 640`)。
* **Click Through**: 即使在動畫播放中，Konva 元素仍需保持可點擊狀態，以便查看參數。

---

## 3. 輸出規範 (Output Protocol)
* **Fallback 驗證**: 每次提交代碼前，請先測試將 `asset_src` 設為空值，確認畫面是否正確顯示 Fallback 方塊。
* **Console Clean**: 確保 `Konva` 與 `GSAP` 沒有拋出大量的 Warning (如重複 ID 或無效 Target)。