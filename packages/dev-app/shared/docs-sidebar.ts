/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { Easing } from '@sandlada/mdk'
import {
    BaseComponents,
    ComponentGroupByName,
    ComponentNavigation,
    Components,
    type ComponentEntry,
    type ComponentGroup,
} from './docs-manifest.js'

/**
 * Cancelable event fired when the sidebar requests to close
 * (scrim click or Escape while modal). The host should set `open = false`
 * unless the close is prevented.
 */
export const DocsSidebarCloseEvent = 'docs-sidebar-close'

export interface DocsSidebarCloseDetail {
    reason: 'scrim' | 'escape'
}

const PanelOpenMs = 400
const PanelCloseMs = 200
const ScrimPeakOpacity = 0.32

/**
 * `<mdc-docs-sidebar>` is the docs site navigation rendered as a dialog.
 *
 * Controlled component: the host sets `open` / `modal` and listens for
 * `docs-sidebar-close`. Below the `md` breakpoint (`modal`) it behaves as a
 * modal dialog with a scrim; otherwise it renders as a static in-flow panel.
 *
 * Open / close transitions follow the Material dialog animation logic
 * (WAAPI panel slide + linear scrim fade, Emphasized open /
 * EmphasizedAccelerate close), adapted from a vertical dialog slide to a
 * horizontal drawer slide.
 */
@customElement('mdc-docs-sidebar')
export class DocsSidebar extends LitElement {

    public static override styles = css`
        :host {
            display: block;
            height: 100%;
        }
        dialog {
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            max-width: none;
            max-height: none;
            color: inherit;
        }
        dialog::backdrop {
            background: none;
        }
        :host(:not([modal])) dialog {
            position: static;
            width: 100%;
            height: 100%;
            display: block;
            overflow: visible;
        }
        :host([modal]) dialog {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
            overflow: hidden;
        }
        .scrim {
            position: absolute;
            inset: 0;
            background: #000;
            opacity: 0.32;
            cursor: pointer;
        }
        .panel {
            background: var(--md-sys-color-surface-container);
            border-right: 1px solid var(--md-sys-color-outline-variant);
            overflow-y: auto;
            overscroll-behavior: contain;
        }
        :host(:not([modal])) .panel {
            width: 100%;
            height: 100%;
        }
        :host([modal]) .panel {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 240px;
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
        a, .group-toggle {
            all: unset;
            box-sizing: border-box;
            height: 32px;
            margin-right: 8px;
            padding-inline: 26px 11px;
            border: 1px solid transparent;
            border-radius: 0 999px 999px 0;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }
        @media (prefers-reduced-motion: no-preference) {
            a, .group-toggle {
                transition: background-color 0.15s ease;
            }
        }
        a:hover, .group-toggle:hover {
            background: var(--md-sys-color-surface-container-high);
        }
        a:focus-visible, .group-toggle:focus-visible {
            outline: 2px solid var(--md-sys-color-primary);
            outline-offset: -2px;
        }
        a[aria-current='page'] {
            background: var(--md-sys-color-primary-container);
        }
        a > span {
            text-decoration: none;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            user-select: none;
            font-size: 14px;
            font-weight: 400;
            line-height: 1;
            color: var(--md-sys-color-on-surface);
        }
        a[aria-current='page'] > span {
            color: var(--md-sys-color-on-primary-container);
        }
        .group-toggle {
            position: relative;
            font-size: 14px;
            font-weight: 400;
            line-height: 1;
            color: var(--md-sys-color-on-surface);
        }
        .group-toggle::before {
            content: '';
            position: absolute;
            inset-inline-start: 11px;
            inset-block: 0;
            margin-block: auto;
            inline-size: 8px;
            block-size: 6px;
            background-color: currentColor;
            clip-path: polygon(0 0, 50% 60%, 100% 0, 100% 35%, 50% 100%, 0 35%);
            rotate: -90deg;
        }
        .group-toggle:dir(rtl)::before {
            rotate: 90deg;
        }
        .group-toggle[aria-expanded='true']::before {
            rotate: 0deg;
        }
        .group-links:not([hidden]) {
            display: flex;
            flex-direction: column;
        }
        @media (prefers-contrast: more) {
            .group-toggle, a[aria-current='page'] {
                border: 1px solid currentColor;
            }
        }
        @media (forced-colors: active) {
            .scrim {
                background: Canvas;
                opacity: 0.6;
            }
            .panel {
                border-right: 1px solid CanvasText;
            }
            .group-toggle, a[aria-current='page'] {
                border: 1px solid ButtonText;
            }
            .group-toggle::before {
                forced-color-adjust: none;
                background-color: ButtonText;
            }
            a:hover, .group-toggle:hover, a:focus-visible, .group-toggle:focus-visible {
                outline: 2px solid Highlight;
                outline-offset: -2px;
            }
        }
    `

