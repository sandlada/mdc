/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-legacy-menu-submenu` — the MD3 Baseline submenu.
 *
 * A menu-item-like trigger row plus a nested `SurfaceContainer` surface
 * (4dp corners, Level2) at `right-start` (mirrored in RTL via
 * `getEffectivePlacement()` and logical CSS properties, clamped to the
 * viewport with floating-ui offset / flip / shift tracked with autoUpdate).
 * The `quick` prop skips the open / close animation hooks (legacy-container
 * idiom). The hover-intent
 * open / close delays (120 / 220 defaults, spec-TODO: no M3 value, pending
 * sign-off) drive the pointer hover-intent timers.
 *
 * Right / Enter opens and focuses the first nested item, Left / Escape
 * closes and refocuses the trigger. Nested submenus compose recursively
 * with no depth cap; Escape closes the innermost open level first.
 * A disabled trigger never expands.
 */
import { autoUpdate, computePosition, flip, offset, shift, type Middleware } from '@floating-ui/dom'
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import type { IMDCLegacyMenuSubmenu, LegacyMenuPlacement } from '../legacy-menu.interface'
import { LegacyMenuSubmenuStyles } from '../legacy-menu-submenu.style'

/** Tag name of the legacy submenu element (used for descendant lookup). */
export const LEGACY_MENU_SUBMENU_ELEMENT = 'mdc-legacy-menu-submenu'

/** Gap in pixels between the trigger and the nested surface (legacy-container idiom). */
const POSITION_OFFSET = 6
/** Viewport padding in pixels for the floating-ui shift middleware. */
const POSITION_SHIFT_PADDING = 8

/** Selector matching the directly usable nested children (items + submenus). */
const NESTED_CHILD_SELECTOR = 'mdc-legacy-menu-item, mdc-legacy-menu-submenu'

/** Structural contract of a nested submenu descendant (open state + close). */
export interface LegacyMenuSubmenuNested {
    readonly open: boolean
    hide(): Promise<void>
    reposition?(): Promise<void>
}

/** Structural contract of a focusable nested child (menu item or submenu). */
export interface LegacyMenuSubmenuFocusableChild {
    readonly isInteractive?: boolean
    readonly isDisabled?: boolean
    readonly disabled?: boolean
    focus(): void
    listTabIndex?: number
}

/** Keyboard intent resolved from a key press on the submenu trigger. */
export type LegacySubmenuKeyAction = 'open' | 'close'

export interface LegacySubmenuKeyState {
    readonly open: boolean
    readonly disabled: boolean
    readonly isRtl: boolean
}

/**
 * Resolves an APG submenu key press to an open / close intent.
 * Right (Left in RTL) and Enter open; Left (Right in RTL) and Escape close.
 * Returns `null` when the key carries no submenu intent in the given state.
 */
export const resolveLegacySubmenuKeyAction = (key: string, state: LegacySubmenuKeyState): LegacySubmenuKeyAction | null => {
    if (state.disabled) {
        return null
    }
    const openKey = state.isRtl ? 'ArrowLeft' : 'ArrowRight'
    const closeKey = state.isRtl ? 'ArrowRight' : 'ArrowLeft'
    if (key === 'Enter' || key === ' ' || key === openKey) {
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
export const mirrorLegacyMenuSubmenuPlacement = (placement: LegacyMenuPlacement): LegacyMenuPlacement => {
    if (placement === 'right') {
        return 'left'
    }
    if (placement === 'left') {
        return 'right'
    }
    if (placement.startsWith('right-')) {
        return placement.replace('right-', 'left-') as LegacyMenuPlacement
    }
    if (placement.startsWith('left-')) {
        return placement.replace('left-', 'right-') as LegacyMenuPlacement
    }
    return placement
}

const isLegacyMenuSubmenuNode = (node: EventTarget): boolean =>
    typeof (node as Element).tagName === 'string' && (node as Element).tagName === 'MDC-LEGACY-MENU-SUBMENU'

export abstract class BaseLegacyMenuSubmenu extends composeMixin(
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCLegacyMenuSubmenu {

    public static override styles = LegacyMenuSubmenuStyles

    /** Accessible label of the submenu trigger. */
    @property({ type: String, reflect: true })
    public label = ''

    /** Disables the submenu trigger. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** Floating-UI placement of the nested surface. Defaults to `right-start`. */
    @property({ type: String, reflect: true })
    public placement: LegacyMenuPlacement = 'right-start'

    /**
     * Hover-intent delay in ms before opening.
     * Defaults to 120. Spec-TODO: no M3 value, pending sign-off.
     */
    @property({ type: Number, attribute: 'open-delay' })
    public openDelay = 120

    /**
     * Hover-intent delay in ms before closing.
     * Defaults to 220. Spec-TODO: no M3 value, pending sign-off.
     */
    @property({ type: Number, attribute: 'close-delay' })
    public closeDelay = 220

    /** Whether the nested submenu surface is open. */
    @property({ type: Boolean, reflect: true })
    public open = false

    /**
     * Skips the open / close animation hooks (mirrors the legacy menu
     * container `quick`). The `.nested-surface.quick` CSS rules then apply
     * with no transition.
     */
    @property({ type: Boolean, reflect: true })
    public quick = false

    /** Roving tabindex value assigned by the parent menu or submenu. */
    @property({ type: Number })
    public listTabIndex = -1

    /** Delay in ms before resetting typeahead buffer. */
    @property({ type: Number, attribute: 'typeahead-delay' })
    public typeaheadDelay = 500

    @query('.trigger')
    protected readonly triggerElement!: HTMLElement | null
    @query('.nested-surface')
    protected readonly surfaceElement!: HTMLElement | null

    private lifecycle = 0
    private isHiding = false
    private openTimer: ReturnType<typeof setTimeout> | undefined
    private closeTimer: ReturnType<typeof setTimeout> | undefined
    private cleanupAutoUpdate: (() => void) | null = null
    private typeaheadBuffer = ''
    private typeaheadTimer: ReturnType<typeof setTimeout> | null = null

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
        if (this.open) {
            this.startPositionTracking()
        }
        this.addEventListener('pointerenter', this.handleHostPointerEnter)
        this.addEventListener('pointerleave', this.handleHostPointerLeave)
        this.addEventListener('keydown', this.handleHostKeydown)
    }

    public override disconnectedCallback(): void {
        this.cancelHoverTimers()
        this.closeOpenDescendants()
        this.stopPositionTracking()
        this.clearTypeaheadTimer()
        this.removeEventListener('pointerenter', this.handleHostPointerEnter)
        this.removeEventListener('pointerleave', this.handleHostPointerLeave)
        this.removeEventListener('keydown', this.handleHostKeydown)
        super.disconnectedCallback()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('disabled') && this.disabled && this.open) {
            void this.hide()
        }
        if (changedProperties.has('open') || changedProperties.has('placement')) {
            if (this.open) {
                this.startPositionTracking()
            } else if (!this.isHiding) {
                // `hide()` clears `open` before the exit transition runs;
                // keep the floating position until the animation settles.
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
            'disabled': this.disabled,
            'open': this.open,
            'quick': this.quick,
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
            'nested-surface': true,
            'open': this.open,
            'quick': this.quick,
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
    public getEffectivePlacement(): LegacyMenuPlacement {
        return this.isRtl() ? mirrorLegacyMenuSubmenuPlacement(this.placement) : this.placement
    }

    protected override render(): TemplateResult {
        return html`
            <div
                class="${classMap(this.getTriggerClasses())}"
                role="menuitem"
                tabindex=${this.disabled ? -1 : this.listTabIndex}
                aria-haspopup="menu"
                aria-expanded=${this.getTriggerAriaExpanded()}
                aria-label=${this.label || nothing}
                aria-disabled=${this.disabled ? 'true' : nothing}
                @click=${this.handleTriggerClick}
            >
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                <slot name="trigger">
                    <span class="trigger-label">${this.label}</span>
                    <span class="trigger-icon" aria-hidden="true"></span>
                </slot>
            </div>
            <div
                class="${classMap(this.getRenderClasses())}"
                role="menu"
                aria-label=${this.label || nothing}
                @transitionend=${this.handleSurfaceTransitionEnd}
            >
                <mdc-elevation aria-hidden="true"></mdc-elevation>
                <div class="nested-items">
                    <div class="nested-padding">
                        <slot></slot>
                        <slot name="surface"></slot>
                    </div>
                </div>
            </div>
        `
    }

    /** Opens the nested surface. Blocked while disabled. */
    public async show(): Promise<void> {
        if (this.disabled || (this.open && !this.isHiding)) {
            return
        }
        this.isHiding = false
        const generation = ++this.lifecycle
        this.cancelHoverTimers()
        this.open = true
        this.startPositionTracking()
        this.dispatchEvent(new CustomEvent<void>(
            'submenu-opened',
            {
                bubbles: true,
                composed: true,
            }
        ))
        // The opened event stays synchronous (hover-intent timers assert sync
        // emission); the animation hook settles afterwards unless `quick` or
        // reduced motion skips it — the legacy-container gate idiom.
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('open')
        }
        if (generation !== this.lifecycle) {
            return
        }
    }

    /**
     * Closes the nested surface and any open nested descendants first
     * (recursive cascade, no depth cap). The floating position is kept until
     * the exit transition settles so the surface does not jump or resize.
     */
    public async hide(): Promise<void> {
        this.cancelHoverTimers()
        if (!this.open || this.isHiding) {
            return
        }
        this.isHiding = true
        const generation = ++this.lifecycle
        this.closeOpenDescendants()
        // Flip the state first so the close transition starts while the
        // surface still uses the floating position. Restoring the in-flow
        // position before the transition settles makes the surface jump /
        // resize mid-animation.
        this.open = false
        this.dispatchEvent(new CustomEvent<void>(
            'submenu-closed',
            {
                bubbles: true,
                composed: true,
            }
        ))
        if (this.isConnected) {
            await this.updateComplete
        }
        if (generation !== this.lifecycle) {
            return
        }
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('close')
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.isHiding = false
        this.stopPositionTracking()
    }

    /** Closes the nested surface (alias to hide for @material/web parity). */
    public async close(): Promise<void> {
        return this.hide()
    }

    /**
     * Toggles the nested submenu surface between open and closed states.
     * If the submenu is open and not currently hiding, closes it. Otherwise opens it.
     */
    public async toggle(): Promise<void> {
        if (this.disabled) {
            return
        }
        if (this.open && !this.isHiding) {
            await this.close()
        } else {
            await this.show()
        }
    }

    /** Recomputes the floating-ui position (alias to updatePosition for @material/web parity). */
    public async reposition(): Promise<void> {
        return this.updatePosition()
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
        const { x, y, placement } = await computePosition(anchor, surface, {
            strategy: 'fixed',
            placement: this.getEffectivePlacement(),
            middleware: this.createPositionMiddleware(),
        })
        if (placement?.startsWith('left')) {
            // Keep the trigger-side edge fixed while the inline-size animation
            // grows the nested surface leftward.
            const width = surface.getBoundingClientRect?.().width ?? 0
            const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth
            surface.style?.setProperty('left', 'auto')
            surface.style?.setProperty('right', `${viewportWidth - x - width}px`)
        } else {
            surface.style?.removeProperty('right')
            surface.style?.setProperty('left', `${x}px`)
        }
        surface.style?.setProperty('top', `${y}px`)
    }

    /**
     * The floating-ui middleware chain: gap offset, overflow flip, viewport
     * shift. Same values as the legacy menu container. Split out so specs can
     * assert the chain without DOM measurements.
     */
    protected createPositionMiddleware(): Middleware[] {
        return [
            offset(POSITION_OFFSET),
            flip(),
            shift({ padding: POSITION_SHIFT_PADDING }),
        ]
    }

    /**
     * Motion hook (inline-size + fade via CSS). The default only awaits live
     * CSS animations; `quick` and `prefers-reduced-motion` skip the call
     * entirely at the logic level (legacy-container idiom).
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
        if (this.isHiding) {
            void this.show()
            return
        }
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
        const target = this.getNestedFocusableItems().find((item) =>
            (item.isInteractive ?? true) && !(item.isDisabled ?? item.disabled ?? false))
        target?.focus()
        this.updateNestedTabIndices()
    }

    public override focus(): void {
        this.triggerElement?.focus()
    }

    public override click(): void {
        this.triggerElement?.click()
    }

    /** Nested submenu descendants (all depths); overridable for testing. */
    protected getNestedSubmenus(): LegacyMenuSubmenuNested[] {
        if (typeof this.querySelectorAll !== 'function') {
            return []
        }
        return Array.from(this.querySelectorAll(LEGACY_MENU_SUBMENU_ELEMENT)) as unknown as LegacyMenuSubmenuNested[]
    }

    /** Focusable nested children in document order; overridable for testing. */
    protected getNestedFocusableItems(): LegacyMenuSubmenuFocusableChild[] {
        if (typeof this.querySelectorAll !== 'function') {
            return []
        }
        const items = Array.from(this.querySelectorAll(NESTED_CHILD_SELECTOR)) as unknown as (HTMLElement & LegacyMenuSubmenuFocusableChild)[]
        return items.filter((el) => el.parentElement?.closest(LEGACY_MENU_SUBMENU_ELEMENT) === (this as unknown))
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
            node !== this && isLegacyMenuSubmenuNode(node) && (node as IMDCLegacyMenuSubmenu).open)
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
        const action = resolveLegacySubmenuKeyAction(event.key, {
            open: this.open,
            disabled: this.disabled,
            isRtl: this.isRtl(),
        })
        if (action === 'open') {
            event.preventDefault()
            event.stopPropagation()
            void this.show().then(() => {
                this.focusFirstItem()
            })
            return
        }
        if (action === 'close') {
            event.preventDefault()
            event.stopPropagation()
            void this.hide().then(() => {
                this.focus()
            })
            return
        }

        if (!this.open) {
            return
        }
        const target = event.target as HTMLElement | null
        if (!target || target === this.triggerElement) {
            return
        }
        const surface = this.getSurfaceElement()
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        const isFromNested = (typeof this.contains === 'function' && this.contains(target)) ||
            (typeof surface?.contains === 'function' && surface.contains(target)) ||
            path.includes(this)
        if (!isFromNested) {
            return
        }

        const isUp = event.key === 'ArrowUp'
        const isDown = event.key === 'ArrowDown'
        const isHome = event.key === 'Home'
        const isEnd = event.key === 'End'
        const isPrintable = event.key.length === 1 &&
            !event.ctrlKey && !event.metaKey && !event.altKey &&
            event.key !== ' '

        if (!isUp && !isDown && !isHome && !isEnd && !isPrintable) {
            return
        }

        event.preventDefault()
        event.stopPropagation()

        if (isPrintable) {
            this.handleNestedTypeahead(event.key)
            return
        }

        if (isHome) {
            this.activateEdgeNestedItem(true)
        } else if (isEnd) {
            this.activateEdgeNestedItem(false)
        } else if (isDown) {
            this.activateRelativeNestedItem(1)
        } else if (isUp) {
            this.activateRelativeNestedItem(-1)
        }
    }

    private isRovingFocusable(item: LegacyMenuSubmenuFocusableChild): boolean {
        const interactive = item.isInteractive ?? true
        const disabled = item.isDisabled ?? item.disabled ?? false
        return interactive && !disabled
    }

    private isItemFocused(item: LegacyMenuSubmenuFocusableChild): boolean {
        return typeof (item as unknown as HTMLElement).matches === 'function' &&
            (item as unknown as HTMLElement).matches(':focus-within')
    }

    protected updateNestedTabIndices(): void {
        const items = this.getNestedFocusableItems()
        if (items.length === 0) {
            return
        }
        const focusedItem = items.find((item) => this.isItemFocused(item))
        const firstFocusable = items.find((item) => this.isRovingFocusable(item))
        const itemToFocus = focusedItem && this.isRovingFocusable(focusedItem) ? focusedItem : firstFocusable

        for (const item of items) {
            if ('listTabIndex' in item) {
                item.listTabIndex = item === itemToFocus ? 0 : -1
            }
        }
    }

    private activateRelativeNestedItem(delta: 1 | -1): void {
        const items = this.getNestedFocusableItems()
        if (items.length === 0) {
            return
        }
        const focusedIndex = items.findIndex((item) => this.isItemFocused(item))
        const startIndex = focusedIndex === -1
            ? (delta > 0 ? 0 : items.length - 1)
            : focusedIndex + delta

        for (let i = 0; i < items.length; i++) {
            let index = startIndex + i * delta
            index = ((index % items.length) + items.length) % items.length
            const candidate = items[index]
            if (this.isRovingFocusable(candidate)) {
                candidate.focus()
                this.updateNestedTabIndices()
                return
            }
        }
    }

    private activateEdgeNestedItem(first: boolean): void {
        const items = this.getNestedFocusableItems()
        const target = first
            ? items.find((item) => this.isRovingFocusable(item))
            : [...items].reverse().find((item) => this.isRovingFocusable(item))
        if (target) {
            target.focus()
            this.updateNestedTabIndices()
        }
    }

    private handleNestedTypeahead(char: string): void {
        const next = `${this.typeaheadBuffer}${char.toLowerCase()}`
        let match = this.findNestedTypeaheadMatch(next)
        let buffer = next
        if (!match && next.length > 1) {
            buffer = char.toLowerCase()
            match = this.findNestedTypeaheadMatch(buffer)
        }
        this.typeaheadBuffer = buffer
        this.clearTypeaheadTimer()
        if (typeof setTimeout === 'function') {
            const timer = setTimeout(() => {
                this.typeaheadBuffer = ''
                this.typeaheadTimer = null
            }, this.typeaheadDelay)
            const withUnref = timer as unknown as { unref?: () => void }
            if (typeof withUnref.unref === 'function') {
                withUnref.unref()
            }
            this.typeaheadTimer = timer
        }
        if (match) {
            match.focus()
            this.updateNestedTabIndices()
        }
    }

    private findNestedTypeaheadMatch(prefix: string): LegacyMenuSubmenuFocusableChild | undefined {
        return this.getNestedFocusableItems().find((item) =>
            this.isRovingFocusable(item) && this.getNestedItemLabel(item).startsWith(prefix),
        )
    }

    private getNestedItemLabel(item: LegacyMenuSubmenuFocusableChild): string {
        const textProp = (item as { typeaheadText?: unknown }).typeaheadText
        if (typeof textProp === 'string' && textProp.length > 0) {
            return textProp.trim().toLowerCase()
        }
        const labelProp = (item as { label?: unknown }).label
        const raw = typeof labelProp === 'string' && labelProp.length > 0
            ? labelProp
            : (typeof (item as unknown as HTMLElement).textContent === 'string' ? (item as unknown as HTMLElement).textContent : '')
        return (raw ?? '').trim().toLowerCase()
    }

    private clearTypeaheadTimer(): void {
        if (this.typeaheadTimer !== null) {
            clearTimeout(this.typeaheadTimer)
            this.typeaheadTimer = null
        }
    }

    private clearTimer(timer: ReturnType<typeof setTimeout> | undefined): void {
        if (timer !== undefined) {
            clearTimeout(timer)
        }
    }

    /**
     * A nested submenu opened while this surface was still growing tracks a
     * moving trigger row. Recompute after the inline-size transition settles
     * so the nested position is anchored to the final geometry.
     */
    protected readonly handleSurfaceTransitionEnd = (event: TransitionEvent): void => {
        if (!this.open || event.target !== this.getSurfaceElement()) {
            return
        }
        if (event.propertyName !== 'inline-size') {
            return
        }
        for (const child of this.getNestedSubmenus()) {
            if (child.open) {
                void child.reposition?.()
            }
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
        surface.style?.removeProperty('right')
        this.cleanupAutoUpdate = autoUpdate(anchor, surface, () => {
            void this.updatePosition()
        })
    }

    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
        const surface = this.getSurfaceElement()
        surface?.style?.removeProperty('position')
        surface?.style?.removeProperty('left')
        surface?.style?.removeProperty('right')
        surface?.style?.removeProperty('top')
    }

    /**
     * Waits until every CSS transition started by the last state change is
     * done. A replaced or canceled transition rejects `finished`, which
     * counts as "no longer animating". When nothing animates (`quick`,
     * reduced motion, zero durations), resolves at once.
     */
    private async waitForAnimations(): Promise<void> {
        const surface = this.getSurfaceElement()
        const animations = surface?.getAnimations?.({ subtree: true }) ?? []
        if (animations.length === 0) {
            return
        }
        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => undefined),
            ),
        )
    }

    private readonly handleTriggerClick = (): void => {
        void this.toggle()
    }
}
