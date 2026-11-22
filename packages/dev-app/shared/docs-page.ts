/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ContextProvider } from '@lit/context'
import { resolvePaneScaffoldScene } from '@sandlada/mdc/components/pane-scaffold/index'
import { getDemo, listDemos, loadDemos } from './demo-loader.js'
import { Components } from './docs-manifest.js'
import { DocsPageTitleContext } from './contexts/index.js'
import './docs-shell.js'

const DemoImports = Object.freeze({ resolvePaneScaffoldScene })

/**
 * `<mdc-docs-page component="button">` wraps a component showcase page.
 * Renders a sidebar with the active component highlighted, a theme-switch
 * header, and a default slot for free-form demo content. Publishes its
 * `title` via `docsPageTitleContext` so the shell header can display it.
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
            background: transparent;
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
    public override title: string = ''

    @property({ type: String })
    public subtitle: string = ''

    /**
     * Comma-separated demo basenames, e.g. "button.variant.demo.html,button.icon.demo.html".
     * Controls ordering; demo files not listed here are appended automatically.
     */
    @property({ type: String, attribute: 'demo-files' })
    public demoFiles: string = ''

    private titleProvider: ContextProvider<typeof DocsPageTitleContext>

    @state()
    private demoVersion = 0

    private lastDemoKey = ''

    public constructor() {
        super()
        this.titleProvider = new ContextProvider(this, { context: DocsPageTitleContext })
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        window.addEventListener('popstate', this.handlePopState)
        this.publishTitle()
        this.ensureDemos()
    }

    public override disconnectedCallback(): void {
        window.removeEventListener('popstate', this.handlePopState)
        super.disconnectedCallback()
    }

    private readonly handlePopState = (): void => {
        const match = /\/components\/([^/]+)\/?$/.exec(window.location.pathname)
        if (match === null) return
        const entry = Components.find((c) => c.name === match[1])
        if (entry === undefined || entry.custom) {
            window.location.reload()
            return
        }
        this.component = entry.name
        this.title = entry.label
        this.subtitle = entry.subtitle
        this.demoFiles = entry.demoFiles
        document.title = `${entry.label} — MDC Docs`
    }

    protected override updated(): void {
        this.publishTitle()
        this.ensureDemos()
        this.executeDemoScripts()
    }

    private publishTitle(): void {
        this.titleProvider.setValue(this.title || this.component)
    }

    private demoFileList(): string[] {
        // Explicitly-ordered demos first (curated via `demo-files`), then any
        // `*.demo.html` files in the component's demo folder that aren't listed —
        // so newly-added demo files show up without editing the page's HTML.
        const explicit = this.demoFiles.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        const seen = new Set(explicit)
        return [...explicit, ...listDemos(this.component).filter((f) => !seen.has(f))]
    }

    private ensureDemos(): void {
        const files = this.demoFileList()
        const key = `${this.component}|${files.join(',')}`
        if (key === this.lastDemoKey) return
        this.lastDemoKey = key
        if (files.length === 0) return
        const currentKey = key
        void loadDemos(this.component)
            .catch((err) => {
                console.error('Failed to load demos:', err)
            })
            .finally(() => {
                if (this.lastDemoKey !== currentKey || !this.isConnected) return
                this.demoVersion++
            })
    }

    public override render() {
        void this.demoVersion
        const files = this.demoFileList()
        const demos = files.map((file) => ({
            file,
            label: file.replace(/\.demo\.html$/, '').replace(/^[^.]+\./, ''),
            content: getDemo(this.component, file),
        }))
        const pendingCount = demos.filter((d) => d.content.length === 0).length

        return html`
            <mdc-docs-shell active=${this.component}>
                <h1>${this.title || this.component}</h1>
                ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : ''}
                ${pendingCount > 0 ? html`<p class="subtitle">Loading ${pendingCount} demo${pendingCount === 1 ? '' : 's'}…</p>` : ''}
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

    protected override firstUpdated() {
        this.executeDemoScripts()
    }

    private executeDemoScripts(): void {
        const root = this.shadowRoot ?? this
        const scriptTags = root.querySelectorAll('script')
        scriptTags.forEach((s) => {
            if (s.dataset['executed']) return
            s.dataset['executed'] = 'true'
            try {
                const scriptBody = s.textContent || ''
                if (!scriptBody.trim()) return

                const runner = new Function('root', 'document', 'demoImports', `
                    const customDocument = new Proxy(document, {
                        get(target, prop) {
                            if (prop === 'getElementById') {
                                return (id) => root.querySelector('#' + id) || target.getElementById(id);
                            }
                            if (prop === 'querySelector') {
                                return (sel) => root.querySelector(sel) || target.querySelector(sel);
                            }
                            if (prop === 'querySelectorAll') {
                                return (sel) => {
                                    const inRoot = root.querySelectorAll(sel);
                                    return inRoot.length > 0 ? inRoot : target.querySelectorAll(sel);
                                };
                            }
                            const val = target[prop];
                            return typeof val === 'function' ? val.bind(target) : val;
                        }
                    });
                    (function(document) {
                        ${scriptBody}
                    })(customDocument);
                `)
                runner(root, document, DemoImports)
            } catch (err) {
                console.error('Error executing demo script:', err)
            }
        })
    }
}

import { unsafeHTML } from 'lit/directives/unsafe-html.js'
function unsafeHtml(s: string) { return unsafeHTML(s) }

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-page': DocsPage
    }
}
