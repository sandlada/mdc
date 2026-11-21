/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
export const OverlayIdAttribute = 'data-mdc-overlay-id'

export const isOutsideComposedPath = (
    path: readonly EventTarget[],
    boundaries: ReadonlyArray<EventTarget | null | undefined>,
): boolean => {
    for (const boundary of boundaries) {
        if (boundary && path.includes(boundary)) {
            return false
        }
    }
    return true
}

/**
 * Walks up the composed DOM tree (crossing ShadowRoot boundaries) to find the
 * nearest ancestor overlay ID, enabling automatic parent-child overlay nesting.
 */
export const findNearestAncestorOverlayId = (startNode: Node | null, selfId: string): string | null => {
    let cursor: Node | null = startNode
    while (cursor) {
        if (cursor.nodeType === 1) {
            const element = cursor as Element
            const candidate = element.getAttribute(OverlayIdAttribute)
            if (candidate && candidate !== selfId) {
                return candidate
            }
            if (element.assignedSlot) {
                cursor = element.assignedSlot
                continue
            }
        }
        if (cursor.parentNode) {
            cursor = cursor.parentNode
        } else if (cursor.nodeType === 11 && 'host' in cursor) {
            cursor = (cursor as ShadowRoot).host
        } else {
            cursor = null
        }
    }
    return null
}
