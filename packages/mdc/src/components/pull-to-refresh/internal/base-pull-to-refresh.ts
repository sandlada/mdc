/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../loading-indicator/loading-indicator'
import '../../progress-indicator/progress-indicator'
import {
    PullToRefreshEvent,
    PullToRefreshIndicator,
    PullToRefreshMode,
    PullToRefreshProgressEvent,
    PullToRefreshState,
    PullToRefreshStateChangeEvent,
    PullToRefreshVariant,
    type IMDCPullToRefresh,
    type IMDCPullToRefreshEventDetail,
    type IMDCPullToRefreshProgressDetail,
    type IMDCPullToRefreshStateChangeDetail,
} from '../pull-to-refresh.interface'
import { PullToRefreshStyles } from '../pull-to-refresh.style'
import {
    applyPullResistance,
    computeIndicatorScale,
    computePullProgress,
    resolvePullState,
} from './pull-physics'

export abstract class BasePullToRefresh extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCPullToRefresh {
    static override styles = PullToRefreshStyles

    @property({ type: Boolean, reflect: true })
    public refreshing = false

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String, reflect: true })
    public indicator: PullToRefreshIndicator = PullToRefreshIndicator.Expressive

    @property({ type: String, reflect: true })
    public variant: PullToRefreshVariant = PullToRefreshVariant.Primary

    @property({ type: String, reflect: true })
    public mode: PullToRefreshMode = PullToRefreshMode.Overlay

    @property({ type: Number })
    public threshold = 80

    @property({ type: Number, attribute: 'max-pull-distance' })
    public maxPullDistance = 144

    @property({ type: Number, attribute: 'indicator-offset' })
    public indicatorOffset = 16

    @property({ type: Number, attribute: 'drag-multiplier' })
    public dragMultiplier = 0.5

    @property({ type: Boolean, attribute: 'enable-mouse' })
    public enableMouse = true

    @property({ attribute: 'scroll-target' })
    public scrollTarget: string | HTMLElement | null = null

    @property({ type: String, attribute: 'pull-label' })
    public pullLabel = 'Pull to refresh'

    @property({ type: String, attribute: 'release-label' })
    public releaseLabel = 'Release to refresh'

    @property({ type: String, attribute: 'refreshing-label' })
    public refreshingLabel = 'Refreshing'

    @state()
    private currentState: PullToRefreshState = PullToRefreshState.Idle

    @state()
    private distance = 0

    @state()
    private isDragging = false

    @query('.content')
    private contentEl?: HTMLElement

    private activePointerId: number | null = null
    private startX = 0
    private startY = 0
    private horizontalLocked = false

    public get pullState(): PullToRefreshState {
        return this.currentState
    }

    public get pullDistance(): number {
        return this.distance
    }

    public get progress(): number {
        return computePullProgress(this.distance, this.threshold)
    }

    public triggerRefresh(): void {
        if (this.disabled || this.refreshing) {
            return
        }
        this.enterRefreshing(true)
    }

    public complete(): void {
        if (!this.refreshing) {
            return
        }
        this.refreshing = false
    }

    protected override willUpdate(changed: PropertyValues): void {
        super.willUpdate(changed)
        if (changed.has('refreshing')) {
            if (this.refreshing) {
                this.enterRefreshing(false)
            } else if (!this.isDragging) {
                this.resetToIdle()
            }
        }
    }

    protected override render(): TemplateResult {
        const progress = this.progress
        const scale = computeIndicatorScale(progress, this.currentState)
        const isVisible = this.currentState !== PullToRefreshState.Idle || this.distance > 0
        const restingY = this.indicatorOffset
        const indicatorY = this.currentState === PullToRefreshState.Idle && this.distance === 0
            ? -56
            : Math.max(-56, this.distance - 48 + restingY * progress)

        const indicatorLayerStyles = {
            transform: `translate3d(0, ${indicatorY}px, 0) scale(${scale})`,
            opacity: isVisible ? '1' : '0',
        }

        const contentStyles = {
            transform: this.mode === PullToRefreshMode.Push && this.distance > 0
                ? `translate3d(0, ${this.distance}px, 0)`
                : 'none',
        }

        const animating = !this.isDragging

        return html`
            <div
                class=${classMap({ 'indicator-layer': true, animating })}
                style=${styleMap(indicatorLayerStyles)}
                aria-hidden="true"
            >
                <div class="indicator-shell">
                    <slot name="indicator">
                        ${this.renderIndicator(progress)}
                    </slot>
                </div>
            </div>

            <div class="sr-status" role="status" aria-live="polite">
                ${this.getStatusAnnouncement()}
            </div>

            <div
                class=${classMap({ content: true, animating })}
                style=${styleMap(contentStyles)}
                @pointerdown=${this.handlePointerDown}
                @pointermove=${this.handlePointerMove}
                @pointerup=${this.handlePointerUp}
                @pointercancel=${this.handlePointerCancel}
            >
                <slot></slot>
            </div>
        `
    }

    private renderIndicator(progress: number): TemplateResult {
        const isRefreshing = this.currentState === PullToRefreshState.Refreshing
        if (this.indicator === PullToRefreshIndicator.Circular) {
            return html`
                <div class="circular-container">
                    <mdc-progress-indicator
                        variant="circular"
                        circular-size="extra-small"
                        ?indeterminate=${isRefreshing}
                        .value=${progress}
                    ></mdc-progress-indicator>
                </div>
            `
        }

        return html`
            <mdc-loading-indicator
                contained
                variant=${this.variant}
                ?indeterminate=${isRefreshing}
                .progress=${progress}
            ></mdc-loading-indicator>
        `
    }

    private getStatusAnnouncement(): string {
        switch (this.currentState) {
            case PullToRefreshState.Pulling:
                return this.pullLabel
            case PullToRefreshState.Ready:
                return this.releaseLabel
            case PullToRefreshState.Refreshing:
                return this.refreshingLabel
            default:
                return ''
        }
    }

    private isAtScrollTop(): boolean {
        const target = this.resolveScrollElement()
        if (!target) {
            return true
        }
        return target.scrollTop <= 0
    }

    private resolveScrollElement(): HTMLElement | null {
        if (this.scrollTarget instanceof HTMLElement) {
            return this.scrollTarget
        }
        if (typeof this.scrollTarget === 'string' && this.scrollTarget.length > 0) {
            const root = this.getRootNode()
            if (root instanceof Document || root instanceof ShadowRoot) {
                const found = root.querySelector(this.scrollTarget)
                if (found instanceof HTMLElement) {
                    return found
                }
            }
        }
        return this.contentEl ?? null
    }

    private handlePointerDown(e: PointerEvent): void {
        if (this.disabled || this.refreshing) {
            return
        }
        if (e.pointerType === 'mouse' && (!this.enableMouse || e.button !== 0)) {
            return
        }
        if (!this.isAtScrollTop()) {
            return
        }

        this.activePointerId = e.pointerId
        this.startX = e.clientX
        this.startY = e.clientY
        this.horizontalLocked = false
    }

    private handlePointerMove(e: PointerEvent): void {
        if (this.activePointerId !== e.pointerId || this.horizontalLocked || this.disabled || this.refreshing) {
            return
        }

        const dx = e.clientX - this.startX
        const dy = e.clientY - this.startY

        if (!this.isDragging) {
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
                this.horizontalLocked = true
                this.activePointerId = null
                return
            }
            if (dy <= 4 || !this.isAtScrollTop()) {
                return
            }
            this.isDragging = true
            try {
                this.contentEl?.setPointerCapture(e.pointerId)
            } catch {
                // Synthetic PointerEvents in unit tests may not have an active pointer id
            }
        }

        const nextDistance = applyPullResistance(
            dy,
            this.threshold,
            this.maxPullDistance,
            this.dragMultiplier,
        )
        if (nextDistance > 0 && e.cancelable) {
            e.preventDefault()
        }

        this.updatePullMetrics(nextDistance, false)
    }

    private handlePointerUp(e: PointerEvent): void {
        if (this.activePointerId !== e.pointerId) {
            return
        }
        this.finishPointerGesture(e.pointerId, false)
    }

    private handlePointerCancel(e: PointerEvent): void {
        if (this.activePointerId !== e.pointerId) {
            return
        }
        this.finishPointerGesture(e.pointerId, true)
    }

    private finishPointerGesture(pointerId: number, canceled: boolean): void {
        const wasDragging = this.isDragging
        this.activePointerId = null
        this.isDragging = false
        this.horizontalLocked = false

        try {
            if (this.contentEl?.hasPointerCapture(pointerId)) {
                this.contentEl.releasePointerCapture(pointerId)
            }
        } catch {
            // Ignore in synthetic test environments
        }

        if (!wasDragging) {
            return
        }

        if (!canceled && this.currentState === PullToRefreshState.Ready) {
            this.enterRefreshing(true)
        } else {
            this.resetToIdle()
        }
    }

    private enterRefreshing(dispatchRefreshEvent: boolean): void {
        const restingDistance = Math.round(this.threshold * 0.7)
        this.refreshing = true
        this.updatePullMetrics(restingDistance, true)

        if (dispatchRefreshEvent) {
            this.dispatchEvent(new CustomEvent<IMDCPullToRefreshEventDetail>(PullToRefreshEvent, {
                bubbles: true,
                composed: true,
                detail: {
                    state: this.currentState,
                    progress: this.progress,
                    distance: this.distance,
                },
            }))
        }
    }

    private resetToIdle(): void {
        this.updatePullMetrics(0, false)
    }

    private updatePullMetrics(nextDistance: number, refreshing: boolean): void {
        const previousState = this.currentState
        const nextState = resolvePullState(nextDistance, this.threshold, refreshing)
        const distanceChanged = this.distance !== nextDistance
        const stateChanged = previousState !== nextState

        this.distance = nextDistance
        this.currentState = nextState

        const progress = computePullProgress(nextDistance, this.threshold)

        if (distanceChanged) {
            this.dispatchEvent(new CustomEvent<IMDCPullToRefreshProgressDetail>(PullToRefreshProgressEvent, {
                bubbles: true,
                composed: true,
                detail: {
                    progress,
                    distance: nextDistance,
                    state: nextState,
                },
            }))
        }

        if (stateChanged) {
            this.dispatchEvent(new CustomEvent<IMDCPullToRefreshStateChangeDetail>(PullToRefreshStateChangeEvent, {
                bubbles: true,
                composed: true,
                detail: {
                    state: nextState,
                    previousState,
                    progress,
                    distance: nextDistance,
                },
            }))
        }
    }
}
