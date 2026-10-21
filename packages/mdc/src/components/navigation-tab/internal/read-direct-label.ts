/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Minimal text-node shape used to read a tab label without depending on the
 * DOM `Node` global (SSR and unit tests provide plain objects instead).
 */
export interface IDirectLabelNode {
    readonly nodeType: number
    readonly textContent: string | null
}

const TEXT_NODE_TYPE = 3

/**
 * Reads a label from the direct text children of an element only.
 *
 * Text living inside child elements is ignored: a slotted
 * `<mdc-icon>settings</mdc-icon>` carries the icon name as text and must not
 * be mistaken for the tab label of an icon-only destination.
 */
export function readDirectLabel(nodes: Iterable<IDirectLabelNode>): string {
    let label = ''
    for (const node of nodes) {
        if (node.nodeType !== TEXT_NODE_TYPE) continue
        label += node.textContent ?? ''
    }
    return label.trim()
}
