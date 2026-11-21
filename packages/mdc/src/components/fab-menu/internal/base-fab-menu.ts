/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import { html, isServer, LitElement, nothing } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    findNearestAncestorOverlayId,
    getOverlayTree,
    isOutsideComposedPath,
    OverlayIdAttribute,
} from '../../../utils/overlay'
import { cancelTrackedAnimations, isReducedMotion } from '../../../utils/motion'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    FabMenuExpandedChangeEvent,
    FabMenuItemSelectEvent,
    type FabMenuHorizontalAlignments,
    type FabMenuSizes,
    type FabMenuVariants,
    type IMDCFabMenu,
    type IMDCFabMenuItem,
} from '../fab-menu.interface'

const DefaultAddIcon = html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
    </svg>
`

const DefaultCloseIcon = html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
    </svg>
`

let NextFabMenuOverlayUid = 0

export abstract class BaseFabMenu extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCFabMenu {

    @query('.toggle-fab')
    protected readonly toggleButtonElement!: HTMLButtonElement | null

    @query('.items')
    protected readonly itemsContainerElement!: HTMLElement | null

    @queryAssignedElements({ flatten: true })
    protected readonly assignedItems!: HTMLElement[]

    public override get focusRingControl() {
        return this.toggleButtonElement
    }

    @property({ type: String, reflect: true })
    public variant: FabMenuVariants = 'primary'

    @property({ type: String, reflect: true })
    public size: FabMenuSizes = 'small'

    private isExpanded = false
    private generation = 0
    private readonly activeAnimations = new Set<Animation>()
    private readonly inheritedVariantItems = new WeakSet<HTMLElement>()

    @property({ type: Boolean, reflect: true, noAccessor: true })
    public get expanded(): boolean {
        return this.isExpanded
    }
    public set expanded(value: boolean) {
        const next = Boolean(value)
        if (next === this.isExpanded) {
            return
        }
        const old = this.isExpanded
        this.isExpanded = next
        this.requestUpdate('expanded', old)
        if (!this.isConnected) {
            this.itemsCollapsed = !next
            return
        }
        if (next) {
            void this.runShowTransition()
        } else {
            void this.runCloseTransition()
        }
    }

