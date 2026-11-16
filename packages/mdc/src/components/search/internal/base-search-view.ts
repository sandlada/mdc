/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { live } from 'lit/directives/live.js'
import '../../elevation/elevation'
import '../../icon-button/icon-button'
import { SearchViewVariant, type IMDCSearchBar, type IMDCSearchView } from '../search.interface'
import { SearchViewStyle } from '../search-view.style'

const SuggestionSelector = 'mdc-list-item, [role="option"], [role="menuitem"], a[href], button:not([disabled])'

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

    @query('.body')
    private readonly bodyElement!: HTMLElement | null

    @query('.divider')
    private readonly dividerElement!: HTMLElement | null

    @query('#default-slot')
    private readonly defaultSlotElement!: HTMLSlotElement | null

    private searchBarValue: IMDCSearchBar | null = null
    private activeAnimation: Animation | null = null
    private isClosing = false
    private viewportListenersAttached = false

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
        if (this.open && !this.isClosing) {
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

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cancelActiveAnimation()
        this.detachViewportListeners()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (isServer) return

        if (changedProperties.has('for') && this.for) {
            this.resolveForTarget()
        }

        if (changedProperties.has('open')) {
            if (this.open) {
                void this.openDialog()
            } else {
                void this.closeDialog()
            }
        } else if (changedProperties.has('variant') && this.open) {
            this.updateDockedGeometry()
            if (this.variant === SearchViewVariant.Docked) {
                this.attachViewportListeners()
            } else {
                this.detachViewportListeners()
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
                @keydown=${this.handleDialogKeydown}
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
                            @keydown=${this.handleInputKeydown}
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
                    <div class="divider" part="divider" aria-hidden="true"></div>
                    <div class="body" part="body">
                        <slot id="default-slot"></slot>
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

    private async openDialog(): Promise<void> {
        const dialog = this.dialogElement
        if (!dialog) return

        this.cancelActiveAnimation()
        this.isClosing = false

        if (!dialog.open) {
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
            if (this.variant === SearchViewVariant.Docked) {
                this.attachViewportListeners()
            }
            dialog.showModal?.()
        }

        if (this.inputElement) {
            this.inputElement.focus()
            const len = this.value.length
            this.inputElement.setSelectionRange?.(len, len)
        }

        await this.animateContainerTransform('open')
        if (this.open) {
            this.dispatchEvent(new Event('opened'))
        }
    }

    private async closeDialog(): Promise<void> {
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

        this.isClosing = true
        this.cancelActiveAnimation()
        await this.animateContainerTransform('close')
        if (this.open) {
            this.isClosing = false
            return
        }

        this.isClosing = false
        this.detachViewportListeners()
        dialog.close?.()
        if (this.searchBarValue) {
            this.searchBarValue.syncFromSearchView(this.value, false)
            this.searchBarValue.focus()
        }
        this.dispatchEvent(new Event('closed'))
    }

    private shouldSkipMotion(): boolean {
        return this.quick || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    }

    private cancelActiveAnimation(): void {
        if (this.activeAnimation) {
            this.activeAnimation.cancel()
            this.activeAnimation = null
        }
    }

    private async animateContainerTransform(direction: 'open' | 'close'): Promise<void> {
        const dialog = this.dialogElement
        if (!dialog || typeof dialog.animate !== 'function' || this.shouldSkipMotion()) {
            return
        }

        const isOpen = direction === 'open'
        const duration = isOpen ? 350 : 250
        const easing = isOpen
            ? Easing.Emphasized.ToCSSValue()
            : Easing.EmphasizedAccelerate.ToCSSValue()

        const dialogRect = dialog.getBoundingClientRect()
        const barRect = this.searchBarValue?.getBoundingClientRect()
        const hasValidBarRect = Boolean(barRect && barRect.width > 0 && barRect.height > 0 && dialogRect.width > 0 && dialogRect.height > 0)

        let startTransform = 'scale(0.96)'
        let startRadius = this.variant === SearchViewVariant.Docked ? '28px' : '0px'
        const endRadius = this.variant === SearchViewVariant.Docked ? '28px' : '0px'

        if (hasValidBarRect && barRect) {
            const dx = barRect.left - dialogRect.left
            const dy = barRect.top - dialogRect.top
            const sx = barRect.width / dialogRect.width
            const sy = barRect.height / dialogRect.height
            startTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
            startRadius = '28px'
        } else if (this.variant === SearchViewVariant.Docked) {
            startTransform = 'scaleY(0.88)'
        }

        const fromFrame: Keyframe = {
            transform: startTransform,
            transformOrigin: hasValidBarRect ? 'top left' : 'top center',
            borderRadius: startRadius,
            opacity: hasValidBarRect ? 0.85 : 0,
        }
        const toFrame: Keyframe = {
            transform: 'translate(0px, 0px) scale(1, 1)',
            transformOrigin: hasValidBarRect ? 'top left' : 'top center',
            borderRadius: endRadius,
            opacity: 1,
        }

        const keyframes = isOpen ? [fromFrame, toFrame] : [toFrame, fromFrame]
        const anim = dialog.animate(keyframes, { duration, easing, fill: 'none' })
        this.activeAnimation = anim

        if (isOpen) {
            this.bodyElement?.animate?.(
                [{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }],
                { duration, easing },
            )
            this.dividerElement?.animate?.(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: Math.round(duration * 0.6), easing },
            )
        } else {
            this.bodyElement?.animate?.(
                [{ opacity: 1 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }],
                { duration, easing },
            )
        }

        try {
            await anim.finished
        } catch {
            // Cancelled mid-flight
        } finally {
            if (this.activeAnimation === anim) {
                this.activeAnimation = null
            }
        }
    }

    private readonly handleViewportChange = (): void => {
        if (this.open && this.variant === SearchViewVariant.Docked) {
            this.updateDockedGeometry()
        }
    }

    private attachViewportListeners(): void {
        if (this.viewportListenersAttached || isServer) return
        this.viewportListenersAttached = true
        window.addEventListener('resize', this.handleViewportChange)
        window.addEventListener('scroll', this.handleViewportChange, { passive: true, capture: true })
    }

    private detachViewportListeners(): void {
        if (!this.viewportListenersAttached || isServer) return
        this.viewportListenersAttached = false
        window.removeEventListener('resize', this.handleViewportChange)
        window.removeEventListener('scroll', this.handleViewportChange, { capture: true })
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

    private getSuggestionItems(): HTMLElement[] {
        const slot = this.defaultSlotElement
        if (!slot) return []
        const items: HTMLElement[] = []
        for (const el of slot.assignedElements({ flatten: true })) {
            if (el.matches(SuggestionSelector)) {
                items.push(el as HTMLElement)
            }
            items.push(...(Array.from(el.querySelectorAll(SuggestionSelector)) as HTMLElement[]))
        }
        return items
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

    private handleDialogKeydown(e: KeyboardEvent): void {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
            return
        }
        const items = this.getSuggestionItems()
        if (!items.length) return

        const active = (this.getRootNode() as Document | ShadowRoot).activeElement as HTMLElement | null
        const currentIndex = active ? items.indexOf(active) : -1
        if (currentIndex === -1) return

        e.preventDefault()
        if (e.key === 'ArrowDown') {
            const next = items[Math.min(items.length - 1, currentIndex + 1)]
            next?.focus()
        } else if (currentIndex === 0) {
            this.inputElement?.focus()
        } else {
            items[currentIndex - 1]?.focus()
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

    private handleInputKeydown(e: KeyboardEvent): void {
        if (e.key === 'ArrowDown') {
            const items = this.getSuggestionItems()
            if (items.length > 0) {
                e.preventDefault()
                items[0].focus()
            }
            return
        }
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
