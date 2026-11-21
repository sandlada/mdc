/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface IExpansionHost extends ReactiveControllerHost, HTMLElement {
    expanded: boolean
    disabled?: boolean
    quick?: boolean
}

export interface IExpansionControllerOptions {
    /** Returns the collapsible container element whose transition is observed. */
    getCollapseElement: () => HTMLElement | null
    /** CSS property name to match on `transitionend`. Defaults to `'grid-template-rows'`. */
    transitionProperty?: string
    /** Fallback timeout (ms) when `transitionend` does not fire. Defaults to `350`. */
    fallbackMs?: number
    /** Event name dispatched (cancelable) before user-initiated toggle. */
    toggleEvent?: string
    /** Event name dispatched when expand transition starts. */
    expandingEvent?: string
    /** Event name dispatched when expand transition finishes. */
    expandedEvent?: string
    /** Event name dispatched when collapse transition starts. */
    collapsingEvent?: string
    /** Event name dispatched when collapse transition finishes. */
    collapsedEvent?: string
}

/**
 * Reusable Lit `ReactiveController` that manages expand/collapse state
 * transitions, cancelable toggle events, `prefers-reduced-motion` / `quick`
 * immediate completion, and `transitionend` + fallback timer cleanup.
 *
 * Designed for shared use across Accordion / ExpansionPanel, List, Menu, and
 * other collapsible disclosure components.
 */
export class ExpansionController implements ReactiveController {
    private readonly host: IExpansionHost
    private readonly options: IExpansionControllerOptions
    private pendingState: 'expanding' | 'collapsing' | null = null
    private fallbackTimer: ReturnType<typeof setTimeout> | null = null
    private lastExpanded: boolean

    public constructor(host: IExpansionHost, options: IExpansionControllerOptions) {
        this.host = host
        this.options = options
        this.lastExpanded = host.expanded
        host.addController(this)
    }

    public hostConnected(): void {
        this.lastExpanded = this.host.expanded
    }

    public hostDisconnected(): void {
        this.clearFallbackTimer()
        this.pendingState = null
    }

    public hostUpdate(): void {
        if (this.host.expanded === this.lastExpanded) {
            return
        }
        const nextExpanded = this.host.expanded
        this.lastExpanded = nextExpanded
        if (nextExpanded) {
            this.startTransition('expanding')
        } else {
            this.startTransition('collapsing')
        }
    }

    /**
     * Requests a user-initiated toggle. Dispatches `toggleEvent` (cancelable)
     * if configured; updates `host.expanded` unless prevented.
     */
    public requestToggle(nextExpanded: boolean = !this.host.expanded): boolean {
        if (this.host.disabled) {
            return false
        }
        if (this.options.toggleEvent) {
            const event = new CustomEvent(this.options.toggleEvent, {
                bubbles   : true,
                composed  : true,
                cancelable: true,
                detail    : { expanded: nextExpanded },
            })
            if (!this.host.dispatchEvent(event)) {
                return false
            }
        }
        this.host.expanded = nextExpanded
        return true
    }

    public async expand(): Promise<void> {
        if (this.host.expanded) return
        this.host.expanded = true
        await this.host.updateComplete
    }

    public async collapse(): Promise<void> {
        if (!this.host.expanded) return
        this.host.expanded = false
        await this.host.updateComplete
    }

    public async toggle(): Promise<void> {
        this.host.expanded = !this.host.expanded
        await this.host.updateComplete
    }

    /**
     * Bind to `@transitionend` on the collapsible container element.
     */
    public readonly handleTransitionEnd = (event: TransitionEvent): void => {
        const collapseEl = this.options.getCollapseElement()
        const prop = this.options.transitionProperty ?? 'grid-template-rows'
        if (!collapseEl || event.target !== collapseEl || event.propertyName !== prop) {
            return
        }
        if (this.pendingState === 'expanding' && this.host.expanded) {
            this.finishTransition('expanding')
        } else if (this.pendingState === 'collapsing' && !this.host.expanded) {
            this.finishTransition('collapsing')
        }
    }

    public isMotionReduced(): boolean {
        return Boolean(this.host.quick) || Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    }

    private startTransition(state: 'expanding' | 'collapsing'): void {
        this.clearFallbackTimer()
        this.pendingState = state

        const startEvent = state === 'expanding' ? this.options.expandingEvent : this.options.collapsingEvent
        if (startEvent) {
            this.host.dispatchEvent(new CustomEvent(startEvent, { bubbles: true, composed: true }))
        }

        const collapseEl = this.options.getCollapseElement()
        if (this.isMotionReduced() || !collapseEl) {
            this.finishTransition(state)
            return
        }

        const fallbackMs = this.options.fallbackMs ?? 350
        this.fallbackTimer = setTimeout(() => {
            if (this.pendingState === state) {
                this.finishTransition(state)
            }
        }, fallbackMs)
    }

    private finishTransition(state: 'expanding' | 'collapsing'): void {
        this.clearFallbackTimer()
        this.pendingState = null
        const endEvent = state === 'expanding' ? this.options.expandedEvent : this.options.collapsedEvent
        if (endEvent) {
            this.host.dispatchEvent(new CustomEvent(endEvent, { bubbles: true, composed: true }))
        }
    }

    private clearFallbackTimer(): void {
        if (this.fallbackTimer !== null) {
            clearTimeout(this.fallbackTimer)
            this.fallbackTimer = null
        }
    }
}
