/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseComponents, playground, regularComponents, type ComponentEntry } from './docs-manifest.js'

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
            box-sizing: border-box;
            padding: 4px 0px 4px 0px;
        }
        section {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }
        h3 {
            all: unset;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            box-sizing: border-box;
            margin-top: 16px;
            margin-bottom: 8px;
            padding-inline: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant);
        }
        section:first-child h2 {
            margin-top: 4px;
        }
        a {
            all: unset;
            box-sizing: border-box;
            height: 40px;
            margin-right: 8px;
            padding-inline: 12px;
            border-radius: 0 999px 999px 0;
            transition: background-color 0.15s ease;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }
        a:hover {
            background: var(--md-sys-color-surface-container-high);
        }
        a.active {
            background: var(--md-sys-color-primary-container);
        }
        a > span {
            text-decoration: none;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            user-select: none;
            font-weight: 400;
            color: var(--md-sys-color-on-surface);
        }
        a.active > span {
            font-weight: 500;
            color: var(--md-sys-color-on-primary-container);
        }
    `

    @property({ type: String, reflect: true })
    public active: string = ''

    public override render() {
        return html`
            <nav>
                <section aria-label="Style Playground">
                    <h3>Style Playground</h3>
                    ${playground !== undefined ? this.renderLinks([playground]) : ''}
                </section>
                <section aria-label="Base Components">
                    <h3>Base Components</h3>
                    ${this.renderLinks(baseComponents)}
                </section>
                <section aria-label="Components">
                    <h3>Components</h3>
                    ${this.renderLinks(regularComponents)}
                </section>
            </nav>
        `
    }

    private renderLinks(entries: ComponentEntry[]) {
        return entries.map((c) => html`
            <a
                href="/components/${c.name}/"
                class=${c.name === this.active ? 'active' : ''}
            >
                <span>${c.label}</span>
            </a>
        `)
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-sidebar': DocsSidebar
    }
}
