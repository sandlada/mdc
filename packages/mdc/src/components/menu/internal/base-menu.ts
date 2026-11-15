/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-menu` — the Material Design 3 Expressive menu
 * container.
 *
 * The `variant` attribute reflects the expressive color-style axis
 * (`standard` → surface-container-low, `vibrant` → tertiary-container, both
 * at Level2). The `layout` attribute reflects the grouped axis: grouped on
 * web is a single surface with divider / `section-label` slots — there are no
 * gap surfaces (inset 4dp gaps with 12dp first / last corners are
 * Android-only; see the grouped branch in `menu.style.ts`).
 *
 * M4 container behavior lives here: cancelable `show()` / `hide()` with
 * `showing` / `hiding` + `opened` / `closed` events, floating-ui
 * offset / flip / shift positioning with autoUpdate, outside-pointerdown
 * dismiss, Escape-to-close with focus-return-to-anchor, roving tabindex with
 * ArrowUp / ArrowDown / ArrowLeft / ArrowRight / Home / End plus a typeahead
 * buffer, and the keep-open (checkable / radio) vs close-on-select policy.
 * Motion itself is M5: `quick` (and `prefers-reduced-motion`) skips the
 * `animateSurface()` hook, which currently only awaits live CSS animations.
 */
import { autoUpdate, computePosition, flip, offset, shift, type Middleware } from '@floating-ui/dom'
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import type {
    IMDCMenu,
    IMDCMenuClosedDetail,
    IMDCMenuItem,
    IMDCMenuItemActivatedDetail,
    IMDCMenuItemRequestActivationDetail,
    IMDCMenuOpenedDetail,
    IMDCMenuSelectDetail,
    IMDCMenuSubmenu,
    MenuColorStyle,
    MenuLayout,
    MenuPlacement,
} from '../menu.interface'
import { MenuStyles } from '../menu.style'

const ValidColorStyles: readonly string[] = ['standard', 'vibrant']
const ValidLayouts: readonly string[] = ['standard', 'grouped']

/** Gap in pixels between the anchor and the menu surface (popup-controller idiom). */
const PositionOffset = 6
/** Viewport padding in pixels for the floating-ui shift middleware. */
const PositionShiftPadding = 8
/** Idle time in ms after which the typeahead buffer resets. */
const TypeaheadResetMs = 500

const isHTMLElement = (value: unknown): value is HTMLElement =>
    typeof HTMLElement !== 'undefined' && value instanceof HTMLElement

/** Selector covering the roving set: items plus submenu triggers (F1). */
const MenuRovingSelector = 'mdc-menu-item, mdc-menu-submenu'

/**
 * Structural roving member: an `mdc-menu-item` or an `mdc-menu-submenu`
 * trigger, coordinated via `focus()` / `isInteractive` duck-typing (the
 * submenu files are owned by another track and are never imported here).
 * Submenu triggers expose `disabled` instead of `isDisabled` and do not
 * expose `isInteractive` / `listTabIndex`; see the roving helpers below.
 */
type MenuRovingChild = (IMDCMenuItem | IMDCMenuSubmenu) & {
    readonly isInteractive?: boolean
    readonly isDisabled?: boolean
    readonly disabled?: boolean
    focus(): void
    listTabIndex?: number
}

const isMenuSubmenuNode = (node: EventTarget): boolean =>
    typeof (node as Element).tagName === 'string' && (node as Element).tagName === 'MDC-MENU-SUBMENU'

export abstract class BaseMenu extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions
)(LitElement) implements IMDCMenu {

    static override styles = MenuStyles

    /** Whether the menu surface is open. */
    @property({ type: Boolean, reflect: true })
    public open = false

    /** Skips opening and closing animations. */
    @property({ type: Boolean, reflect: true })
    public quick = false

    /** Preferred placement of the surface relative to the anchor. */
    @property({ type: String, reflect: true })
    public placement: MenuPlacement = 'bottom-start'

    /**
     * Expressive color-style axis, reflected by the `variant` attribute.
     * `standard` (default) or `vibrant`. Kept in sync with `colorStyle`.
     */
    @property({ type: String, reflect: true })
    public variant: MenuColorStyle = 'standard'

    /**
     * Alias of `variant` under the interface name. Mapped to the
     * `color-style` attribute; kept in sync with `variant`.
     */
    @property({ type: String, attribute: 'color-style', reflect: true })
    public colorStyle: MenuColorStyle = 'standard'

    /** Expressive layout axis. `standard` (default) or `grouped`. */
    @property({ type: String, reflect: true })
    public layout: MenuLayout = 'standard'

    /** Accessible name of the menu (aria-label). */
    @property({ type: String })
    public label: string | null = null

    @queryAssignedElements({ selector: MenuRovingSelector, flatten: true })
    private readonly assignedItems!: MenuRovingChild[]

    @queryAssignedElements({ slot: 'trigger', flatten: true })
    private readonly triggerElements!: HTMLElement[]

    @query('.container')
    private readonly surfaceElement!: HTMLElement | null

    private cachedItems: MenuRovingChild[] = []

    /** Generation guard: a stale show/hide never emits its completion event. */
    private lifecycle = 0
    private cleanupAutoUpdate: (() => void) | null = null
    private dismissAttached = false
    private returnFocusElement: HTMLElement | null = null
    private typeaheadBuffer = ''
    private typeaheadTimer: ReturnType<typeof setTimeout> | null = null

    /** Set when the `section-label` slot is populated (grouped layout). */
    @state()
    protected hasSectionLabel = false

    /** The slotted `mdc-menu-item` / `mdc-menu-submenu` children, flattened. */
    public get items(): IMDCMenuItem[] {
        return this.cachedItems as unknown as IMDCMenuItem[]
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener('click', this.handleTriggerClick)
        this.addEventListener('request-activation', this.handleRequestActivation)
        this.addEventListener('item-activated', this.handleItemActivated)
        this.addEventListener('focusin', this.handleFocusIn)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.open) {
            this.syncOpenSideEffects(false)
        }
    }

    public override disconnectedCallback(): void {
        this.stopPositionTracking()
        this.detachDismissListeners()
        this.clearTypeaheadTimer()
        super.disconnectedCallback()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (changedProperties.has('variant') && this.variant !== this.colorStyle) {
            this.colorStyle = this.variant
        } else if (changedProperties.has('colorStyle') && this.colorStyle !== this.variant) {
            this.variant = this.colorStyle
        }
        if (!ValidColorStyles.includes(this.variant)) {
            throw new Error(`[mdc-menu] Unsupported variant "${String(this.variant)}". Expressive menus support only "standard" | "vibrant".`)
        }
        if (!ValidLayouts.includes(this.layout)) {
            throw new Error(`[mdc-menu] Unsupported layout "${String(this.layout)}". Expressive menus support only "standard" | "grouped".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        const hostClasses = this.getHostClasses()
        for (const [name, active] of Object.entries(hostClasses)) {
            this.classList.toggle(name, active)
        }
        if (changedProperties.has('open')) {
            this.syncOpenSideEffects(false)
        } else if (changedProperties.has('placement') && this.open) {
            this.syncOpenSideEffects(true)
        }
    }

    /** Host-level classes mirroring the reflected state attributes. */
    protected getHostClasses(): Record<string, boolean> {
        return {
            'open': this.open,
            'quick': this.quick,
        }
    }

    /** Render-root classes for the menu surface (non-host, used with classMap). */
    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container': true,
            'open': this.open,
            'quick': this.quick,
            [`variant-${this.variant}`]: true,
            [`layout-${this.layout}`]: true,
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const label = ariaLabel || this.label
        return html`
            <span class="trigger">
                <slot name="trigger"></slot>
            </span>
            <div
                class="${classMap(this.getRenderClasses())}"
                role="menu"
                aria-label=${label || nothing}
            >
                ${this.renderElevation()}
                <div class="content">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                    <slot name="section-label" @slotchange=${this.handleSectionLabelSlotChange}></slot>
                    <slot name="surface"></slot>
                </div>
            </div>
        `
    }

    /**
     * Opens the menu: cancelable `showing`, then positioning, roving-tabindex
     * init and (unless `quick` or reduced motion) the open animation hook,
     * finally `opened`. Stale generations never complete.
     */
    public async show(): Promise<void> {
        if (this.open) {
            return
        }
        const generation = ++this.lifecycle
        const showing = new CustomEvent<IMDCMenuOpenedDetail>(
            'showing',
            {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { menu: this },
            },
        )
        this.dispatchEvent(showing)
        if (showing.defaultPrevented) {
            this.lifecycle--
            return
        }
        this.rememberReturnFocus()
        this.open = true
        if (this.isConnected) {
            await this.updateComplete
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.startPositionTracking()
        this.attachDismissListeners()
        this.updateTabIndices()
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('open', generation)
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.dispatchEvent(new CustomEvent<IMDCMenuOpenedDetail>(
            'opened',
            {
                bubbles: true,
                composed: true,
                detail: { menu: this },
            },
        ))
    }

    /**
     * Closes the menu: cancelable `hiding`, then the close animation hook
     * (skipped when `quick` or reduced motion), focus-return-to-anchor,
     * finally `closed`. Stale generations never complete.
     */
    public async hide(): Promise<void> {
        if (!this.open) {
            return
        }
        const generation = ++this.lifecycle
        const hiding = new CustomEvent<IMDCMenuClosedDetail>(
            'hiding',
            {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { menu: this },
            },
        )
        this.dispatchEvent(hiding)
        if (hiding.defaultPrevented) {
            this.lifecycle--
            return
        }
        // Close first: the close transition only starts once the `open`
        // attribute is removed. `allow-discrete` keeps the surface rendered
        // until the transition ends (dialog.base idiom).
        this.open = false
        this.stopPositionTracking()
        this.detachDismissListeners()
        if (this.isConnected) {
            await this.updateComplete
        }
        if (generation !== this.lifecycle) {
            return
        }
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('close', generation)
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.returnFocusToAnchor()
        this.dispatchEvent(new CustomEvent<IMDCMenuClosedDetail>(
            'closed',
            {
                bubbles: true,
                composed: true,
                detail: { menu: this },
            },
        ))
    }

    /** Closes the menu surface (alias to hide for @material/web parity). */
    public async close(): Promise<void> {
        return this.hide()
    }

    /**
     * Toggles the menu surface between open and closed states.
     */
    public async toggle(): Promise<void> {
        if (this.open) {
            await this.hide()
        } else {
            await this.show()
        }
    }

    /** Focuses the next focusable item (wrap-around). */
    public activateNextItem(): void {
        const target = this.activateRelativeItem(1)
        if (target) {
            target.focus()
            this.updateTabIndices()
        }
    }

    /** Focuses the previous focusable item (wrap-around). */
    public activatePreviousItem(): void {
        const target = this.activateRelativeItem(-1)
        if (target) {
            target.focus()
            this.updateTabIndices()
        }
    }

    /**
     * Recomputes the floating-ui position of the surface against the anchor.
     * Public so tests and M5 motion can drive it without a full show cycle.
     */
    public async updatePosition(): Promise<void> {
        const anchor = this.getAnchorElement()
        const surface = this.getSurfaceElement()
        if (!anchor || !surface) {
            return
        }
        const { x, y } = await computePosition(anchor, surface, {
            placement: this.placement,
            middleware: this.createPositionMiddleware(),
        })
        surface.style?.setProperty('left', `${x}px`)
        surface.style?.setProperty('top', `${y}px`)
    }

    /**
     * The floating-ui middleware chain: gap offset, overflow flip, viewport
     * shift. Split out so specs can assert the chain without DOM measurements.
     */
    protected createPositionMiddleware(): Middleware[] {
        return [
            offset(PositionOffset),
            flip(),
            shift({ padding: PositionShiftPadding }),
        ]
    }

    /**
     * Motion hook for M5 (scale + fade, transform-origin per placement).
     * The default only awaits live CSS animations; `quick` and
     * `prefers-reduced-motion` skip the call entirely at the logic level.
     */
    protected async animateSurface(_mode: 'open' | 'close', _generation: number): Promise<void> {
        await this.waitForAnimations()
    }

    /** Logic-level reduced-motion gate (mirrors the CSS media query). */
    protected prefersReducedMotion(): boolean {
        if (typeof matchMedia !== 'function') {
            return false
        }
        return matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    /**
     * The anchor the surface positions against: the first `trigger`-slotted
     * element. Overridable for tests (shadow slot queries need rendering).
     */
    protected getAnchorElement(): HTMLElement | null {
        const elements = this.triggerElements ?? []
        return elements[0] ?? null
    }

    /** The rendered surface container. Overridable for tests. */
    protected getSurfaceElement(): HTMLElement | null {
        return this.surfaceElement ?? null
    }

    /** RTL context for ArrowLeft / ArrowRight mirroring (base-list idiom). */
    protected isRtlContext(): boolean {
        const dir = this.getAttribute?.('dir')
        if (dir === 'rtl') {
            return true
        }
        if (dir === 'ltr') {
            return false
        }
        if (typeof getComputedStyle === 'function') {
            try {
                return getComputedStyle(this).direction === 'rtl'
            } catch {
                return false
            }
        }
        return false
    }

    private syncOpenSideEffects(restart: boolean): void {
        if (!this.open) {
            this.stopPositionTracking()
            this.detachDismissListeners()
            return
        }
        if (restart || !this.isPositionTracking()) {
            this.startPositionTracking()
        }
        this.attachDismissListeners()
        this.updateTabIndices()
    }

    private isPositionTracking(): boolean {
        return this.cleanupAutoUpdate !== null
    }

    private startPositionTracking(): void {
        this.stopPositionTracking()
        const anchor = this.getAnchorElement()
        const surface = this.getSurfaceElement()
        if (!anchor || !surface) {
            return
        }
        surface.style?.setProperty('position', 'fixed')
        surface.style?.setProperty('left', '0')
        surface.style?.setProperty('top', '0')
        this.cleanupAutoUpdate = autoUpdate(anchor, surface, () => {
            void this.updatePosition()
        })
    }

    /**
     * Stops the autoUpdate loop only. The inline `position` / `left` / `top`
     * styles stay on the surface: the close transition keeps the surface
     * rendered until it ends (`display` flips at the transition end via
     * `allow-discrete`), and pulling the styles mid-fade would drop the
     * surface back into flow — its width jumps from shrink-to-fit to the
     * host width. The styles are rewritten on every open by
     * `startPositionTracking()` and are inert under `display: none`.
     */
    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
    }

    private attachDismissListeners(): void {
        if (this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.addEventListener('pointerdown', this.handleDocumentPointerdown, true)
        document.addEventListener('keydown', this.handleDocumentKeydown, true)
        this.dismissAttached = true
    }

    private detachDismissListeners(): void {
        if (!this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.removeEventListener('pointerdown', this.handleDocumentPointerdown, true)
        document.removeEventListener('keydown', this.handleDocumentKeydown, true)
        this.dismissAttached = false
    }

    private rememberReturnFocus(): void {
        const active = typeof document === 'undefined' ? null : document.activeElement
        this.returnFocusElement = isHTMLElement(active) ? active : null
    }

    private returnFocusToAnchor(): void {
        const target = this.getAnchorElement() ?? this.returnFocusElement
        target?.focus?.()
        this.returnFocusElement = null
    }

    /**
     * Waits until every CSS transition started by the last state change is
     * done (dialog.base idiom). A replaced or canceled transition rejects
     * `finished`, which counts as "no longer animating". When nothing
     * animates (`quick`, reduced motion, zero durations), resolves at once.
     */
    private async waitForAnimations(): Promise<void> {
        const surface = this.getSurfaceElement()
        if (!surface) {
            return
        }
        // Transitions are created at style recalc, and the state change that
        // started them happened in this task. Flush style/layout so they are
        // observable — otherwise `getAnimations` sees none and this resolves
        // before the transition has run.
        void surface.offsetWidth
        const animations = surface.getAnimations?.({ subtree: true }) ?? []
        if (animations.length === 0) {
            return
        }
        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => undefined),
            ),
        )
    }

    private readonly handleSlotChange = (): void => {
        this.cachedItems = [...(this.assignedItems ?? [])]
        this.updateTabIndices()
    }

    private readonly handleSectionLabelSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasSectionLabel = slot.assignedElements().length > 0
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleRequestActivation = (event: Event): void => {
        const item = (event as CustomEvent<IMDCMenuItemRequestActivationDetail>).detail?.item as unknown as MenuRovingChild | undefined
        if (!item || !this.cachedItems.includes(item)) {
            return
        }
        // Promote the activating item (or submenu trigger) to the roving tabindex slot.
        item.focus()
        this.updateTabIndices()
    }

    /**
     * Close-on-select policy, coordinated via events only (item files are
     * owned by another track): plain items close the menu, checkable / radio
     * items stay open so the selection change remains visible.
     */
    private readonly handleItemActivated = (event: Event): void => {
        const item = (event as CustomEvent<IMDCMenuItemActivatedDetail>).detail?.item
        if (!item) {
            return
        }
        this.dispatchEvent(new CustomEvent<IMDCMenuSelectDetail>(
            'select',
            {
                detail: { item },
                bubbles: true,
                composed: true,
            },
        ))
        const keepOpen = item.checkable === true || item.radio === true
        if (!keepOpen) {
            void this.hide()
        }
    }

    private readonly handleTriggerClick = (event: Event): void => {
        const trigger = this.getAnchorElement()
        if (!trigger) {
            return
        }
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        const inPath = path.includes(trigger)
        const target = event.target as Node | null
        const inTarget = target === trigger ||
            (typeof (trigger as { contains?: (node: Node) => boolean }).contains === 'function' &&
                target !== null && (trigger as { contains: (node: Node) => boolean }).contains(target))
        if (!inPath && !inTarget) {
            return
        }
        if (this.open) {
            void this.hide()
        } else {
            void this.show()
        }
    }

    private readonly handleDocumentPointerdown = (event: Event): void => {
        if (!this.open) {
            return
        }
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        if (path.includes(this)) {
            return
        }
        void this.hide()
    }

    private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && this.open) {
            if (this.isEventFromOpenDescendant(event)) {
                return
            }
            event.preventDefault()
            void this.hide()
        }
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            if (this.open) {
                if (this.isEventFromOpenDescendant(event)) {
                    return
                }
                event.preventDefault()
                void this.hide()
            }
            return
        }
        const items = this.cachedItems
        if (items.length === 0) {
            return
        }
        const target = event.target as MenuRovingChild | null
        if (target === null || !items.includes(target)) {
            return
        }

        const isUp = event.key === 'ArrowUp'
        const isDown = event.key === 'ArrowDown'
        const isLeft = event.key === 'ArrowLeft'
        const isRight = event.key === 'ArrowRight'
        const isHome = event.key === 'Home'
        const isEnd = event.key === 'End'
        const isPrintable = event.key.length === 1 &&
            !event.ctrlKey && !event.metaKey && !event.altKey &&
            event.key !== ' '
        if (!isUp && !isDown && !isLeft && !isRight && !isHome && !isEnd && !isPrintable) {
            return
        }
        event.preventDefault()

        if (isPrintable) {
            this.handleTypeahead(event.key)
            return
        }

        const isRtl = this.isRtlContext()
        let nextItem: MenuRovingChild | undefined
        if (isHome || isEnd) {
            nextItem = this.findNextFocusableItem(
                isHome ? 0 : items.length - 1,
                isHome ? 1 : -1,
            )
        } else {
            let delta: 1 | -1 = 1
            if (isUp) {
                delta = -1
            } else if (isDown) {
                delta = 1
            } else if (isLeft) {
                // ArrowLeft moves backwards in LTR, forwards in RTL.
                delta = isRtl ? 1 : -1
            } else {
                // ArrowRight moves forwards in LTR, backwards in RTL.
                delta = isRtl ? -1 : 1
            }
            nextItem = this.activateRelativeItem(delta)
        }

        if (nextItem) {
            nextItem.focus()
            this.updateTabIndices()
        }
    }

    private handleTypeahead(char: string): void {
        const next = `${this.typeaheadBuffer}${char.toLowerCase()}`
        let match = this.findTypeaheadMatch(next)
        let buffer = next
        if (!match && next.length > 1) {
            buffer = char.toLowerCase()
            match = this.findTypeaheadMatch(buffer)
        }
        this.typeaheadBuffer = buffer
        this.clearTypeaheadTimer()
        if (typeof setTimeout === 'function') {
            const timer = setTimeout(() => {
                this.typeaheadBuffer = ''
                this.typeaheadTimer = null
            }, TypeaheadResetMs)
            const withUnref = timer as unknown as { unref?: () => void }
            if (typeof withUnref.unref === 'function') {
                withUnref.unref()
            }
            this.typeaheadTimer = timer
        }
        if (match) {
            match.focus()
            this.updateTabIndices()
        }
    }

    private findTypeaheadMatch(prefix: string): MenuRovingChild | undefined {
        return this.cachedItems.find((item) =>
            this.isRovingFocusable(item) && this.getItemLabel(item).startsWith(prefix),
        )
    }

    private getItemLabel(item: MenuRovingChild): string {
        const labelProp = (item as { label?: unknown }).label
        const raw = typeof labelProp === 'string' && labelProp.length > 0
            ? labelProp
            : (typeof item.textContent === 'string' ? item.textContent : '')
        return raw.trim().toLowerCase()
    }

    private clearTypeaheadTimer(): void {
        if (this.typeaheadTimer !== null) {
            clearTimeout(this.typeaheadTimer)
            this.typeaheadTimer = null
        }
    }

    /** Walk from the focused item (or an edge when none is focused) by `delta`. */
    private activateRelativeItem(delta: 1 | -1): MenuRovingChild | undefined {
        const items = this.cachedItems
        if (items.length === 0) {
            return undefined
        }
        const focusedIndex = items.findIndex((item) => this.isItemFocused(item))
        const startIndex = focusedIndex === -1
            ? (delta > 0 ? 0 : items.length - 1)
            : focusedIndex + delta
        return this.findNextFocusableItem(startIndex, delta > 0 ? 1 : -1)
    }

    /** Walk from `startIndex` in `step` direction (wrapping) for a focusable item. */
    private findNextFocusableItem(startIndex: number, step: 1 | -1): MenuRovingChild | undefined {
        const items = this.cachedItems
        for (let i = 0; i < items.length; i++) {
            let index = startIndex + i * step
            index = ((index % items.length) + items.length) % items.length
            const item = items[index]
            if (this.isRovingFocusable(item)) {
                return item
            }
        }
        return undefined
    }

    private isItemFocused(item: MenuRovingChild): boolean {
        return typeof (item as unknown as HTMLElement).matches === 'function' && (item as unknown as HTMLElement).matches(':focus-within')
    }

    /**
     * True when the child can take roving focus: menu-items via
     * `isInteractive` / `isDisabled`, submenu triggers via `disabled`
     * (missing `isInteractive` defaults to true). Duck-typed so the
     * container never imports the submenu files.
     */
    private isRovingFocusable(item: MenuRovingChild): boolean {
        const interactive = item.isInteractive ?? true
        const disabled = item.isDisabled ?? item.disabled ?? false
        return interactive && !disabled
    }

    /**
     * True when the event targets an open `mdc-menu-submenu` descendant: the
     * inner level handles Escape first (innermost-first hierarchy mirroring
     * `base-menu-submenu.ts`). The container closes only when no open
     * descendant is in the event path.
     */
    private isEventFromOpenDescendant(event: KeyboardEvent): boolean {
        if (typeof event.composedPath !== 'function') {
            return false
        }
        return event.composedPath().some((node) =>
            node !== this && isMenuSubmenuNode(node) && (node as IMDCMenuSubmenu).open)
    }

    /**
     * Assigns the roving tab-stop when the child exposes `listTabIndex`
     * (menu-item). Submenu triggers without `listTabIndex` keep a single
     * tab-stop via container focus discipline: the container moves focus
     * with `focus()` to exactly one member, so no extra tab-stop is added
     * here (documented choice for F1).
     */
    private setRovingTabIndex(item: MenuRovingChild, value: 0 | -1): void {
        if ('listTabIndex' in item) {
            item.listTabIndex = value
        }
    }

    private updateTabIndices(): void {
        const items = this.cachedItems
        if (items.length === 0) {
            return
        }

        const focusedItem = items.find((item) => this.isItemFocused(item))
        const focusedIsFocusable = focusedItem !== undefined && this.isRovingFocusable(focusedItem)
        const firstFocusable = items.find((item) => this.isRovingFocusable(item))
        const itemToFocus = focusedIsFocusable ? focusedItem : firstFocusable

        for (const item of items) {
            this.setRovingTabIndex(item, item === itemToFocus ? 0 : -1)
        }
    }
}
