/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-expressive-progress-indicator` — Material Design 3 Expressive progress
 * indicator.
 *
 * Follows the MD3E spec as implemented by Flutter (year2024) and Jetpack
 * Compose:
 *
 * **Linear**:
 * - The active indicator and the track use round caps (pill-shaped) with a
 *   `secondaryContainer` track separated by a visual gap.
 * - A round stop indicator (primary) sits at the trailing edge of the track
 *   while determinate.
 * - Determinate resizes the active bar with a springy, non-overshooting
 *   settle approximating Compose's `SpringSpec(NoBouncy, VeryLow)`.
 * - Indeterminate animates two bars with translateX + scaleX keyframes at
 *   Compose's `LinearAnimationDuration = 1750ms`.
 *
 * **Circular**:
 * - Determinate draws a primary arc plus a `secondaryContainer` track arc,
 *   each with round stroke caps, separated by the same gap (Compose gap
 *   formula).
 * - Indeterminate uses an SVG arc spinner rotating 1440deg over 6000ms while
 *   sweeping between 0.1 and 0.87 of the circle (Compose
 *   `CircularAnimationDuration` + `EasingStandardCubicBezier`).
 *
 * @link https://m3.material.io/components/progress-indicator/specs
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    type ExpressiveProgressIndicatorCircularSize,
    type ExpressiveProgressIndicatorVariant,
    type IExpressiveProgressIndicator,
} from './expressive-progress-indicator.interface'
import { ExpressiveProgressIndicatorStyles } from './expressive-progress-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-expressive-progress-indicator': MDCExpressiveProgressIndicator
    }
}

@customElement('mdc-expressive-progress-indicator')
export class MDCExpressiveProgressIndicator
    extends composeMixin(mixinDelegatesAria)(LitElement)
    implements IExpressiveProgressIndicator {

    static override styles = ExpressiveProgressIndicatorStyles
    static override shadowRootOptions: ShadowRootInit = { mode: 'open', delegatesFocus: false }

    // ── Public API ────────────────────────────────────────────────────────────

    @property({ type: String, reflect: true })
    public variant: ExpressiveProgressIndicatorVariant = 'linear'

    @property({ type: Number })
    public value = 0

    @property({ type: Number })
    public max = 1

    @property({ type: Boolean, reflect: true })
    public indeterminate = false

    @property({ type: String, reflect: true, attribute: 'circular-size' })
    public circularSize: ExpressiveProgressIndicatorCircularSize = 'medium'

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    protected override firstUpdated(_changedProperties: PropertyValues<this>): void {
        super.firstUpdated(_changedProperties)
        this.setupAria()
    }

    // ── Render ────────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        // Needed for closure conformance
        const { ariaLabel } = this as AriaMixinStrict
        const fraction = this.max > 0 ? this.value / this.max : 0
        return html`
            <div
                class="progress ${classMap(this.getRenderClasses())}"
                style="--_fraction: ${fraction};"
                role="progressbar"
                aria-label="${ariaLabel || nothing}"
                aria-valuemin="0"
                aria-valuemax=${this.max}
                aria-valuenow=${this.indeterminate ? nothing : this.value}
            >
                ${this.variant === 'linear' ? this.renderLinear() : this.renderCircular()}
            </div>
        `
    }

    protected getRenderClasses() {
        return {
            'indeterminate': this.indeterminate,
            'linear': this.variant === 'linear',
            'circular': this.variant === 'circular',
        }
    }

    // ── Linear ────────────────────────────────────────────────────────────────

    protected renderLinear(): TemplateResult {
        if (this.indeterminate) {
            return this.renderLinearIndeterminate()
        }
        return this.renderLinearDeterminate()
    }

    /**
     * Determinate linear — DOM order matches the Compose draw order so the
     * stop indicator paints on top of the track: track → active → stop.
     */
    protected renderLinearDeterminate(): TemplateResult {
        return html`
            <div class="track" aria-hidden="true"></div>
            <div class="active-bar" aria-hidden="true"></div>
            <div class="stop-indicator" aria-hidden="true"></div>
        `
    }

    /**
     * Indeterminate linear — full-width `secondaryContainer` track stays
     * visible (Flutter shows it) while two bars sweep across via CSS
     * keyframes at Compose's 1750ms duration.
     */
    protected renderLinearIndeterminate(): TemplateResult {
        return html`
            <div class="track" aria-hidden="true"></div>
            <div class="bar primary-bar">
                <div class="bar-inner"></div>
            </div>
            <div class="bar secondary-bar">
                <div class="bar-inner"></div>
            </div>
        `
    }

    // ── Circular ──────────────────────────────────────────────────────────────

    protected renderCircular(): TemplateResult {
        if (this.indeterminate) {
            return this.renderCircularIndeterminate()
        }
        return this.renderCircularDeterminate()
    }

    /**
     * Determinate circular — a primary arc plus a `secondaryContainer` track
     * arc separated by the Compose gap: the track starts after the active arc
     * plus `min(sweep, gapSweep)` and sweeps `360 - sweep - 2*gap`. The gap is
     * inflated by one stroke width because the round stroke caps intrude
     * strokeWidth/2 past each dash end, exactly as Compose's
     * `adjustedGapSize = gapSize + strokeWidth`.
     *
     * The 4800px viewBox compensates for Chrome's pathLength rendering
     * inaccuracy (matches @material/web).
     */
    protected renderCircularDeterminate(): TemplateResult {
        const fraction = this.max > 0 ? this.value / this.max : 0
        const { boxSize, strokeWidth, gap } = this.getCircularMetrics()

        const sweep = fraction * 360
        const gapSweep = boxSize > 0
            ? ((gap + strokeWidth) / (Math.PI * boxSize)) * 360
            : 0
        const g = Math.min(sweep, gapSweep)
        // Room left for the track arc after the active arc and both gaps
        const trackLen = 360 - sweep - 2 * g

        const activeDashOffset = 100 - (sweep / 360) * 100

        // Track arc: dash of `trackLenPct` followed by a long gap, offset so
        // the dash covers [trackStartPct, trackEndPct] of the path.
        const trackLenPct = (trackLen / 360) * 100
        const trackStartPct = ((sweep + g) / 360) * 100
        const trackOffset = trackLenPct + 100 - trackStartPct

        return html`
            <svg viewBox="0 0 4800 4800" aria-hidden="true">
                ${
                    trackLen > 0.001
                        ? html`
                            <circle
                                class="track-circle"
                                pathLength="100"
                                style=${styleMap({
                                    strokeDasharray: `${trackLenPct} 100`,
                                    strokeDashoffset: `${trackOffset}`,
                                })}
                            ></circle>`
                        : nothing
                }
                <circle
                    class="active-circle"
                    pathLength="100"
                    stroke-dashoffset=${activeDashOffset}
                ></circle>
            </svg>
        `
    }

    /**
     * Indeterminate circular — an SVG arc spinner: the wrapper rotates
     * 1440deg (Compose's 1080 global + 360 additional) while the arc sweeps
     * between 0.1 and 0.87 of the circle with `EasingStandardCubicBezier`.
     */
    protected renderCircularIndeterminate(): TemplateResult {
        return html`
            <div class="circular-spinner" aria-hidden="true">
                <svg viewBox="0 0 4800 4800">
                    <circle class="spinner-arc" pathLength="100"></circle>
                </svg>
            </div>
        `
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Reads the resolved circular geometry (size, stroke width, track gap)
     * from the CSS custom properties so the gap math uses the same values the
     * stylesheet renders with. `boxSize` is the SVG canvas size — the host
     * diameter minus the 4px `.progress` margin on each side.
     */
    private getCircularMetrics(): { boxSize: number; strokeWidth: number; gap: number } {
        if (isServer) {
            // 64px medium fallback
            return { boxSize: 56, strokeWidth: 4, gap: 4 }
        }
        const style = getComputedStyle(this)
        const size = parseFloat(style.getPropertyValue(`--_circular-${this.circularSize}-size`)) || 64
        const strokeWidth =
            parseFloat(style.getPropertyValue(`--_circular-${this.circularSize}-stroke-width`)) || 4
        const gap = parseFloat(style.getPropertyValue('--_circular-track-gap')) || 4
        return { boxSize: size - 8, strokeWidth, gap }
    }

    private setupAria(): void {
        if (isServer) return
        if (!this.getAttribute('aria-label') && !this.getAttribute('aria-labelledby')) {
            this.setAttribute('aria-label', 'Progress')
        }
    }
}
