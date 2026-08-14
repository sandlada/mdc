/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { components } from './docs-manifest.js'

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
                ${components.map((c) => html`
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