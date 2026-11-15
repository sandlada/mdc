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
    type IMDCListItem,
    type IMDCListItemExpandChangeDetail,
    type IMDCListItemRequestActivationEventDetail,
    type ListItemPosition,
    type ListItemType,
    type ListSelectionMode,
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

    @query('.container')
    protected readonly rootElement!: HTMLElement | null
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
    @queryAssignedElements({ slot: 'children', selector: ListItemSelector, flatten: true })
    private readonly assignedChildren!: IMDCListItem[]
    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]

    private cachedChildItems: IMDCListItem[] = []

    /** Slotted child `mdc-list-item` elements in the `children` slot. */
    public get childItems(): IMDCListItem[] {
        return this.cachedChildItems
    }

    /** Whether the item can expand (`expandable` attribute or has child items). */
    public get isExpandable(): boolean {
        return this.expandable || this.hasChildren
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
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
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
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </button>
            `
        } else {
            rowTemplate = html`
                <li class="${classes}" role="listitem" tabindex="-1" aria-label=${ariaLabel || nothing}>
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </li>
            `
        }

        return html`
            ${rowTemplate}
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

    private readonly handleActivation = (event: Event): void => {
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
