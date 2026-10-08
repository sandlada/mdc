/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-loading-indicator` — the MD3 Expressive morphing-shape loading indicator.
 *
 * The indeterminate form replays the exact choreography of the reference
 * implementation: the seven Material shapes (SoftBurst → Cookie9Sided →
 * Pentagon → Pill → Sunny → Cookie4Sided → Oval) are morphed pairwise with the
 * `androidx.graphics.shapes` algorithm (feature mapping + cubic matching,
 * ported 1:1 in `./internal`) on a 4666/7 ms shape period — the global
 * rotation duration divided by the seven shapes, so the sequence loops
 * seamlessly. The morph factor is a continuous underdamped spring (stiffness
 * 200, damping ratio 0.6) re-targeted one shape further every period; the
 * rendered shape index is its floor and the morph progress its remainder, so
 * the handoff between morphs is continuous (the spring briefly overshoots
 * into the next shape). Each period adds a constant 450/7° of rotation plus
 * 90° driven by the spring — three full turns per seamless loop.
 *
 * The determinate form drives a circle → SoftBurst morph from `progress` with
 * a −180° counter-clockwise rotation.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    LOADING_INDICATOR_COMPLETE_EVENT,
    type ILoadingIndicator,
    type ILoadingIndicatorCompleteDetail,
    type LoadingIndicatorVariant,
} from './loading-indicator.interface'
import { LoadingIndicatorStyles } from './loading-indicator.style'
import {
    INDICATOR_SIZE_PX,
    determinateFrameAt,
    getDeterminateShapeScale,
    getIndeterminateShapeScale,
    indeterminateFrameAt,
    type LoadingIndicatorFrame,
} from './internal'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-loading-indicator': MDCLoadingIndicator
    }
}

/**
 * @element mdc-loading-indicator
 *
 * MD3 Expressive loading indicator. Runs the looping morph-shape sequence when
 * `indeterminate` is set, or tracks `progress` (0–1) as a determinate
 * circle → SoftBurst morph that rotates −180° across the full range.
 *
 * @version Material Design 3 - Expressive
 *
 * @link https://m3.material.io/components/loading-indicator/overview
 */
@customElement('mdc-loading-indicator')
export class MDCLoadingIndicator
    extends composeMixin(mixinDelegatesAria)(LitElement)
    implements ILoadingIndicator {

    static override styles = LoadingIndicatorStyles

    /** When set, loops the indeterminate morph instead of tracking `progress`. */
    @property({ type: Boolean, reflect: true })
    public indeterminate = false

    /** Determinate progress, `0`–`1` (mirrored by `aria-valuenow`). */
    @property({ type: Number })
    public progress = 0

    /**
     * MD3 color-role scheme: `'primary'` (default) | `'secondary'` |
     * `'tertiary'` | `'error'` | `'surface'`.
     */
    @property({ type: String, reflect: true })
    public variant: LoadingIndicatorVariant = 'primary'

    /** When set, draws the fully-rounded container behind the shape. */
    @property({ type: Boolean, reflect: true })
    public contained = false

    /** Animation-rate multiplier for the indeterminate form (default `1`). */
    @property({ type: Number, reflect: true })
    public speed = 1

    // Indeterminate animation state: the timeline position is the accumulated
    // (speed-scaled) elapsed time that the frame functions consume.
    private rafId: number | null = null
    private lastFrameTime = 0
    private timelineMs = 0
    private currentFrame: LoadingIndicatorFrame | null = null
    private reducedMotion = false
    private reducedMotionQuery: MediaQueryList | null = null
    private completeFired = false

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        const query = matchMedia('(prefers-reduced-motion: reduce)')
        this.reducedMotionQuery = query
        this.reducedMotion = query.matches
        query.addEventListener('change', this.handleReducedMotionChange)
        if (this.indeterminate) this.startAnimation()
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        if (isServer) return
        this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
        this.reducedMotionQuery = null
        this.stopAnimation()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        if (this.indeterminate) {
            // The frame loop normally owns the indeterminate frame; only
            // (re)resolve it here when (re)entering that mode or on the very
            // first render (e.g. while reduced motion keeps the loop off).
            if (this.currentFrame === null || changedProperties.has('indeterminate')) {
                this.currentFrame = indeterminateFrameAt(this.timelineMs)
            }
        } else {
            this.currentFrame = determinateFrameAt(this.progress)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('indeterminate')) {
            if (this.indeterminate) {
                // Completion is meaningless while the indicator loops.
                this.completeFired = true
                this.startAnimation()
            } else {
                this.stopAnimation()
                this.completeFired = false
            }
        }
        if (changedProperties.has('progress') && this.progress < 1) {
            this.completeFired = false
        }
        if (!this.indeterminate && !this.completeFired && this.progress >= 1) {
            this.completeFired = true
            this.dispatchEvent(new CustomEvent<ILoadingIndicatorCompleteDetail>(
                LOADING_INDICATOR_COMPLETE_EVENT,
                { detail: { value: 1 }, bubbles: true, composed: true },
            ))
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const frame = this.currentFrame
        if (frame === null) throw new Error('The loading indicator frame must be resolved before rendering')
        const renderScale = this.indeterminate ? getIndeterminateShapeScale() : getDeterminateShapeScale()
        // The path lives in normalized [0, 1]² coordinates; the transform
        // scales it to its active size within the indicator viewBox, centers
        // its bounds in the box and rotates it about that center — the same
        // pipeline as `processPath` + `rotate` in the reference.
        const transform =
            `translate(${INDICATOR_SIZE_PX / 2} ${INDICATOR_SIZE_PX / 2}) ` +
            `rotate(${frame.rotation.toFixed(2)}) ` +
            `scale(${renderScale.toFixed(4)}) ` +
            `translate(${(-frame.centerX).toFixed(6)} ${(-frame.centerY).toFixed(6)})`
        const classes = classMap({
            'container': true,
            'contained': this.contained,
            'indeterminate': this.indeterminate,
            // The color-role class drives the bg / fill via CSS (no inline
            // style): the variant class on the container re-keys the internal
            // color tokens that .background and .indicator path consume.
            [`variant-${this.variant}`]: true,
        })
        return html`
            <div
                class="${classes}"
                role="progressbar"
                aria-label="${ariaLabel || nothing}"
                aria-valuemin="0"
                aria-valuemax="1"
                aria-valuenow=${this.indeterminate ? nothing : this.progress}
            >
                <span class="background" aria-hidden="true"></span>
                <svg class="indicator" viewBox="0 0 ${INDICATOR_SIZE_PX} ${INDICATOR_SIZE_PX}" aria-hidden="true">
                    <path d=${frame.path} transform=${transform} />
                </svg>
            </div>
        `
    }

    // ── private ───────────────────────────────────────────────────────────────

    private startAnimation(): void {
        if (this.rafId !== null) return
        if (this.reducedMotion) {
            // Reduced motion: hold the current frame instead of animating.
            this.requestUpdate()
            return
        }
        this.lastFrameTime = performance.now()
        this.rafId = requestAnimationFrame(this.frame)
    }

    private stopAnimation(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

    private readonly frame = (now: number) => {
        if (this.rafId === null) return
        // Clamp the time delta so a suspended tab does not skip whole morphs.
        const deltaMs = Math.min(now - this.lastFrameTime, 50)
        this.lastFrameTime = now
        // The rate multiplier scales the whole animation timeline — spring,
        // morph interval, per-morph spin and global rotation — so speed=2
        // runs twice as fast and 0 pauses the loop. Clamped to >= 0 so a
        // negative speed pauses instead of reversing the timeline.
        this.timelineMs += deltaMs * Math.max(this.speed, 0)
        this.currentFrame = indeterminateFrameAt(this.timelineMs)
        this.requestUpdate()
        this.rafId = requestAnimationFrame(this.frame)
    }

    private readonly handleReducedMotionChange = (event: MediaQueryListEvent) => {
        this.reducedMotion = event.matches
        if (this.reducedMotion) {
            this.stopAnimation()
            this.requestUpdate()
        } else if (this.indeterminate) {
            this.startAnimation()
        }
    }
}
