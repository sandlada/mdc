/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-list-item` — a single MD3 list row.
 *
 * The item renders one of three native roots depending on `type`:
 *
 * - `link`   → `<a>`   (navigates to `href`, forced when `href` is set)
 * - `button` → `<button>` (activates on Enter / Space / click)
 * - `text`   → `<li>`  (non-interactive; hosts a `control` slot, e.g. checkbox)
 *
 * Interactive items wire `mixinRippleOptions` / `mixinFocusRingOptions` to the
 * root element. On activation the item dispatches a composed
 * `request-activation` event so the parent `mdc-list` can promote it to the
 * roving tabindex slot.
 *
 * Visual structure (mirrors @material/web `<md-item>`):
 *
 *     [leading: control + start] [content: overline / headline / supporting-text /
 *                                 trailing-supporting-text] [end]
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
    LIST_ITEM_REQUEST_ACTIVATION_EVENT,
    type IListItem,
    type IListItemRequestActivationEventDetail,
} from '../list.interface'
import { ListItemStyles } from './list-item.style'

export abstract class BaseListItem extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IListItem {

    static override styles = ListItemStyles

    static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

    /** The interactive role of the item. */
    @property({ type: String, reflect: true })
    public type: 'text' | 'button' | 'link' = 'text'

    /** Disables the item. Link items are never disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** The destination URL. Forces `type` to `link` when set. */
    @property({ type: String, reflect: true })
    public href: string = ''

    /** The target of the link (e.g. `_blank`). */
    @property({ type: String, reflect: true })
    public target: string = ''

    /** Marks the item as selected (MD3 secondary-container highlight). */
    @property({ type: Boolean, reflect: true })
    public selected = false

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
    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]

    /** Whether the item is interactive (`button` or `link` type). */
    public get isInteractive(): boolean {
        return this.type !== 'text'
    }

    /** Whether the item is disabled (always false for `link` items). */
    public get isDisabled(): boolean {
        return this.disabled && this.type !== 'link'
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
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.type]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
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

        if (this.type === 'link') {
            return html`
                <a
                    class="${classes}"
                    role="listitem"
                    href=${this.href || nothing}
                    target=${this.target || nothing}
                    aria-label=${ariaLabel || nothing}
                    aria-selected=${this.selected ? 'true' : nothing}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </a>
            `
        }

        if (this.type === 'button') {
            return html`
                <button
                    class="${classes}"
                    type="button"
                    role="listitem"
                    ?disabled=${this.isDisabled}
                    aria-label=${ariaLabel || nothing}
                    aria-selected=${this.selected ? 'true' : nothing}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </button>
            `
        }

        return html`
            <li class="${classes}" role="listitem" tabindex="-1" aria-label=${ariaLabel || nothing}>
                ${this.renderBody()}
                ${this.renderTouchTarget()}
            </li>
        `
    }

    /** Ripple + focus-ring, rendered only on interactive (button / link) roots. */
    protected renderSurface(): TemplateResult {
        return html`
            ${this.renderFocusRing()}
            ${this.renderRipple()}
        `
    }

    /** The `md-item`-style three-part body: leading / content / trailing. */
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
                    <div class="trailing-supporting-text">
                        <slot name="trailing-supporting-text" @slotchange=${this.handleTrailingSupportingTextSlotChange}></slot>
                    </div>
                </div>
                <div class="end">
                    <slot name="end" @slotchange=${this.handleEndSlotChange}></slot>
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

    private readonly handleActivation = (event: Event): void => {
        if (this.isDisabled) {
            event.preventDefault()
            return
        }
        this.dispatchEvent(new CustomEvent<IListItemRequestActivationEventDetail>(
            LIST_ITEM_REQUEST_ACTIVATION_EVENT,
            {
                detail: { item: this },
                bubbles: true,
                composed: true,
            }
        ))
    }
}
