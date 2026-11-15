/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-list-item` — a single Material Design 3 Expressive list row.
 *
 * The item renders one of three native roots depending on `type`:
 *
 * - `link`   → `<a>`      (navigates to `href`, forced when `href` is set)
 * - `button` → `<button>` (activates on Enter / Space / click)
 * - `text`   → `<li>`     (non-interactive; hosts a `control` slot, e.g. checkbox)
 *
 * When `expandable` is set or the `children` slot contains child `mdc-list-item`
 * elements, the row acts as an accordion parent: clicking/activating toggles
 * `expanded`, animates the nested `children` slot, and updates segmented shapes.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    ListItemExpandChangeEvent,
    ListItemRequestActivationEvent,
    ListItemSelector,
    ListItemSwipeActionEvent,
    ListItemSwipeChangeEvent,
    type IMDCListItem,
    type IMDCListItemExpandChangeDetail,
    type IMDCListItemRequestActivationEventDetail,
    type IMDCListItemSwipeActionDetail,
    type IMDCListItemSwipeChangeDetail,
    type ListItemPosition,
    type ListItemType,
    type ListSelectionMode,
    type ListSwipePrimaryMode,
    type ListSwipeSide,
    type ListSwipeState,
    type ListVariant,
} from '../list.interface'
import { ListItemStyles } from '../list-item.style'

export const ListItemChildrenChangeEvent = 'mdc-list-item-children-change'

export abstract class BaseListItem extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCListItem {

    static override styles = ListItemStyles

    static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

    /** The interactive role of the item. */
    @property({ type: String, reflect: true })
    public type: ListItemType = 'text'

    /** Disables the item. Link items are never disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** Disabled state inherited from parent `mdc-list` or expandable parent. */
    @property({ type: Boolean })
    public listDisabled = false

    /** Whether a parent `mdc-list` manages segmented positions across runs. */
    public listManaged = false

    /** The destination URL. Forces `type` to `link` when set. */
    @property({ type: String, reflect: true })
    public href: string = ''

    /** The target of the link (e.g. `_blank`). */
    @property({ type: String, reflect: true })
    public target: string = ''

    /** Marks the item as selected (MD3 secondary-container highlight). */
    @property({ type: Boolean, reflect: true })
    public selected = false

    /** Visual variant synced from parent `mdc-list` or set directly. */
    @property({ type: String, reflect: true })
    public variant: ListVariant = 'standard'

    /** Position within a contiguous segmented run. */
    @property({ type: String, reflect: true })
    public position: ListItemPosition = 'single'

    /** Selection mode synced from parent `mdc-list`. */
    @property({ type: String })
    public selectionMode: ListSelectionMode = 'none'

    /** Whether the item can expand/collapse nested `children` items. */
    @property({ type: Boolean, reflect: true })
    public expandable = false

    /** Whether the `children` slot is currently expanded. */
    @property({ type: Boolean, reflect: true })
    public expanded = false

    /** Current swipe reveal state (`'closed'`, `'open-start'`, or `'open-end'`). */
    @property({ type: String, reflect: true, attribute: 'swipe-state' })
    public swipeState: ListSwipeState = 'closed'

    /** Primary action full-swipe commit mode (`'none'`, `'indirect'`, `'direct'`). */
    @property({ type: String, reflect: true, attribute: 'swipe-primary-mode' })
    public swipePrimaryMode: ListSwipePrimaryMode = 'none'

    /** Disables horizontal swipe gestures even when swipe action slots are populated. */
    @property({ type: Boolean, reflect: true, attribute: 'swipe-disabled' })
    public swipeDisabled = false

    /** Roving tabindex value assigned by the parent `mdc-list`. */
    @property({ type: Number })
    public listTabIndex = 0

    /** Set when the `control` slot is populated. */
    @state()
    public hasControl = false
    /** Set when the `start` slot is populated. */
    @state()
    public hasStart = false
    /** Set when the `overline` slot is populated. */
    @state()
    public hasOverline = false
    /** Set when the `headline` slot is populated. */
    @state()
    public hasHeadline = false
    /** Set when the `supporting-text` slot is populated. */
    @state()
    public hasSupportingText = false
    /** Set when the `trailing-supporting-text` slot is populated. */
    @state()
    public hasTrailingSupportingText = false
    /** Set when the `end` slot is populated. */
    @state()
    public hasEnd = false
    /** Set when the `children` slot has `mdc-list-item` children. */
    @state()
    public hasChildren = false
    /** Set when the `swipe-start` slot is populated. */
    @state()
    public hasSwipeStart = false
    /** Set when the `swipe-end` slot is populated. */
    @state()
    public hasSwipeEnd = false
    /** True while actively dragging horizontally. */
    @state()
    private swiping = false
    /** True when overswiped past the primary-action commit threshold. */
    @state()
    private swipePrimaryReady = false
    /** Active side revealed during a drag gesture. */
    @state()
    private dragActiveSide: ListSwipeSide | null = null

    @query('.container')
    protected readonly rootElement!: HTMLElement | null
    @query('.swipe-row')
    private readonly swipeRowElement!: HTMLElement | null
    @query('.swipe-actions.start .swipe-actions-track')
    private readonly swipeStartTrackElement!: HTMLElement | null
    @query('.swipe-actions.end .swipe-actions-track')
    private readonly swipeEndTrackElement!: HTMLElement | null
    @queryAssignedElements({ slot: 'control', flatten: true })
    private readonly assignedControls!: HTMLElement[]
    @queryAssignedElements({ slot: 'start', flatten: true })
    private readonly assignedStarts!: HTMLElement[]
    @queryAssignedElements({ slot: 'overline', flatten: true })
    private readonly assignedOverlines!: HTMLElement[]
    @queryAssignedElements({ slot: 'headline', flatten: true })
    private readonly assignedHeadlines!: HTMLElement[]
    @queryAssignedElements({ slot: 'supporting-text', flatten: true })
    private readonly assignedSupportingTexts!: HTMLElement[]
    @queryAssignedElements({ slot: 'trailing-supporting-text', flatten: true })
    private readonly assignedTrailingSupportingTexts!: HTMLElement[]
    @queryAssignedElements({ slot: 'end', flatten: true })
    private readonly assignedEnds!: HTMLElement[]
    @queryAssignedElements({ slot: 'swipe-start', flatten: true })
    private readonly assignedSwipeStarts!: HTMLElement[]
    @queryAssignedElements({ slot: 'swipe-end', flatten: true })
    private readonly assignedSwipeEnds!: HTMLElement[]
    @queryAssignedElements({ slot: 'children', selector: ListItemSelector, flatten: true })
    private readonly assignedChildren!: IMDCListItem[]
    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]

    private cachedChildItems: IMDCListItem[] = []
    private cachedSwipeStartWidth = 0
    private cachedSwipeEndWidth = 0
    private suppressNextClick = false
    private pointerDrag: {
        pointerId: number
        startX: number
        startY: number
        samples: Array<{ x: number; t: number }>
        startLogicalOffset: number
        currentLogicalOffset: number
        startedOpenSide: ListSwipeSide | null
        engaging: boolean
    } | null = null

    /** Slotted child `mdc-list-item` elements in the `children` slot. */
    public get childItems(): IMDCListItem[] {
        return this.cachedChildItems
    }

    /** Whether the item can expand (`expandable` attribute or has child items). */
    public get isExpandable(): boolean {
        return this.expandable || this.hasChildren
    }

    /** Whether either `swipe-start` or `swipe-end` contains action elements. */
    public get hasSwipeActions(): boolean {
        return this.hasSwipeStart || this.hasSwipeEnd
    }

    /** Whether the item is interactive (`button` or `link` type). */
    public get isInteractive(): boolean {
        return this.type !== 'text'
    }

    /** Whether the item is disabled (always false for `link` items). */
    public get isDisabled(): boolean {
        return (this.disabled || this.listDisabled) && this.type !== 'link'
    }

    public override get rippleControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        // The focus ring sits just inside the container for list items.
        this.focusRingInward = true
        this.addEventListener('keydown', this.handleHostKeydown)
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        // A list item with a destination URL is always a link.
        if (this.href) {
            this.type = 'link'
        } else if (this.isExpandable && this.type === 'text') {
            this.type = 'button'
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        this.syncSwipeAttributes()
        if (
            changedProperties.has('hasSwipeStart') ||
            changedProperties.has('hasSwipeEnd') ||
            changedProperties.has('swipeState')
        ) {
            this.measureSwipeTracks()
        }
        if (
            changedProperties.has('expanded') ||
            changedProperties.has('variant') ||
            changedProperties.has('selectionMode') ||
            changedProperties.has('disabled') ||
            changedProperties.has('listDisabled') ||
            changedProperties.has('hasChildren')
        ) {
            if (!this.listManaged) {
                this.syncStandaloneChildren()
            }
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.type]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
            'swiped': this.swiping || this.swipeState !== 'closed',
            'expandable': this.isExpandable,
            'expanded': this.expanded,
            'one-line': !this.hasOverline && !this.hasSupportingText,
            'two-line': !this.hasOverline && this.hasSupportingText,
            'three-line': this.hasOverline,
            'has-control': this.hasControl,
            'has-start': this.hasStart,
            'has-overline': this.hasOverline,
            'has-headline': this.hasHeadline,
            'has-supporting-text': this.hasSupportingText,
            'has-trailing-supporting-text': this.hasTrailingSupportingText,
            'has-end': this.hasEnd,
        })
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const classes = classMap(this.getRenderClasses())
        const tabIndex = this.isDisabled || !this.isInteractive ? -1 : this.listTabIndex
        const isSelectable = this.selectionMode !== 'none' && !this.isExpandable
        const role = isSelectable ? 'option' : 'listitem'
        const ariaSelected = isSelectable ? (this.selected ? 'true' : 'false') : nothing
        const ariaExpanded = this.isExpandable ? (this.expanded ? 'true' : 'false') : nothing

        let rowTemplate: TemplateResult
        if (this.type === 'link') {
            rowTemplate = html`
                <a
                    class="${classes}"
                    role=${role}
                    href=${this.href || nothing}
                    target=${this.target || nothing}
                    aria-label=${ariaLabel || nothing}
                    aria-selected=${ariaSelected}
                    aria-expanded=${ariaExpanded}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                    @pointerdown=${this.handleContainerPointerDown}
                >
                    ${this.renderSurface()}
                    <div class="item-clip">${this.renderBody()}</div>
                    ${this.renderTouchTarget()}
                </a>
            `
        } else if (this.type === 'button') {
            rowTemplate = html`
                <button
                    class="${classes}"
                    type="button"
                    role=${role}
                    ?disabled=${this.isDisabled}
                    aria-label=${ariaLabel || nothing}
                    aria-selected=${ariaSelected}
                    aria-expanded=${ariaExpanded}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                    @pointerdown=${this.handleContainerPointerDown}
                >
                    ${this.renderSurface()}
                    <div class="item-clip">${this.renderBody()}</div>
                    ${this.renderTouchTarget()}
                </button>
            `
        } else {
            rowTemplate = html`
                <li
                    class="${classes}"
                    role="listitem"
                    tabindex="-1"
                    aria-label=${ariaLabel || nothing}
                    @click=${this.handleTextSwipeClick}
                    @pointerdown=${this.handleContainerPointerDown}
                >
                    <div class="item-clip">${this.renderBody()}</div>
                    ${this.renderTouchTarget()}
                </li>
            `
        }

        return html`
            <div
                class="swipe-row"
                @pointermove=${this.handleContainerPointerMove}
                @pointerup=${this.handleContainerPointerUp}
                @pointercancel=${this.handleContainerPointerCancel}
            >
                ${this.renderSwipeActions('start')}
                ${rowTemplate}
                ${this.renderSwipeActions('end')}
            </div>
            ${this.renderChildren()}
        `
    }

    /** Ripple + focus-ring, rendered only on interactive (button / link) roots. */
    protected renderSurface(): TemplateResult {
        return html`
            ${this.renderFocusRing()}
            ${this.renderRipple()}
        `
    }

    /** Three-part body: leading / content / trailing (trailing-supporting-text + end). */
    protected renderBody(): TemplateResult {
        return html`
            <div class="item">
                <div class="leading">
                    <slot name="control" @slotchange=${this.handleControlSlotChange}></slot>
                    <slot name="start" @slotchange=${this.handleStartSlotChange}></slot>
                </div>
                <div class="content">
                    <div class="overline">
                        <slot name="overline" @slotchange=${this.handleOverlineSlotChange}></slot>
                    </div>
                    <div class="headline">
                        <slot name="headline" @slotchange=${this.handleHeadlineSlotChange}></slot>
                        <slot @slotchange=${this.handleDefaultSlotChange}></slot>
                    </div>
                    <div class="supporting-text">
                        <slot name="supporting-text" @slotchange=${this.handleSupportingTextSlotChange}></slot>
                    </div>
                </div>
                <div class="trailing">
                    <div class="trailing-supporting-text">
                        <slot name="trailing-supporting-text" @slotchange=${this.handleTrailingSupportingTextSlotChange}></slot>
                    </div>
                    <div class="end">
                        <slot name="end" @slotchange=${this.handleEndSlotChange}></slot>
                        ${this.isExpandable && !this.hasEnd ? this.renderExpandIndicator() : nothing}
                    </div>
                </div>
            </div>
        `
    }

    protected renderExpandIndicator(): TemplateResult {
        return html`
            <span class="expand-indicator" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="M12 15.375 6 9.375 7.4 7.975 12 12.575 16.6 7.975 18 9.375Z" />
                </svg>
            </span>
        `
    }

    protected renderChildren(): TemplateResult {
        return html`
            <div
                class="children-collapse ${this.hasChildren ? 'has-children' : ''}"
                ?inert=${!this.expanded}
                aria-hidden=${!this.expanded ? 'true' : 'false'}
            >
                <div class="children" role=${this.selectionMode !== 'none' ? 'group' : 'list'}>
                    <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
                </div>
            </div>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    protected renderSwipeActions(side: ListSwipeSide): TemplateResult {
        const hasSlot = side === 'start' ? this.hasSwipeStart : this.hasSwipeEnd
        const expectedState: ListSwipeState = side === 'start' ? 'open-start' : 'open-end'
        const isOpen = this.swipeState === expectedState || (this.swiping && this.dragActiveSide === side)
        const isPrimaryActive = this.swipePrimaryReady && this.dragActiveSide === side
        return html`
            <div
                class="swipe-actions ${side} ${isPrimaryActive ? 'is-primary-active' : ''}"
                ?inert=${!isOpen || !hasSlot}
                aria-hidden=${isOpen && hasSlot ? 'false' : 'true'}
                @click=${(event: Event) => this.handleSwipeActionsClick(side, event)}
            >
                <div class="swipe-actions-track">
                    <slot
                        name=${side === 'start' ? 'swipe-start' : 'swipe-end'}
                        @slotchange=${side === 'start' ? this.handleSwipeStartSlotChange : this.handleSwipeEndSlotChange}
                    ></slot>
                </div>
            </div>
        `
    }

    /** Reveals the swipe actions on the specified side. */
    public openSwipe(side?: ListSwipeSide): void {
        if (this.isDisabled || this.swipeDisabled) {
            return
        }
        const targetSide: ListSwipeSide = side ?? (this.hasSwipeEnd ? 'end' : 'start')
        if (targetSide === 'start' && !this.hasSwipeStart) {
            return
        }
        if (targetSide === 'end' && !this.hasSwipeEnd) {
            return
        }
        this.measureSwipeTracks()
        this.setSwipeState(targetSide === 'start' ? 'open-start' : 'open-end')
    }

    /** Closes any currently revealed swipe actions. */
    public closeSwipe(): void {
        this.clearDragStyles()
        this.swiping = false
        this.swipePrimaryReady = false
        this.dragActiveSide = null
        this.setSwipeState('closed')
    }

    public override focus(): void {
        this.rootElement?.focus()
    }
    public override click(): void {
        this.rootElement?.click()
    }

    private syncStandaloneChildren(): void {
        const children = this.cachedChildItems
        if (this.isExpandable && this.expanded && children.length > 0) {
            this.position = 'first'
            children.forEach((child, index) => {
                child.variant = this.variant
                child.selectionMode = this.selectionMode
                child.position = index === children.length - 1 ? 'last' : 'middle'
                ;(child as unknown as BaseListItem).listDisabled = this.isDisabled
            })
        } else if (this.isExpandable) {
            this.position = 'single'
        }
    }

    private readonly handleControlSlotChange = (): void => {
        this.hasControl = this.assignedControls.length > 0
    }
    private readonly handleStartSlotChange = (): void => {
        this.hasStart = this.assignedStarts.length > 0
    }
    private readonly handleOverlineSlotChange = (): void => {
        this.hasOverline = this.assignedOverlines.length > 0
    }
    private readonly handleHeadlineSlotChange = (): void => {
        this.hasHeadline = this.assignedHeadlines.length > 0
    }
    private readonly handleSupportingTextSlotChange = (): void => {
        this.hasSupportingText = this.assignedSupportingTexts.length > 0
    }
    private readonly handleTrailingSupportingTextSlotChange = (): void => {
        this.hasTrailingSupportingText = this.assignedTrailingSupportingTexts.length > 0
    }
    private readonly handleEndSlotChange = (): void => {
        this.hasEnd = this.assignedEnds.length > 0
    }
    private readonly handleSwipeStartSlotChange = (): void => {
        this.hasSwipeStart = this.assignedSwipeStarts.length > 0
        this.syncPrimaryActionAttributes('start')
        if (!this.hasSwipeStart && this.swipeState === 'open-start') {
            this.closeSwipe()
        }
        this.measureSwipeTracks()
    }
    private readonly handleSwipeEndSlotChange = (): void => {
        this.hasSwipeEnd = this.assignedSwipeEnds.length > 0
        this.syncPrimaryActionAttributes('end')
        if (!this.hasSwipeEnd && this.swipeState === 'open-end') {
            this.closeSwipe()
        }
        this.measureSwipeTracks()
    }

    private syncPrimaryActionAttributes(side: ListSwipeSide): void {
        const items = side === 'start' ? this.assignedSwipeStarts : this.assignedSwipeEnds
        const primary = side === 'start' ? items[0] : items[items.length - 1]
        for (const item of items) {
            item.toggleAttribute('data-swipe-primary', item === primary)
        }
    }
    private readonly handleDefaultSlotChange = (): void => {
        this.hasHeadline = this.assignedHeadlines.length > 0 || this.assignedDefaultNodes.length > 0
    }
    private readonly handleChildrenSlotChange = (): void => {
        this.cachedChildItems = this.assignedChildren
        this.hasChildren = this.cachedChildItems.length > 0
        if (!this.listManaged) {
            this.syncStandaloneChildren()
        }
        this.dispatchEvent(new CustomEvent(ListItemChildrenChangeEvent, {
            bubbles: true,
            composed: true,
        }))
    }

    private syncSwipeAttributes(): void {
        this.toggleAttribute('has-swipe-actions', this.hasSwipeActions)
        this.toggleAttribute('swiping', this.swiping)
        this.toggleAttribute('swipe-primary-ready', this.swipePrimaryReady)
    }

    private setSwipeState(nextState: ListSwipeState): void {
        const previousState = this.swipeState
        if (previousState === nextState) {
            return
        }
        this.swipeState = nextState
        this.dispatchEvent(new CustomEvent<IMDCListItemSwipeChangeDetail>(
            ListItemSwipeChangeEvent,
            {
                detail: { item: this, state: nextState, previousState },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private getDirectionSign(): 1 | -1 {
        if (isServer || typeof getComputedStyle !== 'function') {
            return 1
        }
        return getComputedStyle(this).direction === 'rtl' ? -1 : 1
    }

    private getSwipeGap(): number {
        if (isServer || typeof getComputedStyle !== 'function') {
            return 4
        }
        const raw = parseFloat(getComputedStyle(this).getPropertyValue('--_enabled-swipe-gap'))
        return Number.isFinite(raw) ? raw : 4
    }

    private measureSwipeTracks(): void {
        if (!this.swipeRowElement || !this.style) {
            return
        }
        if (this.swipeStartTrackElement) {
            const container = this.swipeStartTrackElement.parentElement
            container?.classList.add('measuring')
            const width = Math.ceil(this.swipeStartTrackElement.scrollWidth || this.swipeStartTrackElement.getBoundingClientRect().width)
            container?.classList.remove('measuring')
            this.cachedSwipeStartWidth = width
            this.style.setProperty('--_swipe-start-intrinsic', `${width}px`)
        } else {
            this.cachedSwipeStartWidth = 0
        }
        if (this.swipeEndTrackElement) {
            const container = this.swipeEndTrackElement.parentElement
            container?.classList.add('measuring')
            const width = Math.ceil(this.swipeEndTrackElement.scrollWidth || this.swipeEndTrackElement.getBoundingClientRect().width)
            container?.classList.remove('measuring')
            this.cachedSwipeEndWidth = width
            this.style.setProperty('--_swipe-end-intrinsic', `${width}px`)
        } else {
            this.cachedSwipeEndWidth = 0
        }
        this.style.setProperty('--_swipe-dir', `${this.getDirectionSign()}`)
    }

    private applyDragStyles(logicalOffset: number, gap: number): void {
        if (!this.style) {
            return
        }
        const dir = this.getDirectionSign()
        const computeRevealMetrics = (absOffset: number, actionCount: number, intrinsicWidth: number) => {
            const count = Math.max(1, actionCount)
            const revealWidth = Math.max(0, absOffset - gap)
            const appliedGap = Math.min(gap, absOffset)
            const minGapFloor = (count - 1) * gap
            const availableWidth = Math.max(0, revealWidth - minGapFloor)
            const opacity = intrinsicWidth > 0
                ? Math.min(1, availableWidth / Math.min(24, intrinsicWidth))
                : 1
            const pillWidth = availableWidth / count
            const pillFull = intrinsicWidth > 0
                ? Math.max(25, Math.min(36, Math.max(0, intrinsicWidth - minGapFloor) / count))
                : 36
            const iconOpacity = Math.min(1, Math.max(0, (pillWidth - 24) / (pillFull - 24)))
            return { revealWidth, appliedGap, opacity, iconOpacity }
        }
        if (logicalOffset > 0) {
            const { revealWidth, appliedGap, opacity, iconOpacity } = computeRevealMetrics(
                logicalOffset,
                this.assignedSwipeStarts.length,
                this.cachedSwipeStartWidth,
            )
            this.style.setProperty('--_swipe-drag-start-width', `${revealWidth}px`)
            this.style.setProperty('--_swipe-drag-start-gap', `${appliedGap}px`)
            this.style.setProperty('--_swipe-drag-start-opacity', `${opacity}`)
            this.style.setProperty('--_swipe-drag-start-icon-opacity', `${iconOpacity}`)
            this.style.setProperty('--_swipe-drag-end-width', '0px')
            this.style.setProperty('--_swipe-drag-end-gap', '0px')
            this.style.setProperty('--_swipe-drag-end-opacity', '0')
            this.style.setProperty('--_swipe-drag-end-icon-opacity', '0')
            this.style.setProperty('--_swipe-content-extra', `${logicalOffset}px`)
            this.style.setProperty('--_swipe-content-shift', '0px')
        } else if (logicalOffset < 0) {
            const absOffset = -logicalOffset
            const { revealWidth, appliedGap, opacity, iconOpacity } = computeRevealMetrics(
                absOffset,
                this.assignedSwipeEnds.length,
                this.cachedSwipeEndWidth,
            )
            this.style.setProperty('--_swipe-drag-end-width', `${revealWidth}px`)
            this.style.setProperty('--_swipe-drag-end-gap', `${appliedGap}px`)
            this.style.setProperty('--_swipe-drag-end-opacity', `${opacity}`)
            this.style.setProperty('--_swipe-drag-end-icon-opacity', `${iconOpacity}`)
            this.style.setProperty('--_swipe-drag-start-width', '0px')
            this.style.setProperty('--_swipe-drag-start-gap', '0px')
            this.style.setProperty('--_swipe-drag-start-opacity', '0')
            this.style.setProperty('--_swipe-drag-start-icon-opacity', '0')
            this.style.setProperty('--_swipe-content-extra', `${absOffset}px`)
            this.style.setProperty('--_swipe-content-shift', `${-dir * absOffset}px`)
        } else {
            // Keep explicit 0px overrides while dragging so open-* host rules do not bleed through.
            this.style.setProperty('--_swipe-drag-start-width', '0px')
            this.style.setProperty('--_swipe-drag-start-gap', '0px')
            this.style.setProperty('--_swipe-drag-start-opacity', '0')
            this.style.setProperty('--_swipe-drag-start-icon-opacity', '0')
            this.style.setProperty('--_swipe-drag-end-width', '0px')
            this.style.setProperty('--_swipe-drag-end-gap', '0px')
            this.style.setProperty('--_swipe-drag-end-opacity', '0')
            this.style.setProperty('--_swipe-drag-end-icon-opacity', '0')
            this.style.setProperty('--_swipe-content-extra', '0px')
            this.style.setProperty('--_swipe-content-shift', '0px')
        }
    }

    private clearDragStyles(): void {
        if (!this.style) {
            return
        }
        const props = [
            '--_swipe-drag-start-width',
            '--_swipe-drag-start-gap',
            '--_swipe-drag-start-opacity',
            '--_swipe-drag-start-icon-opacity',
            '--_swipe-drag-end-width',
            '--_swipe-drag-end-gap',
            '--_swipe-drag-end-opacity',
            '--_swipe-drag-end-icon-opacity',
            '--_swipe-content-extra',
            '--_swipe-content-shift',
        ]
        for (const prop of props) {
            this.style.removeProperty(prop)
        }
    }

    private getPrimaryActionElement(side: ListSwipeSide): HTMLElement | null {
        if (side === 'start') {
            return this.assignedSwipeStarts[0] ?? null
        }
        return this.assignedSwipeEnds[this.assignedSwipeEnds.length - 1] ?? null
    }

    private readonly handleHostKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && this.swipeState !== 'closed') {
            event.stopPropagation()
            this.closeSwipe()
            this.focus()
        }
    }

    private readonly handleSwipeActionsClick = (side: ListSwipeSide, event: Event): void => {
        const slotList = side === 'start' ? this.assignedSwipeStarts : this.assignedSwipeEnds
        const path = event.composedPath()
        const action = slotList.find((el) => path.includes(el)) ?? null
        if (!action) {
            return
        }
        this.dispatchEvent(new CustomEvent<IMDCListItemSwipeActionDetail>(
            ListItemSwipeActionEvent,
            {
                detail: { item: this, side, action, trigger: 'click' },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private readonly handleTextSwipeClick = (event: Event): void => {
        if (this.suppressNextClick) {
            this.suppressNextClick = false
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (this.swipeState !== 'closed') {
            event.preventDefault()
            this.closeSwipe()
        }
    }

    private readonly handleContainerPointerDown = (event: PointerEvent): void => {
        if (!this.hasSwipeActions || this.isDisabled || this.swipeDisabled) {
            return
        }
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return
        }
        this.measureSwipeTracks()
        const gap = this.getSwipeGap()
        const dir = this.getDirectionSign()
        let startLogicalOffset = 0
        if (this.swipeState === 'open-start') {
            startLogicalOffset = this.cachedSwipeStartWidth + gap
        } else if (this.swipeState === 'open-end') {
            startLogicalOffset = -(this.cachedSwipeEndWidth + gap)
        }
        const startedOpenSide: ListSwipeSide | null =
            this.swipeState === 'open-start' ? 'start' : this.swipeState === 'open-end' ? 'end' : null

        this.pointerDrag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            samples: [{ x: event.clientX, t: performance.now() }],
            startLogicalOffset,
            currentLogicalOffset: startLogicalOffset,
            startedOpenSide,
            engaging: false,
        }
        // Store physical direction multiplier on drag update via dir.
        this.style?.setProperty('--_swipe-dir', `${dir}`)
    }

    private readonly handleContainerPointerMove = (event: PointerEvent): void => {
        const drag = this.pointerDrag
        if (!drag || event.pointerId !== drag.pointerId) {
            return
        }
        const dx = event.clientX - drag.startX
        const dy = event.clientY - drag.startY

        if (!drag.engaging) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                return
            }
            if (Math.abs(dy) >= Math.abs(dx)) {
                // Vertical scroll gesture wins; abandon horizontal drag.
                this.pointerDrag = null
                return
            }
            drag.engaging = true
            this.swiping = true
            this.suppressNextClick = true
            this.syncSwipeAttributes()
            if (event.isTrusted) {
                this.swipeRowElement?.setPointerCapture?.(drag.pointerId)
            }
        }

        const now = performance.now()
        const dir = this.getDirectionSign()
        drag.samples.push({ x: event.clientX, t: now })
        while (drag.samples.length > 2 && now - drag.samples[0].t > 100) {
            drag.samples.shift()
        }

        const gap = this.getSwipeGap()
        const logicalDelta = dx * dir
        const candidate = drag.startLogicalOffset + logicalDelta
        const rowWidth = this.swipeRowElement?.getBoundingClientRect().width ?? 320

        let clamped = 0
        let activeSide: ListSwipeSide | null = null
        let primaryReady = false

        const resolveSideClamp = (absCandidate: number, side: ListSwipeSide, intrinsicWidth: number) => {
            const maxOpen = intrinsicWidth + gap
            if (absCandidate <= maxOpen) {
                return { absClamped: absCandidate, primaryReady: false }
            }
            const over = absCandidate - maxOpen
            if (this.swipePrimaryMode === 'none') {
                const maxOvershoot = 48
                return {
                    absClamped: maxOpen + (maxOvershoot * over) / (over + 160),
                    primaryReady: false,
                }
            }
            const commitThreshold = Math.max(maxOpen + 56, rowWidth * 0.55)
            const maxExtent = Math.max(commitThreshold + 40, maxOpen + 112)
            const allowPrimary =
                this.swipePrimaryMode === 'direct' ||
                (this.swipePrimaryMode === 'indirect' && drag.startedOpenSide === side)
            return {
                absClamped: maxOpen + Math.min(over, maxExtent - maxOpen) * 0.65,
                primaryReady: allowPrimary && absCandidate >= commitThreshold,
            }
        }

        if (candidate > 0 && this.hasSwipeStart) {
            activeSide = 'start'
            const result = resolveSideClamp(candidate, 'start', this.cachedSwipeStartWidth)
            clamped = result.absClamped
            primaryReady = result.primaryReady
        } else if (candidate < 0 && this.hasSwipeEnd) {
            activeSide = 'end'
            const result = resolveSideClamp(-candidate, 'end', this.cachedSwipeEndWidth)
            clamped = -result.absClamped
            primaryReady = result.primaryReady
        }

        drag.currentLogicalOffset = clamped
        this.dragActiveSide = activeSide
        this.swipePrimaryReady = primaryReady
        this.syncSwipeAttributes()
        this.applyDragStyles(clamped, gap)
    }

    private readonly handleContainerPointerUp = (event: PointerEvent): void => {
        const drag = this.pointerDrag
        if (!drag || event.pointerId !== drag.pointerId) {
            return
        }
        this.pointerDrag = null
        if (!drag.engaging) {
            return
        }

        if (event.isTrusted && this.swipeRowElement?.hasPointerCapture?.(drag.pointerId)) {
            this.swipeRowElement.releasePointerCapture(drag.pointerId)
        }

        const gap = this.getSwipeGap()
        const offset = drag.currentLogicalOffset
        const side: ListSwipeSide | null = offset > 0 ? 'start' : offset < 0 ? 'end' : null
        const intrinsic = side === 'start' ? this.cachedSwipeStartWidth : side === 'end' ? this.cachedSwipeEndWidth : 0

        let nextState: ListSwipeState = 'closed'
        let committedPrimary = false

        if (side && this.swipePrimaryReady) {
            committedPrimary = true
            nextState = 'closed'
        } else if (side && intrinsic > 0) {
            const absOffset = Math.abs(offset)
            const targetOpen = intrinsic + gap
            const now = performance.now()
            const lastSample = drag.samples[drag.samples.length - 1]
            const firstSample = drag.samples[0]
            const dtSinceLastMove = lastSample ? now - lastSample.t : Infinity
            let effectiveVx = 0
            if (dtSinceLastMove <= 80 && drag.samples.length >= 2) {
                const dir = this.getDirectionSign()
                const totalDx = (lastSample.x - firstSample.x) * dir
                if (Math.abs(totalDx) >= 8) {
                    effectiveVx = totalDx / Math.max(1, lastSample.t - firstSample.t)
                }
            }
            const openingVelocity = side === 'start' ? effectiveVx : -effectiveVx
            if (openingVelocity > 0.35 && absOffset > 16) {
                nextState = side === 'start' ? 'open-start' : 'open-end'
            } else if (openingVelocity < -0.35 && absOffset < targetOpen) {
                nextState = 'closed'
            } else if (absOffset >= targetOpen * 0.5) {
                nextState = side === 'start' ? 'open-start' : 'open-end'
            }
        }

        // Flush layout once with [swiping] removed so snap animates from current offset.
        this.swipePrimaryReady = false
        this.dragActiveSide = null
        this.swiping = false
        this.syncSwipeAttributes()
        this.setSwipeState(nextState)
        void this.swipeRowElement?.offsetWidth
        this.clearDragStyles()

        if (committedPrimary && side) {
            const action = this.getPrimaryActionElement(side)
            this.dispatchEvent(new CustomEvent<IMDCListItemSwipeActionDetail>(
                ListItemSwipeActionEvent,
                {
                    detail: { item: this, side, action, trigger: 'swipe' },
                    bubbles: true,
                    composed: true,
                }
            ))
        }

        // Clear click suppression after browser's synchronous click tick.
        queueMicrotask(() => {
            setTimeout(() => {
                this.suppressNextClick = false
            }, 0)
        })
    }

    private readonly handleContainerPointerCancel = (event: PointerEvent): void => {
        const drag = this.pointerDrag
        if (!drag || event.pointerId !== drag.pointerId) {
            return
        }
        this.pointerDrag = null
        if (!drag.engaging) {
            return
        }
        this.swipePrimaryReady = false
        this.dragActiveSide = null
        this.swiping = false
        this.suppressNextClick = false
        this.syncSwipeAttributes()
        void this.swipeRowElement?.offsetWidth
        this.clearDragStyles()
    }

    private readonly handleActivation = (event: Event): void => {
        if (this.suppressNextClick) {
            this.suppressNextClick = false
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (this.swipeState !== 'closed') {
            event.preventDefault()
            this.closeSwipe()
            return
        }
        if (this.isDisabled) {
            event.preventDefault()
            return
        }
        if (this.isExpandable) {
            this.expanded = !this.expanded
            this.dispatchEvent(new CustomEvent<IMDCListItemExpandChangeDetail>(
                ListItemExpandChangeEvent,
                {
                    detail: { item: this, expanded: this.expanded },
                    bubbles: true,
                    composed: true,
                }
            ))
        }
        this.dispatchEvent(new CustomEvent<IMDCListItemRequestActivationEventDetail>(
            ListItemRequestActivationEvent,
            {
                detail: { item: this },
                bubbles: true,
                composed: true,
            }
        ))
    }
}
