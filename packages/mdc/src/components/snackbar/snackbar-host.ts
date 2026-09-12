/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Snackbar Host component.
 *
 * Coordinates sequential, queued display of snackbars, handling async promises,
 * positioning, dismiss reasons, and event delegation.
 *
 * @example
 * ```html
 * <!-- Place in page or scaffold -->
 * <mdc-snackbar-host placement="bottom-center"></mdc-snackbar-host>
 *
 * <script>
 *   const host = document.querySelector('mdc-snackbar-host');
 *   const result = await host.show({
 *     message: 'Message sent',
 *     action: 'Undo',
 *     duration: 'short',
 *   });
 *   if (result === 'action') {
 *     console.log('User clicked Undo');
 *   }
 * </script>
 * ```
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './snackbar'
import {
    MDC_SNACKBAR_SHOW_EVENT,
    type ISnackbarHost,
    type ISnackbarQueueItem,
    type ISnackbarShowEventDetail,
    type SnackbarPlacement,
    type SnackbarResult,
    type SnackbarShowOptions,
} from './snackbar-host.interface'
import { SnackbarHostStyles } from './snackbar-host.style'

export * from './snackbar-host.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-snackbar-host': MDCSnackbarHost
    }
}

/**
 * @element mdc-snackbar-host
 *
 * Manages queued display of snackbars.
 *
 * @fires mdc-snackbar-show - Listens to bubbling snackbar show requests.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-snackbar-host')
export class MDCSnackbarHost extends LitElement implements ISnackbarHost {
    public static override styles = SnackbarHostStyles

    @property({ type: String, reflect: true })
    public placement: SnackbarPlacement = 'bottom-center'

    @property({ type: Boolean, reflect: true })
    public scoped: boolean = false

    @state()
    protected currentItem: ISnackbarQueueItem | null = null

    private readonly queue: ISnackbarQueueItem[] = []
    private isProcessing: boolean = false
    private currentResolve: ((result: SnackbarResult) => void) | null = null
    private currentResult: SnackbarResult | null = null

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        window.addEventListener(MDC_SNACKBAR_SHOW_EVENT, this.handleWindowShowEvent as EventListener)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        if (isServer) return
        window.removeEventListener(MDC_SNACKBAR_SHOW_EVENT, this.handleWindowShowEvent as EventListener)
        this.clearQueue()
    }

    /**
     * Shows a snackbar message through the host, queueing if another snackbar is currently visible.
     * Returns a promise that resolves when the snackbar closes.
     */
    public show(options: SnackbarShowOptions | string): Promise<SnackbarResult> {
        const normalizedOptions: SnackbarShowOptions = typeof options === 'string'
            ? { message: options }
            : options

        return new Promise<SnackbarResult>((resolve) => {
            const item: ISnackbarQueueItem = {
                id: Math.random().toString(36).slice(2),
                options: normalizedOptions,
                resolve,
            }
            this.queue.push(item)
            this.processQueue()
        })
    }

    /**
     * Dismisses the currently active snackbar.
     */
    public dismissCurrent(reason: SnackbarResult = 'dismiss'): void {
        if (!this.currentItem) return
        this.currentResult = reason
        const snackbar = this.shadowRoot?.querySelector('mdc-snackbar')
        if (snackbar) {
            snackbar.open = false
        }
    }

    /**
     * Clears all queued snackbars in waiting.
     */
    public clearQueue(): void {
        while (this.queue.length > 0) {
            const item = this.queue.shift()
            item?.resolve('dismiss')
        }
    }

    protected override render(): TemplateResult {
        if (!this.currentItem) {
            return html`<div class="container" role="status" aria-live="polite" aria-atomic="true"></div>`
        }

        const { options } = this.currentItem

        return html`
            <div class="container" role="status" aria-live="polite" aria-atomic="true">
                <mdc-snackbar
                    .open=${true}
                    .duration=${options.duration ?? 'short'}
                    .variant=${options.variant ?? 'inverse-surface'}
                    .animationMode=${options.animationMode ?? 'slide'}
                    .multiline=${options.multiline ?? false}
                    @snackbar-action=${this.handleSnackbarAction}
                    @snackbar-closed=${this.handleSnackbarClosed}
                >
                    ${options.message}
                    ${options.action ? html`<span slot="action">${options.action}</span>` : nothing}
                    ${options.hasCloseIcon ? html`<span slot="close-icon"></span>` : nothing}
                </mdc-snackbar>
            </div>
        `
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return

        this.isProcessing = true
        const nextItem = this.queue.shift()!
        this.currentItem = nextItem
        this.currentResolve = nextItem.resolve
        this.currentResult = null

        await this.updateComplete
    }

    private handleSnackbarAction(): void {
        this.currentResult = 'action'
    }

    private handleSnackbarClosed(): void {
        const result = this.currentResult ?? 'timeout'
        if (this.currentResolve) {
            this.currentResolve(result)
            this.currentResolve = null
        }

        this.currentItem = null
        this.isProcessing = false

        // Process next queued item
        setTimeout(() => {
            this.processQueue()
        }, 100)
    }

    private handleWindowShowEvent = (event: CustomEvent<ISnackbarShowEventDetail>): void => {
        const { resolve: customResolve, ...options } = event.detail || {}
        if (!options.message) return

        this.show(options as SnackbarShowOptions).then((result) => {
            customResolve?.(result)
        })
    }
}
