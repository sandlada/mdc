/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import {
    computeScaffoldBottomOffsets,
    isScaffoldFabCentered,
    isScaffoldFabOverlay,
    normalizeScaffoldFabPosition,
    resolveScaffoldHeightMode,
    resolveScaffoldLayoutMode,
    resolveScaffoldNavigationType,
    ScaffoldLayoutChangeEvent,
    type IMDCScaffold,
    type IMDCScaffoldLayoutChangeDetail,
    type IScaffoldPaddingValues,
    type ScaffoldAdaptiveNavigation,
    type ScaffoldContentPaddingMode,
    type ScaffoldFabPosition,
    type ScaffoldHeightMode,
    type ScaffoldLayoutMode,
    type ScaffoldNavigationType,
    type ScaffoldRailLayout,
    type ScaffoldScrollMode,
} from '../scaffold.interface'

/**
 * Android layout constants mirrored from Compose Material 3 `Scaffold.kt`.
 * `FabSpacing = 16.dp` (1dp = 1px at baseline density).
 */
const FabSpacing = 16
const SnackbarSpacing = 16

export abstract class BaseScaffold extends LitElement implements IMDCScaffold {
    @property({ type: String, attribute: 'rail-layout', reflect: true })
    public railLayout: ScaffoldRailLayout = 'full-height'

    @property({ type: String, attribute: 'fab-position', reflect: true })
    public fabPosition: ScaffoldFabPosition = 'end'

    @property({ type: String, attribute: 'scroll-mode', reflect: true })
    public scrollMode: ScaffoldScrollMode = 'body'

    @property({ type: String, attribute: 'layout-mode', reflect: true })
    public layoutMode: ScaffoldLayoutMode = 'auto'

    @property({ type: String, attribute: 'adaptive-navigation', reflect: true })
    public adaptiveNavigation: ScaffoldAdaptiveNavigation = 'auto'

    @property({ type: String, attribute: 'content-padding-mode', reflect: true })
    public contentPaddingMode: ScaffoldContentPaddingMode = 'inset'

    @property({ type: Boolean, attribute: 'avoid-safe-area', reflect: true })
    public avoidSafeArea: boolean = false

    @state()
    public hasAppbar: boolean = false

    @state()
    public hasRail: boolean = false

    @state()
    public hasDrawer: boolean = false

    @state()
    public hasEndRail: boolean = false

    @state()
    public hasEndDrawer: boolean = false

    @state()
    public hasBottomBar: boolean = false

    @state()
    public hasNavigationBar: boolean = false

    @state()
    public hasDockedBottomBar: boolean = false

    @state()
    public hasBottomSheet: boolean = false

    @state()
    public hasFab: boolean = false

    @state()
    public hasSnackbarHost: boolean = false

    @state()
    public effectiveLayoutMode: Exclude<ScaffoldLayoutMode, 'auto'> = 'compact'

    @state()
    public effectiveHeightMode: ScaffoldHeightMode = 'medium'

    @state()
    public effectiveNavigationType: ScaffoldNavigationType = 'none'

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    @query('.body-area')
    protected readonly bodyAreaElement!: HTMLElement | null

    @query('.appbar-area')
    protected readonly appbarAreaElement!: HTMLElement | null

    @query('.bottom-bar-area')
    protected readonly bottomBarAreaElement!: HTMLElement | null

    @query('.fab-area')
    protected readonly fabAreaElement!: HTMLDivElement | null

    @query('.snackbar-host-area')
    protected readonly snackbarHostAreaElement!: HTMLDivElement | null

    @query('.bottom-sheet-area')
    protected readonly bottomSheetAreaElement!: HTMLDivElement | null

    private resizeObserver: ResizeObserver | null = null
    private hasInitializedLightDomSlots: boolean = false
    private hasMeasuredHostSize: boolean = false
    private restingTopBarHeight: number = 0
    private lastEmittedLayoutSignature: string = ''
    private readonly pendingUpgradeElements = new WeakSet<Element>()
    private readonly wiredScrollTargetElements = new Set<HTMLElement>()

