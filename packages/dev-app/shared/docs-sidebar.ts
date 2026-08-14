/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const COMPONENTS: ReadonlyArray<{ name: string; label: string }> = [
    { name: 'badge',            label: 'Badge' },
    { name: 'button',           label: 'Button' },
    { name: 'divider',          label: 'Divider' },
    { name: 'elevation',        label: 'Elevation' },
    { name: 'fab',              label: 'FAB' },
    { name: 'focus-ring',       label: 'Focus Ring' },
    { name: 'icon',             label: 'Icon' },
    { name: 'icon-button',      label: 'Icon Button' },
    { name: 'navigation-bar',   label: 'Navigation Bar' },
    { name: 'navigation-drawer', label: 'Navigation Drawer' },
    { name: 'navigation-rail',  label: 'Navigation Rail' },
    { name: 'navigation-tab',   label: 'Navigation Tab' },
    { name: 'radio-button',     label: 'Radio Button' },
    { name: 'ripple',           label: 'Ripple' },
    { name: 'search',           label: 'Search' },
    { name: 'slider',           label: 'Slider' },
    { name: 'switch',           label: 'Switch' },
    { name: 'tabs',             label: 'Tabs' },
    { name: 'typography',       label: 'Typography' },
]

@customElement('mdc-docs-sidebar')
export class DocsSidebar extends LitElement {

    public static override styles = css`
        :host {
            display: block;
            height: 100%;
        }
        nav {
            display: flex;
            flex-direction: column;
            padding: 8px 0;
        }
        a {
            display: block;
            padding: 8px 16px;
            color: var(--md-sys-color-on-surface);
            text-decoration: none;
            border-radius: 0 16px 16px 0;
            margin-right: 8px;
            transition: background-color 0.15s ease;
        }
        a:hover {
            background: var(--md-sys-color-surface-container-high);
        }
        a.active {
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            font-weight: 500;
        }
    `

    @property({ type: String, reflect: true })
    public active: string = ''

    public override render() {
        return html`
            <nav>
                ${COMPONENTS.map((c) => html`
                    <a
                        href="/components/${c.name}/"
                        class=${c.name === this.active ? 'active' : ''}
                    >${c.label}</a>
                `)}
                <a
                    href="/"
                    class=${this.active === 'home' ? 'active' : ''}
                >Home</a>
            </nav>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-sidebar': DocsSidebar
    }
}