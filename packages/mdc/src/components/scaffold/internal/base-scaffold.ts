/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type {
    IScaffold,
    ScaffoldFabPosition,
    ScaffoldLayoutMode,
    ScaffoldRailLayout,
    ScaffoldScrollMode,
} from '../scaffold.interface'

export abstract class BaseScaffold extends LitElement implements IScaffold {
    @property({ type: String, attribute: 'rail-layout', reflect: true })
    public railLayout: ScaffoldRailLayout = 'full-height'

    @property({ type: String, attribute: 'fab-position', reflect: true })
    public fabPosition: ScaffoldFabPosition = 'bottom-end'

    @property({ type: String, attribute: 'scroll-mode', reflect: true })
    public scrollMode: ScaffoldScrollMode = 'body'

    @property({ type: String, attribute: 'layout-mode', reflect: true })
    public layoutMode: ScaffoldLayoutMode = 'auto'

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
    public hasBottomSheet: boolean = false

    @state()
    public hasFab: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    @query('.body-area')
    protected readonly bodyAreaElement!: HTMLElement | null

    @query('.appbar-area')
    protected readonly appbarAreaElement!: HTMLElement | null

    @query('.bottom-bar-area')
    protected readonly bottomBarAreaElement!: HTMLElement | null

    @query('slot[name="appbar"]')
    protected readonly appbarSlot!: HTMLSlotElement | null

    @query('slot[name="bottom-bar"]')
    protected readonly bottomBarSlot!: HTMLSlotElement | null

    private resizeObserver: ResizeObserver | null = null

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        this.setupResizeObserver()
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
    }

    protected override firstUpdated(changedProperties: PropertyValues<this>): void {
        super.firstUpdated(changedProperties)
        this.syncScrollTarget()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('scrollMode') || changedProperties.has('hasAppbar')) {
            this.syncScrollTarget()
        }
    }

    protected getRenderClasses() {
        return {
            'container': true,
            [`rail-${this.railLayout}`]: true,
            [`scroll-${this.scrollMode}`]: true,
            [`layout-${this.layoutMode}`]: true,
            'has-appbar': this.hasAppbar,
            'has-rail': this.hasRail,
            'has-drawer': this.hasDrawer,
            'has-end-rail': this.hasEndRail,
            'has-end-drawer': this.hasEndDrawer,
            'has-bottom-bar': this.hasBottomBar,
            'has-bottom-sheet': this.hasBottomSheet,
            'has-fab': this.hasFab,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                <!-- Start Drawer (Primary / Standard / Modal) -->
                <aside class="start-drawer-area ${this.hasDrawer ? 'has-drawer' : ''}">
                    <slot name="drawer" @slotchange=${this.handleDrawerSlotChange}></slot>
                    <slot name="start-drawer" @slotchange=${this.handleDrawerSlotChange}></slot>
                </aside>

                <!-- Start Navigation Rail (Primary) -->
                <aside class="start-rail-area ${this.hasRail ? 'has-rail' : ''}">
                    <slot name="rail" @slotchange=${this.handleRailSlotChange}></slot>
                    <slot name="start-rail" @slotchange=${this.handleRailSlotChange}></slot>
                </aside>

                <!-- Top App Bar / Header -->
                <header class="appbar-area ${this.hasAppbar ? 'has-appbar' : ''}">
                    <slot name="appbar" @slotchange=${this.handleAppbarSlotChange}></slot>
                </header>

                <!-- Main Body Content Area -->
                <main class="body-area">
                    <slot></slot>
                </main>

                <!-- End Navigation Rail (Secondary / Inspector / Toolbox) -->
                <aside class="end-rail-area ${this.hasEndRail ? 'has-end-rail' : ''}">
                    <slot name="end-rail" @slotchange=${this.handleEndRailSlotChange}></slot>
                    <slot name="trailing-rail" @slotchange=${this.handleEndRailSlotChange}></slot>
                </aside>

                <!-- End Drawer / Side Sheet -->
                <aside class="end-drawer-area ${this.hasEndDrawer ? 'has-end-drawer' : ''}">
                    <slot name="end-drawer" @slotchange=${this.handleEndDrawerSlotChange}></slot>
                    <slot name="side-sheet" @slotchange=${this.handleEndDrawerSlotChange}></slot>
                </aside>

                <!-- Bottom Navigation Bar / Bottom App Bar -->
                <footer class="bottom-bar-area ${this.hasBottomBar ? 'has-bottom-bar' : ''}">
                    <slot name="bottom-bar" @slotchange=${this.handleBottomBarSlotChange}></slot>
                    <slot name="navigation-bar" @slotchange=${this.handleBottomBarSlotChange}></slot>
                </footer>

                <!-- Bottom Sheet Layer -->
                <div class="bottom-sheet-area ${this.hasBottomSheet ? 'has-bottom-sheet' : ''}">
                    <slot name="bottom-sheet" @slotchange=${this.handleBottomSheetSlotChange}></slot>
                </div>

                <!-- Floating Action Button Layer -->
                <div class="fab-area fab-${this.fabPosition} ${this.hasFab ? 'has-fab' : ''}">
                    <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
                </div>

                <!-- Snackbar Host Layer -->
                <div class="snackbar-host-area">
                    <slot name="snackbar-host"></slot>
                </div>
            </div>
        `
    }

    private setupResizeObserver(): void {
        if (typeof ResizeObserver === 'undefined') return
        this.resizeObserver = new ResizeObserver(() => {
            this.updateLayoutMeasurements()
        })

        if (this.bottomBarAreaElement) {
            this.resizeObserver.observe(this.bottomBarAreaElement)
        }
        if (this.appbarAreaElement) {
            this.resizeObserver.observe(this.appbarAreaElement)
        }
    }

    private updateLayoutMeasurements(): void {
        const bottomBarHeight = this.hasBottomBar && this.bottomBarAreaElement
            ? this.bottomBarAreaElement.offsetHeight
            : 0

        this.style.setProperty('--_computed-bottom-bar-height', `${bottomBarHeight}px`)

        if (bottomBarHeight > 0) {
            this.style.setProperty('--_computed-fab-bottom', `calc(${bottomBarHeight}px + var(--_enabled-fab-margin-block-end, 16px))`)
        } else {
            this.style.removeProperty('--_computed-fab-bottom')
        }
    }

    private syncScrollTarget(): void {
        if (isServer) return
        if (this.scrollMode === 'body' && this.bodyAreaElement && this.appbarSlot) {
            const assigned = this.appbarSlot.assignedElements({ flatten: true })
            for (const el of assigned) {
                if ('scrollTarget' in el && (el as any).scrollTarget === undefined) {
                    ;(el as any).scrollTarget = this.bodyAreaElement
                }
            }
        }
    }

    protected handleAppbarSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasAppbar = slot.assignedElements({ flatten: true }).length > 0
        this.syncScrollTarget()
        this.updateLayoutMeasurements()
    }

    protected handleRailSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasRail = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleDrawerSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasDrawer = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleEndRailSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasEndRail = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleEndDrawerSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasEndDrawer = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleBottomBarSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasBottomBar = slot.assignedElements({ flatten: true }).length > 0
        this.updateLayoutMeasurements()
    }

    protected handleBottomSheetSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasBottomSheet = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleFabSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasFab = slot.assignedElements({ flatten: true }).length > 0
    }
}
