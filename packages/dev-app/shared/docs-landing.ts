/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { components } from './docs-manifest.js'

/**
 * `<mdc-docs-landing>` renders the landing page's component grid. The list is
 * derived live from `docs-manifest` (import.meta.glob), so new component pages
 * appear here automatically in dev.
 */
@customElement('mdc-docs-landing')
export class DocsLanding extends LitElement {

    public static override styles = css`
        :host {
            display: contents;
        }
    `

    public override render() {
        return html`
            <section class="docs-landing-grid">
                ${components.map((c) => html`<a href=${c.href}>${c.label}</a>`)}
            </section>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-landing': DocsLanding
    }
}
