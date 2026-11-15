/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-menu-submenu` — the Material Design 3
 * Expressive nested menu surface.
 *
 * The nested surface mirrors the `mdc-menu` container (M3E vertical 16dp
 * corners, Level2 elevation, same container color per color-style selected
 * through the reflected `variant` attribute, 8dp block padding,
 * `calc(100vh - 48px)` max-height with scroll). Placement defaults to
 * `right-start` and mirrors in RTL (logical CSS properties plus
 * `getEffectivePlacement()`); the nested surface is clamped to the viewport
 * with floating-ui offset / flip / shift (same values as the menu container,
 * tracked with autoUpdate). The `quick` prop skips the open / close animation
 * hooks (menu-container idiom). The hover-intent open / close delays
 * (120 / 220 defaults, spec-TODO C4: no M3 value, pending sign-off) drive
 * the pointer hover-intent timers.
 *
 * Right / Enter opens and focuses the first nested item, Left / Escape
 * closes and refocuses the trigger. Nested submenus compose recursively
 * with no depth cap; Escape closes the innermost open level first.
 */
import { autoUpdate, computePosition, flip, offset, shift, type Middleware } from '@floating-ui/dom'
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import type {
    IMDCMenuSubmenu,
    IMDCMenuSubmenuClosedDetail,
    IMDCMenuSubmenuOpenedDetail,
    MenuColorStyle,
    MenuPlacement,
} from '../menu.interface'
import { MenuSubmenuStyles } from '../menu-submenu.style'

const ValidVariants: readonly string[] = ['standard', 'vibrant']

/** Gap in pixels between the trigger and the nested surface. */
const PositionOffset = 4
/** Viewport padding in pixels for the floating-ui shift middleware. */
const PositionShiftPadding = 8

/** Tag name of the expressive submenu element (used for descendant lookup). */
export const MenuSubmenuElement = 'mdc-menu-submenu'

/** Selector matching the directly usable nested children (items + submenus). */
const NestedChildSelector = 'mdc-menu-item, mdc-menu-submenu'

/** Structural contract of a focusable nested child (menu item or submenu). */
export interface MenuSubmenuFocusableChild {
    readonly isInteractive?: boolean
    readonly isDisabled?: boolean
    readonly disabled?: boolean
    focus(): void
}

/** Keyboard intent resolved from a key press on the submenu trigger. */
export type SubmenuKeyAction = 'open' | 'close'

export interface SubmenuKeyState {
    readonly open: boolean
    readonly disabled: boolean
    readonly isRtl: boolean
}

/**
 * Resolves an APG submenu key press to an open / close intent.
 * Right (Left in RTL) and Enter open; Left (Right in RTL) and Escape close.
 * Returns `null` when the key carries no submenu intent in the given state.
 */
export const resolveSubmenuKeyAction = (key: string, state: SubmenuKeyState): SubmenuKeyAction | null => {
    if (state.disabled) {
        return null
    }
    const openKey = state.isRtl ? 'ArrowLeft' : 'ArrowRight'
    const closeKey = state.isRtl ? 'ArrowRight' : 'ArrowLeft'
    if (key === 'Enter' || key === openKey) {
        return state.open ? null : 'open'
    }
    if (key === 'Escape' || key === closeKey) {
        return state.open ? 'close' : null
    }
    return null
}

/**
 * Mirrors a submenu placement for RTL: `right*` becomes `left*` and vice
 * versa; vertical placements are unchanged.
 */
export const mirrorMenuSubmenuPlacement = (placement: MenuPlacement): MenuPlacement => {
    if (placement === 'right') {
        return 'left'
    }
    if (placement === 'left') {
        return 'right'
    }
    if (placement.startsWith('right-')) {
        return placement.replace('right-', 'left-') as MenuPlacement
    }
    if (placement.startsWith('left-')) {
        return placement.replace('left-', 'right-') as MenuPlacement
    }
    return placement
}

const isMenuSubmenuNode = (node: EventTarget): boolean =>
    typeof (node as Element).tagName === 'string' && (node as Element).tagName === 'MDC-MENU-SUBMENU'

export abstract class BaseMenuSubmenu extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCMenuSubmenu {

    static override styles = MenuSubmenuStyles

    /** Visible label of the submenu trigger item. */
    @property({ type: String })
    public label = ''

    /** Disables the submenu trigger. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** Preferred placement of the nested surface. Defaults to `right-start`. */
    @property({ type: String })
    public placement: MenuPlacement = 'right-start'

    /** Whether the nested surface is open. */
    @property({ type: Boolean, reflect: true })
    public open = false

    /**
     * Skips the open / close animation hooks (mirrors the menu container
     * `quick`). The `.surface.quick` CSS rules then apply with no transition.
     */
    @property({ type: Boolean, reflect: true })
    public quick = false

    /**
     * Hover-intent delay in ms before opening.
     * Defaults to 120. Spec-TODO(C4): no M3 value, pending sign-off.
     */
    @property({ type: Number, attribute: 'open-delay' })
    public openDelay = 120

    /**
     * Hover-intent delay in ms before closing.
     * Defaults to 220. Spec-TODO(C4): no M3 value, pending sign-off.
     */
    @property({ type: Number, attribute: 'close-delay' })
    public closeDelay = 220

    /**
     * Expressive color-style axis inherited from the parent menu.
     * `standard` (default) or `vibrant`.
     */
    @property({ type: String, reflect: true })
    public variant: MenuColorStyle = 'standard'

    /** Set when the `section-label` slot is populated (grouped layout). */
    @state()
    protected hasSectionLabel = false

    /** Set when the `trailing` slot is populated (replaces the indicator). */
    @state()
    protected hasTrailing = false

    @query('.trigger')
    protected readonly triggerElement!: HTMLElement | null
    @query('.surface')
    protected readonly surfaceElement!: HTMLElement | null
    @queryAssignedElements({ flatten: true })
    private readonly defaultSlotElements!: HTMLElement[]

    private openTimer: ReturnType<typeof setTimeout> | undefined
    private closeTimer: ReturnType<typeof setTimeout> | undefined
    private cleanupAutoUpdate: (() => void) | null = null

    public override get rippleControl(): HTMLElement | null {
        return this.disabled ? null : this.triggerElement
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.disabled ? null : this.triggerElement
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.focusRingInward = true
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.addEventListener('pointerenter', this.handleHostPointerEnter)
        this.addEventListener('pointerleave', this.handleHostPointerLeave)
        this.addEventListener('keydown', this.handleHostKeydown)
    }

    public override disconnectedCallback(): void {
        this.cancelHoverTimers()
        this.stopPositionTracking()
        this.removeEventListener('pointerenter', this.handleHostPointerEnter)
        this.removeEventListener('pointerleave', this.handleHostPointerLeave)
        this.removeEventListener('keydown', this.handleHostKeydown)
        super.disconnectedCallback()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!ValidVariants.includes(this.variant)) {
            throw new Error(`[mdc-menu-submenu] Unsupported variant "${String(this.variant)}". Expressive submenus support only "standard" | "vibrant".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('variant')) {
            this.propagateVariantToChildren()
        }
        if (changedProperties.has('disabled') && this.disabled && this.open) {
            void this.hide()
        }
        if (changedProperties.has('open') || changedProperties.has('placement')) {
            if (this.open) {
                this.startPositionTracking()
            } else {
                this.stopPositionTracking()
            }
        }
        const hostClasses = this.getHostClasses()
        for (const [name, active] of Object.entries(hostClasses)) {
            this.classList.toggle(name, active)
        }
    }

    /** Host-level classes mirroring the reflected state attributes. */
    protected getHostClasses(): Record<string, boolean> {
        return {
            'open': this.open,
            'quick': this.quick,
            'disabled': this.disabled,
            [`placement-${this.placement}`]: true,
        }
    }

    /** Render-root classes for the trigger row (non-host, used with classMap). */
    protected getTriggerClasses(): Record<string, boolean> {
        return {
            'trigger': true,
            'disabled': this.disabled,
            'open': this.open,
        }
    }

    /** Render-root classes for the nested surface (non-host, used with classMap). */
    protected getRenderClasses(): Record<string, boolean> {
        return {
            'surface': true,
            'open': this.open,
            'quick': this.quick,
            [`variant-${this.variant}`]: true,
        }
    }

    /** Value bound to the trigger `aria-expanded` attribute; syncs with `open`. */
    protected getTriggerAriaExpanded(): string {
        return this.open ? 'true' : 'false'
    }

    /**
     * Effective placement of the nested surface, mirrored in RTL
     * (`right-start` becomes `left-start`).
     */
    public getEffectivePlacement(): MenuPlacement {
        return this.isRtl() ? mirrorMenuSubmenuPlacement(this.placement) : this.placement
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const label = ariaLabel || this.label
        return html`
            <button
                class="${classMap(this.getTriggerClasses())}"
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded=${this.getTriggerAriaExpanded()}
                aria-label=${label || nothing}
                ?disabled=${this.disabled}
                @click=${this.handleTriggerClick}
            >
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                <slot name="leading"></slot>
                <span class="trigger-label">${this.label}</span>
                <span class="trigger-chevron">
                    ${this.hasTrailing
                        ? nothing
                        : html`<svg class="trigger-indicator" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5v10z"/></svg>`}
                    <slot name="trailing" @slotchange=${this.handleTrailingSlotChange}></slot>
                </span>
            </button>
            <div
                class="${classMap(this.getRenderClasses())}"
                role="menu"
                aria-label=${label || nothing}
            >
                ${this.renderElevation()}
                <div class="content">
                    <slot name="section-label" @slotchange=${this.handleSectionLabelSlotChange}></slot>
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </div>
            </div>
        `
    }

    /** Opens the nested surface. Blocked while disabled. */
    public async show(): Promise<void> {
        if (this.disabled || this.open) {
            return
        }
        this.cancelHoverTimers()
        this.open = true
        this.startPositionTracking()
        this.dispatchEvent(new CustomEvent<IMDCMenuSubmenuOpenedDetail>(
            'submenu-opened',
            {
                detail: { submenu: this },
                bubbles: true,
                composed: true,
            }
        ))
        // The opened event stays synchronous (hover-intent timers assert sync
        // emission); the animation hook settles afterwards unless `quick` or
        // reduced motion skips it — the menu-container gate idiom.
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('open')
        }
    }

    /**
     * Closes the nested surface and any open nested descendants first
     * (recursive cascade, no depth cap).
     */
    public async hide(): Promise<void> {
        this.cancelHoverTimers()
        if (!this.open) {
            return
        }
        this.closeOpenDescendants()
        this.open = false
        this.stopPositionTracking()
        this.dispatchEvent(new CustomEvent<IMDCMenuSubmenuClosedDetail>(
            'submenu-closed',
            {
                detail: { submenu: this },
                bubbles: true,
                composed: true,
            }
        ))
        if (this.isConnected) {
            await this.updateComplete
        }
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('close')
        }
    }

    /**
     * Recomputes the floating-ui position of the nested surface against the
     * trigger, with overflow flip / shift clamping. Public so tests and
     * motion can drive it without a full show cycle.
     */
    public async updatePosition(): Promise<void> {
        const anchor = this.getAnchorElement()
        const surface = this.getSurfaceElement()
        if (!anchor || !surface) {
            return
        }
        const { x, y } = await computePosition(anchor, surface, {
            placement: this.getEffectivePlacement(),
            middleware: this.createPositionMiddleware(),
        })
        surface.style?.setProperty('left', `${x}px`)
        surface.style?.setProperty('top', `${y}px`)
    }

    /**
     * The floating-ui middleware chain: gap offset, overflow flip, viewport
     * shift. Same values as the menu container. Split out so specs can assert
     * the chain without DOM measurements.
     */
    protected createPositionMiddleware(): Middleware[] {
        return [
            offset(PositionOffset),
            flip(),
            shift({ padding: PositionShiftPadding }),
        ]
    }

    /**
     * Motion hook (scale + fade via CSS). The default only awaits live CSS
     * animations; `quick` and `prefers-reduced-motion` skip the call entirely
     * at the logic level (menu-container idiom).
     */
    protected async animateSurface(_mode: 'open' | 'close'): Promise<void> {
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
     * The trigger the nested surface positions against. Overridable for
     * tests (shadow queries need rendering).
     */
    protected getAnchorElement(): HTMLElement | null {
        return this.triggerElement ?? null
    }

    /** The rendered nested surface. Overridable for tests. */
    protected getSurfaceElement(): HTMLElement | null {
        return this.surfaceElement ?? null
    }

    /**
     * Starts (or re-arms) the hover-intent open timer: cancels a pending
     * close and opens after `openDelay` ms. Blocked while disabled.
     */
    public scheduleOpen(): void {
        if (this.disabled) {
            return
        }
        this.clearTimer(this.closeTimer)
        this.closeTimer = undefined
        if (this.open || this.openTimer !== undefined) {
            return
        }
        this.openTimer = setTimeout(() => {
            this.openTimer = undefined
            void this.show()
        }, this.openDelay)
    }

    /**
     * Starts (or re-arms) the hover-intent close timer: cancels a pending
     * open and closes after `closeDelay` ms.
     */
    public scheduleClose(): void {
        this.clearTimer(this.openTimer)
        this.openTimer = undefined
        if (!this.open || this.closeTimer !== undefined) {
            return
        }
        this.closeTimer = setTimeout(() => {
            this.closeTimer = undefined
            void this.hide()
        }, this.closeDelay)
    }

    /** Cancels any pending hover-intent open / close timers. */
    public cancelHoverTimers(): void {
        this.clearTimer(this.openTimer)
        this.clearTimer(this.closeTimer)
        this.openTimer = undefined
        this.closeTimer = undefined
    }

    /** Focuses the first interactive nested child (item or submenu). */
    public focusFirstItem(): void {
        const items = this.getNestedFocusableItems()
        const target = items.find((item) => this.isNestedItemFocusable(item))
        target?.focus()
    }

    public override focus(): void {
        this.triggerElement?.focus()
    }
    public override click(): void {
        this.triggerElement?.click()
    }

    /** Nested submenu descendants (all depths); overridable for testing. */
    protected getNestedSubmenus(): IMDCMenuSubmenu[] {
        if (typeof this.querySelectorAll !== 'function') {
            return []
        }
        return Array.from(this.querySelectorAll(MenuSubmenuElement)) as unknown as IMDCMenuSubmenu[]
    }

    /** Focusable nested children in document order; overridable for testing. */
    protected getNestedFocusableItems(): MenuSubmenuFocusableChild[] {
        if (typeof this.querySelectorAll !== 'function') {
            return []
        }
        return Array.from(this.querySelectorAll(NestedChildSelector)) as unknown as MenuSubmenuFocusableChild[]
    }

    /** Closes every open nested submenu descendant (recursive via `hide`). */
    protected closeOpenDescendants(): void {
        for (const child of this.getNestedSubmenus()) {
            if (child.open) {
                void child.hide()
            }
        }
    }

    protected isRtl(): boolean {
        try {
            if (typeof this.getAttribute === 'function' && this.getAttribute('dir') === 'rtl') {
                return true
            }
            if (typeof getComputedStyle === 'function' && this.isConnected) {
                return getComputedStyle(this).direction === 'rtl'
            }
            if (typeof document !== 'undefined' && document.documentElement) {
                return document.documentElement.dir === 'rtl'
            }
        } catch {
            return false
        }
        return false
    }

    /**
     * True when the event targets an open nested submenu descendant: the
     * inner level handles the key first (Escape hierarchy).
     */
    protected isEventFromOpenDescendant(event: KeyboardEvent): boolean {
        if (typeof event.composedPath !== 'function') {
            return false
        }
        return event.composedPath().some((node) =>
            node !== this && isMenuSubmenuNode(node) && (node as IMDCMenuSubmenu).open)
    }

    protected readonly handleHostPointerEnter = (): void => {
        this.scheduleOpen()
    }

    protected readonly handleHostPointerLeave = (): void => {
        this.scheduleClose()
    }

    protected readonly handleHostKeydown = (event: KeyboardEvent): void => {
        if (this.disabled) {
            return
        }
        if (this.isEventFromOpenDescendant(event)) {
            return
        }
        const action = resolveSubmenuKeyAction(event.key, {
            open: this.open,
            disabled: this.disabled,
            isRtl: this.isRtl(),
        })
        if (action !== null) {
            event.preventDefault()
            if (action === 'open') {
                event.stopPropagation()
                void this.show()
                if (this.isConnected) {
                    void this.updateComplete.then(() => {
                        if (this.open) {
                            this.focusFirstItem()
                        }
                    })
                } else {
                    this.focusFirstItem()
                }
            } else {
                event.stopPropagation()
                void this.hide().then(() => {
                    this.focus()
                })
            }
            return
        }
        if (!this.open || event.target === this) {
            return
        }
        const items = this.getNestedFocusableItems()
        if (items.length === 0) {
            return
        }
        const target = event.target as MenuSubmenuFocusableChild | null
        if (target === null || !items.includes(target)) {
            return
        }
        const isUp = event.key === 'ArrowUp'
        const isDown = event.key === 'ArrowDown'
        const isHome = event.key === 'Home'
        const isEnd = event.key === 'End'
        if (!isUp && !isDown && !isHome && !isEnd) {
            return
        }
        event.preventDefault()
        event.stopPropagation()
        let nextItem: MenuSubmenuFocusableChild | undefined
        if (isHome) {
            nextItem = this.findNextFocusableItem(items, 0, 1)
        } else if (isEnd) {
            nextItem = this.findNextFocusableItem(items, items.length - 1, -1)
        } else {
            const focusedIndex = items.indexOf(target)
            const delta: 1 | -1 = isUp ? -1 : 1
            const startIndex = focusedIndex === -1
                ? (delta > 0 ? 0 : items.length - 1)
                : focusedIndex + delta
            nextItem = this.findNextFocusableItem(items, startIndex, delta)
        }
        nextItem?.focus()
    }

    private isNestedItemFocusable(item: MenuSubmenuFocusableChild): boolean {
        return (item.isInteractive ?? true) && !(item.isDisabled ?? item.disabled ?? false)
    }

    private findNextFocusableItem(
        items: MenuSubmenuFocusableChild[],
        startIndex: number,
        step: 1 | -1,
    ): MenuSubmenuFocusableChild | undefined {
        for (let i = 0; i < items.length; i++) {
            let index = startIndex + i * step
            index = ((index % items.length) + items.length) % items.length
            const item = items[index]
            if (this.isNestedItemFocusable(item)) {
                return item
            }
        }
        return undefined
    }

    private clearTimer(timer: ReturnType<typeof setTimeout> | undefined): void {
        if (timer !== undefined) {
            clearTimeout(timer)
        }
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
     * styles stay on the surface so the close fade runs in place
     * (`allow-discrete` keeps the surface rendered until the transition
     * ends; menu-container idiom). `startPositionTracking()` rewrites them
     * on every open and they are inert under `display: none`.
     */
    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
    }

    /**
     * Waits until every CSS transition started by the last state change is
     * done. A replaced or canceled transition rejects `finished`, which
     * counts as "no longer animating". When nothing animates (`quick`,
     * reduced motion, zero durations), resolves at once.
     */
    private async waitForAnimations(): Promise<void> {
        const surface = this.getSurfaceElement()
        if (!surface) {
            return
        }
        // Transitions are created at style recalc, and the state change that
        // started them happened in this task. Flush style/layout so they are
        // observable — otherwise `getAnimations` sees none and this resolves
        // before the transition has run (menu-container idiom).
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
        this.propagateVariantToChildren()
    }

    private propagateVariantToChildren(): void {
        for (const el of this.defaultSlotElements ?? []) {
            const tag = el.tagName
            if (tag === 'MDC-MENU-ITEM' || tag === 'MDC-MENU-GROUP' || tag === 'MDC-MENU-SUBMENU') {
                (el as HTMLElement & { variant: MenuColorStyle }).variant = this.variant
            }
        }
    }

    private readonly handleSectionLabelSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasSectionLabel = slot.assignedElements().length > 0
    }

    private readonly handleTrailingSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasTrailing = slot.assignedElements().length > 0
    }

    private readonly handleTriggerClick = (): void => {
        if (this.disabled) {
            return
        }
        if (this.open) {
            void this.hide()
        } else {
            void this.show()
        }
    }
}