    /**
     * Last scroll target assigned automatically by `syncScrollTarget`.
     * Tracks ownership so mode switches and removals can reclaim it without
     * clobbering an explicit user-provided target.
     */
    private autoScrollTarget: HTMLElement | Window | null = null

    /** Canonical FAB value (`start` | `center` | `end` | `end-overlay`). Never throws. */
    protected get normalizedFabPosition(): ScaffoldFabPosition {
        return normalizeScaffoldFabPosition(this.fabPosition)
    }

    protected get fabCentered(): boolean {
        return isScaffoldFabCentered(this.normalizedFabPosition)
    }

    protected get fabOverlay(): boolean {
        return isScaffoldFabOverlay(this.normalizedFabPosition)
    }

    protected get showNavigationBar(): boolean {
        if (!this.hasNavigationBar) return false
        if (this.adaptiveNavigation === 'off') return true
        return this.effectiveNavigationType === 'navigation-bar'
    }

    protected get showStartRail(): boolean {
        if (!this.hasRail) return false
        if (this.adaptiveNavigation === 'off') return true
        return this.effectiveNavigationType === 'navigation-rail'
    }

    protected get showStartDrawer(): boolean {
        if (!this.hasDrawer) return false
        if (this.adaptiveNavigation === 'off') return true
        return this.effectiveNavigationType === 'navigation-drawer'
    }

    protected get effectiveHasBottomBar(): boolean {
        return this.hasDockedBottomBar || this.showNavigationBar
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
        this.clearWiredScrollTargets()
        this.autoScrollTarget = null
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        if (!this.hasInitializedLightDomSlots) {
            this.hasInitializedLightDomSlots = true
            this.refreshSlotPresenceFromLightDom()
        }

        if (changedProperties.has('layoutMode')) {
            if (this.layoutMode !== 'auto') {
                this.effectiveLayoutMode = this.layoutMode as Exclude<ScaffoldLayoutMode, 'auto'>
            } else if (!this.hasMeasuredHostSize && typeof this.offsetWidth === 'number' && this.offsetWidth > 0) {
                this.effectiveLayoutMode = resolveScaffoldLayoutMode(this.offsetWidth)
                this.effectiveHeightMode = this.offsetHeight > 0
                    ? resolveScaffoldHeightMode(this.offsetHeight)
                    : 'medium'
                this.hasMeasuredHostSize = true
            }
        }

        this.effectiveNavigationType = this.computeNavigationType()
    }

    protected override firstUpdated(changedProperties: PropertyValues<this>): void {
        super.firstUpdated(changedProperties)
        this.setupResizeObserver()
        this.updateLayoutMeasurements()
        this.syncScrollTarget()
        this.emitLayoutChangeIfNeeded()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (
            changedProperties.has('scrollMode') ||
            changedProperties.has('hasAppbar') ||
            changedProperties.has('layoutMode') ||
            changedProperties.has('effectiveLayoutMode')
        ) {
            this.syncScrollTarget()
        }
        if (
            changedProperties.has('hasBottomBar') ||
            changedProperties.has('hasNavigationBar') ||
            changedProperties.has('hasDockedBottomBar') ||
            changedProperties.has('hasFab') ||
            changedProperties.has('hasAppbar') ||
            changedProperties.has('hasRail') ||
            changedProperties.has('hasDrawer') ||
            changedProperties.has('hasEndRail') ||
            changedProperties.has('hasEndDrawer') ||
            changedProperties.has('fabPosition') ||
            changedProperties.has('adaptiveNavigation') ||
            changedProperties.has('effectiveNavigationType') ||
            changedProperties.has('contentPaddingMode') ||
            changedProperties.has('avoidSafeArea')
        ) {
            this.updateLayoutMeasurements()
        }
        this.emitLayoutChangeIfNeeded()
    }

    /**
     * Recompute slot presence, breakpoints, and measurements.
     * Public so hosts can force a relayout after slotted content changes size.
     */
    public refreshLayout(): void {
        this.refreshSlotPresence()
        this.updateSizeModes()
        this.effectiveNavigationType = this.computeNavigationType()
        this.updateLayoutMeasurements()
        this.syncScrollTarget()
        this.emitLayoutChangeIfNeeded()
    }

