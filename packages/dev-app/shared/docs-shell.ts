/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { consume } from '@lit/context'
import type { Subscription } from 'rxjs'
import { getDefaultViewportObserver, lessThan, observeWidthBreakpoint } from '@sandlada/breakpoint'
import { docsPageTitleContext } from './contexts/index.js'
import { DOCS_SIDEBAR_CLOSE_EVENT, type DocsSidebar } from './docs-sidebar.js'
import './base-imports.js'
import './docs-sidebar.js'

/**
 * Width below which the sidebar switches to a modal dialog.
 * Matches the `md` breakpoint (`>= 840px`) of the default configuration.
 */
const COMPACT_MAX_WIDTH = 840

/**
 * `<mdc-docs-shell active="button">` is the full-page layout for the docs site.
 * Provides a responsive sidebar (left), a header with a menu button, the
 * current page title (via `docsPageTitleContext`) and a theme switch (top),
 * and a scrolling main slot. Use `<mdc-docs-page>` if you want a one-shot wrapper.
 *
 * Below the `md` breakpoint the sidebar is a modal dialog; on `md` and above
 * it is a static element that the menu button can collapse and expand.
 */
@customElement('mdc-docs-shell')
export class DocsShell extends LitElement {

    public static override styles = css`
        :host {
            display: grid;
            grid-template-columns: 240px 1fr;
            grid-template-rows: 56px 1fr;
            height: 100dvh;
            background: var(--md-sys-color-background);
            color: var(--md-sys-color-on-background);
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        :host([compact]),
        :host(:not([compact]):not([sidebar-open])) {
            grid-template-columns: 1fr;
        }
        :host([compact]) header,
        :host(:not([compact]):not([sidebar-open])) header,
        :host([compact]) main,
        :host(:not([compact]):not([sidebar-open])) main {
            grid-column: 1 / -1;
        }
        :host([compact]) aside {
            display: contents;
        }
        :host(:not([compact]):not([sidebar-open])) aside {
            display: none;
        }
        aside {
            grid-column: 1 / 2;
            grid-row: 1 / -1;
            border-right: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container);
            overflow-y: auto;
        }
        header {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 0 16px;
            background: var(--md-sys-color-surface);
        }
        .header-start {
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
        }
        .page-title {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }
        main {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
            overflow: auto;
            padding: 24px 32px;
        }
    `

    @property({ type: String, reflect: true })
    public active: string = ''

    @property({ type: Boolean, reflect: true, attribute: 'sidebar-open' })
    public sidebarOpen: boolean = true

    @property({ type: Boolean, reflect: true })
    public compact: boolean = false

    @consume({ context: docsPageTitleContext, subscribe: true })
    @property({ type: String, attribute: false })
    public pageTitle: string = ''

    private breakpointSubscription: Subscription | undefined = undefined

    @query('mdc-docs-sidebar')
    private declare readonly sidebarEl: DocsSidebar | null

    public override connectedCallback(): void {
        super.connectedCallback()
        const belowMd = lessThan(COMPACT_MAX_WIDTH)
        this.compact = getDefaultViewportObserver().matchesWidthBreakpoint(belowMd)
        if (this.compact) {
            this.sidebarOpen = false
        }
        this.breakpointSubscription = observeWidthBreakpoint(belowMd).subscribe((compact) => {
            const wasCompact = this.compact
            this.compact = compact
            if (compact && !wasCompact) {
                this.sidebarOpen = false
            }
        })
    }

    public override disconnectedCallback(): void {
        this.breakpointSubscription?.unsubscribe()
        this.breakpointSubscription = undefined
        super.disconnectedCallback()
    }

    protected override firstUpdated(): void {
        this.sidebarEl?.addEventListener(DOCS_SIDEBAR_CLOSE_EVENT, this.handleSidebarClose)
    }

    public override render() {
        return html`
            <aside>
                <mdc-docs-sidebar
                    .active=${this.active}
                    .open=${this.sidebarOpen}
                    .modal=${this.compact}
                ></mdc-docs-sidebar>
            </aside>
            <header>
                <div class="header-start">
                    <mdc-icon-button
                        aria-label="Toggle navigation menu"
                        aria-expanded=${this.sidebarOpen ? 'true' : 'false'}
                        @click=${this.toggleSidebar}
                    >
                        <mdc-icon>menu</mdc-icon>
                    </mdc-icon-button>
                    <span class="page-title">${this.pageTitle}</span>
                </div>
                <mdc-switch
                    id="docs-theme-switch"
                    show-unselected-icon
                    @change=${this.onThemeChange}
                >
                    <mdc-icon filled slot="icon-selected">dark_mode</mdc-icon>
                    <mdc-icon slot="icon-unselected">dark_mode</mdc-icon>
                </mdc-switch>
            </header>
            <main>
                <slot></slot>
            </main>
        `
    }

    private readonly toggleSidebar = (): void => {
        this.sidebarOpen = !this.sidebarOpen
    }

    private readonly handleSidebarClose = (): void => {
        this.sidebarOpen = false
    }

    private onThemeChange = (event: Event) => {
        const target = event.target as HTMLElement & { selected?: boolean }
        document.documentElement.style.colorScheme = target.selected ? 'dark' : 'light'
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-shell': DocsShell
    }
}