    @property({ type: String, reflect: true, attribute: 'horizontal-alignment' })
    public horizontalAlignment: FabMenuHorizontalAlignments = 'end'

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: Boolean, reflect: true, attribute: 'close-on-select' })
    public closeOnSelect = true

    @property({ type: String, attribute: 'close-aria-label' })
    public closeAriaLabel: string | null = null

    @state()
    private itemsCollapsed = true

    @state()
    private hasCustomTrigger = false

    private readonly overlayId = `mdc-fab-menu-${++NextFabMenuOverlayUid}`

    private overlayDocument: Document | null = null
    private isConnectedPromiseResolve!: () => void
    private isConnectedPromise = this.createConnectedPromise()

    private createConnectedPromise(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    public constructor() {
        super()
        if (typeof document === 'undefined') {
            return
        }
        this.addEventListener(FabMenuItemSelectEvent, (e) => this.handleItemSelect(e))
        this.addEventListener('keydown', (e) => this.handleKeyDown(e))
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.isConnectedPromiseResolve()
        this.itemsCollapsed = !this.isExpanded
        const document = this.ownerDocument
        if (!document) return
        this.overlayDocument = document
        this.setAttribute(OverlayIdAttribute, this.overlayId)
        const tree = getOverlayTree(document)
        tree.register(this.overlayId, {
            parentId: findNearestAncestorOverlayId(this, this.overlayId),
            getSurface: () => this.itemsContainerElement,
            onClose: () => this.close(),
        })
        if (this.isExpanded) void tree.markOpen(this.overlayId)
        document.addEventListener('pointerdown', this.handleOutsidePointerDown)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        ++this.generation
        cancelTrackedAnimations(this.activeAnimations)
        this.isConnectedPromise = this.createConnectedPromise()
        const document = this.overlayDocument
        if (document) {
            getOverlayTree(document).unregister(this.overlayId)
            document.removeEventListener('pointerdown', this.handleOutsidePointerDown)
            this.overlayDocument = null
        }
    }

    protected override firstUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.firstUpdated(changedProperties)
        this.syncItemVariants()
    }

    protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
        super.updated(changedProperties)
        if (changedProperties.has('variant')) {
            this.syncItemVariants()
        }
    }

    public async show(): Promise<void> {
        if (this.disabled || this.isExpanded) {
            return
        }
        const preventOpen = !this.dispatchEvent(new Event('open', { cancelable: true }))
        if (preventOpen) {
            return
        }
        this.isExpanded = true
        this.requestUpdate('expanded', false)
        this.dispatchExpandedChange(true)
        const generation = this.generation
        if (this.overlayDocument) await getOverlayTree(this.overlayDocument).markOpen(this.overlayId)
        if (generation === this.generation && this.isExpanded) await this.runShowTransition()
    }

    public async close(): Promise<void> {
        if (!this.isExpanded) {
            return
        }
        const preventClose = !this.dispatchEvent(new Event('close', { cancelable: true }))
        if (preventClose) {
            return
        }
        const generation = this.generation
        if (this.overlayDocument) await getOverlayTree(this.overlayDocument).markClosed(this.overlayId)
        if (generation !== this.generation) return
        this.isExpanded = false
        this.requestUpdate('expanded', true)
        this.dispatchExpandedChange(false)
        await this.runCloseTransition()
    }

    public async toggle(): Promise<void> {
        if (this.isExpanded) {
            await this.close()
        } else {
            await this.show()
        }
    }

    protected getToggleFabClasses(): Record<string, boolean> {
        return {
            'toggle-fab': true,
            [this.size]: true,
            [this.variant]: true,
            'expanded': this.isExpanded,
        }
    }

    protected override render(): unknown {
        const { ariaLabel } = this as AriaMixinStrict
        const computedAriaLabel = this.isExpanded
            ? (this.closeAriaLabel ?? ariaLabel ?? 'Close menu')
            : (ariaLabel ?? 'Open menu')

        return html`
            <div
                class=${classMap({ 'items': true, 'collapsed': this.itemsCollapsed })}
                role="menu"
                aria-hidden=${this.isExpanded ? 'false' : 'true'}
                ?inert=${!this.isExpanded}
            >
                <slot @slotchange=${this.handleItemsSlotChange}></slot>
            </div>
            <div class="trigger" @click=${this.handleTriggerSlotClick}>
                <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}>
                    ${this.hasCustomTrigger ? nothing : html`
                        <button
                            class=${classMap(this.getToggleFabClasses())}
                            type="button"
                            ?disabled=${this.disabled}
                            aria-haspopup="menu"
                            aria-expanded=${this.isExpanded ? 'true' : 'false'}
                            aria-label=${ifDefined(computedAriaLabel)}
                        >
                            ${this.renderRipple()}
                            ${this.renderFocusRing()}
                            ${this.renderElevation()}
                            <span class="icon-slot icon-open" aria-hidden="true">
                                <slot name="icon">${DefaultAddIcon}</slot>
                            </span>
                            <span class="icon-slot icon-close" aria-hidden="true">
                                <slot name="close-icon">${DefaultCloseIcon}</slot>
                            </span>
                        </button>
                    `}
                </slot>
            </div>
        `
    }

    private handleTriggerSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasCustomTrigger = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleTriggerSlotClick(e: Event): void {
        if (this.disabled) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        void this.toggle()
    }

    private handleItemsSlotChange(): void {
        this.syncItemVariants()
    }

    private handleItemSelect(e: Event): void {
        const customEvent = e as CustomEvent<{ item: IMDCFabMenuItem }>
        const item = customEvent.detail?.item
        if (this.closeOnSelect && !item?.keepOpen && !customEvent.defaultPrevented) {
            void this.close()
        }
    }

    private handleOutsidePointerDown = (e: PointerEvent): void => {
        if (!this.isExpanded) {
            return
        }
        const boundaries = [this, ...getOverlayTree(this.ownerDocument).getOpenDescendantSurfaces(this.overlayId)]
        if (isOutsideComposedPath(e.composedPath(), boundaries)) {
            void this.close()
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (!this.isExpanded) {
            return
        }

        if (e.key === 'Escape') {
            const deepest = getOverlayTree(this.ownerDocument).getDeepestActiveLeafId()
            if (deepest && deepest !== this.overlayId) {
                return
            }
            e.preventDefault()
            e.stopPropagation()
            void this.close().then(() => {
                this.toggleButtonElement?.focus()
            })
            return
        }

        const items = this.getEnabledMenuItems()
        if (items.length === 0) {
            return
        }

        const active = this.getActiveElement()
        const activeIndex = active
            ? items.findIndex(
                (item) =>
                    item === active
                    || item.contains(active)
                    || Boolean(item.shadowRoot?.contains(active)),
            )
            : -1
        let nextIndex = -1

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % items.length
                break
            case 'ArrowUp':
                e.preventDefault()
                nextIndex = activeIndex < 0 ? items.length - 1 : (activeIndex - 1 + items.length) % items.length
                break
            case 'Home':
                e.preventDefault()
                nextIndex = 0
                break
            case 'End':
                e.preventDefault()
                nextIndex = items.length - 1
                break
            default:
                return
        }

        items[nextIndex]?.focus()
    }

    private getActiveElement(): Element | null {
        const root = this.getRootNode()
        let active: Element | null =
            root instanceof Document || root instanceof ShadowRoot
                ? root.activeElement
                : this.ownerDocument.activeElement
        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement
        }
        return active
    }

    private getMenuItems(): IMDCFabMenuItem[] {
        const slotted = this.assignedItems.filter(
            (el): el is IMDCFabMenuItem => el.tagName.toLowerCase() === 'mdc-fab-menu-item',
        )
        if (slotted.length > 0) {
            return slotted
        }
        return Array.from(this.children).filter(
            (el): el is IMDCFabMenuItem => el.tagName.toLowerCase() === 'mdc-fab-menu-item',
        )
    }

    private getEnabledMenuItems(): IMDCFabMenuItem[] {
        return this.getMenuItems().filter((el) => !el.disabled)
    }

    private syncItemVariants(): void {
        for (const el of this.getMenuItems()) {
            const hasExplicit = (el as IMDCFabMenuItem & { hasExplicitVariant?: boolean }).hasExplicitVariant === true
            if (!hasExplicit || this.inheritedVariantItems.has(el)) {
                this.inheritedVariantItems.add(el)
                el.variant = this.variant
            }
        }
    }

    private dispatchExpandedChange(expanded: boolean): void {
        this.dispatchEvent(new CustomEvent<{ expanded: boolean }>(FabMenuExpandedChangeEvent, {
            detail: { expanded },
            bubbles: true,
            composed: true,
        }))
    }

    private async runShowTransition(): Promise<void> {
        const gen = ++this.generation
        await this.isConnectedPromise
        this.itemsCollapsed = false
        await this.updateComplete
        if (gen !== this.generation) return

        cancelTrackedAnimations(this.activeAnimations)
        const items = [...this.assignedItems].reverse()

        if (!isReducedMotion() && items.length > 0) {
            const promises: Promise<unknown>[] = []
            items.forEach((item, index) => {
                if (typeof item.animate !== 'function') return
                if (typeof item.getAnimations === 'function') {
                    for (const existing of item.getAnimations()) {
                        existing.cancel()
                    }
                }
                const anim = item.animate(
                    [
                        { opacity: '0', transform: 'translateY(16px) scale(0.85)' },
                        { opacity: '1', transform: 'translateY(0) scale(1)' },
                    ],
                    {
                        duration: Duration.ExpressiveFastSpatial.Value,
                        easing: Easing.ExpressiveFastSpatial.ToCSSValue(),
                        delay: index * 25,
                        fill: 'backwards',
                    },
                )
                this.activeAnimations.add(anim)
                promises.push(
                    anim.finished
                        .catch(() => {})
                        .finally(() => this.activeAnimations.delete(anim)),
                )
            })
            await Promise.all(promises)
        }

        if (gen !== this.generation) return
        this.dispatchEvent(new Event('opened'))
    }

    private async runCloseTransition(): Promise<void> {
        const gen = ++this.generation
        if (!this.isConnected) {
            this.itemsCollapsed = true
            return
        }
        await this.updateComplete
        if (gen !== this.generation) return

        cancelTrackedAnimations(this.activeAnimations)
        const items = [...this.assignedItems]

        const closeAnims: Animation[] = []
        if (!isReducedMotion() && items.length > 0) {
            const promises: Promise<unknown>[] = []
            items.forEach((item, index) => {
                if (typeof item.animate !== 'function') return
                const anim = item.animate(
                    [
                        { opacity: '1', transform: 'translateY(0) scale(1)' },
                        { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
                    ],
                    {
                        duration: Duration.ExpressiveFastEffects.Value,
                        easing: Easing.ExpressiveFastEffects.ToCSSValue(),
                        delay: index * 15,
                        fill: 'forwards',
                    },
                )
                closeAnims.push(anim)
                this.activeAnimations.add(anim)
                promises.push(
                    anim.finished
                        .catch(() => {})
                        .finally(() => this.activeAnimations.delete(anim)),
                )
            })
            await Promise.all(promises)
        }

        if (gen !== this.generation) {
            for (const anim of closeAnims) {
                anim.cancel()
            }
            return
        }
        this.itemsCollapsed = true
        await this.updateComplete
        for (const anim of closeAnims) {
            anim.cancel()
        }
        this.dispatchEvent(new Event('closed'))
    }
}