    /**
     * Web equivalent of Compose `innerPadding` (`PaddingValues`).
     */
    public getInnerPadding(): IScaffoldPaddingValues {
        const topBarHeight = this.hasAppbar && this.appbarAreaElement
            ? (this.appbarAreaElement.offsetHeight || 0)
            : 0
        const bottomBarHeight = this.effectiveHasBottomBar && this.bottomBarAreaElement
            ? (this.bottomBarAreaElement.offsetHeight || 0)
            : 0

        const safe = this.readSafeAreaInsets()
        const isRtl = this.isRtlDirection()
        const hasVisibleStart = this.showStartDrawer || this.showStartRail
        const hasVisibleEnd = this.hasEndDrawer || this.hasEndRail
        const leftCovered = isRtl ? hasVisibleEnd : hasVisibleStart
        const rightCovered = isRtl ? hasVisibleStart : hasVisibleEnd

        return {
            top   : this.hasAppbar ? topBarHeight : safe.top,
            bottom: this.effectiveHasBottomBar ? bottomBarHeight : safe.bottom,
            left  : leftCovered ? 0 : safe.left,
            right : rightCovered ? 0 : safe.right,
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        const fab = this.normalizedFabPosition
        const hasVisibleBottomBar = this.effectiveHasBottomBar
        const hasVisibleRail = this.showStartRail
        const hasVisibleDrawer = this.showStartDrawer

        return {
            'container'                                  : true,
            [`rail-${this.railLayout}`]                  : true,
            [`scroll-${this.scrollMode}`]                : true,
            [`layout-${this.layoutMode}`]                : true,
            [`effective-${this.effectiveLayoutMode}`]    : true,
            [`height-${this.effectiveHeightMode}`]       : true,
            [`nav-type-${this.effectiveNavigationType}`] : true,
            [`padding-mode-${this.contentPaddingMode}`]  : true,
            [`fab-${fab}`]                               : true,
            'fab-centered'                               : this.fabCentered,
            'fab-overlay'                                : this.fabOverlay,
            'has-appbar'                                 : this.hasAppbar,
            'has-rail'                                   : hasVisibleRail,
            'has-drawer'                                 : hasVisibleDrawer,
            'has-end-rail'                               : this.hasEndRail,
            'has-end-drawer'                             : this.hasEndDrawer,
            'has-bottom-bar'                             : hasVisibleBottomBar,
            'has-navigation-bar'                         : this.showNavigationBar,
            'has-docked-bottom-bar'                      : this.hasDockedBottomBar,
            'has-bottom-sheet'                           : this.hasBottomSheet,
            'has-fab'                                    : this.hasFab,
            'has-snackbar-host'                          : this.hasSnackbarHost,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                <!-- Start Drawer (Primary / Standard / Modal) -->
                <div class="start-drawer-area ${this.showStartDrawer ? 'has-drawer' : ''}">
                    <slot name="drawer" @slotchange=${this.handleSlotChange}></slot>
                    <slot name="start-drawer" @slotchange=${this.handleSlotChange}></slot>
                </div>

                <!-- Start Navigation Rail (Primary) -->
                <div class="start-rail-area ${this.showStartRail ? 'has-rail' : ''}">
                    <slot name="rail" @slotchange=${this.handleSlotChange}></slot>
                    <slot name="start-rail" @slotchange=${this.handleSlotChange}></slot>
                </div>

                <!-- Top App Bar / Header -->
                <div class="appbar-area ${this.hasAppbar ? 'has-appbar' : ''}">
                    <slot name="appbar" @slotchange=${this.handleSlotChange}></slot>
                </div>

                <!-- Main Body Content Area -->
                <main class="body-area">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </main>

                <!-- End Navigation Rail (Secondary / Inspector / Toolbox) -->
                <div class="end-rail-area ${this.hasEndRail ? 'has-end-rail' : ''}">
                    <slot name="end-rail" @slotchange=${this.handleSlotChange}></slot>
                    <slot name="trailing-rail" @slotchange=${this.handleSlotChange}></slot>
                </div>

                <!-- End Drawer / Side Sheet -->
                <div class="end-drawer-area ${this.hasEndDrawer ? 'has-end-drawer' : ''}">
                    <slot name="end-drawer" @slotchange=${this.handleSlotChange}></slot>
                    <slot name="side-sheet" @slotchange=${this.handleSlotChange}></slot>
                </div>

                <!-- Bottom Navigation Bar / Bottom App Bar -->
                <div class="bottom-bar-area ${this.effectiveHasBottomBar ? 'has-bottom-bar' : ''}">
                    <div class="docked-bottom-bar-wrapper ${this.hasDockedBottomBar ? 'is-visible' : ''}">
                        <slot name="bottom-bar" @slotchange=${this.handleSlotChange}></slot>
                    </div>
                    <div class="navigation-bar-wrapper ${this.showNavigationBar ? 'is-visible' : ''}">
                        <slot name="navigation-bar" @slotchange=${this.handleSlotChange}></slot>
                    </div>
                </div>

                <!-- Content-Scoped Overlay Layer (FAB, Snackbar Host, Bottom Sheet) -->
                <div class="content-overlay">
                    <div class="bottom-sheet-area ${this.hasBottomSheet ? 'has-bottom-sheet' : ''}">
                        <slot name="bottom-sheet" @slotchange=${this.handleSlotChange}></slot>
                    </div>

                    <div class="snackbar-host-area ${this.hasSnackbarHost ? 'has-snackbar-host' : ''}">
                        <slot name="snackbar-host" @slotchange=${this.handleSlotChange}></slot>
                    </div>

                    <div class="fab-area ${this.hasFab ? 'has-fab' : ''}">
                        <slot name="fab" @slotchange=${this.handleSlotChange}></slot>
                    </div>
                </div>
            </div>
        `
    }

    protected handleSlotChange(): void {
        this.refreshSlotPresence()
        this.updateLayoutMeasurements()
        this.syncScrollTarget()
        this.emitLayoutChangeIfNeeded()
    }

    private computeNavigationType(): ScaffoldNavigationType {
        if (this.adaptiveNavigation === 'off') {
            if (this.hasRail) return 'navigation-rail'
            if (this.hasDrawer) return 'navigation-drawer'
            if (this.hasNavigationBar) return 'navigation-bar'
            return 'none'
        }
        if (this.adaptiveNavigation !== 'auto') {
            return this.adaptiveNavigation
        }
        return resolveScaffoldNavigationType(this.effectiveLayoutMode, this.effectiveHeightMode, {
            hasDrawer       : this.hasDrawer,
            hasRail         : this.hasRail,
            hasNavigationBar: this.hasNavigationBar,
        })
    }

    private hasAssignedSlot(...names: string[]): boolean {
        const root = this.renderRoot as unknown as ShadowRoot | null
        if (!root || typeof root.querySelector !== 'function') return false
        for (const name of names) {
            const slot = root.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null
            if (slot && typeof slot.assignedElements === 'function' && slot.assignedElements({ flatten: true }).length > 0) {
                return true
            }
        }
        return false
    }

    private hasLightDomSlot(...names: string[]): boolean {
        const children = this.children
        if (!children) return false
        for (let i = 0; i < children.length; i++) {
            const slotName = children[i].getAttribute?.('slot')
            if (slotName && names.includes(slotName)) return true
        }
        return false
    }

    private refreshSlotPresenceFromLightDom(): void {
        this.hasAppbar = this.hasLightDomSlot('appbar')
        this.hasRail = this.hasLightDomSlot('rail', 'start-rail')
        this.hasDrawer = this.hasLightDomSlot('drawer', 'start-drawer')
        this.hasEndRail = this.hasLightDomSlot('end-rail', 'trailing-rail')
        this.hasEndDrawer = this.hasLightDomSlot('end-drawer', 'side-sheet')
        this.hasDockedBottomBar = this.hasLightDomSlot('bottom-bar')
        this.hasNavigationBar = this.hasLightDomSlot('navigation-bar')
        this.hasBottomBar = this.hasDockedBottomBar || this.hasNavigationBar
        this.hasBottomSheet = this.hasLightDomSlot('bottom-sheet')
        this.hasFab = this.hasLightDomSlot('fab')
        this.hasSnackbarHost = this.hasLightDomSlot('snackbar-host')
    }

    private refreshSlotPresence(): void {
        if (!this.renderRoot) return
        const root = this.renderRoot as unknown as ShadowRoot | null
        const hasSlots = Boolean(root && typeof root.querySelector === 'function' && root.querySelector('slot[name="appbar"]'))
        if (!hasSlots) {
            this.refreshSlotPresenceFromLightDom()
            return
        }
        this.hasAppbar = this.hasAssignedSlot('appbar')
        this.hasRail = this.hasAssignedSlot('rail', 'start-rail')
        this.hasDrawer = this.hasAssignedSlot('drawer', 'start-drawer')
        this.hasEndRail = this.hasAssignedSlot('end-rail', 'trailing-rail')
        this.hasEndDrawer = this.hasAssignedSlot('end-drawer', 'side-sheet')
        this.hasDockedBottomBar = this.hasAssignedSlot('bottom-bar')
        this.hasNavigationBar = this.hasAssignedSlot('navigation-bar')
        this.hasBottomBar = this.hasDockedBottomBar || this.hasNavigationBar
        this.hasBottomSheet = this.hasAssignedSlot('bottom-sheet')
        this.hasFab = this.hasAssignedSlot('fab')
        this.hasSnackbarHost = this.hasAssignedSlot('snackbar-host')
    }

    private setupResizeObserver(): void {
        if (typeof ResizeObserver === 'undefined') return
        this.resizeObserver?.disconnect()
        this.resizeObserver = new ResizeObserver(() => {
            this.updateSizeModes()
            this.updateLayoutMeasurements()
            this.emitLayoutChangeIfNeeded()
        })
        if (this.containerElement) this.resizeObserver.observe(this.containerElement)
        if (this.appbarAreaElement) this.resizeObserver.observe(this.appbarAreaElement)
        if (this.bottomBarAreaElement) this.resizeObserver.observe(this.bottomBarAreaElement)
        if (this.fabAreaElement) this.resizeObserver.observe(this.fabAreaElement)
        if (this.bottomSheetAreaElement) this.resizeObserver.observe(this.bottomSheetAreaElement)
    }

    private updateSizeModes(): void {
        const rect = this.containerElement?.getBoundingClientRect?.()
        const width = rect?.width ?? (this as unknown as HTMLElement).offsetWidth ?? 0
        const height = rect?.height ?? (this as unknown as HTMLElement).offsetHeight ?? 0

        if (width > 0 || height > 0) {
            this.hasMeasuredHostSize = true
        }

        if (this.layoutMode !== 'auto') {
            if (this.effectiveLayoutMode !== this.layoutMode) {
                this.effectiveLayoutMode = this.layoutMode as Exclude<ScaffoldLayoutMode, 'auto'>
            }
        } else {
            const resolvedWidth = resolveScaffoldLayoutMode(width > 0 ? width : 0)
            if (this.effectiveLayoutMode !== resolvedWidth) {
                this.effectiveLayoutMode = resolvedWidth
            }
        }

        const resolvedHeight = height > 0
            ? resolveScaffoldHeightMode(height)
            : 'medium'
        if (this.effectiveHeightMode !== resolvedHeight) {
            this.effectiveHeightMode = resolvedHeight
        }
    }

    private isAppbarCollapsed(): boolean {
        const root = this.renderRoot as unknown as ShadowRoot | null
        const slot = root?.querySelector?.('slot[name="appbar"]') as HTMLSlotElement | null
        const assigned = slot?.assignedElements?.({ flatten: true }) ?? []
        return assigned.some((el) => (el as { collapsed?: boolean }).collapsed === true)
    }

    private readSafeAreaInsets(): IScaffoldPaddingValues {
        if (!this.avoidSafeArea || typeof getComputedStyle !== 'function') {
            return { top: 0, bottom: 0, left: 0, right: 0 }
        }
        const cs = getComputedStyle(this)
        const parsePx = (prop: string): number => {
            const val = Number.parseFloat(cs.getPropertyValue(prop))
            return Number.isFinite(val) ? val : 0
        }
        return {
            top   : parsePx('--_probe-safe-top'),
            bottom: parsePx('--_probe-safe-bottom'),
            left  : parsePx('--_probe-safe-left'),
            right : parsePx('--_probe-safe-right'),
        }
    }

    private isRtlDirection(): boolean {
        if (typeof getComputedStyle === 'function') {
            return getComputedStyle(this).direction === 'rtl'
        }
        return this.dir === 'rtl'
    }

    private updateLayoutMeasurements(): void {
        if (!this.renderRoot) return
        const topBarHeight = this.hasAppbar && this.appbarAreaElement
            ? (this.appbarAreaElement.offsetHeight || 0)
            : 0
        const bottomBarHeight = this.effectiveHasBottomBar && this.bottomBarAreaElement
            ? (this.bottomBarAreaElement.offsetHeight || 0)
            : 0
        const fabHeight = this.hasFab && this.fabAreaElement
            ? (this.fabAreaElement.offsetHeight || 0)
            : 0

        if (!this.hasAppbar) {
            this.restingTopBarHeight = 0
        } else if (!this.isAppbarCollapsed() || this.restingTopBarHeight === 0) {
            this.restingTopBarHeight = topBarHeight
        }

        this.style.setProperty('--_computed-top-bar-height', `${topBarHeight}px`)
        this.style.setProperty('--_computed-resting-top-bar-height', `${this.restingTopBarHeight}px`)
        this.style.setProperty('--_computed-bottom-bar-height', `${bottomBarHeight}px`)
        this.style.setProperty('--_computed-fab-height', `${fabHeight}px`)

        const offsets = computeScaffoldBottomOffsets({
            hasFab         : this.hasFab,
            fabHeight,
            fabPosition    : this.normalizedFabPosition,
            fabSpacing     : FabSpacing,
            hasBottomBar   : this.effectiveHasBottomBar,
            bottomBarHeight,
            snackbarSpacing: SnackbarSpacing,
        })

        this.style.setProperty('--_computed-fab-bottom', `${offsets.fabBottom}px`)
        this.style.setProperty('--_computed-snackbar-bottom', `${offsets.snackbarBottom}px`)
        this.style.setProperty(
            '--_safe-fab-bottom',
            offsets.fabUsesSafeBottom && this.avoidSafeArea ? 'env(safe-area-inset-bottom, 0px)' : '0px',
        )
        this.style.setProperty(
            '--_safe-snackbar-bottom',
            offsets.snackbarUsesSafeBottom && this.avoidSafeArea ? 'env(safe-area-inset-bottom, 0px)' : '0px',
        )

        const inner = this.getInnerPadding()
        const isRtl = this.isRtlDirection()
        const insetTop = this.hasAppbar ? this.restingTopBarHeight : inner.top
        const insetStart = isRtl ? inner.right : inner.left
        const insetEnd = isRtl ? inner.left : inner.right

        this.style.setProperty('--_computed-inner-padding-top', `${insetTop}px`)
        this.style.setProperty('--_computed-inner-padding-bottom', `${inner.bottom}px`)
        this.style.setProperty('--_computed-inner-padding-start', `${insetStart}px`)
        this.style.setProperty('--_computed-inner-padding-end', `${insetEnd}px`)

        this.style.setProperty('--mdc-scaffold-inner-padding-top', `${inner.top}px`)
        this.style.setProperty('--mdc-scaffold-inner-padding-bottom', `${inner.bottom}px`)
        this.style.setProperty('--mdc-scaffold-inner-padding-start', `${insetStart}px`)
        this.style.setProperty('--mdc-scaffold-inner-padding-end', `${insetEnd}px`)
    }

    private emitLayoutChangeIfNeeded(): void {
        if (!this.isConnected) return
        const innerPadding = this.getInnerPadding()
        const signature = `${this.effectiveLayoutMode}|${this.effectiveHeightMode}|${this.effectiveNavigationType}|${innerPadding.top},${innerPadding.bottom},${innerPadding.left},${innerPadding.right}`
        if (signature === this.lastEmittedLayoutSignature) return
        this.lastEmittedLayoutSignature = signature

        this.dispatchEvent(new CustomEvent<IMDCScaffoldLayoutChangeDetail>(ScaffoldLayoutChangeEvent, {
            bubbles : true,
            composed: true,
            detail  : {
                layoutMode    : this.effectiveLayoutMode,
                heightMode    : this.effectiveHeightMode,
                navigationType: this.effectiveNavigationType,
                innerPadding,
            },
        }))
    }

    private clearWiredScrollTargets(): void {
        for (const el of this.wiredScrollTargetElements) {
            if ('scrollTarget' in el) {
                const current = (el as unknown as { scrollTarget: unknown }).scrollTarget
                if (current === this.autoScrollTarget) {
                    ;(el as unknown as { scrollTarget: unknown }).scrollTarget = null
                }
            }
        }
        this.wiredScrollTargetElements.clear()
    }

    private syncScrollTarget(): void {
        const root = this.renderRoot as unknown as ShadowRoot | null
        if (!root || typeof root.querySelector !== 'function') return
        const appbarSlot = root.querySelector('slot[name="appbar"]') as HTMLSlotElement | null
        const bottomBarSlot = root.querySelector('slot[name="bottom-bar"]') as HTMLSlotElement | null
        const navigationBarSlot = root.querySelector('slot[name="navigation-bar"]') as HTMLSlotElement | null
        const railSlot = root.querySelector('slot[name="rail"]') as HTMLSlotElement | null
        const startRailSlot = root.querySelector('slot[name="start-rail"]') as HTMLSlotElement | null
        const assigned: HTMLElement[] = [
            ...((appbarSlot?.assignedElements?.({ flatten: true }) as HTMLElement[] | undefined) ?? []),
            ...((bottomBarSlot?.assignedElements?.({ flatten: true }) as HTMLElement[] | undefined) ?? []),
            ...((navigationBarSlot?.assignedElements?.({ flatten: true }) as HTMLElement[] | undefined) ?? []),
            ...((railSlot?.assignedElements?.({ flatten: true }) as HTMLElement[] | undefined) ?? []),
            ...((startRailSlot?.assignedElements?.({ flatten: true }) as HTMLElement[] | undefined) ?? []),
        ]

        // Reclaim auto-assigned target from elements no longer slotted.
        for (const prev of this.wiredScrollTargetElements) {
            if (!assigned.includes(prev)) {
                if ('scrollTarget' in prev) {
                    const current = (prev as unknown as { scrollTarget: unknown }).scrollTarget
                    if (current === this.autoScrollTarget) {
                        ;(prev as unknown as { scrollTarget: unknown }).scrollTarget = null
                    }
                }
                this.wiredScrollTargetElements.delete(prev)
            }
        }

        if (assigned.length === 0) return

        const target: HTMLElement | Window | null =
            this.scrollMode === 'body'
                ? this.bodyAreaElement
                : (typeof window !== 'undefined' ? window : null)

        if (!target) return

        let didWire = false
        for (const el of assigned) {
            if (!('scrollTarget' in el)) {
                if (
                    el.localName.includes('-') &&
                    typeof customElements !== 'undefined' &&
                    !customElements.get(el.localName) &&
                    !this.pendingUpgradeElements.has(el)
                ) {
                    this.pendingUpgradeElements.add(el)
                    customElements.whenDefined(el.localName).then(() => {
                        this.pendingUpgradeElements.delete(el)
                        if (this.isConnected) {
                            this.syncScrollTarget()
                        }
                    })
                }
                continue
            }

            const current = (el as unknown as { scrollTarget: unknown }).scrollTarget
            // Adopt target unless the user set an explicit custom target.
            if (current === null || current === undefined || current === this.autoScrollTarget) {
                ;(el as unknown as { scrollTarget: unknown }).scrollTarget = target
                this.wiredScrollTargetElements.add(el)
                didWire = true
            }
        }
        if (didWire) {
            this.autoScrollTarget = target
        }
    }
}
