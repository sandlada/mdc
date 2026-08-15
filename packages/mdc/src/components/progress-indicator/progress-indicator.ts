/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-progress-indicator` — Material Design 3 progress indicator.
 *
 * Two layout variants via the `variant` attribute:
 * - **linear** (default): a horizontal bar with a track and an active
 *   indicator. Determinate scales the active bar with `transform: scaleX()`
 *   (the @material/web approach); indeterminate animates two bars with
 *   translateX + scaleX keyframes.
 * - **circular**: SVG circle (determinate) or div-based spinner
 *   (indeterminate) with four size presets. The indeterminate spinner uses
 *   three composed CSS animations (expand-arc, rotate-arc, linear-rotate)
 *   matching the @material/web circular implementation for performance
 *   (4.5× better FPS than SVG on Chrome).
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
    type IProgressIndicator,
    type ProgressIndicatorCircularSize,
    type ProgressIndicatorVariant,
} from './progress-indicator.interface'
import { ProgressIndicatorStyles } from './progress-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-progress-indicator': MDCProgressIndicator
    }
}

@customElement('mdc-progress-indicator')
export class MDCProgressIndicator
    extends composeMixin(mixinDelegatesAria)(LitElement)
    implements IProgressIndicator {

    static override styles = ProgressIndicatorStyles
    static override shadowRootOptions: ShadowRootInit = { mode: 'open', delegatesFocus: false }

    // ── Public API ────────────────────────────────────────────────────────────

    @property({ type: String, reflect: true })
    public variant: ProgressIndicatorVariant = 'linear'

    @property({ type: Number })
    public value = 0

    @property({ type: Number })
    public max = 1

    @property({ type: Boolean, reflect: true })
    public indeterminate = false

    @property({ type: String, reflect: true, attribute: 'circular-size' })
    public circularSize: ProgressIndicatorCircularSize = 'medium'

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    protected override firstUpdated(_changedProperties: PropertyValues<this>): void {
        super.firstUpdated(_changedProperties)
        this.setupAria()
    }

    // ── Render ────────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        // Needed for closure conformance
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="progress ${classMap(this.getRenderClasses())}"
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

    /**
     * Determinate: `transform: scaleX(value / max)` on the active bar (no
     * clip-path — the @material/web approach). Indeterminate: the primary /
     * secondary bars are shifted by `inset-inline-start` and animated purely
     * with CSS keyframes; the full-width track stays visible underneath.
     */
    protected renderLinear(): TemplateResult {
        const fraction = this.max > 0 ? this.value / this.max : 0
        const progressStyles = {
            transform: `scaleX(${(this.indeterminate ? 1 : fraction) * 100}%)`,
        }
        return html`
            <div class="inactive-track"></div>
            <div class="bar primary-bar" style=${styleMap(progressStyles)}>
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
     * Determinate circular: SVG with two circles using pathLength=100 and
     * stroke-dashoffset. The track circle is transparent — MD3 circular has
     * no track. The 4800px viewBox compensates for Chrome's pathLength
     * rendering inaccuracy (matches @material/web).
     */
    protected renderCircularDeterminate(): TemplateResult {
        const fraction = this.max > 0 ? this.value / this.max : 0
        const dashOffset = (1 - fraction) * 100
        return html`
            <svg viewBox="0 0 4800 4800">
                <circle class="track" pathLength="100"></circle>
                <circle class="active-track" pathLength="100" stroke-dashoffset=${dashOffset}></circle>
            </svg>
        `
    }

    /**
     * Indeterminate circular: div-based spinner (no SVG — 4.5× better FPS
     * on Chrome). Uses three composed CSS animations:
     * 1. expand-arc: arc expands/contracts (1333ms)
     * 2. rotate-arc: arc rotates in 135° increments (5332ms)
     * 3. linear-rotate: container rotates 360° (~1568ms)
     */
    protected renderCircularIndeterminate(): TemplateResult {
        return html`
            <div class="spinner">
                <div class="left">
                    <div class="circle"></div>
                </div>
                <div class="right">
                    <div class="circle"></div>
                </div>
            </div>
        `
    }

    // ── ARIA setup ────────────────────────────────────────────────────────────

    private setupAria(): void {
        if (isServer) return
        if (!this.getAttribute('aria-label') && !this.getAttribute('aria-labelledby')) {
            this.setAttribute('aria-label', 'Progress')
        }
    }
}
