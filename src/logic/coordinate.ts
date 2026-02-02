/**
 * SlotForge Coordinate Bridge
 * 
 * 實作 Web 座標系與 Cocos 座標系之間的精確轉換
 * 
 * 座標系統定義:
 * - Web 座標系: 原點在左上角 (0,0), X 向右, Y 向下
 * - Cocos 座標系: 原點在畫布中心 (0,0), X 向右, Y 向上
 * 
 * 公式來源: SLOTFORGE_DATA_CONTRACT.md V1.2
 */

import type { Rect } from '@/types/manifest'

/**
 * 座標系統類型
 */
export type CoordinateSystem = 'web' | 'cocos'

/**
 * 錨點類型
 */
export type AnchorType = 'top-left' | 'center'

/**
 * Cocos 座標矩形 (用於顯示與驗證)
 */
export interface CocosRect {
    x: number
    y: number
    w: number
    h: number
}

/**
 * 座標轉換結果 (包含詳細計算過程)
 */
export interface CoordinateTransformResult {
    webRect: Rect
    cocosRect: CocosRect
    anchor: AnchorType
    baseResolution: { w: number; h: number }
    formula: {
        anchorX: number
        anchorY: number
        calculation: string
    }
}

/**
 * 將錨點字串轉換為數值
 * 
 * @param anchor - 錨點類型 ('top-left' | 'center')
 * @returns 錨點數值 { x, y }
 */
function getAnchorValue(anchor: AnchorType): { x: number; y: number } {
    switch (anchor) {
        case 'top-left':
            return { x: 0, y: 0 }
        case 'center':
            return { x: 0.5, y: 0.5 }
        default:
            throw new Error(`Invalid anchor type: ${anchor}`)
    }
}

/**
 * Web 座標 → Cocos 座標轉換
 * 
 * 公式:
 * x_cocos = (x_web - W_base / 2) + (Anchor_x * w)
 * y_cocos = (H_base / 2 - y_web) - (Anchor_y * h)
 * 
 * @param webRect - Web 座標矩形
 * @param anchor - 錨點類型
 * @param baseResolution - 畫布解析度
 * @returns Cocos 座標矩形
 */
export function webToCocos(
    webRect: Rect,
    anchor: AnchorType,
    baseResolution: { w: number; h: number }
): CocosRect {
    const anchorValue = getAnchorValue(anchor)
    const { x: xWeb, y: yWeb, w, h } = webRect
    const { w: wBase, h: hBase } = baseResolution

    // 應用公式
    const xCocos = (xWeb - wBase / 2) + (anchorValue.x * w)
    const yCocos = (hBase / 2 - yWeb) - (anchorValue.y * h)

    return {
        x: xCocos,
        y: yCocos,
        w,
        h
    }
}

/**
 * Cocos 座標 → Web 座標轉換
 * 
 * 反向公式:
 * x_web = x_cocos + W_base / 2 - (Anchor_x * w)
 * y_web = H_base / 2 - y_cocos - (Anchor_y * h)
 * 
 * @param cocosRect - Cocos 座標矩形
 * @param anchor - 錨點類型
 * @param baseResolution - 畫布解析度
 * @returns Web 座標矩形
 */
export function cocosToWeb(
    cocosRect: CocosRect,
    anchor: AnchorType,
    baseResolution: { w: number; h: number }
): Rect {
    const anchorValue = getAnchorValue(anchor)
    const { x: xCocos, y: yCocos, w, h } = cocosRect
    const { w: wBase, h: hBase } = baseResolution

    // 應用反向公式
    const xWeb = xCocos + wBase / 2 - (anchorValue.x * w)
    const yWeb = hBase / 2 - yCocos - (anchorValue.y * h)

    return {
        x: xWeb,
        y: yWeb,
        w,
        h
    }
}

/**
 * 完整座標轉換 (包含計算過程)
 * 
 * 用於 Inspector 面板顯示詳細資訊
 * 
 * @param webRect - Web 座標矩形
 * @param anchor - 錨點類型
 * @param baseResolution - 畫布解析度
 * @returns 完整轉換結果
 */
export function transformCoordinate(
    webRect: Rect,
    anchor: AnchorType,
    baseResolution: { w: number; h: number }
): CoordinateTransformResult {
    const anchorValue = getAnchorValue(anchor)
    const cocosRect = webToCocos(webRect, anchor, baseResolution)

    // 生成計算過程說明
    const calculation = `
x_cocos = (${webRect.x} - ${baseResolution.w}/2) + (${anchorValue.x} * ${webRect.w}) = ${cocosRect.x}
y_cocos = (${baseResolution.h}/2 - ${webRect.y}) - (${anchorValue.y} * ${webRect.h}) = ${cocosRect.y}
  `.trim()

    return {
        webRect,
        cocosRect,
        anchor,
        baseResolution,
        formula: {
            anchorX: anchorValue.x,
            anchorY: anchorValue.y,
            calculation
        }
    }
}

/**
 * 驗證座標轉換的雙向一致性
 * 
 * 用於 QA 測試
 * 
 * @param webRect - 原始 Web 座標
 * @param anchor - 錨點類型
 * @param baseResolution - 畫布解析度
 * @returns 是否通過驗證
 */
export function validateCoordinateTransform(
    webRect: Rect,
    anchor: AnchorType,
    baseResolution: { w: number; h: number }
): boolean {
    const cocosRect = webToCocos(webRect, anchor, baseResolution)
    const webRectReverse = cocosToWeb(cocosRect, anchor, baseResolution)

    // 允許浮點數誤差 (< 0.001)
    const epsilon = 0.001
    return (
        Math.abs(webRect.x - webRectReverse.x) < epsilon &&
        Math.abs(webRect.y - webRectReverse.y) < epsilon &&
        Math.abs(webRect.w - webRectReverse.w) < epsilon &&
        Math.abs(webRect.h - webRectReverse.h) < epsilon
    )
}
