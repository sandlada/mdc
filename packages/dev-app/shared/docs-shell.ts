/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { docsPageTitleContext } from './contexts/index.js'
import './base-imports.js'
import './docs-sidebar.js'

/**
 * `<mdc-docs-shell active="button">` is the full-page layout for the docs site.
 * Provides a sticky sidebar (left), a header showing the current page title
 * (via `docsPageTitleContext`) with a theme switch (top right), and a
 * scrolling main slot. Use `<mdc-docs-page>` if you want a one-shot wrapper.
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
        .page-title {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

    @consume({ context: docsPageTitleContext, subscribe: true })
    @property({ type: String, attribute: false })
    public pageTitle: string = ''

    public override render() {
        return html`
            <aside>
                <mdc-docs-sidebar .active=${this.active}></mdc-docs-sidebar>
            </aside>
            <header>
                <span class="page-title">${this.pageTitle}</span>
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