    @property({ type: String, reflect: true })
    public active: string = ''

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Boolean, reflect: true })
    public modal: boolean = false

    @state()
    private openGroups = new Set<string>()

    @query('dialog')
    private declare readonly dialogEl: HTMLDialogElement | null

    @query('.panel')
    private declare readonly panelEl: HTMLElement | null

    @query('.scrim')
    private declare readonly scrimEl: HTMLElement | null

    private animationsAborter: AbortController | null = null

    private modalShown: boolean = false

    public override render() {
        return html`
            <dialog
                ?open=${!this.modal}
                aria-label=${this.modal ? 'Documentation navigation' : nothing}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
            >
                ${this.modal ? html`
                    <span
                        aria-hidden="true"
                        class="scrim"
                        @click=${this.handleScrimClick}
                    ></span>
                ` : nothing}
                <div class="panel">
                    <nav>
                        <section aria-label="Base Components">
                            <h3>Base Components</h3>
                            ${BaseComponents.map((entry) => this.renderLink(entry))}
                        </section>
                        <section aria-label="Components">
                            <h3>Components</h3>
                            ${ComponentNavigation.map((item) => 'entries' in item
                                ? this.renderGroup(item)
                                : this.renderLink(item))}
                        </section>
                        <section aria-label="Testing">
                            <h3>Testing</h3>
                            <a href="/form-qa.html"
                                aria-current=${this.active === 'form-qa' ? 'page' : nothing}>
                                <span>Form QA</span>
                            </a>
                        </section>
                    </nav>
                </div>
            </dialog>
        `
    }

    protected override willUpdate(changed: Map<string, unknown>): void {
        if (changed.has('active')) {
            const group = ComponentGroupByName.get(this.active)
            if (group !== undefined) {
                this.openGroups.add(group.id)
            }
        }
    }

    protected override updated(changed: Map<string, unknown>): void {
        if (changed.has('open') || changed.has('modal')) {
            void this.syncDialog()
        }
    }

    public override disconnectedCallback(): void {
        this.abortAnimations()
        this.modalShown = false
        super.disconnectedCallback()
    }

    private renderGroup(group: ComponentGroup) {
        const open = this.openGroups.has(group.id)
        const linksId = `group-${group.id}`
        return html`
            <button
                type="button"
                class="group-toggle"
                aria-expanded=${open ? 'true' : 'false'}
                aria-controls=${linksId}
                @click=${() => this.toggleGroup(group.id)}
            >${group.label}</button>
            <div id=${linksId} class="group-links" ?hidden=${!open}>
                ${group.entries.map((entry) => this.renderLink(entry))}
            </div>
        `
    }

    private toggleGroup(id: string): void {
        const openGroups = new Set(this.openGroups)
        if (!openGroups.delete(id)) {
            openGroups.add(id)
        }
        this.openGroups = openGroups
    }

    private renderLink(entry: ComponentEntry) {
        return html`
            <a
                href=${entry.href}
                aria-current=${entry.name === this.active ? 'page' : nothing}
                @click=${(event: MouseEvent) => this.handleLinkClick(event, entry)}
            >
                <span>${entry.label}</span>
            </a>
        `
    }

    private handleLinkClick(event: MouseEvent, entry: ComponentEntry): void {
        if (
            event.defaultPrevented
            || event.button !== 0
            || event.metaKey
            || event.ctrlKey
            || event.shiftKey
            || event.altKey
            || entry.custom
        ) {
            return
        }

        const currentEntry = Components.find((c) => c.name === this.active)
        if (currentEntry?.custom) {
            return
        }

        const pageEl = document.querySelector('mdc-docs-page')
        if (pageEl === null) {
            return
        }

        event.preventDefault()
        if (entry.name !== this.active) {
            history.pushState(null, '', entry.href)
            document.title = `${entry.label} — MDC Docs`
            pageEl.setAttribute('component', entry.name)
            pageEl.setAttribute('title', entry.label)
            pageEl.setAttribute('subtitle', entry.subtitle)
            pageEl.setAttribute('demo-files', entry.demoFiles)
        }
        if (this.modal) {
            this.requestClose('scrim')
        }
    }

    private async syncDialog(): Promise<void> {
        await this.updateComplete
        const dialog = this.dialogEl
        if (dialog === null || !this.isConnected) {
            return
        }
        if (!this.modal) {
            if (this.modalShown) {
                this.abortAnimations()
                if (dialog.open) {
                    dialog.close()
                }
                this.modalShown = false
            }
            return
        }
        if (this.open && !dialog.open) {
            await this.showModal()
            return
        }
        if (!this.open && dialog.open) {
            await this.hideModal()
        }
    }

    private async showModal(): Promise<void> {
        const dialog = this.dialogEl
        if (dialog === null) {
            return
        }
        if (dialog.open && !this.modalShown) {
            this.abortAnimations()
            dialog.close()
        }
        if (this.modalShown) {
            return
        }
        dialog.showModal()
        this.modalShown = true
        await this.animateSidebar(true)
        this.dispatchEvent(new Event('opened', { bubbles: true, composed: true }))
    }

    private async hideModal(): Promise<void> {
        const dialog = this.dialogEl
        if (dialog === null || !dialog.open || !this.modalShown) {
            return
        }
        await this.animateSidebar(false)
        dialog.close()
        this.modalShown = false
        this.dispatchEvent(new Event('closed', { bubbles: true, composed: true }))
    }

    private requestClose(reason: DocsSidebarCloseDetail['reason']): void {
        if (!this.modal || !this.open) {
            return
        }
        const prevented = !this.dispatchEvent(
            new CustomEvent<DocsSidebarCloseDetail>(DocsSidebarCloseEvent, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { reason },
            }),
        )
        if (prevented) {
            return
        }
        this.open = false
    }

    private readonly handleScrimClick = (): void => {
        this.requestClose('scrim')
    }

    private readonly handleDialogClick = (event: MouseEvent): void => {
        if (event.target === this.dialogEl) {
            this.requestClose('scrim')
        }
    }

    private readonly handleCancel = (event: Event): void => {
        event.preventDefault()
        this.requestClose('escape')
    }

    private prefersReducedMotion(): boolean {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    private abortAnimations(): void {
        this.animationsAborter?.abort()
        this.animationsAborter = null
    }

    private async animateSidebar(opening: boolean): Promise<void> {
        this.abortAnimations()
        const aborter = new AbortController()
        this.animationsAborter = aborter
        if (this.prefersReducedMotion()) {
            return
        }
        const animations: Animation[] = []
        if (this.panelEl !== null) {
            animations.push(this.panelEl.animate(
                opening
                    ? [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }]
                    : [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
                {
                    duration: opening ? PanelOpenMs : PanelCloseMs,
                    easing: opening
                        ? Easing.Emphasized.ToCSSValue()
                        : Easing.EmphasizedAccelerate.ToCSSValue(),
                },
            ))
        }
        if (this.scrimEl !== null) {
            animations.push(this.scrimEl.animate(
                opening
                    ? [{ opacity: '0' }, { opacity: String(ScrimPeakOpacity) }]
                    : [{ opacity: String(ScrimPeakOpacity) }, { opacity: '0' }],
                {
                    duration: opening ? PanelOpenMs : PanelCloseMs,
                    easing: 'linear',
                },
            ))
        }
        for (const animation of animations) {
            aborter.signal.addEventListener('abort', () => {
                animation.cancel()
            })
        }
        await Promise.all(
            animations.map((animation) => animation.finished.catch(() => {
            })),
        )
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docs-sidebar': DocsSidebar
    }
}
