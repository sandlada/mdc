/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { live } from 'lit/directives/live.js'
import '../../elevation/elevation'
import '../../icon-button/icon-button'
import { SearchViewVariant, type IMDCSearchBar, type IMDCSearchView } from '../search.interface'
import { SearchViewStyle } from '../search-view.style'

/**
 * Internal base class for `mdc-search-view`.
 */
export abstract class BaseSearchView extends LitElement implements IMDCSearchView {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    static override styles = SearchViewStyle

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, reflect: true })
    public variant: SearchViewVariant = SearchViewVariant.Fullscreen

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = 'Search'

    @property({ type: String })
    public value: string = ''

    @property({ type: String, reflect: true })
    public for: string = ''

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @query('.dialog')
    private readonly dialogElement!: HTMLDialogElement | null

    @query('.input')
    private readonly inputElement!: HTMLInputElement | null

    private searchBarValue: IMDCSearchBar | null = null

    public get searchBar(): IMDCSearchBar | null {
        return this.searchBarValue
    }

    public set searchBar(bar: IMDCSearchBar | null) {
        this.setupWithSearchBar(bar)
    }

    /**
     * Binds this `SearchView` to a `SearchBar` (Android `setupWithSearchBar` parity).
     */
    public setupWithSearchBar(searchBar: IMDCSearchBar | null): void {
        if (this.searchBarValue === searchBar) {
            return
        }
        const prev = this.searchBarValue
        this.searchBarValue = searchBar
        if (prev && prev.searchView === this) {
            prev.searchView = null
        }
        if (searchBar && searchBar.searchView !== this) {
            searchBar.searchView = this
        }
        if (searchBar) {
            searchBar.syncFromSearchView(this.value, this.open)
        }
    }

    /**
     * Opens the search view and focuses its search input.
     */
    public show(): void {
        if (this.open) {
            return
        }
        this.open = true
    }

    /**
     * Closes the search view and restores focus to the linked `mdc-search-bar`.
     */
    public close(): void {
        if (!this.open) {
            return
        }
        this.open = false
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer && this.for && !this.searchBarValue) {
            queueMicrotask(() => this.resolveForTarget())
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (isServer) return

        if (changedProperties.has('for') && this.for) {
            this.resolveForTarget()
        }

        if (changedProperties.has('open')) {
            if (this.open) {
                this.openDialog()
            } else {
                this.closeDialog()
            }
        }
    }

    protected override render(): TemplateResult {
        const isDocked = this.variant === SearchViewVariant.Docked
        const classes = {
            fullscreen: !isDocked,
            docked: isDocked,
            quick: this.quick,
        }

        return html`
            <dialog
                class="dialog ${classMap(classes)}"
                part="dialog"
                aria-label=${this.supportingText}
                @cancel=${this.handleDialogCancel}
                @click=${this.handleDialogClick}
            >
                <mdc-elevation></mdc-elevation>
                <div class="surface" part="surface">
                    <div class="header" part="header">
                        <span class="leading-icon">
                            <slot name="leading-icon">
                                <mdc-icon-button
                                    class="back-button"
                                    aria-label="Close search"
                                    @click=${this.handleBackClick}
                                >
                                    ${this.renderBackIcon()}
                                </mdc-icon-button>
                            </slot>
                        </span>
                        <input
                            class="input"
                            type="search"
                            .value=${live(this.value)}
                            placeholder=${this.supportingText}
                            aria-label=${this.supportingText}
                            @input=${this.handleInput}
                            @change=${this.handleChange}
                            @keydown=${this.handleKeydown}
                        />
                        <span class="trailing-icon">
                            <mdc-icon-button
                                class="clear-button"
                                aria-label="Clear search"
                                ?hidden=${this.value.length === 0}
                                @click=${this.handleClearClick}
                            >
                                ${this.renderClearIcon()}
                            </mdc-icon-button>
                            <slot name="trailing-icon"></slot>
                        </span>
                    </div>
                    <div class="divider" aria-hidden="true"></div>
                    <div class="body" part="body">
                        <slot></slot>
                    </div>
                </div>
            </dialog>
        `
    }

    protected renderBackIcon(): TemplateResult {
        return html`<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>`
    }

    protected renderClearIcon(): TemplateResult {
        return html`<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`
    }

    private resolveForTarget(): void {
        if (!this.for || isServer) return
        const root = this.getRootNode()
        const target = root instanceof Document || root instanceof ShadowRoot
            ? root.getElementById(this.for)
            : null
        if (target && 'syncFromSearchView' in target) {
            this.setupWithSearchBar(target as IMDCSearchBar)
        }
    }

    private openDialog(): void {
        const dialog = this.dialogElement
        if (!dialog || dialog.open) {
            return
        }

        const openEvent = new Event('open', { cancelable: true })
        this.dispatchEvent(openEvent)
        if (openEvent.defaultPrevented) {
            this.open = false
            return
        }

        if (this.searchBarValue) {
            this.value = this.searchBarValue.value
            this.searchBarValue.syncFromSearchView(this.value, true)
        }

        this.updateDockedGeometry()
        dialog.showModal?.()
        this.inputElement?.focus()
        this.dispatchEvent(new Event('opened'))
    }

    private closeDialog(): void {
        const dialog = this.dialogElement
        if (!dialog || !dialog.open) {
            return
        }

        const closeEvent = new Event('close', { cancelable: true })
        this.dispatchEvent(closeEvent)
        if (closeEvent.defaultPrevented) {
            this.open = true
            return
        }

        dialog.close?.()
        if (this.searchBarValue) {
            this.searchBarValue.syncFromSearchView(this.value, false)
            this.searchBarValue.focus()
        }
        this.dispatchEvent(new Event('closed'))
    }

    private updateDockedGeometry(): void {
        const dialog = this.dialogElement
        if (!dialog) return

        if (this.variant !== SearchViewVariant.Docked) {
            dialog.style.removeProperty('--_docked-top')
            dialog.style.removeProperty('--_docked-left')
            dialog.style.removeProperty('--_docked-width')
            dialog.style.removeProperty('--_docked-transform')
            return
        }

        if (this.searchBarValue) {
            const rect = this.searchBarValue.getBoundingClientRect()
            const width = Math.max(360, Math.min(720, rect.width || 560))
            const maxLeft = Math.max(8, window.innerWidth - width - 8)
            const left = Math.max(8, Math.min(rect.left, maxLeft))
            const top = Math.max(8, Math.min(rect.top, window.innerHeight - 120))
            dialog.style.setProperty('--_docked-top', `${top}px`)
            dialog.style.setProperty('--_docked-left', `${left}px`)
            dialog.style.setProperty('--_docked-width', `${width}px`)
            dialog.style.setProperty('--_docked-transform', 'none')
        } else {
            dialog.style.setProperty('--_docked-top', '16px')
            dialog.style.setProperty('--_docked-left', '50%')
            dialog.style.setProperty('--_docked-width', 'min(560px, calc(100vw - 32px))')
            dialog.style.setProperty('--_docked-transform', 'translateX(-50%)')
        }
    }

    private handleBackClick(): void {
        this.close()
    }

    private handleClearClick(): void {
        this.value = ''
        this.searchBarValue?.syncFromSearchView(this.value, this.open)
        this.inputElement?.focus()
        this.dispatchValueEvent('input')
        this.dispatchValueEvent('clear')
    }

    private handleDialogCancel(e: Event): void {
        e.preventDefault()
        this.close()
    }

    private handleDialogClick(e: MouseEvent): void {
        if (this.variant === SearchViewVariant.Docked && e.target === this.dialogElement) {
            this.close()
        }
    }

    private handleInput(e: Event): void {
        this.value = (e.target as HTMLInputElement).value
        e.stopPropagation()
        this.searchBarValue?.syncFromSearchView(this.value, this.open)
        this.dispatchValueEvent('input')
    }

    private handleChange(e: Event): void {
        this.value = (e.target as HTMLInputElement).value
        e.stopPropagation()
        this.searchBarValue?.syncFromSearchView(this.value, this.open)
        this.dispatchValueEvent('change')
    }

    private handleKeydown(e: KeyboardEvent): void {
        if (e.key !== 'Enter' || e.isComposing || e.repeat) {
            return
        }
        this.value = (e.target as HTMLInputElement).value
        this.searchBarValue?.syncFromSearchView(this.value, this.open)
        this.dispatchValueEvent('search')
    }

    private dispatchValueEvent(type: 'input' | 'change' | 'search' | 'clear'): void {
        this.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: {
                value: this.value,
            },
        }))
    }
}
