/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-legacy-menu` — the MD3 Baseline standard menu.
 *
 * Static render (M3): an anchor `trigger` slot plus a `SurfaceContainer`
 * surface (4dp corners, Level2) hosting `section-label`, default item, and
 * `surface`-override slots.
 *
 * M4 container behavior lives here: cancelable `show()` / `hide()` with
 * `showing` / `hiding` + `opened` / `closed` events, floating-ui
 * offset / flip / shift positioning with autoUpdate, outside-pointerdown
 * dismiss, Escape-to-close with focus-return-to-anchor, roving tabindex with
 * ArrowUp / ArrowDown / ArrowLeft / ArrowRight / Home / End plus a typeahead
 * buffer, and the keep-open (checkable / radio) vs close-on-select policy.
 * Item coordination is events-only: the legacy item files are owned by
 * another track, so `listTabIndex` is assigned duck-typed (present once the
 * item track lands) and `focus()` is called through a structural type.
 * Motion itself is M5: `quick` (and `prefers-reduced-motion`) skips the
 * `animateSurface()` hook, which currently only awaits live CSS animations.
 */
import { autoUpdate, computePosition, flip, offset, shift, type Middleware } from '@floating-ui/dom'
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import {
    LEGACY_MENU_ITEM_ELEMENT,
    LEGACY_MENU_SUBMENU_ELEMENT,
    type IMDCLegacyMenu,
    type IMDCLegacyMenuItem,
    type IMDCLegacyMenuSelectDetail,
    type IMDCLegacyMenuSubmenu,
    type LegacyMenuColorStyle,
    type LegacyMenuLayout,
    type LegacyMenuPlacement,
} from '../legacy-menu.interface'
import { assertLegacyMenuLayout, assertLegacyMenuVariant } from '../legacy-menu.definition'
import { LegacyMenuStyles } from '../legacy-menu.style'

/** Gap in pixels between the anchor and the menu surface (popup-controller idiom). */
const POSITION_OFFSET = 6
/** Viewport padding in pixels for the floating-ui shift middleware. */
const POSITION_SHIFT_PADDING = 8
/** Idle time in ms after which the typeahead buffer resets. */
const TYPEAHEAD_RESET_MS = 500

/** Legacy menu child as the container drives it (item files owned by another track). */
type LegacyMenuChild = (IMDCLegacyMenuItem | IMDCLegacyMenuSubmenu) & {
    readonly isInteractive?: boolean
    readonly isDisabled?: boolean
    readonly disabled?: boolean
    focus(): void
    listTabIndex?: number
}

/** Selector covering the roving set: items plus submenu triggers (F1). */
const LEGACY_MENU_ROVING_SELECTOR = 'mdc-legacy-menu-item, mdc-legacy-menu-submenu'

const isLegacyMenuSubmenuNode = (node: EventTarget): boolean =>
    typeof (node as Element).tagName === 'string' && (node as Element).tagName === 'MDC-LEGACY-MENU-SUBMENU'

const isHTMLElement = (value: unknown): value is HTMLElement =>
    typeof HTMLElement !== 'undefined' && value instanceof HTMLElement

const escapeIdSelector = (id: string): string => {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return `#${CSS.escape(id)}`
    }
    return `#${id}`
}

export abstract class BaseLegacyMenu extends LitElement implements IMDCLegacyMenu {

    public static override styles = LegacyMenuStyles

    /** Whether the menu surface is open (reflected for static styling only). */
    @property({ type: Boolean, reflect: true })
    public open = false

    /** Reduces motion for open / close transitions. */
    @property({ type: Boolean, reflect: true })
    public quick = false

    /** Floating-UI placement of the surface relative to the trigger. */
    @property({ type: String, reflect: true })
    public placement: LegacyMenuPlacement = 'bottom-start'

    /** Fixed `standard` color style (MD3 Baseline). */
    @property({ type: String, reflect: true })
    public colorStyle: LegacyMenuColorStyle = 'standard'

    /** Fixed `standard` layout (MD3 Baseline). */
    @property({ type: String, reflect: true })
    public layout: LegacyMenuLayout = 'standard'

