/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getDemo } from './demo-loader.js'
import './docs-shell.js'

/**
 * `<mdc-docs-page component="button">` wraps a component showcase page.
 * Renders a sidebar with the active component highlighted, a theme-switch
 * header, and a default slot for free-form demo content.
 *
 * For components with `*.demo.html` snippets, use the `demoFiles` attribute
 * (comma-separated basenames) and they will be rendered as labeled sections.
 */
@customElement('mdc-docs-page')
export class DocsPage extends LitElement {

    public static override styles = css`
        :host {
            display: contents;
        }
        h1 {
            margin: 0 0 8px;
            color: var(--md-sys-color-on-surface);
            font-size: 28px;
            font-weight: 400;
        }
        .subtitle {
            color: var(--md-sys-color-on-surface-variant);
            margin: 0 0 24px;
        }
        section {
            margin-bottom: 32px;
        }
        section h2 {
            margin: 0 0 12px;
            color: var(--md-sys-color-on-surface);
            font-size: 18px;
            font-weight: 500;
        }
        .demo-frame {
            padding: 24px;
            border-radius: 12px;
            background: var(--md-sys-color-surface-container-low);
            border: 1px solid var(--md-sys-color-outline-variant);
            overflow-x: auto;
        }
        mdc-docs-shell {
            height: 100%;
        }
    `

    @property({ type: String })
    public component: string = ''

    @property({ type: String })
    public title: string = ''

    @property({ type: String })
    public subtitle: string = ''

    /** Comma-separated demo basenames, e.g. "button.variant.demo.html,button.icon.demo.html". */
    @property({ type: String, attribute: 'demo-files' })
    public demoFiles: string = ''

    public override render() {
        const demos = this.demoFiles
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((file) => ({
                file,
                label: file.replace(/\.demo\.html$/, '').replace(/^[^.]+\./, ''),
                content: getDemo(this.component, file),
            }))

        return html`
            <mdc-docs-shell active=${this.component}>
                <h1>${this.title || this.component}</h1>
                ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : ''}
                ${demos.map((d) => html`
                    <section>
                        <h2>${d.label}</h2>
                        <div class="demo-frame">${unsafeHtml(d.content)}</div>
                    </section>
                `)}
                <slot></slot>
            </mdc-docs-shell>
        `
    }
}

import { unsafeHTML } from 'lit/directives/unsafe-html.js'
function unsafeHtml(s: string) { return unsafeHTML(s) }

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-page': DocsPage
    }
}