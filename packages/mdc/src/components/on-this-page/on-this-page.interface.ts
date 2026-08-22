/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Type contracts and event details for `mdc-on-this-page` and `mdc-on-this-page-item`.
 */
import type { LitElement } from 'lit'

export type OnThisPageIndicatorFit = 'content' | 'full'

export interface IOnThisPage extends LitElement {
    /** Subtitle/caption above the page title, e.g. "On this page". */
    caption: string
    /** Main headline/title, e.g. "Navigation rail". */
    headline: string
    /** Active item href anchor. */
    activeHref: string
    /** Active item index. */
    activeIndex: number
    /** Target scroll container selector or element (defaults to window). */
    scrollTarget: string | HTMLElement | Window
    /** Offset in pixels from top of viewport/container for reading line and scroll snapping. */
    scrollOffset: number
    /** Whether to update the URL hash on item click. */
    updateHash: boolean
    /** Container selector for auto-discovering headings on the page. */
    contentSelector: string
    /** Whether to auto-discover headings if no items are slotted. */
    autoDiscover: boolean
    /** Whether the active indicator border wraps the text content or stretches to full container width. */
    indicatorFit: OnThisPageIndicatorFit
}

export interface IOnThisPageItem extends LitElement {
    /** Target anchor href, e.g. "#variants". */
    href: string
    /** Optional anchor target or section element ID without leading hash. */
    target: string
    /** Text label for the item. */
    label: string
    /** Whether this item is currently active. */
    active: boolean
    /** Whether this item is disabled. */
    disabled: boolean
    /** Heading hierarchy level (1, 2, 3...) for indentation. */
    level: number
    /** Item index within parent on-this-page container. */
    index: number
}

export interface OnThisPageChangeEventDetail {
    /** The newly activated item. */
    item: IOnThisPageItem | null
    /** Index of the newly activated item. */
    index: number
    /** Href of the newly activated item. */
    href: string
    /** Target ID of the section. */
    target: string
    /** Whether the activation was triggered by user click or by scroll spy. */
    userInitiated: boolean
}