    /** Accessible label of the menu. */
    @property({ type: String, reflect: true })
    public label: string | null = null

    /**
     * The ID of the element in the same root node in which the menu should align
     * to.
     */
    @property({ type: String })
    public anchor = ''

    /**
     * An HTML element to anchor the menu to. Overrides `anchor` ID if set.
     */
    @property({ attribute: false })
    public anchorElement: HTMLElement | null = null

    /** Keeps the menu open when user clicks outside. */
    @property({ type: Boolean, attribute: 'stay-open-on-outside-click' })
    public stayOpenOnOutsideClick = false

    /** Keeps the menu open when focus leaves the menu subtree. */
    @property({ type: Boolean, attribute: 'stay-open-on-focusout' })
    public stayOpenOnFocusout = false

    /** After closing, does not restore focus to the last focused element. */
    @property({ type: Boolean, attribute: 'skip-restore-focus' })
    public skipRestoreFocus = false

    /** Displays overflow content like a submenu without clipping. */
    @property({ type: Boolean, attribute: 'has-overflow', reflect: true })
    public hasOverflow = false

    /** Offsets inline alignment in pixels. */
    @property({ type: Number, attribute: 'x-offset' })
    public xOffset = 0

    /** Offsets block alignment in pixels. */
    @property({ type: Number, attribute: 'y-offset' })
    public yOffset = 0

    /** Delay in ms before resetting typeahead buffer. */
    @property({ type: Number, attribute: 'typeahead-delay' })
    public typeaheadDelay = TYPEAHEAD_RESET_MS

    /** The element to focus by default when opened. */
    @property({ attribute: 'default-focus' })
    public defaultFocus: 'first-item' | 'last-item' | 'none' | 'root' = 'first-item'

    /** Disables horizontal flipping when outside viewport. */
    @property({ type: Boolean, attribute: 'no-horizontal-flip' })
    public noHorizontalFlip = false

    /** Disables vertical flipping when outside viewport. */
    @property({ type: Boolean, attribute: 'no-vertical-flip' })
    public noVerticalFlip = false

    @queryAssignedElements({ selector: LEGACY_MENU_ROVING_SELECTOR, flatten: true })
    private readonly assignedItems!: LegacyMenuChild[]

    @queryAssignedElements({ slot: 'trigger', flatten: true })
    private readonly triggerElements!: HTMLElement[]

    @query('.surface')
    private readonly surfaceElement!: HTMLElement | null

    private cachedItems: LegacyMenuChild[] = []

    /** Generation guard: a stale show/hide never emits its completion event. */
    private lifecycle = 0
    private isHiding = false
    private cleanupAutoUpdate: (() => void) | null = null
    private dismissAttached = false
    private returnFocusElement: HTMLElement | null = null
    private typeaheadBuffer = ''
    private typeaheadTimer: ReturnType<typeof setTimeout> | null = null

