/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { IDockLayoutData } from './internal/dock-tree'
import type { DropZone } from './internal/dock-hit-tester'

export type {
    GridNode,
    LeafNode,
    BranchNode,
    SizeConstraints,
    TabSpec,
    Orientation,
    Direction,
    Rect,
    IDockLayoutData,
} from './internal/dock-tree'
export { serialize, deserialize, addLeafAt, removeLeaf, resizeLeaf, moveLeaf } from './internal/dock-tree'
export type { DropZone } from './internal/dock-hit-tester'

/** Event detail types emitted by dock-* components. */

export interface IDockDragStartDetail {
    viewId: string
    tabId?: string
    pointer: { x: number; y: number }
}

export interface IDockDragZoneChangeDetail {
    viewId: string
    zone: DropZone
}

export interface IDockDragCommitDetail {
    viewId: string
    zone: DropZone
    data: IDockLayoutData
}

export interface IDockSashDragDetail {
    leafId: string
    /** New size as a fraction of parent (0..1). */
    size: number
}

export interface IDockSashCommitDetail {
    leafId: string
    size: number
}

export interface IDockTabSelectDetail {
    tabId: string
    viewId: string
}

export interface IDockTabCloseDetail {
    tabId: string
    viewId: string
}

export interface IDockPaneSplitDetail {
    viewId: string
    direction: 'horizontal' | 'vertical'
}

export interface IDockPaneCloseDetail {
    viewId: string
}

export interface IDockPaneMaximizeToggleDetail {
    viewId: string
    maximized: boolean
}

export interface IDockLayoutChangeDetail {
    mutation: 'add' | 'remove' | 'move' | 'resize' | 'split' | 'merge' | 'maximize' | 'restore' | 'close'
    data: IDockLayoutData
}