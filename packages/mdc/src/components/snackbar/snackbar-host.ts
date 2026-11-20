/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Material Design 3 Snackbar Host component.
 *
 * Coordinates sequential or stacked display of snackbars, handling async promises,
 * tag-based coalescing, positioning, dismiss reasons, and event delegation.
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './snackbar'
import type { MDCSnackbar } from './snackbar'
import {
    MdcSnackbarShowEvent,
    SnackbarPlacement,
    SnackbarResult,
    type ISnackbarHost,
    type ISnackbarQueueItem,
    type ISnackbarShowEventDetail,
    type SnackbarShowOptions,
} from './snackbar-host.interface'
import { SnackbarHostStyles } from './snackbar-host.style'
import {
    SnackbarAnimationMode,
    SnackbarDuration,
    SnackbarVariant,
    type ISnackbarCloseEventDetail,
} from './snackbar.interface'

export * from './snackbar-host.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-snackbar-host': MDCSnackbarHost
    }
}

/**
 * @element mdc-snackbar-host
 *
 * Manages queued or stacked display of snackbars.
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
    public placement: SnackbarPlacement = SnackbarPlacement.BottomCenter

    @property({ type: Boolean, reflect: true })
    public scoped: boolean = false

    @property({ type: Number, attribute: 'max-visible', reflect: true })
    public maxVisible: number = 1

    @state()
    protected activeItems: ISnackbarQueueItem[] = []

    private readonly queue: ISnackbarQueueItem[] = []
    private readonly activeResults = new Map<string, SnackbarResult>()
    private nextQueueTimer: ReturnType<typeof setTimeout> | null = null

    public override connectedCallback(): void {
        super.connectedCallback()
        if (typeof window === 'undefined') return
        window.addEventListener(MdcSnackbarShowEvent, this.handleWindowShowEvent as EventListener)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        if (typeof window === 'undefined') return
        window.removeEventListener(MdcSnackbarShowEvent, this.handleWindowShowEvent as EventListener)
        if (this.nextQueueTimer !== null) {
            clearTimeout(this.nextQueueTimer)
            this.nextQueueTimer = null
        }
        this.clearQueue()
    }

    /**
     * Shows a snackbar message through the host.
     * - If `options.tag` matches an active or queued snackbar, updates it in place and resets its timer.
     * - If `maxVisible > 1`, stacks up to `maxVisible` snackbars simultaneously so each remains interactive.
     * - If `options.replace` is true and the visible slots are full, dismisses the oldest active snackbar.
     * Returns a promise that resolves when the snackbar closes (or `'dismiss'` if superseded).
     */
    public show(options: SnackbarShowOptions | string): Promise<SnackbarResult> {
        const normalizedOptions: SnackbarShowOptions = typeof options === 'string'
            ? { message: options }
            : options

        return new Promise<SnackbarResult>((resolve) => {
            if (normalizedOptions.tag) {
                const activeMatch = this.activeItems.find((item) => item.options.tag === normalizedOptions.tag)
                if (activeMatch) {
                    activeMatch.resolve(SnackbarResult.Dismiss)
                    activeMatch.options = normalizedOptions
                    activeMatch.resolve = resolve
                    this.requestUpdate()
                    this.updateComplete.then(() => {
                        const el = this.shadowRoot?.querySelector<MDCSnackbar>(`mdc-snackbar[data-id="${activeMatch.id}"]`)
                        el?.resetAutoHideTimer()
                    })
                    return
                }

                const queuedMatch = this.queue.find((item) => item.options.tag === normalizedOptions.tag)
                if (queuedMatch) {
                    queuedMatch.resolve(SnackbarResult.Dismiss)
                    queuedMatch.options = normalizedOptions
                    queuedMatch.resolve = resolve
                    return
                }
            }

            const item: ISnackbarQueueItem = {
                id: Math.random().toString(36).slice(2),
                options: normalizedOptions,
                resolve,
            }

            const limit = Math.max(1, this.maxVisible)
            if (normalizedOptions.replace && this.activeItems.length >= limit) {
                this.queue.unshift(item)
                this.dismissItem(this.activeItems[0].id, SnackbarResult.Dismiss)
            } else {
                this.queue.push(item)
                this.processQueue()
            }
        })
    }

    /**
     * Dismisses the oldest currently active snackbar.
     */
    public dismissCurrent(reason: SnackbarResult = SnackbarResult.Dismiss): void {
        if (this.activeItems.length === 0) return
        this.dismissItem(this.activeItems[0].id, reason)
    }

    /**
     * Dismisses all currently active snackbars.
     */
    public dismissAll(reason: SnackbarResult = SnackbarResult.Dismiss): void {
        for (const item of [...this.activeItems]) {
            this.dismissItem(item.id, reason)
        }
    }

    /**
     * Clears all queued snackbars in waiting.
     */
    public clearQueue(): void {
        while (this.queue.length > 0) {
            const item = this.queue.shift()
            item?.resolve(SnackbarResult.Dismiss)
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class="container">
                ${repeat(
                    this.activeItems,
                    (item) => item.id,
                    (item) => {
                        const { options } = item
                        return html`
                            <mdc-snackbar
                                data-id=${item.id}
                                .open=${true}
                                .duration=${options.duration ?? SnackbarDuration.Short}
                                .variant=${options.variant ?? SnackbarVariant.InverseSurface}
                                .animationMode=${options.animationMode ?? SnackbarAnimationMode.Slide}
                                .multiline=${options.multiline ?? false}
                                .actionOnNewLine=${options.actionOnNewLine ?? false}
                                .swipeToDismiss=${options.swipeToDismiss ?? true}
                                .hasCloseIcon=${options.hasCloseIcon ?? false}
                                @snackbar-action=${() => this.handleSnackbarAction(item.id)}
                                @snackbar-closed=${(e: CustomEvent<ISnackbarCloseEventDetail>) => this.handleSnackbarClosed(item.id, e)}
                            >
                                ${options.message}
                                ${options.action ? html`<span slot="action">${options.action}</span>` : nothing}
                            </mdc-snackbar>
                        `
                    }
                )}
            </div>
        `
    }

    private dismissItem(id: string, reason: SnackbarResult): void {
        this.activeResults.set(id, reason)
        const snackbar = this.shadowRoot?.querySelector<MDCSnackbar>(`mdc-snackbar[data-id="${id}"]`)
        snackbar?.hide(reason)
    }

    private processQueue(): void {
        const limit = Math.max(1, this.maxVisible)
        if (this.activeItems.length >= limit || this.queue.length === 0) return

        const added: ISnackbarQueueItem[] = []
        while (this.activeItems.length + added.length < limit && this.queue.length > 0) {
            added.push(this.queue.shift()!)
        }
        if (added.length > 0) {
            this.activeItems = [...this.activeItems, ...added]
        }
    }

    private handleSnackbarAction(id: string): void {
        this.activeResults.set(id, SnackbarResult.Action)
    }

    private handleSnackbarClosed(id: string, event: CustomEvent<ISnackbarCloseEventDetail>): void {
        const item = this.activeItems.find((entry) => entry.id === id)
        if (!item) return

        const result = this.activeResults.get(id) ?? event.detail?.reason ?? SnackbarResult.Timeout
        this.activeResults.delete(id)
        item.resolve(result)

        this.activeItems = this.activeItems.filter((entry) => entry.id !== id)

        if (this.queue.length > 0) {
            const delay = this.maxVisible <= 1 ? 100 : 0
            if (delay === 0) {
                this.processQueue()
            } else {
                if (this.nextQueueTimer !== null) {
                    clearTimeout(this.nextQueueTimer)
                }
                this.nextQueueTimer = setTimeout(() => {
                    this.nextQueueTimer = null
                    this.processQueue()
                }, delay)
            }
        }
    }

    private handleWindowShowEvent = (event: CustomEvent<ISnackbarShowEventDetail>): void => {
        const { resolve: customResolve, ...options } = event.detail || {}
        if (!options.message) return

        this.show(options as SnackbarShowOptions).then((result) => {
            customResolve?.(result)
        })
    }
}