    /** The slotted `mdc-legacy-menu-item` / `mdc-legacy-menu-submenu` children, flattened. */
    public get items(): IMDCLegacyMenuItem[] {
        return this.cachedItems as unknown as IMDCLegacyMenuItem[]
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener('request-activation', this.handleRequestActivation)
        this.addEventListener('item-activated', this.handleItemActivated)
        this.addEventListener('focusin', this.handleFocusIn)
        this.addEventListener('submenu-opened', this.handleSubmenuOpened)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.open) {
            this.syncOpenSideEffects(false)
        } else {
            this.closeOpenSubmenus()
        }
    }

    public override disconnectedCallback(): void {
        this.closeOpenSubmenus()
        this.stopPositionTracking()
        this.detachDismissListeners()
        this.clearTypeaheadTimer()
        super.disconnectedCallback()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        assertLegacyMenuVariant(this.colorStyle)
        assertLegacyMenuLayout(this.layout)
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        const hostClasses = this.getHostClasses()
        if (this.classList) {
            for (const [name, active] of Object.entries(hostClasses)) {
                this.classList.toggle(name, active)
            }
        }

        const positionPropsChanged =
            changedProperties.has('placement') ||
            changedProperties.has('anchor') ||
            changedProperties.has('anchorElement') ||
            changedProperties.has('xOffset') ||
            changedProperties.has('yOffset') ||
            changedProperties.has('noHorizontalFlip') ||
            changedProperties.has('noVerticalFlip')

        if (changedProperties.has('open')) {
            this.syncOpenSideEffects(false)
        } else if (positionPropsChanged && this.open) {
            this.syncOpenSideEffects(true)
        }
        if (changedProperties.has('open') || changedProperties.has('placement')) {
            this.syncItemMotionDelays()
        }
    }

    /** Host-level classes mirroring the reflected state attributes. */
    protected getHostClasses(): Record<string, boolean> {
        return {
            'open': this.open,
            'quick': this.quick,
            'has-overflow': this.hasOverflow,
        }
    }

    /** Render-root classes for the menu surface (non-host, used with classMap). */
    protected getRenderClasses(): Record<string, boolean> {
        return {
            'surface': true,
            'open': this.open,
            'quick': this.quick,
            'has-overflow': this.hasOverflow,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class="anchor">
                <slot name="trigger"></slot>
            </div>
            <div
                class="${classMap(this.getRenderClasses())}"
                role="menu"
                tabindex="-1"
                aria-label=${this.label ?? nothing}
                @transitionend=${this.handleSurfaceTransitionEnd}
            >
                <mdc-elevation aria-hidden="true"></mdc-elevation>
                <div class="items">
                    <div class="item-padding">
                        <slot name="section-label"></slot>
                        <slot @slotchange=${this.handleSlotChange}></slot>
                        <slot name="surface"></slot>
                    </div>
                </div>
            </div>
        `
    }

    /**
     * Opens the menu surface: cancelable `showing`, then positioning,
     * roving-tabindex init and (unless `quick` or reduced motion) the open
     * animation hook, finally `opened`. Stale generations never complete.
     */
    public async show(): Promise<void> {
        if (this.open && !this.isHiding) {
            return
        }
        this.isHiding = false
        const generation = ++this.lifecycle
        const showing = new CustomEvent(
            'showing',
            {
                bubbles: true,
                composed: true,
                cancelable: true,
            },
        )
        this.dispatchEvent(showing)
        if (showing.defaultPrevented) {
            this.lifecycle--
            return
        }
        this.rememberReturnFocus()
        this.syncItemMotionDelays()
        this.open = true
        if (this.isConnected) {
            await this.updateComplete
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.startPositionTracking()
        this.attachDismissListeners()
        this.applyDefaultFocus()
        this.updateTabIndices()
        if (!this.quick && !this.prefersReducedMotion()) {
            await this.animateSurface('open', generation)
        }
        if (generation !== this.lifecycle) {
            return
        }
        this.dispatchEvent(new CustomEvent('opened', { bubbles: true, composed: true }))
    }

    /**
     * Closes the menu surface: cancelable `hiding`, closes and awaits open
     * submenus (cascading the surfaces outward-in before the parent height
     * contracts), clears `open` (starting the CSS exit transition), then the
     * close animation hook (skipped when `quick` or reduced motion),
     * focus-return-to-anchor, finally `closed`. The floating position is kept
     * until the transition settles so the surface neither jumps nor resizes
     * while animating out. Stale generations never complete.
     */
    public async hide(): Promise<void> {
        if (!this.open || this.isHiding) {
            return
        }
        this.isHiding = true
        const generation = ++this.lifecycle
        const hiding = new CustomEvent(
            'hiding',
            {
                bubbles: true,
                composed: true,
                cancelable: true,
            },
        )
        this.dispatchEvent(hiding)
        if (hiding.defaultPrevented) {
            this.isHiding = false
            this.lifecycle--
            return
        }
        const closingSubmenus = this.closeOpenSubmenus()
        if (closingSubmenus.length > 0) {
            // Finish the nested close animations before the menu surface
            // starts contracting. This keeps the cascade outward-in and keeps
            // a still-visible fixed submenu from chasing a moving trigger.
            await Promise.all(closingSubmenus)
            if (generation !== this.lifecycle) {
                return
            }
        }
        // Flip the state first so the close transition starts while the
        // surface is still fixed to its anchored geometry. Removing the
        // floating position before the transition settles drops the surface
        // back into flow, which resizes it mid-animation (visible width jump).
        this.open = false
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
        this.isHiding = false
        this.stopPositionTracking()
        this.detachDismissListeners()
        this.returnFocusToAnchor()
        this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }))
    }

    /** Closes the menu surface (alias to hide for @material/web parity). */
    public async close(): Promise<void> {
        return this.hide()
    }

    /**
     * Toggles the menu surface between open and closed states.
     * If the menu is open and not currently hiding, closes it. Otherwise opens it.
     */
    public async toggle(): Promise<void> {
        if (this.open && !this.isHiding) {
            await this.close()
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
        const { x, y, placement } = await computePosition(anchor, surface, {
            strategy: 'fixed',
            placement: this.placement,
            middleware: this.createPositionMiddleware(),
        })
        const bounds = surface.getBoundingClientRect?.()
        if (placement?.startsWith('left')) {
            // Anchor to the inline-end edge while the surface grows / shrinks
            // so the edge nearest the trigger does not chase the width.
            const width = bounds?.width ?? 0
            const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth
            surface.style?.removeProperty('left')
            surface.style?.setProperty('right', `${viewportWidth - x - width}px`)
        } else {
            surface.style?.removeProperty('right')
            surface.style?.setProperty('left', `${x}px`)
        }
        if (this.isBlockEndAnchored(placement)) {
            // Anchor to the bottom edge while the surface grows / shrinks so
            // the block-end edge does not chase the changing height.
            const height = bounds?.height ?? 0
            const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight
            surface.style?.removeProperty('top')
            surface.style?.setProperty('bottom', `${viewportHeight - y - height}px`)
            return
        }
        surface.style?.removeProperty('bottom')
        surface.style?.setProperty('top', `${y}px`)
    }

    private isBlockEndAnchored(placement: string | undefined): boolean {
        if (!placement) {
            return false
        }
        return placement === 'top' ||
            placement.startsWith('top-') ||
            ((placement.startsWith('left') || placement.startsWith('right')) && placement.endsWith('-end'))
    }

    /** Recomputes the floating-ui position (alias to updatePosition for @material/web parity). */
    public async reposition(): Promise<void> {
        return this.updatePosition()
    }

    /**
     * The floating-ui middleware chain: gap offset, overflow flip, viewport
     * shift. Split out so specs can assert the chain without DOM measurements.
     */
    protected createPositionMiddleware(): Middleware[] {
        const isHorizontal = this.placement.startsWith('left') || this.placement.startsWith('right')
        const mainAxisOffset = isHorizontal ? POSITION_OFFSET + this.xOffset : POSITION_OFFSET + this.yOffset
        const crossAxisOffset = isHorizontal ? this.yOffset : this.xOffset
        const checkMainAxis = isHorizontal ? !this.noHorizontalFlip : !this.noVerticalFlip
        const checkCrossAxis = isHorizontal ? !this.noVerticalFlip : !this.noHorizontalFlip

        return [
            offset({
                mainAxis: mainAxisOffset,
                crossAxis: crossAxisOffset,
            }),
            flip({
                mainAxis: checkMainAxis,
                crossAxis: checkCrossAxis,
            }),
            shift({ padding: POSITION_SHIFT_PADDING }),
        ]
    }

    /**
     * Motion hook for M5. The default only awaits live CSS animations;
     * `quick` and `prefers-reduced-motion` skip the call entirely at the
     * logic level.
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
        if (this.anchorElement) {
            return this.anchorElement
        }
        if (this.anchor) {
            const root = typeof this.getRootNode === 'function'
                ? (this.getRootNode() as Document | ShadowRoot)
                : null
            if (root && typeof root.getElementById === 'function') {
                const el = root.getElementById(this.anchor)
                if (el) {
                    return el
                }
            }
            if (root && typeof (root as unknown as ParentNode).querySelector === 'function') {
                const el = (root as unknown as ParentNode).querySelector<HTMLElement>(escapeIdSelector(this.anchor))
                if (el) {
                    return el
                }
            }
            if (typeof document !== 'undefined' && root !== (document as unknown)) {
                if (typeof document.getElementById === 'function') {
                    const docEl = document.getElementById(this.anchor)
                    if (docEl) {
                        return docEl
                    }
                }
                if (typeof document.querySelector === 'function') {
                    const docEl = document.querySelector<HTMLElement>(escapeIdSelector(this.anchor))
                    if (docEl) {
                        return docEl
                    }
                }
            }
        }

        const elements = this.triggerElements ?? []
        return elements[0] ?? null
    }

    /** The rendered surface element. Overridable for tests. */
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
            this.closeOpenSubmenus()
            // `hide()` clears `open` before the exit transition runs. Keep
            // the floating position until that transition settles so the
            // surface does not fall back into flow and change size / origin;
            // `hide()` stops tracking itself once the animation completes.
            if (!this.isHiding) {
                this.stopPositionTracking()
            }
            this.detachDismissListeners()
            return
        }
        if (restart || !this.isPositionTracking()) {
            this.startPositionTracking()
            this.applyDefaultFocus()
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
        surface.style?.removeProperty('right')
        surface.style?.removeProperty('bottom')
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
        surface?.style?.removeProperty('bottom')
    }

    private attachDismissListeners(): void {
        if (this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.addEventListener('pointerdown', this.handleDocumentPointerdown, true)
        document.addEventListener('keydown', this.handleDocumentKeydown, true)
        this.addEventListener('focusout', this.handleFocusout)
        this.dismissAttached = true
    }

    private detachDismissListeners(): void {
        if (!this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.removeEventListener('pointerdown', this.handleDocumentPointerdown, true)
        document.removeEventListener('keydown', this.handleDocumentKeydown, true)
        this.removeEventListener('focusout', this.handleFocusout)
        this.dismissAttached = false
    }

    private rememberReturnFocus(): void {
        const active = typeof document === 'undefined' ? null : document.activeElement
        this.returnFocusElement = isHTMLElement(active) ? active : null
    }

    private returnFocusToAnchor(): void {
        if (this.skipRestoreFocus) {
            this.returnFocusElement = null
            return
        }
        const target = this.getAnchorElement() ?? this.returnFocusElement
        target?.focus?.()
        this.returnFocusElement = null
    }

    protected applyDefaultFocus(): void {
        const focusables = this.cachedItems.filter((item) => this.isRovingFocusable(item))
        if (this.defaultFocus === 'first-item') {
            focusables[0]?.focus()
        } else if (this.defaultFocus === 'last-item') {
            focusables[focusables.length - 1]?.focus()
        } else if (this.defaultFocus === 'root') {
            this.getSurfaceElement()?.focus()
        }
    }

    protected closeOpenSubmenus(): Promise<void>[] {
        if (typeof this.querySelectorAll !== 'function') {
            return []
        }
        const submenus = Array.from(this.querySelectorAll(LEGACY_MENU_SUBMENU_ELEMENT)) as unknown as IMDCLegacyMenuSubmenu[]
        const closing: Promise<void>[] = []
        for (const submenu of submenus) {
            if (submenu.open) {
                closing.push(submenu.hide())
            }
        }
        return closing
    }

    /**
     * Waits until every CSS transition started by the last state change is
     * done (dialog.base idiom). When nothing animates, resolves at once.
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

    private readonly handleSlotChange = (): void => {
        this.cachedItems = [...(this.assignedItems ?? [])] as LegacyMenuChild[]
        this.syncItemMotionDelays()
        this.updateTabIndices()
    }

    /**
     * Material staggers item fades across the 500ms open / 150ms close window.
     * The delays depend on the item count and on whether the menu grows
     * upwards, so they cannot use `sibling-index()` (the trigger and named
     * slots are siblings too). Inline custom properties keep the choreography
     * in CSS while the container only supplies the timing values.
     */
    private syncItemMotionDelays(): void {
        const items = this.cachedItems
        if (items.length === 0) {
            return
        }
        const count = items.length
        const upwards = this.isOpeningUpwards()
        const openStep = 250 / count
        const closeStep = 50 / count
        for (let index = 0; index < count; index++) {
            const element = items[index] as unknown as HTMLElement
            const openIndex = upwards ? count - 1 - index : index
            const closeIndex = upwards ? index : count - 1 - index
            element.style?.setProperty('--_menu-item-open-delay', `${openStep * openIndex}ms`)
            element.style?.setProperty('--_menu-item-close-delay', `${50 + closeStep * closeIndex}ms`)
        }
    }

    private isOpeningUpwards(): boolean {
        return this.placement.startsWith('top') ||
            ((this.placement.startsWith('left') || this.placement.startsWith('right')) && this.placement.endsWith('-end'))
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleRequestActivation = (event: Event): void => {
        const item = (event as CustomEvent<{ item: LegacyMenuChild }>).detail?.item
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
        const item = (event as CustomEvent<IMDCLegacyMenuSelectDetail>).detail?.item
        if (!item) {
            return
        }
        if (item.radio) {
            const itemSubmenu = (item as HTMLElement).closest?.(LEGACY_MENU_SUBMENU_ELEMENT)
            const itemContainer = itemSubmenu ?? this
            if (typeof itemContainer.querySelectorAll === 'function') {
                const radios = itemContainer.querySelectorAll<IMDCLegacyMenuItem>(LEGACY_MENU_ITEM_ELEMENT)
                const itemRadioGroup = (item as { name?: string }).name ?? (item as HTMLElement).getAttribute?.('name') ?? ''
                for (const radioItem of radios) {
                    if (radioItem !== item && radioItem.radio) {
                        if (typeof (radioItem as HTMLElement).closest === 'function') {
                            const sibSubmenu = (radioItem as HTMLElement).closest(LEGACY_MENU_SUBMENU_ELEMENT)
                            if (itemSubmenu ? sibSubmenu !== itemSubmenu : Boolean(sibSubmenu)) {
                                continue
                            }
                        }
                        const sibRadioGroup = (radioItem as { name?: string }).name ?? (radioItem as HTMLElement).getAttribute?.('name') ?? ''
                        if (itemRadioGroup === sibRadioGroup) {
                            radioItem.selected = false
                        }
                    }
                }
            }
        }
        this.dispatchEvent(new CustomEvent<IMDCLegacyMenuSelectDetail>(
            'select',
            {
                detail: { item },
                bubbles: true,
                composed: true,
            },
        ))
        const keepOpen = item.keepOpen || item.checkable === true || item.radio === true
        if (!keepOpen) {
            void this.hide()
        }
    }

    private readonly handleDocumentPointerdown = (event: Event): void => {
        if (!this.open) {
            return
        }
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        const anchor = this.getAnchorElement()
        const target = event.target as Node | null
        const isInsideThis = path.includes(this) || (Boolean(target) && typeof this.contains === 'function' && this.contains(target!))
        const isInsideAnchor = Boolean(anchor && (path.includes(anchor) || (Boolean(target) && typeof anchor.contains === 'function' && anchor.contains(target!))))
        if (isInsideThis || isInsideAnchor) {
            return
        }
        if (this.stayOpenOnOutsideClick) {
            return
        }
        void this.hide()
    }

    private readonly handleFocusout = (event: FocusEvent): void => {
        if (!this.open || this.stayOpenOnFocusout) {
            return
        }
        const related = event.relatedTarget as Node | null
        if (!related) {
            return
        }
        const anchor = this.getAnchorElement()
        const containsRelated = typeof this.contains === 'function' && this.contains(related)
        const anchorContainsRelated = Boolean(anchor && typeof anchor.contains === 'function' && anchor.contains(related))
        if (containsRelated || anchorContainsRelated) {
            return
        }
        void this.hide()
    }

    private readonly handleSubmenuOpened = (event: Event): void => {
        const target = event.target as Node
        if (typeof this.querySelectorAll !== 'function') {
            return
        }
        const submenus = Array.from(this.querySelectorAll(LEGACY_MENU_SUBMENU_ELEMENT)) as unknown as (HTMLElement & IMDCLegacyMenuSubmenu)[]
        for (const submenu of submenus) {
            if (submenu !== target && !submenu.contains(target) && submenu.open) {
                void submenu.hide()
            }
        }
    }

    /**
     * A submenu opened while the menu surface was still growing (initial
     * `open`, fast hover) tracks a moving trigger row. Recompute the nested
     * positions once the height transition settles and the anchor is stable.
     */
    private readonly handleSurfaceTransitionEnd = (event: TransitionEvent): void => {
        if (!this.open || event.target !== this.getSurfaceElement()) {
            return
        }
        if (event.propertyName !== 'height') {
            return
        }
        this.repositionOpenSubmenus()
    }

    private repositionOpenSubmenus(): void {
        if (typeof this.querySelectorAll !== 'function') {
            return
        }
        const submenus = Array.from(this.querySelectorAll(LEGACY_MENU_SUBMENU_ELEMENT)) as unknown as IMDCLegacyMenuSubmenu[]
        for (const submenu of submenus) {
            if (submenu.open) {
                void submenu.reposition()
            }
        }
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
        const target = event.target as LegacyMenuChild | null
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
        let nextItem: LegacyMenuChild | undefined
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
            }, this.typeaheadDelay)
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

    private findTypeaheadMatch(prefix: string): LegacyMenuChild | undefined {
        return this.cachedItems.find((item) =>
            this.isRovingFocusable(item) && this.getItemLabel(item).startsWith(prefix),
        )
    }

    private getItemLabel(item: LegacyMenuChild): string {
        const textProp = (item as { typeaheadText?: unknown }).typeaheadText
        if (typeof textProp === 'string' && textProp.length > 0) {
            return textProp.trim().toLowerCase()
        }
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
    private activateRelativeItem(delta: 1 | -1): LegacyMenuChild | undefined {
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
    private findNextFocusableItem(startIndex: number, step: 1 | -1): LegacyMenuChild | undefined {
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

    private isItemFocused(item: LegacyMenuChild): boolean {
        return typeof (item as unknown as HTMLElement).matches === 'function' && (item as unknown as HTMLElement).matches(':focus-within')
    }

    /**
     * True when the child can take roving focus: menu-items via
     * `isInteractive` / `isDisabled`, submenu triggers via `disabled`
     * (missing `isInteractive` defaults to true). Duck-typed so the
     * container never imports the submenu files.
     */
    private isRovingFocusable(item: LegacyMenuChild): boolean {
        const interactive = item.isInteractive ?? true
        const disabled = item.isDisabled ?? item.disabled ?? false
        return interactive && !disabled
    }

    /**
     * True when the event targets an open `mdc-legacy-menu-submenu`
     * descendant: the inner level handles Escape first (innermost-first
     * hierarchy mirroring `base-legacy-menu-submenu.ts`). The container
     * closes only when no open descendant is in the event path.
     */
    private isEventFromOpenDescendant(event: KeyboardEvent): boolean {
        if (typeof event.composedPath !== 'function') {
            return false
        }
        return event.composedPath().some((node) =>
            node !== this && isLegacyMenuSubmenuNode(node) && (node as IMDCLegacyMenuSubmenu).open)
    }

    /**
     * Assigns the roving tab-stop when the child exposes `listTabIndex`
     * (menu-item). Submenu triggers without `listTabIndex` keep a single
     * tab-stop via container focus discipline: the container moves focus
     * with `focus()` to exactly one member, so no extra tab-stop is added
     * here (documented choice for F1).
     */
    private setRovingTabIndex(item: LegacyMenuChild, value: 0 | -1): void {
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
        let itemToFocus: LegacyMenuChild | undefined
        if (focusedIsFocusable) {
            itemToFocus = focusedItem
        } else if (this.defaultFocus === 'last-item') {
            const focusables = items.filter((item) => this.isRovingFocusable(item))
            itemToFocus = focusables[focusables.length - 1]
        } else {
            itemToFocus = items.find((item) => this.isRovingFocusable(item))
        }

        for (const item of items) {
            this.setRovingTabIndex(item, item === itemToFocus ? 0 : -1)
        }
    }
}
